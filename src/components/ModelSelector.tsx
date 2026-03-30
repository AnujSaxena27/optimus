'use client';

import { useState, useEffect } from 'react';
import { CATEGORIES, DEFAULT_MODEL, type ModelCategory } from '@/config/models';
import { Zap, Brain, RotateCw, Lock, Code2, CheckCircle2 } from 'lucide-react';

type CategoryDisplay = {
  id: ModelCategory;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

const CATEGORY_INFO: Record<ModelCategory, CategoryDisplay> = {
  reasoning: {
    id: 'reasoning',
    name: 'Reasoning',
    description: 'Complex problem-solving',
    icon: <Brain className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    description: 'Best of both worlds',
    icon: <RotateCw className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
  },
  fast: {
    id: 'fast',
    name: 'Fast',
    description: 'Ultra-quick responses',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
  },
  stable: {
    id: 'stable',
    name: 'Stable',
    description: 'Reliable baseline',
    icon: <Lock className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
  },
  coding: {
    id: 'coding',
    name: 'Coding',
    description: 'Code & technical',
    icon: <Code2 className="w-5 h-5" />,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
  },
};

export default function ModelSelector({
  selectedModelId,
  onSelectModel,
}: {
  selectedModelId?: string;
  onSelectModel?: (modelId: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('balanced');
  const [selected, setSelected] = useState<string>(selectedModelId || DEFAULT_MODEL);

  useEffect(() => {
    if (selectedModelId) {
      setSelected(selectedModelId);
    }
  }, [selectedModelId]);

  const handleSelectModel = (modelId: string) => {
    setSelected(modelId);
    if (onSelectModel) {
      onSelectModel(modelId);
    }
  };

  const categoryData = CATEGORIES[activeCategory];
  const models = categoryData.models || [];
  const info = CATEGORY_INFO[activeCategory];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORIES).map(([catId, cat]) => {
          const catInfo = CATEGORY_INFO[catId as ModelCategory];
          const isActive = activeCategory === catId;

          return (
            <button
              key={catId}
              onClick={() => setActiveCategory(catId as ModelCategory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm whitespace-nowrap ${
                isActive
                  ? `bg-gradient-to-r ${catInfo.color} text-white shadow-lg`
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <span>{catInfo.icon}</span>
              <span>{catInfo.name}</span>
            </button>
          );
        })}
      </div>

      {/* Category Header */}
      <div className={`p-4 rounded-lg ${info.bgColor} border border-white/10`}>
        <div className="font-semibold text-white">{info.name}</div>
        <div className="text-xs text-gray-400 mt-1">{info.description}</div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {models.map((model) => {
          const isSelected = selected === model.id;
          return (
            <button
              key={model.id}
              onClick={() => handleSelectModel(model.id)}
              className={`relative p-4 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/15 ring-1 ring-blue-400'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                </div>
              )}

              {/* Model Info */}
              <div className="pr-6">
                <div className="font-semibold text-white text-sm mb-1">{model.name}</div>
                <div className="text-xs text-gray-400 mb-2">{model.description}</div>
                <div className="text-xs text-gray-500">Hugging Face</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Selection Display */}
      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="text-xs text-gray-400 mb-1">Selected Model</div>
        <div className="text-sm font-medium text-blue-300">
          {CATEGORIES[activeCategory].models
            .find((m) => m.id === selected)?.name || 'Unknown'}
        </div>
      </div>
    </div>
  );
}
