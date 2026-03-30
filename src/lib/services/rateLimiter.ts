/**
 * Rate Limiter Service
 * Prevents abuse by limiting requests per user per time window
 */

import { INFERENCE_CONFIG } from '@/config/constants';
import { RateLimitState } from '@/lib/utils/types';
import { logger } from './logging';

class RateLimiterService {
  private static instance: RateLimiterService;
  private userLimits: Map<string, RateLimitState> = new Map();
  private windowMs = INFERENCE_CONFIG.RATE_LIMIT_WINDOW_MS;
  private maxRequests = INFERENCE_CONFIG.RATE_LIMIT_MAX_REQUESTS;

  private constructor() {
    // Cleanup expired rate limit entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  static getInstance(): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService();
    }
    return RateLimiterService.instance;
  }

  /**
   * Check if user has exceeded rate limit
   */
  isLimited(userId: string): boolean {
    const now = new Date();
    const state = this.userLimits.get(userId);

    if (!state) {
      // First request from user
      this.userLimits.set(userId, {
        userId,
        requestCount: 1,
        windowStart: now,
        exceeded: false,
      });
      return false;
    }

    // Check if window has expired
    const windowExpired = now.getTime() - state.windowStart.getTime() > this.windowMs;

    if (windowExpired) {
      // Reset window
      state.windowStart = now;
      state.requestCount = 1;
      state.exceeded = false;
      return false;
    }

    // Increment request count
    state.requestCount++;

    if (state.requestCount > this.maxRequests) {
      state.exceeded = true;

      if (state.requestCount === this.maxRequests + 1) {
        // Log only on first limit exceed
        logger.warn(`Rate limit exceeded for user: ${userId}`, {
          userId,
          requestCount: state.requestCount,
          limit: this.maxRequests,
        });
      }

      return true;
    }

    return false;
  }

  /**
   * Get remaining requests for user
   */
  getRemainingRequests(userId: string): number {
    const state = this.userLimits.get(userId);

    if (!state) return this.maxRequests;

    const now = new Date();
    const windowExpired = now.getTime() - state.windowStart.getTime() > this.windowMs;

    if (windowExpired) return this.maxRequests;

    return Math.max(0, this.maxRequests - state.requestCount);
  }

  /**
   * Get window reset time for user
   */
  getWindowResetTime(userId: string): Date {
    const state = this.userLimits.get(userId);

    if (!state) return new Date();

    return new Date(state.windowStart.getTime() + this.windowMs);
  }

  /**
   * Reset limit for user (admin use)
   */
  reset(userId: string): void {
    this.userLimits.delete(userId);
    logger.info(`Rate limit reset for user: ${userId}`);
  }

  /**
   * Cleanup old rate limit entries
   */
  private cleanup(): void {
    const now = new Date();
    let removedCount = 0;

    for (const [userId, state] of this.userLimits.entries()) {
      const windowExpired = now.getTime() - state.windowStart.getTime() > this.windowMs * 2;
      if (windowExpired) {
        this.userLimits.delete(userId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug(`Rate limiter cleanup: removed ${removedCount} entries`);
    }
  }
}

export const rateLimiterService = RateLimiterService.getInstance();
