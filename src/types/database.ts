/**
 * Production-ready database types and schemas for BridgeAI
 * Centralized type definitions with validation schemas
 */

import { Timestamp } from 'firebase/firestore';

// Core Entity Types
export interface Family {
  id?: string;
  name: string;
  parentIds: string[];
  childIds: string[];
  inviteCode: string; // For family joining
  settings: FamilySettings;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface FamilySettings {
  allowSharing: boolean;
  notificationsEnabled: boolean;
  conversationReminders: 'daily' | 'weekly' | 'none';
  contentFiltering: 'strict' | 'moderate' | 'relaxed';
  maxChildAge: number;
}

export interface User {
  id?: string;
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  role: 'parent' | 'child';
  familyId: string;
  profile: UserProfile;
  preferences: UserPreferences;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastActiveAt: Date | Timestamp;
  isActive: boolean;
}

export interface UserProfile {
  age?: number;
  interests: string[];
  aiExperienceLevel: 'beginner' | 'intermediate' | 'advanced';
  avatar?: string;
  bio?: string;
  completedOnboarding: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  conversationReminders: boolean;
  newContent: boolean;
  familyActivity: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'family' | 'private';
  allowDataCollection: boolean;
  shareProgress: boolean;
}

// Content Types
export interface ConversationPrompt {
  id?: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'special' | 'trending';
  ageGroups: AgeGroup[];
  difficulty: DifficultyLevel;
  tags: string[];
  estimatedTime: number; // minutes
  content: PromptContent;
  metadata: PromptMetadata;
  isActive: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface PromptContent {
  parentGuidance: string;
  childQuestion: string;
  followUpQuestions: string[];
  resources?: PromptResource[];
  objectives: string[];
}

export interface PromptResource {
  type: 'article' | 'video' | 'interactive' | 'game';
  title: string;
  url: string;
  description: string;
  ageGroup: AgeGroup;
}

export interface PromptMetadata {
  authorId: string;
  version: number;
  completionCount: number;
  averageRating: number;
  ratingCount: number;
  featured: boolean;
}

export interface JournalEntry {
  id?: string;
  userId: string;
  familyId: string;
  title: string;
  content: string;
  isShared: boolean;
  tags: string[];
  promptId?: string;
  promptTitle?: string;
  metadata: JournalMetadata;
  engagement: JournalEngagement;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface JournalMetadata {
  wordCount: number;
  readingTime: number; // estimated minutes
  contentType: 'reflection' | 'discovery' | 'question' | 'insight';
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
    complexity: number; // 1-10
    suggestedFollowUps: string[];
  };
}

export interface JournalEngagement {
  likes: string[]; // User IDs
  comments: Comment[];
  shares: number;
  views: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: 'parent' | 'child';
  content: string;
  parentCommentId?: string; // For nested comments
  isEdited: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Progress and Analytics
export interface UserProgress {
  id?: string;
  userId: string;
  promptId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: Date | Timestamp;
  rating?: number; // 1-5
  notes?: string;
  timeSpent: number; // minutes
  followUpCompleted: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface ConversationSession {
  id?: string;
  familyId: string;
  promptId: string;
  participantIds: string[];
  duration: number; // minutes
  topics: string[];
  insights: string[];
  satisfaction: {
    [userId: string]: number; // 1-5 rating
  };
  createdAt: Date | Timestamp;
  completedAt?: Date | Timestamp;
}

export interface FamilyAnalytics {
  familyId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    conversationsHeld: number;
    journalEntriesCreated: number;
    topicsExplored: string[];
    engagementScore: number; // 0-100
    progressTrend: 'improving' | 'stable' | 'declining';
  };
  insights: AnalyticsInsight[];
  generatedAt: Date | Timestamp;
}

export interface AnalyticsInsight {
  type: 'achievement' | 'suggestion' | 'milestone' | 'concern';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

// AI and Content Management
export interface AITerm {
  id?: string;
  term: string;
  aliases: string[];
  category: 'basics' | 'ethics' | 'safety' | 'tools' | 'concepts' | 'advanced';
  definitions: {
    simple: string; // For children
    detailed: string; // For parents/teens
    technical?: string; // For advanced users
  };
  examples: AITermExample[];
  relatedTerms: string[];
  ageAppropriate: AgeGroup[];
  lastUpdated: Date | Timestamp;
  isVerified: boolean;
}

export interface AITermExample {
  context: string;
  explanation: string;
  relatable: boolean; // Is this example relatable to kids?
}

export interface ContentSuggestion {
  id?: string;
  type: 'prompt' | 'topic' | 'resource' | 'activity';
  targetUserId: string;
  familyId: string;
  title: string;
  description: string;
  reason: string; // Why this was suggested
  confidence: number; // 0-1
  priority: number; // 1-10
  metadata: {
    basedOn: string[]; // What triggered this suggestion
    expiresAt: Date | Timestamp;
  };
  status: 'pending' | 'viewed' | 'accepted' | 'dismissed';
  createdAt: Date | Timestamp;
}

// System and Configuration
export interface SystemConfig {
  id: string;
  feature: string;
  enabled: boolean;
  config: Record<string, any>;
  version: string;
  lastUpdated: Date | Timestamp;
}

export interface ErrorLog {
  id?: string;
  userId?: string;
  familyId?: string;
  type: 'validation' | 'api' | 'database' | 'ai' | 'auth';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: Record<string, any>;
  resolved: boolean;
  createdAt: Date | Timestamp;
}

// Type Unions and Enums
export type AgeGroup = '8-10' | '11-13' | '14-16' | '17-18' | 'all';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type UserRole = 'parent' | 'child' | 'admin';

// Collection Names
export const COLLECTIONS = {
  FAMILIES: 'families',
  USERS: 'users',
  PROMPTS: 'conversationPrompts',
  JOURNAL_ENTRIES: 'journalEntries',
  USER_PROGRESS: 'userProgress',
  CONVERSATION_SESSIONS: 'conversationSessions',
  FAMILY_ANALYTICS: 'familyAnalytics',
  AI_TERMS: 'aiTerms',
  CONTENT_SUGGESTIONS: 'contentSuggestions',
  SYSTEM_CONFIG: 'systemConfig',
  ERROR_LOGS: 'errorLogs',
} as const;

// Validation Schemas
export const ValidationRules = {
  familyName: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s'-]+$/,
  },
  displayName: {
    minLength: 2,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9\s'-]+$/,
  },
  journalTitle: {
    minLength: 1,
    maxLength: 100,
  },
  journalContent: {
    minLength: 10,
    maxLength: 5000,
  },
  comment: {
    minLength: 1,
    maxLength: 500,
  },
  tags: {
    maxItems: 10,
    itemMaxLength: 30,
  },
  interests: {
    maxItems: 15,
    itemMaxLength: 30,
  },
} as const;

// Database Indexes (for Firestore)
export const INDEXES = {
  // Journal Entries
  journalEntries: [
    ['familyId', 'isShared', 'createdAt'],
    ['userId', 'createdAt'],
    ['promptId', 'createdAt'],
    ['tags', 'createdAt'],
    ['isShared', 'createdAt'],
  ],
  // Prompts
  conversationPrompts: [
    ['category', 'ageGroups', 'isActive'],
    ['difficulty', 'isActive', 'createdAt'],
    ['tags', 'isActive'],
    ['metadata.featured', 'isActive'],
  ],
  // User Progress
  userProgress: [
    ['userId', 'status', 'updatedAt'],
    ['promptId', 'status'],
    ['userId', 'completedAt'],
  ],
  // Users
  users: [
    ['familyId', 'isActive'],
    ['role', 'familyId'],
    ['lastActiveAt'],
  ],
} as const;