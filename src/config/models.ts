/**
 * Multi-Model LLM Configuration
 * Hugging Face API Models organized by category
 * Production-ready model system with fallbacks
 */

export type ModelCategory = 'reasoning' | 'balanced' | 'fast' | 'stable' | 'coding';

export interface ModelConfig {
  id: string;
  name: string;
  category: ModelCategory;
  description: string;
  latencyMs: number;
  maxTokens: number;
  costPerMTok: number;
  provider: 'Hugging Face';
}

export interface CategoryConfig {
  id: ModelCategory;
  name: string;
  description: string;
  defaultModel: string;
  models: ModelConfig[];
}

// Individual Model Definitions
export const MODELS: Record<string, ModelConfig> = {
  // Reasoning Models
  'deepseek-ai/DeepSeek-V3': {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek V3',
    category: 'reasoning',
    description: 'Advanced reasoning and complex problem-solving',
    latencyMs: 2500,
    maxTokens: 8192,
    costPerMTok: 0.27,
    provider: 'Hugging Face',
  },
  'deepseek-ai/DeepSeek-R1': {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek R1',
    category: 'reasoning',
    description: 'Specialized for chain-of-thought reasoning tasks',
    latencyMs: 2800,
    maxTokens: 8192,
    costPerMTok: 0.25,
    provider: 'Hugging Face',
  },

  // Balanced Models
  'Qwen/Qwen2.5-7B-Instruct': {
    id: 'Qwen/Qwen2.5-7B-Instruct',
    name: 'Qwen 2.5 7B',
    category: 'balanced',
    description: 'Balanced performance and quality',
    latencyMs: 800,
    maxTokens: 8192,
    costPerMTok: 0.08,
    provider: 'Hugging Face',
  },
  'Qwen/Qwen2.5-14B-Instruct': {
    id: 'Qwen/Qwen2.5-14B-Instruct',
    name: 'Qwen 2.5 14B',
    category: 'balanced',
    description: 'Higher quality and longer context',
    latencyMs: 1200,
    maxTokens: 8192,
    costPerMTok: 0.15,
    provider: 'Hugging Face',
  },

  // Fast/Lightweight Models
  'google/gemma-7b-it': {
    id: 'google/gemma-7b-it',
    name: 'Gemma 7B IT',
    category: 'fast',
    description: 'Fast inference with good quality',
    latencyMs: 400,
    maxTokens: 8192,
    costPerMTok: 0.05,
    provider: 'Hugging Face',
  },
  'HuggingFaceH4/zephyr-7b-alpha': {
    id: 'HuggingFaceH4/zephyr-7b-alpha',
    name: 'Zephyr 7B Alpha',
    category: 'fast',
    description: 'Lightweight and fast',
    latencyMs: 350,
    maxTokens: 4096,
    costPerMTok: 0.02,
    provider: 'Hugging Face',
  },

  // Stable/Fallback Models
  'meta-llama/Meta-Llama-3-8B-Instruct': {
    id: 'meta-llama/Meta-Llama-3-8B-Instruct',
    name: 'Llama 3 8B',
    category: 'stable',
    description: 'Reliable and well-tested baseline',
    latencyMs: 600,
    maxTokens: 8192,
    costPerMTok: 0.06,
    provider: 'Hugging Face',
  },
  'meta-llama/Meta-Llama-3-70B-Instruct': {
    id: 'meta-llama/Meta-Llama-3-70B-Instruct',
    name: 'Llama 3 70B',
    category: 'stable',
    description: 'High-quality stable model',
    latencyMs: 1500,
    maxTokens: 8192,
    costPerMTok: 0.30,
    provider: 'Hugging Face',
  },

  // Coding Models
  'mistralai/Mistral-7B-Instruct-v0.2': {
    id: 'mistralai/Mistral-7B-Instruct-v0.2',
    name: 'Mistral 7B',
    category: 'coding',
    description: 'Latest version optimized for instruction following',
    latencyMs: 700,
    maxTokens: 8192,
    costPerMTok: 0.07,
    provider: 'Hugging Face',
  },
  'HuggingFaceH4/zephyr-7b-beta': {
    id: 'HuggingFaceH4/zephyr-7b-beta',
    name: 'Zephyr 7B',
    category: 'coding',
    description: 'Fine-tuned for better instruction following',
    latencyMs: 800,
    maxTokens: 8192,
    costPerMTok: 0.05,
    provider: 'Hugging Face',
  },
};

