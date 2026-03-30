/**
 * TypeScript Interfaces and Types
 * Strongly-typed structures for the inference system
 */

/**
 * Inference Request - Core request structure
 */
export interface InferenceRequest {
  id: string;
  userId: string;
  message: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  createdAt: Date;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

/**
 * Inference Response - Standard response structure
 */
export interface InferenceResponse {
  id: string;
  userId: string;
  model: string;
  reply: string;
  tokensUsed?: number;
  processingTimeMs?: number;
  cached?: boolean;
  timestamp: Date;
}

/**
 * Batch Request - For internal batch processing
 */
export interface BatchRequest {
  requests: InferenceRequest[];
  batchId: string;
  createdAt: Date;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Cache Entry - For caching responses
 */
export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: Date;
  hits: number;
  createdAt: Date;
}

/**
 * Request Log - For tracking user activity
 */
export interface RequestLog {
  id: string;
  userId: string;
  requestId: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  totalCost?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  processingTimeMs?: number;
  createdAt: Date;
  completedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * JWT Payload - After verification
 */
export interface JWTPayload {
  sub: string; // User ID
  email?: string;
  aud?: string;
  iat?: number;
  exp?: number;
}

/**
 * Rate Limit State
 */
export interface RateLimitState {
  userId: string;
  requestCount: number;
  windowStart: Date;
  exceeded: boolean;
}

/**
 * Groq API Response
 */
export interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  code?: string;
  status: number;
  timestamp: Date;
  requestId?: string;
  details?: Record<string, any>;
}

/**
 * Queue Statistics
 */
export interface QueueStats {
  queueSize: number;
  averageWaitTimeMs: number;
  totalProcessed: number;
  totalFailed: number;
  cacheHitRate: number;
}

/**
 * Model Metrics
 */
export interface ModelMetrics {
  model: string;
  costPerMTok: number;
  latencyMs: number;
  maxTokens: number;
  provider: string;
  accuracy?: number;
  throughput?: number;
}

/**
 * User Stats
 */
export interface UserStats {
  userId: string;
  totalRequests: number;
  totalCost: number;
  averageResponseTimeMs: number;
  lastRequestAt: Date;
  preferredModel: string;
}
