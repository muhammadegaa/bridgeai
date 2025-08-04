/**
 * Performance Monitoring Service
 * Tracks database performance and provides optimization insights
 */

import { databaseService } from './database';
import { COLLECTIONS } from '../types/database';

interface PerformanceMetric {
  operation: string;
  collection: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  cacheHit?: boolean;
}

interface PerformanceStats {
  totalOperations: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  slowestOperations: PerformanceMetric[];
  operationsByCollection: Record<string, number>;
  recentErrors: PerformanceMetric[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 operations
  private readonly slowOperationThreshold = 2000; // 2 seconds

  // Record a database operation
  recordOperation(
    operation: string,
    collection: string,
    duration: number,
    success: boolean,
    error?: string,
    cacheHit?: boolean
  ): void {
    const metric: PerformanceMetric = {
      operation,
      collection,
      duration,
      timestamp: Date.now(),
      success,
      error,
      cacheHit,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (duration > this.slowOperationThreshold) {
      console.warn(`Slow database operation detected: ${operation} on ${collection} took ${duration}ms`);
    }

    // Log errors
    if (!success && error) {
      console.error(`Database operation failed: ${operation} on ${collection} - ${error}`);
    }
  }

  // Get performance statistics
  getStats(timeWindowMs: number = 5 * 60 * 1000): PerformanceStats {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        slowestOperations: [],
        operationsByCollection: {},
        recentErrors: [],
      };
    }

    const totalOperations = recentMetrics.length;
    const successfulOperations = recentMetrics.filter(m => m.success);
    const failedOperations = recentMetrics.filter(m => !m.success);
    const cachedOperations = recentMetrics.filter(m => m.cacheHit);

    const averageResponseTime = successfulOperations.length > 0
      ? successfulOperations.reduce((sum, m) => sum + m.duration, 0) / successfulOperations.length
      : 0;

    const errorRate = (failedOperations.length / totalOperations) * 100;
    const cacheHitRate = (cachedOperations.length / totalOperations) * 100;

    // Get slowest operations
    const slowestOperations = [...recentMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Group by collection
    const operationsByCollection: Record<string, number> = {};
    recentMetrics.forEach(m => {
      operationsByCollection[m.collection] = (operationsByCollection[m.collection] || 0) + 1;
    });

    const recentErrors = failedOperations.slice(-5); // Last 5 errors

    return {
      totalOperations,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      slowestOperations,
      operationsByCollection,
      recentErrors,
    };
  }

  // Get performance insights and recommendations
  getInsights(): string[] {
    const stats = this.getStats();
    const insights: string[] = [];

    if (stats.averageResponseTime > 1000) {
      insights.push('Average response time is high (>1s). Consider optimizing queries or adding indexes.');
    }

    if (stats.errorRate > 5) {
      insights.push(`Error rate is high (${stats.errorRate}%). Check recent errors for patterns.`);
    }

    if (stats.cacheHitRate < 30) {
      insights.push(`Cache hit rate is low (${stats.cacheHitRate}%). Consider increasing cache TTL or improving cache strategy.`);
    }

    const topCollections = Object.entries(stats.operationsByCollection)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (topCollections.length > 0) {
      insights.push(`Most active collections: ${topCollections.map(([name, count]) => `${name} (${count})`).join(', ')}`);
    }

    const slowOperations = stats.slowestOperations.filter(op => op.duration > this.slowOperationThreshold);
    if (slowOperations.length > 0) {
      insights.push(`${slowOperations.length} slow operations detected. Consider query optimization.`);
    }

    if (insights.length === 0) {
      insights.push('Performance looks good! All metrics are within acceptable ranges.');
    }

    return insights;
  }

  // Generate performance report
  generateReport(): {
    summary: PerformanceStats;
    insights: string[];
    recommendations: string[];
  } {
    const summary = this.getStats();
    const insights = this.getInsights();
    const recommendations: string[] = [];

    // Generate specific recommendations
    if (summary.averageResponseTime > 500) {
      recommendations.push('Enable query result caching for frequently accessed data');
      recommendations.push('Review and optimize database indexes');
      recommendations.push('Consider pagination for large result sets');
    }

    if (summary.errorRate > 2) {
      recommendations.push('Implement retry logic for transient failures');
      recommendations.push('Add better error handling and validation');
      recommendations.push('Monitor for rate limiting issues');
    }

    if (summary.cacheHitRate < 50) {
      recommendations.push('Increase cache TTL for stable data');
      recommendations.push('Implement cache warming for critical data');
      recommendations.push('Review cache invalidation strategy');
    }

    // Collection-specific recommendations
    const journalOps = summary.operationsByCollection[COLLECTIONS.JOURNAL_ENTRIES] || 0;
    const promptOps = summary.operationsByCollection[COLLECTIONS.PROMPTS] || 0;

    if (journalOps > promptOps * 2) {
      recommendations.push('Journal entries are accessed frequently - consider implementing real-time listeners');
    }

    if (summary.slowestOperations.some(op => op.collection === COLLECTIONS.JOURNAL_ENTRIES)) {
      recommendations.push('Optimize journal entry queries with compound indexes on (familyId, isShared, createdAt)');
    }

    return {
      summary,
      insights,
      recommendations,
    };
  }

  // Clear old metrics
  clearMetrics(): void {
    this.metrics = [];
  }

  // Export metrics for analysis
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Import metrics (for testing or analysis)
  importMetrics(metrics: PerformanceMetric[]): void {
    this.metrics = [...metrics].slice(-this.maxMetrics);
  }
}

// Create performance monitor wrapper for database service
export class MonitoredDatabaseService {
  private monitor = new PerformanceMonitor();

