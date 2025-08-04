/**
 * Production Database Service Layer
 * Provides centralized database operations with caching, validation, and error handling
 */

import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  runTransaction,
  onSnapshot,
  QueryConstraint,
  DocumentSnapshot,
  Query,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, ValidationRules } from '../types/database';

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DatabaseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation: string,
    public collection?: string,
    public documentId?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Query options interface
export interface QueryOptions {
  limit?: number;
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  where?: { field: string; operator: any; value: any }[];
  startAfter?: DocumentSnapshot;
  useCache?: boolean;
  cacheTTL?: number;
}

export interface RealtimeOptions {
  includeMetadataChanges?: boolean;
  onError?: (error: Error) => void;
}

// Main Database Service
export class DatabaseService {
  private cache = new DatabaseCache();
  private activeListeners = new Map<string, Unsubscribe>();

  constructor() {
    // Clean up listeners on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }
  }

  // Validation methods
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateDisplayName(name: string): void {
    if (name.length < ValidationRules.displayName.minLength) {
      throw new ValidationError(
        `Display name must be at least ${ValidationRules.displayName.minLength} characters`,
        'displayName',
        name
      );
    }
    if (name.length > ValidationRules.displayName.maxLength) {
      throw new ValidationError(
        `Display name must not exceed ${ValidationRules.displayName.maxLength} characters`,
        'displayName',
        name
      );
    }
    if (!ValidationRules.displayName.pattern.test(name)) {
      throw new ValidationError(
        'Display name contains invalid characters',
        'displayName',
        name
      );
    }
  }

  private validateJournalContent(title: string, content: string): void {
    if (title.length > ValidationRules.journalTitle.maxLength) {
      throw new ValidationError(
        `Title must not exceed ${ValidationRules.journalTitle.maxLength} characters`,
        'title',
        title
      );
    }
    if (content.length < ValidationRules.journalContent.minLength) {
      throw new ValidationError(
        `Content must be at least ${ValidationRules.journalContent.minLength} characters`,
        'content',
        content
      );
    }
    if (content.length > ValidationRules.journalContent.maxLength) {
      throw new ValidationError(
        `Content must not exceed ${ValidationRules.journalContent.maxLength} characters`,
        'content',
        content
      );
    }
  }

  // Generic CRUD operations
  async create<T extends Record<string, any>>(
    collectionName: string,
    data: Omit<T, 'id'>,
    validateFn?: (data: Omit<T, 'id'>) => void
  ): Promise<string> {
    try {
      if (validateFn) {
        validateFn(data);
      }

      const now = Timestamp.now();
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, collectionName), docData);
      
      // Invalidate related caches
      this.cache.invalidatePattern(`${collectionName}_`);
      
