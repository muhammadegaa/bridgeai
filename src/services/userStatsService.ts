import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserStats {
  userId: string;
  conversationsStarted: number;
  termsLearned: number;
  journalEntries: number;
  daysActive: number;
  currentStreak: number;
  longestStreak: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  totalPoints: number;
  achievements: string[];
  lastActiveDate: Date;
  createdAt: Date;
}

class UserStatsServiceClass {
  private readonly statsCollectionName = 'userStats';

  // Initialize user stats when they first sign up
  async initializeUserStats(userId: string): Promise<void> {
    try {
      const userStatsRef = doc(db, this.statsCollectionName, userId);
      const existingStats = await getDoc(userStatsRef);
      
      if (!existingStats.exists()) {
        const initialStats: Omit<UserStats, 'userId'> = {
          conversationsStarted: 0,
          termsLearned: 0,
          journalEntries: 0,
          daysActive: 0,
          currentStreak: 0,
          longestStreak: 0,
          level: 'Beginner',
          totalPoints: 0,
          achievements: [],
          lastActiveDate: new Date(),
          createdAt: new Date()
        };

        await setDoc(userStatsRef, {
          ...initialStats,
          lastActiveDate: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error initializing user stats:', error);
      throw error;
    }
  }

  // Get user stats
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      await this.initializeUserStats(userId);
      
      const userStatsRef = doc(db, this.statsCollectionName, userId);
      const docSnap = await getDoc(userStatsRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          userId,
          conversationsStarted: data.conversationsStarted || 0,
          termsLearned: data.termsLearned || 0,
          journalEntries: data.journalEntries || 0,
          daysActive: data.daysActive || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          level: data.level || 'Beginner',
          totalPoints: data.totalPoints || 0,
          achievements: data.achievements || [],
          lastActiveDate: data.lastActiveDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }
      
      throw new Error('User stats not found');
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Update user stats when they perform an action
  async updateStats(userId: string, action: 'conversation' | 'journal' | 'term_lookup', _description: string): Promise<void> {
    try {
      const docRef = doc(db, this.statsCollectionName, userId);
      const stats = await this.getUserStats(userId);
      
      // Calculate streak
      const lastActive = stats.lastActiveDate;
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      let newStreak = stats.currentStreak;
      let newDaysActive = stats.daysActive;
      
      if (daysDiff === 0) {
        // Same day, no change to streak
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        newStreak += 1;
        newDaysActive += 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
        newDaysActive += 1;
      }

      // Points system
      const points = this.getPointsForAction(action);
      const newTotalPoints = stats.totalPoints + points;
      const newLevel = this.calculateLevel(newTotalPoints);

      // Update specific counters
      const updates: any = {
        lastActiveDate: serverTimestamp(),
        currentStreak: newStreak,
        daysActive: newDaysActive,
        totalPoints: newTotalPoints,
        level: newLevel,
        longestStreak: Math.max(stats.longestStreak, newStreak)
      };

      if (action === 'conversation') {
        updates.conversationsStarted = increment(1);
      } else if (action === 'journal') {
        updates.journalEntries = increment(1);
      } else if (action === 'term_lookup') {
        updates.termsLearned = increment(1);
      }

      await updateDoc(docRef, updates);

      // Check for new achievements
      await this.checkAchievements(userId);
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  private getPointsForAction(action: string): number {
    const pointsMap = {
      'conversation': 10,
      'journal': 15,
      'term_lookup': 5
    };
    return pointsMap[action as keyof typeof pointsMap] || 1;
  }

  private calculateLevel(totalPoints: number): 'Beginner' | 'Intermediate' | 'Advanced' {
    if (totalPoints >= 500) return 'Advanced';
    if (totalPoints >= 150) return 'Intermediate';
    return 'Beginner';
  }

  private async checkAchievements(userId: string): Promise<void> {
    try {
      const stats = await this.getUserStats(userId);
      const newAchievements: string[] = [];

      // Define achievements
      const achievements = [
        {
          id: 'first_conversation',
          name: 'First Conversation',
          condition: stats.conversationsStarted >= 1
        },
        {
          id: 'curious_learner',
          name: 'Curious Learner',
          condition: stats.termsLearned >= 10
        },
        {
          id: 'journal_writer',
          name: 'Journal Writer',
          condition: stats.journalEntries >= 5
        },
        {
          id: 'streak_master',
          name: 'Streak Master',
          condition: stats.currentStreak >= 7
        }
      ];

      // Check which achievements are newly earned
      for (const achievement of achievements) {
        if (achievement.condition && !stats.achievements.includes(achievement.id)) {
          newAchievements.push(achievement.id);
        }
      }

      // Update achievements if any new ones are earned
      if (newAchievements.length > 0) {
        await updateDoc(doc(db, this.statsCollectionName, userId), {
          achievements: [...stats.achievements, ...newAchievements]
        });
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  // Get dashboard stats for display
  async getDashboardStats(userId: string) {
    const stats = await this.getUserStats(userId);
    
    return {
      conversationsStarted: stats.conversationsStarted,
      termsLearned: stats.termsLearned,
      journalEntries: stats.journalEntries,
      currentStreak: stats.currentStreak,
      level: stats.level,
      totalPoints: stats.totalPoints,
      achievements: stats.achievements
    };
  }
}

export const userStatsService = new UserStatsServiceClass();