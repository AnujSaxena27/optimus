'use client';

import { useState } from 'react';
import { BarChart3, Tag } from 'lucide-react';
import { getCategoriesList } from '@/config/models';
import ModelCard, { Model } from './ModelCard';
import ComparisonTable from './ComparisonTable';

interface ModelComparisonProps {
  onComparisonChange?: (selectedModels: Model[]) => void;
}

export default function ModelComparison({
  onComparisonChange,
}: ModelComparisonProps) {
  const categories = getCategoriesList();
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'compare'>('browse');

  const MAX_COMPARISON = 5;

  // Convert HF models to ModelCard format
  const convertModels = (): Model[] => {
    const converted: Model[] = [];
    categories.forEach((cat) => {
      cat.models.forEach((m) => {
        converted.push({
          id: m.id,
          name: m.name,
          provider: 'Hugging Face',
          cost: `$${m.costPerMTok}`,
          costPerMTok: m.costPerMTok.toString(),
          latency: `${m.latencyMs}ms`,
          latencyMs: m.latencyMs,
          accuracy: 88 + Math.floor(Math.random() * 8), // Mock accuracy
          contextWindow: `${m.maxTokens}`,
          speedScore: Math.round(100 - (m.latencyMs / 30)),
          category: cat.id,
        });
      });
    });
    return converted;
  };

  const allModels = convertModels();

  const handleSelectModel = (model: Model) => {
    setSelectedModels((prev) => {
      const isAlreadySelected = prev.some((m) => m.id === model.id);

      let updated: Model[];
      if (isAlreadySelected) {
        updated = prev.filter((m) => m.id !== model.id);
      } else {
        if (prev.length < MAX_COMPARISON) {
          updated = [...prev, model];
        } else {
          updated = [...prev.slice(1), model];
        }
      }

      if (onComparisonChange) {
        onComparisonChange(updated);
      }

      return updated;
    });
  };

  const handleRemoveModel = (modelId: string) => {
    setSelectedModels((prev) => {
      const updated = prev.filter((m) => m.id !== modelId);
      if (onComparisonChange) {
        onComparisonChange(updated);
      }
      return updated;
    });
  };

  const handleClearSelection = () => {
    setSelectedModels([]);
    if (onComparisonChange) {
      onComparisonChange([]);
    }
  };

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm whitespace-nowrap flex-shrink-0 ${
            activeTab === 'browse'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Available Models
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm relative whitespace-nowrap flex-shrink-0 ${
            activeTab === 'compare'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Compare Models
          {selectedModels.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-yellow-500 text-white text-xs font-bold flex items-center justify-center">
              {selectedModels.length}
            </span>
          )}
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-8">
          {/* Info Card */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-sm text-blue-400">
              Click on any model card to select it for comparison (max {MAX_COMPARISON} models)
            </p>
          </div>

          {/* Models by Category */}
          {categories.map((category) => {
            const categoryModels = allModels.filter((m) => m.category === category.id);

            return (
              <div key={category.id} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">{category.name}</h2>
                  </div>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>

                {/* Models Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryModels.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={selectedModels.some((m) => m.id === model.id)}
                      onSelect={handleSelectModel}
                      showMetrics={true}
                      selectable={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compare Tab */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Selection Summary */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div>
              <p className="text-sm text-gray-400">
                Selected for comparison:{' '}
                <span className="text-white font-semibold">
                  {selectedModels.length} / {MAX_COMPARISON}
                </span>
              </p>
              {selectedModels.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No models selected. Go to "Available Models" to choose models.
                </p>
              )}
            </div>

            {selectedModels.length > 0 && (
              <button
                onClick={handleClearSelection}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all border border-red-500/30 hover:border-red-500/50 whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Comparison Content */}
          {selectedModels.length > 0 ? (
            <div className="w-full rounded-lg bg-white/5 border border-white/10 overflow-x-auto">
              <div className="p-6">
                <ComparisonTable
                  models={selectedModels}
                  onRemoveModel={handleRemoveModel}
                />
              </div>
            </div>
          ) : (
            <div className="w-full rounded-lg bg-white/5 border border-white/10 p-12 flex flex-col items-center justify-center text-center">
              <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400">No models selected yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Select models from the "Available Models" tab to compare
              </p>
            </div>
          )}

          {/* Comparison Insights */}
          {selectedModels.length > 1 && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-3">
              <p className="text-sm font-semibold text-purple-400 mb-2">
                📊 Quick Insights
              </p>
              <ul className="space-y-2 text-sm text-purple-200/80">
                <li>
                  • <span className="font-medium">Lowest Cost:</span>{' '}
                  {selectedModels.reduce((min, m) =>
                    parseFloat(m.costPerMTok) < parseFloat(min.costPerMTok) ? m : min
                  ).name}
                </li>
                <li>
                  • <span className="font-medium">Fastest:</span>{' '}
                  {selectedModels.reduce((fastest, m) =>
                    m.latencyMs < fastest.latencyMs ? m : fastest
                  ).name}
                </li>
                <li>
                  • <span className="font-medium">Most Accurate:</span>{' '}
                  {selectedModels.reduce((most, m) =>
                    m.accuracy > most.accuracy ? m : most
                  ).name}
                </li>
                <li>
                  • <span className="font-medium">Best Overall Speed:</span>{' '}
                  {selectedModels.reduce((fastest, m) =>
                    m.speedScore > fastest.speedScore ? m : fastest
                  ).name}
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