  // Wrap database operations with performance monitoring
  async create<T extends Record<string, any>>(
    collectionName: string,
    data: Omit<T, 'id'>,
    validateFn?: (data: Omit<T, 'id'>) => void
  ): Promise<string> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      const result = await databaseService.create(collectionName, data, validateFn);
      success = true;
      return result;
    } catch (e: any) {
      error = e.message;
      throw e;
    } finally {
      const duration = Date.now() - startTime;
      this.monitor.recordOperation('create', collectionName, duration, success, error);
    }
  }

  async get<T>(
    collectionName: string,
    documentId: string,
    useCache: boolean = true
  ): Promise<T | null> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;
    let cacheHit = false;

    try {
      // Check if we're using cache
      if (useCache) {
        const cacheStats = databaseService.getCacheStats();
        const cacheKey = `${collectionName}_${documentId}`;
        cacheHit = cacheStats.keys.includes(cacheKey);
      }

      const result = await databaseService.get<T>(collectionName, documentId, useCache);
      success = true;
      return result;
    } catch (e: any) {
      error = e.message;
      throw e;
    } finally {
      const duration = Date.now() - startTime;
      this.monitor.recordOperation('get', collectionName, duration, success, error, cacheHit);
    }
  }

  async query<T>(
    collectionName: string,
    options: any = {}
  ): Promise<T[]> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;
    let cacheHit = false;

    try {
      if (options.useCache !== false) {
        cacheHit = true; // Simplified cache detection
      }

      const result = await databaseService.query<T>(collectionName, options);
      success = true;
      return result;
    } catch (e: any) {
      error = e.message;
      throw e;
    } finally {
      const duration = Date.now() - startTime;
      this.monitor.recordOperation('query', collectionName, duration, success, error, cacheHit);
    }
  }

  async update<T extends Record<string, any>>(
    collectionName: string,
    documentId: string,
    updates: Partial<T>,
    validateFn?: (data: Partial<T>) => void
  ): Promise<void> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      await databaseService.update(collectionName, documentId, updates, validateFn);
      success = true;
    } catch (e: any) {
      error = e.message;
      throw e;
    } finally {
      const duration = Date.now() - startTime;
      this.monitor.recordOperation('update', collectionName, duration, success, error);
    }
  }

  async delete(collectionName: string, documentId: string): Promise<void> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      await databaseService.delete(collectionName, documentId);
      success = true;
    } catch (e: any) {
      error = e.message;
      throw e;
    } finally {
      const duration = Date.now() - startTime;
      this.monitor.recordOperation('delete', collectionName, duration, success, error);
    }
  }

  // Performance monitoring methods
  getPerformanceStats(timeWindowMs?: number) {
    return this.monitor.getStats(timeWindowMs);
  }

  getPerformanceInsights() {
    return this.monitor.getInsights();
  }

  generatePerformanceReport() {
    return this.monitor.generateReport();
  }

  clearPerformanceMetrics() {
    this.monitor.clearMetrics();
  }

  // Delegate other methods to original service
  subscribeToDocument<T>(...args: any[]) {
    return (databaseService as any).subscribeToDocument<T>(...args);
  }

  subscribeToQuery<T>(...args: any[]) {
    return (databaseService as any).subscribeToQuery<T>(...args);
  }

  unsubscribe(listenerId: string) {
    return databaseService.unsubscribe(listenerId);
  }

  clearCache() {
    return databaseService.clearCache();
  }

  getCacheStats() {
    return databaseService.getCacheStats();
  }

  cleanup() {
    return databaseService.cleanup();
  }
}

export const monitoredDatabaseService = new MonitoredDatabaseService();
export const performanceMonitor = new PerformanceMonitor();