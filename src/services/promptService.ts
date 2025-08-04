/**
 * Enhanced Prompt Service with filtering, recommendations, and progress tracking
 */

import { databaseService, DatabaseError, ValidationError } from './database';
import { aiService } from './aiService';
import {
  COLLECTIONS,
  ConversationPrompt,
  UserProgress,
  User,
  ConversationSession,
  AgeGroup,
  DifficultyLevel
} from '../types/database';

export class PromptService {
  // Get prompts with filtering and personalization
  async getPrompts(options: {
    userId?: string;
    category?: string;
    difficulty?: DifficultyLevel;
    ageGroup?: AgeGroup;
    tags?: string[];
    featured?: boolean;
    completed?: boolean;
    limit?: number;
  } = {}): Promise<ConversationPrompt[]> {
    const {
      userId,
      category,
      difficulty,
      ageGroup,
      tags,
      featured,
      completed,
      limit = 20
    } = options;

    const whereConstraints: any[] = [
      { field: 'isActive', operator: '==', value: true }
    ];

    if (category) {
      whereConstraints.push({ field: 'category', operator: '==', value: category });
    }

    if (difficulty) {
      whereConstraints.push({ field: 'difficulty', operator: '==', value: difficulty });
    }

    if (ageGroup) {
      whereConstraints.push({ field: 'ageGroups', operator: 'array-contains', value: ageGroup });
    }

    if (tags && tags.length > 0) {
      whereConstraints.push({ field: 'tags', operator: 'array-contains-any', value: tags });
    }

    if (featured !== undefined) {
      whereConstraints.push({ field: 'metadata.featured', operator: '==', value: featured });
    }

    let prompts = await databaseService.query<ConversationPrompt>(COLLECTIONS.PROMPTS, {
      where: whereConstraints,
      orderBy: [
        { field: 'metadata.featured', direction: 'desc' },
        { field: 'metadata.averageRating', direction: 'desc' },
        { field: 'createdAt', direction: 'desc' }
      ],
      limit,
    });

    // Filter by completion status if requested
    if (userId && completed !== undefined) {
      const userProgress = await this.getUserProgress(userId);
      const completedPromptIds = new Set(
        userProgress
          .filter(p => p.status === 'completed')
          .map(p => p.promptId)
      );

      prompts = prompts.filter(prompt => {
        const isCompleted = completedPromptIds.has(prompt.id!);
        return completed ? isCompleted : !isCompleted;
      });
    }

    return prompts;
  },

  // Get single prompt with progress info
  async getPrompt(promptId: string, userId?: string): Promise<{
    prompt: ConversationPrompt | null;
    userProgress?: UserProgress;
    isCompleted: boolean;
    canStart: boolean;
  }> {
    const prompt = await databaseService.get<ConversationPrompt>(COLLECTIONS.PROMPTS, promptId);
    
    if (!prompt) {
      return {
        prompt: null,
        isCompleted: false,
        canStart: false
      };
    }

    let userProgress: UserProgress | undefined;
    let isCompleted = false;

    if (userId) {
      const progressList = await databaseService.query<UserProgress>(COLLECTIONS.USER_PROGRESS, {
        where: [
          { field: 'userId', operator: '==', value: userId },
          { field: 'promptId', operator: '==', value: promptId }
        ],
        limit: 1
      });
      
      userProgress = progressList[0];
      isCompleted = userProgress?.status === 'completed';
    }

    return {
      prompt,
      userProgress,
      isCompleted,
      canStart: !isCompleted
    };
  }

