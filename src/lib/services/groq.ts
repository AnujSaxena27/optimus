/**
 * Groq API Service
 * Wrapper for Groq API calls with error handling and optimization
 */

import { API_ENDPOINTS, INFERENCE_CONFIG, ERROR_MESSAGES } from '@/config/constants';
import { GroqChatResponse } from '@/lib/utils/types';
import { logger } from './logging';
import { getValidModel } from '@/lib/utils/helpers';

class GroqService {
  private static instance: GroqService;
  private apiKey: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.baseUrl = API_ENDPOINTS.GROQ_BASE_URL;

    if (!this.apiKey) {
      logger.error('Groq API key not configured');
    }
  }

  static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }

  /**
   * Send chat completion request to Groq
   */
  async chatCompletion(
    model: string,
    message: string,
    temperature: number = 0.7,
    maxTokens: number = 1024,
    requestId: string = ''
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error(ERROR_MESSAGES.INVALID_API_KEY);
    }

    // Validate and fallback to default model if invalid
    const validModel = getValidModel(model);

    const startTime = Date.now();

    try {
      logger.debug(`Calling Groq API for model: ${validModel}`, {
        requestId,
        originalModel: model !== validModel ? model : undefined,
        messageLength: message.length,
        maxTokens,
      });

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.CHAT_COMPLETIONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'InferenceOptimizer/1.0',
        },
        body: JSON.stringify({
          model: validModel,
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
        signal: AbortSignal.timeout(INFERENCE_CONFIG.REQUEST_TIMEOUT_MS),
      });

      const processingTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;

        logger.error(`Groq API error: ${errorMessage}`, {
          requestId,
          status: response.status,
          model,
          processingTimeMs: processingTime,
        });

        throw new Error(errorMessage);
      }

      const data: GroqChatResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated from Groq API');
      }

      const reply = data.choices[0].message.content;

      logger.info(`Groq API call successful`, {
        requestId,
        model,
        processingTimeMs: processingTime,
        tokensUsed: data.usage?.total_tokens,
      });

      return reply;
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logger.error(`Groq API call failed: ${error.message}`, {
        requestId,
        model,
        processingTimeMs: processingTime,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'InferenceOptimizer/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: HTTP ${response.status}`);
      }

      const data = await response.json();
      logger.info(`Retrieved ${data.data?.length || 0} models from Groq API`);

      return data.data || [];
    } catch (error: any) {
      logger.error(`Failed to list Groq models: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate API key
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const groqService = GroqService.getInstance();
