export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'parent' | 'child';
  parentId?: string; // For child users
  childIds?: string[]; // For parent users
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationPrompt {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'special';
  ageGroup: '10-13' | '14-17' | 'all';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  content: {
    parentGuidance: string;
    childQuestion: string;
    followUpQuestions: string[];
  };
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  familyId: string;
  title: string;
  content: string;
  isShared: boolean;
  tags: string[];
  promptId?: string; // If created from a conversation prompt
  createdAt: Date;
  updatedAt: Date;
  likes: string[]; // User IDs who liked this entry
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface AITerm {
  id: string;
  term: string;
  simpleExplanation: string;
  technicalExplanation: string;
  examples: string[];
  relatedTerms: string[];
  category: 'basics' | 'ethics' | 'safety' | 'tools' | 'concepts';
  parentNotes?: string; // Additional context for parents
  lastUpdated: Date;
}

export interface Family {
  id: string;
  name: string;
  parentIds: string[];
  childIds: string[];
  settings: {
    allowSharing: boolean;
    notificationsEnabled: boolean;
    conversationReminders: 'daily' | 'weekly' | 'none';
  };
  createdAt: Date;
}

export interface UserProfile {
  userId: string;
  interests: string[];
  aiExperienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredTopics: string[];
  completedPrompts: string[];
  journalEntries: number;
  joinDate: Date;
}