      return docRef.id;
    } catch (error: any) {
      throw new DatabaseError(
        error.message || 'Failed to create document',
        error.code || 'create_failed',
        'create',
        collectionName
      );
    }
  }

  async get<T>(
    collectionName: string,
    documentId: string,
    useCache: boolean = true
  ): Promise<T | null> {
    const cacheKey = `${collectionName}_${documentId}`;
    
    if (useCache) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) return cached;
    }

    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as T;

      if (useCache) {
        this.cache.set(cacheKey, data);
      }

      return data;
    } catch (error: any) {
      throw new DatabaseError(
        error.message || 'Failed to get document',
        error.code || 'get_failed',
        'get',
        collectionName,
        documentId
      );
    }
  }

  async query<T>(
    collectionName: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    const {
      limit: queryLimit,
      orderBy: orderByOptions,
      where: whereOptions,
      startAfter: startAfterDoc,
      useCache = true,
      cacheTTL,
    } = options;

    const cacheKey = `${collectionName}_query_${JSON.stringify(options)}`;
    
    if (useCache) {
      const cached = this.cache.get<T[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const constraints: QueryConstraint[] = [];

      if (whereOptions) {
        whereOptions.forEach(({ field, operator, value }) => {
          constraints.push(where(field, operator, value));
        });
      }

      if (orderByOptions) {
        orderByOptions.forEach(({ field, direction }) => {
          constraints.push(orderBy(field, direction));
        });
      }

      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc));
      }

      if (queryLimit) {
        constraints.push(limit(queryLimit));
      }

      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const results: T[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as T);
      });

      if (useCache) {
        this.cache.set(cacheKey, results, cacheTTL);
      }

      return results;
    } catch (error: any) {
      throw new DatabaseError(
        error.message || 'Failed to query documents',
        error.code || 'query_failed',
        'query',
        collectionName
      );
    }
  }

  async update<T extends Record<string, any>>(
    collectionName: string,
    documentId: string,
    updates: Partial<T>,
    validateFn?: (data: Partial<T>) => void
  ): Promise<void> {
    try {
      if (validateFn) {
        validateFn(updates);
      }

      const docRef = doc(db, collectionName, documentId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);
      
      // Invalidate caches
      this.cache.delete(`${collectionName}_${documentId}`);
      this.cache.invalidatePattern(`${collectionName}_query`);
    } catch (error: any) {
      throw new DatabaseError(
        error.message || 'Failed to update document',
        error.code || 'update_failed',
        'update',
        collectionName,
        documentId
      );
    }
  }

  async delete(
    collectionName: string,
    documentId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      
      // Invalidate caches
      this.cache.delete(`${collectionName}_${documentId}`);
      this.cache.invalidatePattern(`${collectionName}_query`);
    } catch (error: any) {
      throw new DatabaseError(
        error.message || 'Failed to delete document',
        error.code || 'delete_failed',
        'delete',
        collectionName,
        documentId
      );
    }
  }

  // Batch operations
  async batchWrite(operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    id?: string;
    data?: Record<string, any>;
  }>): Promise<void> {
    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();

      operations.forEach(({ type, collection: collectionName, id, data }) => {
        switch (type) {
          case 'create':
            if (!data) throw new Error('Data required for create operation');
            const createRef = doc(collection(db, collectionName));
            batch.set(createRef, {
              ...data,
              createdAt: now,
              updatedAt: now,
            });
            break;

          case 'update':
            if (!id || !data) throw new Error('ID and data required for update operation');
            const updateRef = doc(db, collectionName, id);
            batch.update(updateRef, {
              ...data,
              updatedAt: now,
            });
            break;

          case 'delete':
            if (!id) throw new Error('ID required for delete operation');
            const deleteRef = doc(db, collectionName, id);
            batch.delete(deleteRef);
            break;
        }
      });

      await batch.commit();
      
      // Clear all caches after batch operation
      this.cache.clear();
    } catch (error: any) {
      throw new DatabaseError(
        error.message || 'Failed to execute batch operation',
        error.code || 'batch_failed',
        'batch'
      );
    }
  }

  // Transaction
  async transaction<T>(
    transactionFn: (transaction: any) => Promise<T>
  ): Promise<T> {
    try {
      return await runTransaction(db, transactionFn);
    } catch (error: any) {
      throw new DatabaseError(
        error.message || 'Transaction failed',
        error.code || 'transaction_failed',
        'transaction'
      );
    }
  }

  // Real-time listeners
  subscribeToDocument<T>(
    collectionName: string,
    documentId: string,
    callback: (data: T | null) => void,
    options: RealtimeOptions = {}
  ): string {
    const listenerId = `${collectionName}_${documentId}_${Date.now()}`;
    
    try {
      const docRef = doc(db, collectionName, documentId);
      const unsubscribe = onSnapshot(
        docRef,
        {
          includeMetadataChanges: options.includeMetadataChanges || false,
        },
        (docSnap) => {
          if (docSnap.exists()) {
            const data = {
              id: docSnap.id,
              ...docSnap.data(),
              createdAt: docSnap.data().createdAt?.toDate(),
              updatedAt: docSnap.data().updatedAt?.toDate(),
            } as T;
            callback(data);
          } else {
            callback(null);
          }
        },
        (error) => {
          if (options.onError) {
            options.onError(error);
          } else {
            console.error('Firestore listener error:', error);
          }
        }
      );

      this.activeListeners.set(listenerId, unsubscribe);
      return listenerId;
    } catch (error: any) {
      throw new DatabaseError(
        error.message || 'Failed to create document listener',
        error.code || 'listener_failed',
        'subscribe',
        collectionName,
        documentId
      );
    }
  }

  subscribeToQuery<T>(
    collectionName: string,
    options: QueryOptions & RealtimeOptions = {}
  ): string {
    const listenerId = `${collectionName}_query_${Date.now()}`;
    
    try {
      const constraints: QueryConstraint[] = [];

      if (options.where) {
        options.where.forEach(({ field, operator, value }) => {
          constraints.push(where(field, operator, value));
        });
      }

      if (options.orderBy) {
        options.orderBy.forEach(({ field, direction }) => {
          constraints.push(orderBy(field, direction));
        });
      }

      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, collectionName), ...constraints);
      const unsubscribe = onSnapshot(
        q,
        {
          includeMetadataChanges: options.includeMetadataChanges || false,
        },
        (querySnapshot) => {
          const results: T[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            results.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
            } as T);
          });
          
          // Update callback would be passed in a more complete implementation
          // For now, this establishes the pattern
        },
        (error) => {
          if (options.onError) {
            options.onError(error);
          } else {
            console.error('Firestore query listener error:', error);
          }
        }
      );

      this.activeListeners.set(listenerId, unsubscribe);
      return listenerId;
    } catch (error: any) {
      throw new DatabaseError(
        error.message || 'Failed to create query listener',
        error.code || 'listener_failed',
        'subscribe',
        collectionName
      );
    }
  }

  unsubscribe(listenerId: string): void {
    const unsubscribe = this.activeListeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.activeListeners.delete(listenerId);
    }
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache['cache'].size,
      keys: Array.from(this.cache['cache'].keys()),
    };
  }

  // Cleanup
  cleanup(): void {
    // Unsubscribe from all listeners
    this.activeListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.activeListeners.clear();
    
    // Clear cache
    this.cache.clear();
  }
}

// Singleton instance
export const databaseService = new DatabaseService();