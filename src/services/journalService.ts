/**
 * Enhanced Journal Service with AI integration, caching, and real-time features
 */

import { databaseService, DatabaseError, ValidationError } from './database';
import { aiService } from './aiService';
import { familyService } from './familyService';
import {
  COLLECTIONS,
  JournalEntry,
  Comment,
  User,
  JournalMetadata,
  JournalEngagement,
} from '../types/database';

export class JournalService {
  // Create a new journal entry with AI analysis
  async createEntry(
    userId: string,
    title: string,
    content: string,
    isShared: boolean = false,
    tags: string[] = [],
    promptId?: string
  ): Promise<string> {
    try {
      // Validate user exists and get user info
      const user = await databaseService.get<User>(COLLECTIONS.USERS, userId);
      if (!user) {
        throw new ValidationError('User not found', 'userId', userId);
      }

      // Validate content
      this.validateJournalContent(title, content, tags);

      // Generate AI analysis
      const aiAnalysis = await this.generateAIAnalysis(content, user.profile.age || 12);
      
      // Calculate metadata
      const metadata: JournalMetadata = {
        wordCount: content.trim().split(/\s+/).length,
        readingTime: Math.ceil(content.length / 1000), // Rough estimate
        contentType: this.detectContentType(content),
        aiAnalysis,
      };

      const engagement: JournalEngagement = {
        likes: [],
        comments: [],
        shares: 0,
        views: 0,
      };

      const journalData: Omit<JournalEntry, 'id'> = {
        userId,
        familyId: user.familyId,
        title: title.trim(),
        content: content.trim(),
        isShared,
        tags: tags.map(tag => tag.trim().toLowerCase()),
        promptId,
        metadata,
        engagement,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const entryId = await databaseService.create<JournalEntry>(
        COLLECTIONS.JOURNAL_ENTRIES,
        journalData,
        this.validateJournalEntry
      );

      return entryId;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to create journal entry', 'create_entry_failed', 'createEntry');
    }
  },

  // Get journal entries with filtering and pagination
  async getEntries(options: {
    userId?: string;
    familyId?: string;
    isSharedOnly?: boolean;
    tags?: string[];
    promptId?: string;
    limit?: number;
    startAfter?: any;
  } = {}): Promise<JournalEntry[]> {
    const {
      userId,
      familyId,
      isSharedOnly,
      tags,
      promptId,
      limit = 20,
      startAfter,
    } = options;

    const whereConstraints: any[] = [];
    const orderByConstraints = [{ field: 'createdAt', direction: 'desc' as const }];

    if (familyId) {
      whereConstraints.push({ field: 'familyId', operator: '==', value: familyId });
    }

    if (userId && !isSharedOnly) {
      whereConstraints.push({ field: 'userId', operator: '==', value: userId });
    } else if (isSharedOnly) {
      whereConstraints.push({ field: 'isShared', operator: '==', value: true });
    }

    if (promptId) {
      whereConstraints.push({ field: 'promptId', operator: '==', value: promptId });
    }

    if (tags && tags.length > 0) {
      whereConstraints.push({ field: 'tags', operator: 'array-contains-any', value: tags });
    }

    return databaseService.query<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, {
      where: whereConstraints,
      orderBy: orderByConstraints,
      limit,
      startAfter,
    });
  },

  // Get single journal entry
  async getEntry(entryId: string, viewerId?: string): Promise<JournalEntry | null> {
    const entry = await databaseService.get<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId);
    
    if (entry && viewerId) {
      // Increment view count (but not for the author)
      if (entry.userId !== viewerId) {
        await this.incrementViews(entryId);
      }
    }
    
