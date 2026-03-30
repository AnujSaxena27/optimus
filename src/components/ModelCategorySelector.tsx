'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { getCategoriesList, ModelCategory, ModelConfig } from '@/config/models';

interface ModelCategorySelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onCategoryChange?: (category: ModelCategory) => void;
}

export default function ModelCategorySelector({
  selectedModel,
  onModelChange,
  onCategoryChange,
}: ModelCategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory>('balanced');
  const categories = getCategoriesList();
  const currentCategory = categories.find((c) =>
    c.models.some((m) => m.id === selectedModel)
  );

  useEffect(() => {
    if (currentCategory) {
      setSelectedCategory(currentCategory.id);
    }
  }, [selectedModel, currentCategory]);

  const handleCategorySelect = (category: ModelCategory) => {
    setSelectedCategory(category);
    onCategoryChange?.(category);
    const defaultModel = categories.find((c) => c.id === category)?.defaultModel;
    if (defaultModel) {
      onModelChange(defaultModel);
    }
  };

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  const selectedModelObj = categories
    .flatMap((c) => c.models)
    .find((m) => m.id === selectedModel);

  return (
    <div className="relative">
      {/* Category Tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2 px-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Model Selector */}
      <div className="relative px-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500 transition-colors group"
        >
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500 group-hover:text-gray-400">
              Selected Model
            </span>
            <span className="text-sm font-medium text-gray-100">
              {selectedModelObj?.name || 'Select a model'}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full mt-2 left-4 right-4 bg-gray-900 border border-gray-700 rounded-lg z-50 shadow-xl max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id}>
                {/* Category Header */}
                <div
                  className={`px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-800/30 sticky top-0 ${
                    category.id === selectedCategory ? 'bg-blue-950/40' : ''
                  }`}
                >
                  {category.name}
                </div>

                {/* Models in Category */}
                {category.models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${
                      selectedModel === model.id
                        ? 'bg-blue-500/20 border-l-4 border-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-100">
                          {model.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {model.description}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {model.latencyMs}ms
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-gray-600">
                      <span>📊 {model.maxTokens} tokens</span>
                      <span>💰 ${model.costPerMTok}/MTok</span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Info Card */}
      {selectedModelObj && (
        <div className="mt-3 px-4 py-3 bg-gradient-to-r from-gray-800/40 to-gray-800/20 rounded-lg border border-gray-700/50">
          <div className="text-xs text-gray-500">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-gray-600">Speed</div>
                <div className="text-sm font-medium text-blue-400">
                  {selectedModelObj.latencyMs}ms
                </div>
              </div>
              <div>
                <div className="text-gray-600">Context</div>
                <div className="text-sm font-medium text-green-400">
                  {selectedModelObj.maxTokens}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Provider</div>
                <div className="text-sm font-medium text-purple-400">
                  {selectedModelObj.provider}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