  // Get personalized prompt recommendations
  async getRecommendedPrompts(
    userId: string,
    limit: number = 5
  ): Promise<ConversationPrompt[]> {
    const user = await databaseService.get<User>(COLLECTIONS.USERS, userId);
    if (!user) {
      throw new ValidationError('User not found', 'userId', userId);
    }

    const userProgress = await this.getUserProgress(userId);
    const completedPromptIds = new Set(
      userProgress
        .filter(p => p.status === 'completed')
        .map(p => p.promptId)
    );

    // Determine user's age group
    const userAge = user.profile.age || 12;
    let ageGroup: AgeGroup;
    if (userAge <= 10) ageGroup = '8-10';
    else if (userAge <= 13) ageGroup = '11-13';
    else if (userAge <= 16) ageGroup = '14-16';
    else ageGroup = '17-18';

    // Get prompts suitable for user's age and experience level
    const allPrompts = await this.getPrompts({
      ageGroup,
      difficulty: user.profile.aiExperienceLevel,
      limit: limit * 2, // Get more to filter from
    });

    // Filter out completed prompts and personalize based on interests
    const availablePrompts = allPrompts
      .filter(prompt => !completedPromptIds.has(prompt.id!))
      .map(prompt => ({
        ...prompt,
        relevanceScore: this.calculateRelevanceScore(prompt, user.profile.interests, userProgress)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return availablePrompts;
  }

  private calculateRelevanceScore(
    prompt: ConversationPrompt,
    userInterests: string[],
    userProgress: UserProgress[]
  ): number {
    let score = 0;

    // Base score from ratings and popularity
    score += prompt.metadata.averageRating * 10;
    score += Math.min(prompt.metadata.completionCount / 100, 5); // Up to 5 points for popularity

    // Interest matching
    const interestMatches = prompt.tags.filter(tag => 
      userInterests.some(interest => 
        interest.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(interest.toLowerCase())
      )
    ).length;
    score += interestMatches * 15;

    // Category preference based on user's completion history
    const categoryCompletions = userProgress.filter(p => 
      p.status === 'completed' && 
      // Would need to look up prompt to get category - simplified for now
      p.rating && p.rating >= 4
    ).length;
    score += Math.min(categoryCompletions, 3) * 5;

    // Featured content bonus
    if (prompt.metadata.featured) {
      score += 10;
    }

    return score;
  },

  // Start a prompt (create initial progress entry)
  async startPrompt(userId: string, promptId: string): Promise<string> {
    // Check if prompt exists and is active
    const prompt = await databaseService.get<ConversationPrompt>(COLLECTIONS.PROMPTS, promptId);
    if (!prompt || !prompt.isActive) {
      throw new ValidationError('Prompt not found or inactive', 'promptId', promptId);
    }

    // Check if already started
    const existingProgress = await databaseService.query<UserProgress>(COLLECTIONS.USER_PROGRESS, {
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'promptId', operator: '==', value: promptId }
      ],
      limit: 1
    });

    if (existingProgress.length > 0) {
      return existingProgress[0].id!;
    }

    // Create new progress entry
    const progressData: Omit<UserProgress, 'id'> = {
      userId,
      promptId,
      status: 'in_progress',
      timeSpent: 0,
      followUpCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return databaseService.create<UserProgress>(COLLECTIONS.USER_PROGRESS, progressData);
  }

  // Update prompt progress
  async updateProgress(
    progressId: string,
    userId: string,
    updates: {
      status?: 'in_progress' | 'completed' | 'skipped';
      timeSpent?: number;
      rating?: number;
      notes?: string;
      followUpCompleted?: boolean;
    }
  ): Promise<void> {
    // Verify ownership
    const progress = await databaseService.get<UserProgress>(COLLECTIONS.USER_PROGRESS, progressId);
    if (!progress || progress.userId !== userId) {
      throw new ValidationError('Progress entry not found or access denied', 'progressId', progressId);
    }

    const updateData: any = { ...updates };
    
    // Set completion timestamp if marking as completed
    if (updates.status === 'completed' && progress.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    await databaseService.update<UserProgress>(COLLECTIONS.USER_PROGRESS, progressId, updateData);

    // Update prompt metadata if completed with rating
    if (updates.status === 'completed' && updates.rating) {
      await this.updatePromptMetadata(progress.promptId, updates.rating);
    }
  }

  private async updatePromptMetadata(promptId: string, newRating: number): Promise<void> {
    const prompt = await databaseService.get<ConversationPrompt>(COLLECTIONS.PROMPTS, promptId);
    if (!prompt) return;

    const currentRating = prompt.metadata.averageRating || 0;
    const currentCount = prompt.metadata.ratingCount || 0;
    const newCount = currentCount + 1;
    const newAverageRating = ((currentRating * currentCount) + newRating) / newCount;

    await databaseService.update<ConversationPrompt>(COLLECTIONS.PROMPTS, promptId, {
      'metadata.averageRating': Math.round(newAverageRating * 100) / 100,
      'metadata.ratingCount': newCount,
      'metadata.completionCount': (prompt.metadata.completionCount || 0) + 1
    });
  },

  // Get user's progress with detailed statistics
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return databaseService.query<UserProgress>(COLLECTIONS.USER_PROGRESS, {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: [{ field: 'updatedAt', direction: 'desc' }]
    });
  }

  // Get user progress statistics
  async getUserProgressStats(userId: string): Promise<{
    totalStarted: number;
    totalCompleted: number;
    totalSkipped: number;
    completionRate: number;
    averageRating: number;
    totalTimeSpent: number;
    streakDays: number;
    favoriteCategories: string[];
  }> {
    const progress = await this.getUserProgress(userId);
    
    const completed = progress.filter(p => p.status === 'completed');
    const skipped = progress.filter(p => p.status === 'skipped');
    
    const completionRate = progress.length > 0 
      ? Math.round((completed.length / progress.length) * 100) 
      : 0;
    
    const averageRating = completed.length > 0
      ? completed.reduce((sum, p) => sum + (p.rating || 0), 0) / completed.length
      : 0;
    
    const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    
    // Calculate streak (simplified - consecutive days with completions)
    const streakDays = this.calculateCompletionStreak(completed);
    
    // Get favorite categories (would need to join with prompts - simplified)
    const favoriteCategories = ['daily', 'weekly']; // Placeholder
    
    return {
      totalStarted: progress.length,
      totalCompleted: completed.length,
      totalSkipped: skipped.length,
      completionRate,
      averageRating: Math.round(averageRating * 100) / 100,
      totalTimeSpent,
      streakDays,
      favoriteCategories
    };
  }

  private calculateCompletionStreak(completedProgress: UserProgress[]): number {
    if (completedProgress.length === 0) return 0;
    
    const sortedByDate = completedProgress
      .filter(p => p.completedAt)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const progress of sortedByDate) {
      const completionDate = new Date(progress.completedAt!);
      completionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff === streak + 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Create a conversation session
  async createConversationSession(
    familyId: string,
    promptId: string,
    participantIds: string[]
  ): Promise<string> {
    const sessionData: Omit<ConversationSession, 'id'> = {
      familyId,
      promptId,
      participantIds,
      duration: 0,
      topics: [],
      insights: [],
      satisfaction: {},
      createdAt: new Date()
    };

    return databaseService.create<ConversationSession>(COLLECTIONS.CONVERSATION_SESSIONS, sessionData);
  }

  // Complete a conversation session
  async completeConversationSession(
    sessionId: string,
    data: {
      duration: number;
      topics: string[];
      insights: string[];
      satisfaction: { [userId: string]: number };
    }
  ): Promise<void> {
    await databaseService.update<ConversationSession>(COLLECTIONS.CONVERSATION_SESSIONS, sessionId, {
      ...data,
      completedAt: new Date()
    });
  }

  // Get family conversation sessions
  async getFamilyConversationSessions(
    familyId: string,
    limit: number = 10
  ): Promise<ConversationSession[]> {
    return databaseService.query<ConversationSession>(COLLECTIONS.CONVERSATION_SESSIONS, {
      where: [{ field: 'familyId', operator: '==', value: familyId }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit
    });
  }

  // Subscribe to prompt updates
  subscribeToPrompts(
    options: {
      category?: string;
      difficulty?: DifficultyLevel;
      featured?: boolean;
      limit?: number;
    } = {},
    callback: (prompts: ConversationPrompt[]) => void,
    onError?: (error: Error) => void
  ): string {
    const whereConstraints: any[] = [
      { field: 'isActive', operator: '==', value: true }
    ];

    if (options.category) {
      whereConstraints.push({ field: 'category', operator: '==', value: options.category });
    }

    if (options.difficulty) {
      whereConstraints.push({ field: 'difficulty', operator: '==', value: options.difficulty });
    }

    if (options.featured !== undefined) {
      whereConstraints.push({ field: 'metadata.featured', operator: '==', value: options.featured });
    }

    return databaseService.subscribeToQuery<ConversationPrompt>(COLLECTIONS.PROMPTS, {
      where: whereConstraints,
      orderBy: [
        { field: 'metadata.featured', direction: 'desc' },
        { field: 'createdAt', direction: 'desc' }
      ],
      limit: options.limit || 20,
      onError
    });
  }

  // Subscribe to user progress
  subscribeToUserProgress(
    userId: string,
    callback: (progress: UserProgress[]) => void,
    onError?: (error: Error) => void
  ): string {
    return databaseService.subscribeToQuery<UserProgress>(COLLECTIONS.USER_PROGRESS, {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: [{ field: 'updatedAt', direction: 'desc' }],
      onError
    });
  }
}

export const promptService = new PromptService();