/**
 * Model Routing Service
 * Intelligently selects best model based on request characteristics
 * Supports explicit model selection and auto-routing by category
 */

import {
  ModelCategory,
  CATEGORIES,
  getDefaultModelForCategory,
  isValidModel,
  FALLBACK_MODEL,
} from '@/config/models';

export interface RoutingRequest {
  message: string;
  requestedModel?: string;
  category?: ModelCategory;
}

export interface RoutingResult {
  selectedModel: string;
  category: ModelCategory;
  reason: string;
}

class ModelRoutingService {
  /**
   * Route a request to the best model
   */
  route(request: RoutingRequest): RoutingResult {
    const { message, requestedModel, category } = request;

    // 1. If specific model requested, use it (with validation)
    if (requestedModel) {
      if (isValidModel(requestedModel)) {
        return {
          selectedModel: requestedModel,
          category: this._getCategory(requestedModel) || 'balanced',
          reason: 'User-specified model',
        };
      }
      console.warn(`Invalid model requested: ${requestedModel}, using fallback`);
    }

    // 2. If category specified, use category default
    if (category && category in CATEGORIES) {
      return {
        selectedModel: getDefaultModelForCategory(category),
        category,
        reason: `Category "${category}" selected`,
      };
    }

    // 3. Auto-detect best category based on message
    const detectedCategory = this._detectCategory(message);
    return {
      selectedModel: getDefaultModelForCategory(detectedCategory),
      category: detectedCategory,
      reason: `Auto-detected as "${detectedCategory}"`,
    };
  }

  /**
   * Detect best category for a message
   * Uses simple keyword matching for now
   */
  private _detectCategory(message: string): ModelCategory {
    const lowerMsg = message.toLowerCase();

    // Reasoning keywords
    if (this._hasKeywords(lowerMsg, ['think', 'reason', 'explain', 'analyze', 'derive', 'proof', 'logic'])) {
      return 'reasoning';
    }

    // Coding keywords
    if (this._hasKeywords(lowerMsg, ['code', 'function', 'debug', 'python', 'javascript', 'sql', 'git', 'algorithm'])) {
      return 'coding';
    }

    // Fast keywords (quick answer)
    if (this._hasKeywords(lowerMsg, ['quick', 'fast', 'summary', 'brief', 'tldr', 'simple'])) {
      return 'fast';
    }

    // Balanced is default
    return 'balanced';
  }

  /**
   * Check if message contains keywords
   */
  private _hasKeywords(text: string, keywords: string[]): boolean {
    return keywords.some((kw) => text.includes(kw));
  }

  /**
   * Get category for a model ID
   */
  private _getCategory(modelId: string): ModelCategory | null {
    for (const [category, config] of Object.entries(CATEGORIES)) {
      if (config.models.some((m) => m.id === modelId)) {
        return category as ModelCategory;
      }
    }
    return null;
  }

  /**
   * Get all models in a category
   */
  getModelsInCategory(category: ModelCategory) {
    return CATEGORIES[category]?.models || [];
  }

  /**
   * Get default model for category
   */
  getDefaultModel(category: ModelCategory): string {
    return getDefaultModelForCategory(category);
  }

  /**
   * Get fallback model
   */
  getFallbackModel(): string {
    return FALLBACK_MODEL;
  }
}

export const modelRoutingService = new ModelRoutingService();
