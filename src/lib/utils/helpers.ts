/**
 * Utility Helpers
 * Common utility functions for the inference system
 */

import { nanoid } from 'nanoid';
import { ERROR_MESSAGES, INFERENCE_CONFIG, MODEL_CONFIGS } from '@/config/constants';
import { InferenceRequest } from '@/lib/utils/types';

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${nanoid(12)}`;
}

/**
 * Generate unique batch ID
 */
export function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get valid Groq model or fallback to default
 * Falls back to default model if the requested model is unavailable
 */
export function getValidModel(requestedModel?: string): string {
  if (!requestedModel) {
    return INFERENCE_CONFIG.DEFAULT_MODEL;
  }

  // Check if model exists in config
  if (MODEL_CONFIGS[requestedModel as keyof typeof MODEL_CONFIGS]) {
    return requestedModel;
  }

  // Log fallback
  console.warn(`Model "${requestedModel}" not available, using default: ${INFERENCE_CONFIG.DEFAULT_MODEL}`);

  return INFERENCE_CONFIG.DEFAULT_MODEL;
}

/**
 * Check if model is valid
 */
export function isValidModel(model?: string): boolean {
  if (!model) return false;
  return !!MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS];
}

/**
 * Get all available model IDs
 */
export function getAvailableModels(): string[] {
  return Object.keys(MODEL_CONFIGS);
}

/**
 * Validate inference request parameters
 */
export function validateInferenceRequest(message: string, model: string): {
  valid: boolean;
  error?: string;
} {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message is required' };
  }

  if (message.length > INFERENCE_CONFIG.MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message exceeds maximum length of ${INFERENCE_CONFIG.MAX_MESSAGE_LENGTH} characters`,
    };
  }

  if (!model || model.trim().length === 0) {
    return { valid: false, error: 'Model is required' };
  }

  return { valid: true };
}

/**
 * Create cache key for request
 */
export function createCacheKey(model: string, message: string, temperature?: number): string {
  const key = `${model}:${message}:${temperature || 0}`;
  return Buffer.from(key).toString('base64');
}

/**
 * Extract client IP from request
 */
export function getClientIp(request: Request): string {
  const xForwardedFor =
    (request.headers.get('x-forwarded-for') as string) || '';
  const ip = xForwardedFor.split(',')[0]?.trim() || 'unknown';
  return ip;
}

/**
 * Calculate token cost (approximate)
 */
export function estimateTokenCost(
  inputTokens: number,
  outputTokens: number,
  costPerMTok: number
): number {
  const totalTokens = (inputTokens + outputTokens) / 1_000_000;
  return totalTokens * costPerMTok;
}

/**
 * Format numbers for display
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * Format milliseconds to human-readable time
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Create API response
 */
export function createApiResponse<T>(
  data: T,
  status: number = 200,
  message?: string
) {
  return {
    success: status >= 200 && status < 300,
    status,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create API error response
 */
export function createApiError(
  error: string,
  status: number = 500,
  details?: any
) {
  return {
    success: false,
    error,
    status,
    details,
    timestamp: new Date().toISOString(),
  };
}