    return entry;
  }

  // Update a journal entry
  async updateEntry(
    entryId: string,
    userId: string,
    updates: {
      title?: string;
      content?: string;
      isShared?: boolean;
      tags?: string[];
    }
  ): Promise<void> {
    // Verify ownership
    const entry = await databaseService.get<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId);
    if (!entry) {
      throw new DatabaseError('Journal entry not found', 'entry_not_found', 'updateEntry');
    }
    
    if (entry.userId !== userId) {
      throw new ValidationError('You can only edit your own journal entries', 'permission', userId);
    }

    // Validate updates
    if (updates.title || updates.content) {
      this.validateJournalContent(
        updates.title || entry.title,
        updates.content || entry.content,
        updates.tags || entry.tags
      );
    }

    // Regenerate AI analysis if content changed
    let aiAnalysis = entry.metadata.aiAnalysis;
    if (updates.content && updates.content !== entry.content) {
      const user = await databaseService.get<User>(COLLECTIONS.USERS, userId);
      aiAnalysis = await this.generateAIAnalysis(updates.content, user?.profile.age || 12);
    }

    const updateData: any = {
      ...updates,
    };

    if (updates.content) {
      updateData.metadata = {
        ...entry.metadata,
        wordCount: updates.content.trim().split(/\s+/).length,
        readingTime: Math.ceil(updates.content.length / 1000),
        contentType: this.detectContentType(updates.content),
        aiAnalysis,
      };
    }

    if (updates.tags) {
      updateData.tags = updates.tags.map(tag => tag.trim().toLowerCase());
    }

    await databaseService.update<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId, updateData);
  },

  // Delete a journal entry
  async deleteEntry(entryId: string, userId: string): Promise<void> {
    // Verify ownership
    const entry = await databaseService.get<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId);
    if (!entry) {
      throw new DatabaseError('Journal entry not found', 'entry_not_found', 'deleteEntry');
    }
    
    if (entry.userId !== userId) {
      // Check if user is a parent in the same family (parents can delete children's entries)
      const user = await databaseService.get<User>(COLLECTIONS.USERS, userId);
      const isParentInFamily = user?.role === 'parent' && user?.familyId === entry.familyId;
      
      if (!isParentInFamily) {
        throw new ValidationError('You can only delete your own journal entries', 'permission', userId);
      }
    }

    await databaseService.delete(COLLECTIONS.JOURNAL_ENTRIES, entryId);
  },

  // Toggle like on an entry (with transaction to prevent race conditions)
  async toggleLike(entryId: string, userId: string): Promise<{ liked: boolean; totalLikes: number }> {
    return databaseService.transaction(async (transaction) => {
      const entryRef = databaseService.get<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId);
      const entry = await entryRef;
      
      if (!entry) {
        throw new DatabaseError('Journal entry not found', 'entry_not_found', 'toggleLike');
      }

      const likes = entry.engagement.likes || [];
      const hasLiked = likes.includes(userId);
      
      const newLikes = hasLiked
        ? likes.filter(id => id !== userId)
        : [...likes, userId];

      const updateData = {
        'engagement.likes': newLikes,
      };

      await databaseService.update<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId, updateData);

      return {
        liked: !hasLiked,
        totalLikes: newLikes.length,
      };
    });
  },

  // Add a comment to an entry
  async addComment(
    entryId: string,
    userId: string,
    content: string,
    parentCommentId?: string
  ): Promise<string> {
    // Validate comment content
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Comment content is required', 'content', content);
    }
    
    if (content.length > 500) {
      throw new ValidationError('Comment must not exceed 500 characters', 'content', content);
    }

    // Get user info
    const user = await databaseService.get<User>(COLLECTIONS.USERS, userId);
    if (!user) {
      throw new ValidationError('User not found', 'userId', userId);
    }

    // Verify entry exists
    const entry = await databaseService.get<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId);
    if (!entry) {
      throw new DatabaseError('Journal entry not found', 'entry_not_found', 'addComment');
    }

    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName: user.displayName,
      userRole: user.role,
      content: content.trim(),
      parentCommentId,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const comments = [...(entry.engagement.comments || []), newComment];
    
    await databaseService.update<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId, {
      'engagement.comments': comments,
    });

    return newComment.id;
  }

  // Update a comment
  async updateComment(
    entryId: string,
    commentId: string,
    userId: string,
    newContent: string
  ): Promise<void> {
    const entry = await databaseService.get<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId);
    if (!entry) {
      throw new DatabaseError('Journal entry not found', 'entry_not_found', 'updateComment');
    }

    const comments = entry.engagement.comments || [];
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      throw new DatabaseError('Comment not found', 'comment_not_found', 'updateComment');
    }

    const comment = comments[commentIndex];
    if (comment.userId !== userId) {
      throw new ValidationError('You can only edit your own comments', 'permission', userId);
    }

    comments[commentIndex] = {
      ...comment,
      content: newContent.trim(),
      isEdited: true,
      updatedAt: new Date(),
    };

    await databaseService.update<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId, {
      'engagement.comments': comments,
    });
  }

  // Delete a comment
  async deleteComment(entryId: string, commentId: string, userId: string): Promise<void> {
    const entry = await databaseService.get<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId);
    if (!entry) {
      throw new DatabaseError('Journal entry not found', 'entry_not_found', 'deleteComment');
    }

    const comments = entry.engagement.comments || [];
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) {
      throw new DatabaseError('Comment not found', 'comment_not_found', 'deleteComment');
    }

    if (comment.userId !== userId) {
      // Check if user is the entry author or a parent in the same family
      const user = await databaseService.get<User>(COLLECTIONS.USERS, userId);
      const canDelete = entry.userId === userId || 
        (user?.role === 'parent' && user?.familyId === entry.familyId);
      
      if (!canDelete) {
        throw new ValidationError('You can only delete your own comments', 'permission', userId);
      }
    }

    const updatedComments = comments.filter(c => c.id !== commentId);
    
    await databaseService.update<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId, {
      'engagement.comments': updatedComments,
    });
  }

  // Increment view count
  private async incrementViews(entryId: string): Promise<void> {
    try {
      const entry = await databaseService.get<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId);
      if (entry) {
        await databaseService.update<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, entryId, {
          'engagement.views': (entry.engagement.views || 0) + 1,
        });
      }
    } catch (error) {
      // Silently fail view increment to not break the main operation
      console.warn('Failed to increment view count:', error);
    }
  }

  // Get user's journal statistics
  async getUserJournalStats(userId: string): Promise<{
    totalEntries: number;
    totalWords: number;
    totalLikes: number;
    totalComments: number;
    averageRating: number;
    streakDays: number;
  }> {
    const entries = await this.getEntries({ userId });
    
    const stats = {
      totalEntries: entries.length,
      totalWords: entries.reduce((sum, entry) => sum + entry.metadata.wordCount, 0),
      totalLikes: entries.reduce((sum, entry) => sum + (entry.engagement.likes || []).length, 0),
      totalComments: entries.reduce((sum, entry) => sum + (entry.engagement.comments || []).length, 0),
      averageRating: 0, // TODO: Implement rating system
      streakDays: this.calculateStreakDays(entries),
    };

    return stats;
  }

  // Subscribe to journal entries
  subscribeToEntries(
    options: {
      userId?: string;
      familyId?: string;
      isSharedOnly?: boolean;
      limit?: number;
    },
    callback: (entries: JournalEntry[]) => void,
    onError?: (error: Error) => void
  ): string {
    const whereConstraints: any[] = [];
    
    if (options.familyId) {
      whereConstraints.push({ field: 'familyId', operator: '==', value: options.familyId });
    }
    
    if (options.userId && !options.isSharedOnly) {
      whereConstraints.push({ field: 'userId', operator: '==', value: options.userId });
    } else if (options.isSharedOnly) {
      whereConstraints.push({ field: 'isShared', operator: '==', value: true });
    }

    return databaseService.subscribeToQuery<JournalEntry>(COLLECTIONS.JOURNAL_ENTRIES, {
      where: whereConstraints,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: options.limit || 20,
      onError,
    });
  }

  // Helper methods
  private validateJournalContent(title: string, content: string, tags: string[]): void {
    if (!title || title.trim().length === 0) {
      throw new ValidationError('Title is required', 'title', title);
    }
    
    if (title.length > 100) {
      throw new ValidationError('Title must not exceed 100 characters', 'title', title);
    }

    if (!content || content.trim().length < 10) {
      throw new ValidationError('Content must be at least 10 characters', 'content', content);
    }
    
    if (content.length > 5000) {
      throw new ValidationError('Content must not exceed 5000 characters', 'content', content);
    }

    if (tags.length > 10) {
      throw new ValidationError('Maximum 10 tags allowed', 'tags', tags);
    }

    tags.forEach(tag => {
      if (tag.length > 30) {
        throw new ValidationError('Tag must not exceed 30 characters', 'tags', tag);
      }
    });
  }

  private validateJournalEntry(entry: Omit<JournalEntry, 'id'>): void {
    this.validateJournalContent(entry.title, entry.content, entry.tags);
    
    if (!entry.userId) {
      throw new ValidationError('User ID is required', 'userId', entry.userId);
    }
    
    if (!entry.familyId) {
      throw new ValidationError('Family ID is required', 'familyId', entry.familyId);
    }
  }

  private async generateAIAnalysis(content: string, userAge: number): Promise<any> {
    try {
      // Use AI service to analyze content
      const topics = await aiService.analyzeJournalForTopics(content, userAge);
      
      // Simple sentiment analysis (could be enhanced with proper AI)
      const sentiment = this.analyzeSentiment(content);
      
      return {
        sentiment,
        topics: topics.slice(0, 5), // Limit to 5 topics
        complexity: this.calculateComplexity(content),
        suggestedFollowUps: topics.slice(0, 3).map(topic => 
          `How might ${topic} affect your daily life?`
        ),
      };
    } catch (error) {
      console.warn('AI analysis failed, using fallback:', error);
      return {
        sentiment: 'neutral' as const,
        topics: [],
        complexity: 5,
        suggestedFollowUps: [],
      };
    }
  }

  private detectContentType(content: string): 'reflection' | 'discovery' | 'question' | 'insight' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('?') || lowerContent.startsWith('why') || lowerContent.startsWith('how')) {
      return 'question';
    }
    
    if (lowerContent.includes('learned') || lowerContent.includes('discovered') || lowerContent.includes('found out')) {
      return 'discovery';
    }
    
    if (lowerContent.includes('realize') || lowerContent.includes('understand') || lowerContent.includes('insight')) {
      return 'insight';
    }
    
    return 'reflection';
  }

  private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['happy', 'excited', 'love', 'amazing', 'great', 'wonderful', 'fantastic'];
    const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'worried', 'scared'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateComplexity(content: string): number {
    const words = content.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const sentences = content.split(/[.!?]+/).length;
    const avgSentenceLength = words.length / sentences;
    
    // Simple complexity score from 1-10
    const complexity = Math.min(10, Math.round((avgWordLength + avgSentenceLength) / 3));
    return Math.max(1, complexity);
  }

  private calculateStreakDays(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;
    
    const sortedEntries = entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
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
}

export const journalService = new JournalService();