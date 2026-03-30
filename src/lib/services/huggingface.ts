/**
 * Hugging Face Inference Service
 * Handles communication with Hugging Face API
 * Implements fallback logic and error handling
 */

import { FALLBACK_MODEL, isValidModel, getModel } from '@/config/models';

export interface HFResponse {
  generated_text?: string;
  error?: string;
  estimated_time?: number;
}

export interface InferenceOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

class HuggingFaceService {
  private apiKey: string;
  private baseUrl = 'https://router.huggingface.co/v1';

  constructor() {
    const key = process.env.HF_API_KEY;
    if (!key) {
      console.warn('⚠️ HF_API_KEY not set. Set it in .env.local');
    }
    this.apiKey = key || '';
  }

  /**
   * Initialize with API key (for runtime changes)
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Core chat completion method
   */
  async chatCompletion(
    modelId: string,
    message: string,
    options: InferenceOptions = {},
    requestId?: string
  ): Promise<string> {
    // Validate and fallback
    const validModel = isValidModel(modelId) ? modelId : FALLBACK_MODEL;

    if (!isValidModel(modelId)) {
      console.warn(
        `[${requestId}] Invalid model "${modelId}", falling back to "${validModel}"`
      );
    }

    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      const response = await this._callHFAPI(
        validModel,
        message,
        options,
        requestId
      );
      return response;
    } catch (error: any) {
      console.error(`[${requestId}] HF API error for model "${validModel}":`, error.message);

      // If primary model fails, try fallback
      if (validModel !== FALLBACK_MODEL) {
        console.warn(`[${requestId}] Retrying with fallback model "${FALLBACK_MODEL}"`);
        try {
          const response = await this._callHFAPI(
            FALLBACK_MODEL,
            message,
            options,
            requestId
          );
          return response;
        } catch (fallbackError: any) {
          console.error(
            `[${requestId}] Fallback model also failed:`,
            fallbackError.message
          );
          throw new Error(
            `Both primary and fallback models failed: ${fallbackError.message}`
          );
        }
      }

      throw error;
    }
  }

  /**
   * Internal method to call HF API
   */
  private async _callHFAPI(
    modelId: string,
    message: string,
    options: InferenceOptions,
    requestId?: string
  ): Promise<string> {
    const modelConfig = getModel(modelId);
    if (!modelConfig) {
      throw new Error(`Unknown model: ${modelId}`);
    }

    const url = `${this.baseUrl}/chat/completions`;

    const payload = {
      model: modelId,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 0.95,
    };

    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const latency = Date.now() - startTime;
      console.debug(
        `[${requestId}] HF API call to "${modelId}" took ${latency}ms`
      );

      if (!response.ok) {
        let errorMsg = `API request failed with status ${response.status}`;

        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMsg = errorData;
          }
        } catch {
          // Could not parse error response
        }

        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Handle OpenAI-style response
      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid response format from model');
      }

      const generatedText = data.choices[0].message.content;
      if (!generatedText) {
        throw new Error('Empty response from model');
      }

      return generatedText.trim();
    } catch (error: any) {
      throw new Error(`HF API error (${modelId}): ${error.message}`);
    }
  }

  /**
   * Format user message - now using OpenAI-style messages
   */
  private _formatPrompt(message: string): string {
    // No longer needed - using messages array format
    return message;
  }

  /**
   * Health check - test if API is accessible
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      // Try a simple request to the fallback model
      const result = await this.chatCompletion(
        FALLBACK_MODEL,
        'Hello',
        { maxTokens: 10 }
      );
      return result.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get model information
   */
  getModelInfo(modelId: string) {
    return getModel(modelId);
  }
}

export const huggingFaceService = new HuggingFaceService();
