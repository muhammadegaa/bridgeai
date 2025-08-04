import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface JournalEntry {
  id?: string;
  userId: string;
  userName: string;
  userRole: 'parent' | 'child';
  title: string;
  content: string;
  isShared: boolean;
  tags: string[];
  promptId?: string;
  promptTitle?: string;
  createdAt: Date;
  updatedAt: Date;
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

const COLLECTION_NAME = 'journalEntries';

export const journalService = {
  // Create a new journal entry
  async createEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...entry,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        likes: [],
        comments: []
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  },

  // Get all journal entries (with optional filtering)
  async getEntries(userId?: string, isSharedOnly?: boolean): Promise<JournalEntry[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      
      if (userId && isSharedOnly) {
        // Get shared entries OR user's own entries
        q = query(
          collection(db, COLLECTION_NAME),
          where('isShared', '==', true),
          orderBy('createdAt', 'desc')
        );
      } else if (userId && !isSharedOnly) {
        // Get only user's entries
        q = query(
          collection(db, COLLECTION_NAME),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const entries: JournalEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          comments: data.comments?.map((comment: any) => ({
            ...comment,
            createdAt: comment.createdAt.toDate()
          })) || []
        } as JournalEntry);
      });
      
      return entries;
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  },

  // Update a journal entry
  async updateEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, entryId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  },

  // Delete a journal entry
  async deleteEntry(entryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, entryId));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  },

  // Add a like to an entry
  async toggleLike(entryId: string, userId: string): Promise<void> {
    try {
      // This is a simplified version - in a real app, you'd want to use transactions
      // to avoid race conditions
      const entries = await this.getEntries();
      const entry = entries.find(e => e.id === entryId);
      
      if (entry) {
        const likes = entry.likes || [];
        const hasLiked = likes.includes(userId);
        const newLikes = hasLiked 
          ? likes.filter(id => id !== userId)
          : [...likes, userId];
        
        await this.updateEntry(entryId, { likes: newLikes });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  // Add a comment to an entry
  async addComment(entryId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<void> {
    try {
      const entries = await this.getEntries();
      const entry = entries.find(e => e.id === entryId);
      
      if (entry) {
        const newComment: Comment = {
          ...comment,
          id: Date.now().toString(), // Simple ID generation
          createdAt: new Date()
        };
        
        const comments = [...(entry.comments || []), newComment];
        await this.updateEntry(entryId, { comments });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
};