// Category Groupings
export const CATEGORIES: Record<ModelCategory, CategoryConfig> = {
  reasoning: {
    id: 'reasoning',
    name: 'Reasoning',
    description: 'Advanced reasoning and problem-solving',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    models: [
      MODELS['deepseek-ai/DeepSeek-V3'],
      MODELS['deepseek-ai/DeepSeek-R1'],
    ],
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    description: 'Balanced quality and speed',
    defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
    models: [
      MODELS['Qwen/Qwen2.5-7B-Instruct'],
      MODELS['Qwen/Qwen2.5-14B-Instruct'],
    ],
  },
  fast: {
    id: 'fast',
    name: 'Fast',
    description: 'Lightweight and quick responses',
    defaultModel: 'google/gemma-7b-it',
    models: [MODELS['google/gemma-7b-it'], MODELS['HuggingFaceH4/zephyr-7b-alpha']],
  },
  stable: {
    id: 'stable',
    name: 'Stable',
    description: 'Reliable and predictable',
    defaultModel: 'meta-llama/Meta-Llama-3-8B-Instruct',
    models: [
      MODELS['meta-llama/Meta-Llama-3-8B-Instruct'],
      MODELS['meta-llama/Meta-Llama-3-70B-Instruct'],
    ],
  },
  coding: {
    id: 'coding',
    name: 'Coding',
    description: 'Optimized for code tasks',
    defaultModel: 'mistralai/Mistral-7B-Instruct-v0.2',
    models: [
      MODELS['mistralai/Mistral-7B-Instruct-v0.2'],
      MODELS['HuggingFaceH4/zephyr-7b-beta'],
    ],
  },
};

// Default Configuration
export const DEFAULT_CATEGORY: ModelCategory = 'balanced';
export const DEFAULT_MODEL = CATEGORIES[DEFAULT_CATEGORY].defaultModel;
export const FALLBACK_MODEL = CATEGORIES.stable.defaultModel;

// All models as flat list for validation
export const ALL_MODELS = Object.values(MODELS);
export const ALL_MODEL_IDS = Object.keys(MODELS);

// Helper: Get model by ID
export function getModel(modelId: string): ModelConfig | null {
  return MODELS[modelId] || null;
}

// Helper: Get category config
export function getCategoryConfig(category: ModelCategory): CategoryConfig {
  return CATEGORIES[category];
}

// Helper: Get default model for category
export function getDefaultModelForCategory(category: ModelCategory): string {
  return CATEGORIES[category].defaultModel;
}

// Helper: Validate model ID
export function isValidModel(modelId: string): boolean {
  return modelId in MODELS;
}

// Helper: Get fallback model if primary fails
export function getFallbackModel(requestedModel?: string): string {
  if (requestedModel && isValidModel(requestedModel)) {
    return requestedModel;
  }
  return FALLBACK_MODEL;
}

// Helper: Get category from model ID
export function getCategoryFromModel(modelId: string): ModelCategory | null {
  const model = getModel(modelId);
  return model ? model.category : null;
}

// Helper: Get all models in category
export function getModelsInCategory(category: ModelCategory): ModelConfig[] {
  return CATEGORIES[category].models;
}

// Helper: Get all categories (for UI)
export function getCategoriesList(): CategoryConfig[] {
  return Object.values(CATEGORIES);
}
