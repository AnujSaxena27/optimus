/**
 * Request Queue Service
 * Dynamic batching and request queuing for optimized throughput
 * Implements FIFO queue with batch processing and priority support
 */

import { INFERENCE_CONFIG, LOG_EVENTS } from '@/config/constants';
import { InferenceRequest, BatchRequest } from '@/lib/utils/types';
import { logger } from './logging';

type RequestCallback = (request: InferenceRequest) => Promise<any>;

class RequestQueueService {
  private static instance: RequestQueueService;
  private queue: InferenceRequest[] = [];
  private processing = false;
  private batchTimer: NodeJS.Timeout | null = null;
  private totalProcessed = 0;
  private totalFailed = 0;
  private requestCallbacks: Map<string, RequestCallback> = new Map();
  private priorityQueue: InferenceRequest[] = [];

  private constructor() {}

  static getInstance(): RequestQueueService {
    if (!RequestQueueService.instance) {
      RequestQueueService.instance = new RequestQueueService();
    }
    return RequestQueueService.instance;
  }

  /**
   * Enqueue a request for processing
   */
  enqueue(request: InferenceRequest): string {
    // Validate queue size
    if (this.queue.length + this.priorityQueue.length >= INFERENCE_CONFIG.MAX_QUEUE_SIZE) {
      logger.warn(`Queue is full, rejecting request: ${request.id}`, {
        userId: request.userId,
      });
      throw new Error('Request queue is full');
    }

    // Add to appropriate queue based on priority
    if (request.priority === 'high') {
      this.priorityQueue.unshift(request); // Add to front
    } else {
      this.queue.push(request);
    }

    logger.info(`Request enqueued: ${request.id}`, {
      userId: request.userId,
      model: request.model,
      queueSize: this.getQueueSize(),
    });

    // Trigger batch processing
    this.scheduleBatchProcessing();

    return request.id;
  }

  /**
   * Set callback for specific request type/model
   */
  onRequest(key: string, callback: RequestCallback): void {
    this.requestCallbacks.set(key, callback);
  }

  /**
   * Schedule batch processing with timeout
   */
  private scheduleBatchProcessing(): void {
    if (this.processing) return;

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Process immediately if we have a full batch
    if (this.getQueueSize() >= INFERENCE_CONFIG.BATCH_SIZE) {
      this.processBatch();
    } else {
      // Otherwise, wait for timeout
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, INFERENCE_CONFIG.BATCH_TIMEOUT_MS);
    }
  }

  /**
   * Process a batch of queued requests
   */
  private async processBatch(): Promise<void> {
    if (this.processing) return;

    this.processing = true;

    try {
      // Build batch from priority queue first, then regular queue
      const batchSize = Math.min(
        INFERENCE_CONFIG.BATCH_SIZE,
        this.getQueueSize()
      );
      const requests: InferenceRequest[] = [];

      // Priority requests first
      while (requests.length < batchSize && this.priorityQueue.length > 0) {
        const req = this.priorityQueue.shift();
        if (req) requests.push(req);
      }

      // Fill remaining with regular queue
      while (requests.length < batchSize && this.queue.length > 0) {
        const req = this.queue.shift();
        if (req) requests.push(req);
      }

      if (requests.length === 0) {
        this.processing = false;
        return;
      }

      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const batch: BatchRequest = {
        requests,
        batchId,
        createdAt: new Date(),
      };

      logger.info(`Processing batch: ${batchId}`, {
        size: requests.length,
        queueRemaining: this.getQueueSize(),
      });

      // Process each request in the batch
      const startTime = Date.now();
      await Promise.all(
        requests.map(async (request) => {
          try {
            const callback = this.requestCallbacks.get(request.model);
            if (callback) {
              await callback(request);
            }
            this.totalProcessed++;
            logger.debug(`Request processed: ${request.id}`, { model: request.model });
          } catch (error) {
            this.totalFailed++;
            logger.error(`Request failed: ${request.id}`, {
              error: String(error),
              model: request.model,
            });
          }
        })
      );

      const processingTime = Date.now() - startTime;
      logger.info(`Batch completed: ${batchId}`, {
        processedCount: requests.length,
        processingTimeMs: processingTime,
        totalProcessed: this.totalProcessed,
        totalFailed: this.totalFailed,
      });
    } catch (error) {
      logger.error(`Batch processing error`, { error: String(error) });
    } finally {
      this.processing = false;

      // Schedule next batch if queue is not empty
      if (this.getQueueSize() > 0) {
        this.scheduleBatchProcessing();
      }
    }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length + this.priorityQueue.length;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queueSize: this.getQueueSize(),
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed,
      isProcessing: this.processing,
      priorityQueueSize: this.priorityQueue.length,
      regularQueueSize: this.queue.length,
    };
  }

  /**
   * Clear all queues (use with caution)
   */
  clear(): void {
    this.queue = [];
    this.priorityQueue = [];
    logger.warn(`Request queues cleared`);
  }
}

export const queueService = RequestQueueService.getInstance();
