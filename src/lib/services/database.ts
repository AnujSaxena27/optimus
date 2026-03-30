/**
 * Database Service
 * User request tracking and analytics in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { RequestLog, UserStats } from '@/lib/utils/types';
import { logger } from './logging';

class DatabaseService {
  private static instance: DatabaseService;
  private supabase: any;

  private constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      logger.error('Supabase configuration missing');
      return;
    }

    this.supabase = createClient(url, key);
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Log an inference request to database
   */
  async logRequest(log: RequestLog): Promise<void> {
    try {
      if (!this.supabase) {
        logger.warn('Supabase not configured, skipping log persistence');
        return;
      }

      // Ensure request_logs table exists
      const { error } = await this.supabase
        .from('request_logs')
        .insert([
          {
            id: log.id,
            user_id: log.userId,
            request_id: log.requestId,
            model: log.model,
            input_tokens: log.inputTokens,
            output_tokens: log.outputTokens,
            total_cost: log.totalCost,
            status: log.status,
            error_message: log.errorMessage,
            processing_time_ms: log.processingTimeMs,
            created_at: log.createdAt,
            completed_at: log.completedAt,
            ip_address: log.ipAddress,
            user_agent: log.userAgent,
          },
        ]);

      if (error) {
        logger.error(`Failed to log request: ${error.message}`);
      } else {
        logger.debug(`Request logged: ${log.requestId}`, { userId: log.userId });
      }
    } catch (error) {
      logger.error(`Database error while logging request: ${String(error)}`);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      if (!this.supabase) return null;

      const { data, error } = await this.supabase
        .from('request_logs')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        logger.error(`Failed to fetch user stats: ${error.message}`);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const totalCost = data.reduce((sum: number, log: any) => sum + (log.total_cost || 0), 0);
      const avgTime =
        data.reduce((sum: number, log: any) => sum + (log.processing_time_ms || 0), 0) /
        data.length;
      const lastRequest = new Date(
        Math.max(...data.map((log: any) => new Date(log.created_at).getTime()))
      );
      const modelCounts: Record<string, number> = {};

      data.forEach((log: any) => {
        modelCounts[log.model] = (modelCounts[log.model] || 0) + 1;
      });

      const preferredModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

      return {
        userId,
        totalRequests: data.length,
        totalCost,
        averageResponseTimeMs: avgTime,
        lastRequestAt: lastRequest,
        preferredModel,
      };
    } catch (error) {
      logger.error(`Failed to get user stats: ${String(error)}`);
      return null;
    }
  }

  /**
   * Create request_logs table if it doesn't exist
   */
  async initializeSchema(): Promise<void> {
    try {
      if (!this.supabase) return;

      const { error } = await this.supabase.rpc('setup_request_logs_table');

      if (error) {
        logger.debug(`Schema initialization note: ${error.message}`);
      } else {
        logger.info('Database schema initialized');
      }
    } catch (error) {
      logger.warn(`Could not initialize schema: ${String(error)}`);
    }
  }
}

export const databaseService = DatabaseService.getInstance();
