import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  doc,
  updateDoc,
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

export const journalService = {
  // Create a new journal entry
  async createEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'journalEntries'), {
        ...entry,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        likes: [],
        comments: []
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw new Error('Failed to create journal entry');
    }
  },

  // Get journal entries for a user
  async getEntries(userId: string, sharedOnly = false): Promise<JournalEntry[]> {
    try {
      let q;
      
      if (sharedOnly) {
        // Get shared entries from all users in the same family
        q = query(
          collection(db, 'journalEntries'),
          where('isShared', '==', true),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Get user's own entries (both shared and private)
        q = query(
          collection(db, 'journalEntries'),
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
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole,
          title: data.title,
          content: data.content,
          isShared: data.isShared,
          tags: data.tags || [],
          promptId: data.promptId,
          promptTitle: data.promptTitle,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          likes: data.likes || [],
          comments: data.comments || []
        });
      });

      return entries;
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw new Error('Failed to load journal entries');
    }
  },

  // Update an existing journal entry
  async updateEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    try {
      const entryRef = doc(db, 'journalEntries', entryId);
      await updateDoc(entryRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw new Error('Failed to update journal entry');
    }
  },

  // Delete a journal entry
  async deleteEntry(entryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'journalEntries', entryId));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw new Error('Failed to delete journal entry');
    }
  },

  // Like/unlike a journal entry
  async toggleLike(entryId: string, userId: string): Promise<void> {
    try {
      const entryRef = doc(db, 'journalEntries', entryId);
      
      // First, get the current entry to check likes
      const entryDoc = await getDocs(query(collection(db, 'journalEntries'), where('__name__', '==', entryId)));
      
      if (!entryDoc.empty) {
        const currentEntry = entryDoc.docs[0].data();
        const currentLikes = currentEntry.likes || [];
        
        let newLikes;
        if (currentLikes.includes(userId)) {
          // Remove like
          newLikes = currentLikes.filter((id: string) => id !== userId);
        } else {
          // Add like
          newLikes = [...currentLikes, userId];
        }
        
        await updateDoc(entryRef, {
          likes: newLikes,
          updatedAt: Timestamp.fromDate(new Date())
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw new Error('Failed to update like status');
    }
  }
};