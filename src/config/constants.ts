/**
 * Global Constants and Configuration
 * Production-ready inference optimization settings
 */

export const INFERENCE_CONFIG = {
  // Default Model
  DEFAULT_MODEL: 'llama-3.1-8b-instant', // Fast, cost-effective default

  // Queue and Batching
  BATCH_SIZE: 5, // Process up to 5 requests at once
  BATCH_TIMEOUT_MS: 100, // Wait max 100ms to accumulate batch
  MAX_QUEUE_SIZE: 1000, // Prevent memory overflow
  REQUEST_TIMEOUT_MS: 30000, // 30 seconds per request

  // Caching
  CACHE_TTL_SECONDS: 3600, // 1 hour cache TTL
  CACHE_MAX_ENTRIES: 10000, // Max cache entries
  CACHE_ENABLE_COMPRESSION: true, // Compress cache entries

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute window
  RATE_LIMIT_MAX_REQUESTS: 100, // 100 requests per minute per user

  // Logging
  LOG_LEVEL: (process.env.LOG_LEVEL as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR') || 'INFO',
  LOG_RETENTION_DAYS: 30,
  LOG_BATCH_SIZE: 50, // Batch logs before writing

  // Security
  JWT_EXPIRY_SECONDS: 3600, // 1 hour
  MAX_MESSAGE_LENGTH: 10000, // Prevent abuse
  MAX_CONTEXT_TOKENS: 4096,
};

export const MODEL_CONFIGS = {
  'llama-3.1-8b-instant': {
    maxTokens: 8192,
    costPerMTok: 0.05,
    latencyMs: 80,
    provider: 'Groq',
  },
  'llama-3.1-70b-versatile': {
    maxTokens: 8192,
    costPerMTok: 0.59,
    latencyMs: 200,
    provider: 'Groq',
  },
};

export const API_ENDPOINTS = {
  GROQ_BASE_URL: 'https://api.groq.com/openai/v1',
  CHAT_COMPLETIONS: '/chat/completions',
  MODELS: '/models',
};

export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Invalid or missing Groq API key',
  INVALID_MODEL: 'Selected model is not available',
  BATCH_TIMEOUT: 'Request processing timeout',
  CACHE_ERROR: 'Cache operation failed',
  JWT_INVALID: 'Invalid or expired JWT token',
  JWT_MISSING: 'JWT token is missing',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  MESSAGE_TOO_LONG: 'Message exceeds maximum length',
  INVALID_REQUEST: 'Invalid request parameters',
  INTERNAL_ERROR: 'Internal server error',
  DB_ERROR: 'Database error occurred',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const LOG_EVENTS = {
  REQUEST_QUEUED: 'REQUEST_QUEUED',
  REQUEST_PROCESSED: 'REQUEST_PROCESSED',
  BATCH_EXECUTED: 'BATCH_EXECUTED',
  CACHE_HIT: 'CACHE_HIT',
  CACHE_MISS: 'CACHE_MISS',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILED: 'AUTH_FAILED',
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  RATE_LIMIT_HIT: 'RATE_LIMIT_HIT',
};
