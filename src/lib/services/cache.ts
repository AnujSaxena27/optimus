/**
 * Cache Service
 * In-memory caching with TTL and automatic eviction
 * Prevents redundant API calls for identical requests
 */

import { INFERENCE_CONFIG } from '@/config/constants';
import { CacheEntry } from '@/lib/utils/types';
import { logger } from './logging';

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private ttlMs = INFERENCE_CONFIG.CACHE_TTL_SECONDS * 1000;
  private maxEntries = INFERENCE_CONFIG.CACHE_MAX_ENTRIES;
  private totalHits = 0;
  private totalMisses = 0;

  private constructor() {
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Generate cache key from request parameters
   */
  private generateKey(model: string, message: string, temperature?: number): string {
    // Simple hash-like key combining model + message + params
    const params = `${model}:${message}:${temperature || 0}`;
    // In production, use proper hashing: crypto.createHash('sha256').update(params).digest('hex')
    return Buffer.from(params).toString('base64');
  }

  /**
   * Get cached response
   */
  get<T>(model: string, message: string, temperature?: number): T | null {
    const key = this.generateKey(model, message, temperature);
    const entry = this.cache.get(key);

    if (!entry) {
      this.totalMisses++;
      return null;
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.totalMisses++;
      return null;
    }

    // Update stats
    entry.hits++;
    this.totalHits++;
    logger.debug(`Cache HIT for key: ${key}`, { hits: entry.hits });

    return entry.value as T;
  }

  /**
   * Set cached response
   */
  set<T>(model: string, message: string, value: T, temperature?: number): void {
    // Prevent cache from growing too large
    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    const key = this.generateKey(model, message, temperature);
    const expiresAt = new Date(Date.now() + this.ttlMs);

    const entry: CacheEntry<T> = {
      key,
      value,
      expiresAt,
      hits: 0,
      createdAt: new Date(),
    };

    this.cache.set(key, entry);
    logger.debug(`Cache SET for key: ${key}`, { ttlSeconds: this.ttlMs / 1000 });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`Cache cleared`, { entriesRemoved: size });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.totalHits + this.totalMisses;
    const hitRate = total > 0 ? (this.totalHits / total) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxEntries,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  /**
   * Remove expired entries and update memory usage stats
   */
  private cleanup(): void {
    let removedCount = 0;
    const now = new Date();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug(`Cache cleanup: removed ${removedCount} expired entries`);
    }
  }

  /**
   * Evict Least Recently Used (LRU) entry to make space
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let minHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      logger.debug(`Evicted LRU entry: ${lruKey}`);
    }
  }
}

export const cacheService = CacheService.getInstance();
