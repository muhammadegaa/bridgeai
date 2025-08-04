import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Prompt {
  id?: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'special';
  ageGroup: '10-13' | '14-17' | 'all';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  estimatedTime: string;
  parentGuidance: string;
  childQuestion: string;
  followUpQuestions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProgress {
  id?: string;
  userId: string;
  promptId: string;
  completed: boolean;
  completedAt?: Date;
  rating?: number;
  notes?: string;
}

const PROMPTS_COLLECTION = 'conversationPrompts';
const PROGRESS_COLLECTION = 'userProgress';

export const promptService = {
  // Get all prompts
  async getPrompts(): Promise<Prompt[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PROMPTS_COLLECTION));
      const prompts: Prompt[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        prompts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Prompt);
      });
      
      return prompts;
    } catch (error) {
      console.error('Error getting prompts:', error);
      throw error;
    }
  },

  // Create initial prompts (admin function)
  async initializePrompts(): Promise<void> {
    try {
      const defaultPrompts: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          title: 'What is Artificial Intelligence?',
          description: 'Start with the basics - explore what AI really means in simple terms.',
          category: 'daily',
          ageGroup: 'all',
          difficulty: 'beginner',
          tags: ['basics', 'introduction'],
          estimatedTime: '15 minutes',
          parentGuidance: 'Begin by asking what your child already knows about AI. Use everyday examples like voice assistants or recommendation systems.',
          childQuestion: 'Can you think of any AI that you use every day?',
          followUpQuestions: [
            'How do you think AI learns new things?',
            'What makes AI different from regular computer programs?',
            'What questions do you have about AI?'
          ]
        },
        {
          title: 'AI in Social Media',
          description: 'Discuss how AI shapes what we see online and its impact on our daily lives.',
          category: 'weekly',
          ageGroup: '14-17',
          difficulty: 'intermediate',
          tags: ['social media', 'algorithms', 'ethics'],
          estimatedTime: '25 minutes',
          parentGuidance: 'Focus on algorithmic feeds and personalization. Discuss both benefits and potential concerns.',
          childQuestion: 'Have you noticed that your social media shows you things you\'re interested in?',
          followUpQuestions: [
            'How do you think these platforms know what you like?',
            'Are there any downsides to AI choosing what we see?',
            'How can we use social media more mindfully?'
          ]
        },
        {
          title: 'AI and Privacy',
          description: 'Explore how AI uses our data and what that means for privacy.',
          category: 'weekly',
          ageGroup: 'all',
          difficulty: 'intermediate',
          tags: ['privacy', 'data', 'ethics'],
          estimatedTime: '20 minutes',
          parentGuidance: 'Help your child understand data collection without creating fear. Focus on making informed choices.',
          childQuestion: 'What information do you think apps collect about us?',
          followUpQuestions: [
            'Why might companies want our data?',
            'How can we protect our privacy online?',
            'What are the benefits and risks of sharing data?'
          ]
        }
      ];

      for (const prompt of defaultPrompts) {
        await addDoc(collection(db, PROMPTS_COLLECTION), {
          ...prompt,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        });
      }
    } catch (error) {
      console.error('Error initializing prompts:', error);
      throw error;
    }
  },

  // Mark prompt as completed
  async markPromptCompleted(userId: string, promptId: string, rating?: number, notes?: string): Promise<void> {
    try {
      await addDoc(collection(db, PROGRESS_COLLECTION), {
        userId,
        promptId,
        completed: true,
        completedAt: Timestamp.fromDate(new Date()),
        rating,
        notes
      });
    } catch (error) {
      console.error('Error marking prompt as completed:', error);
      throw error;
    }
  },

  // Get user's progress
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const q = query(
        collection(db, PROGRESS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const progress: UserProgress[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        progress.push({
          id: doc.id,
          ...data,
          completedAt: data.completedAt?.toDate()
        } as UserProgress);
      });
      
      return progress;
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }
};