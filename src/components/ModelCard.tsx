'use client';

import { Check, Zap, Gauge, TrendingUp } from 'lucide-react';

export type Model = {
  id: string;
  name: string;
  provider: string;
  cost: string;
  costPerMTok: string;
  latency: string;
  latencyMs: number;
  accuracy: number;
  contextWindow: string;
  speedScore: number;
  category?: string;
};

interface ModelCardProps {
  model: Model;
  isSelected?: boolean;
  onSelect?: (model: Model) => void;
  showMetrics?: boolean;
  selectable?: boolean;
}

export default function ModelCard({
  model,
  isSelected = false,
  onSelect,
  showMetrics = true,
  selectable = false,
}: ModelCardProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-400 bg-green-500/10';
    if (accuracy >= 92) return 'text-blue-400 bg-blue-500/10';
    return 'text-yellow-400 bg-yellow-500/10';
  };

  return (
    <div
      onClick={() => selectable && onSelect?.(model)}
      className={`relative group rounded-xl border transition-all duration-300 overflow-hidden flex flex-col h-full
        ${
          isSelected
            ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/20 cursor-pointer'
            : 'border-white/10 bg-white/[2%] hover:border-white/20 hover:bg-white/5 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer'
        }
      `}
    >
      {/* Header with Selection Checkbox */}
      <div className="p-5 pb-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1 break-words">
              {model.name}
            </h3>
            <p className="text-xs font-medium text-gray-400">{model.provider}</p>
          </div>
          
          {/* Selection Checkbox */}
          {selectable && (
            <div className="flex-shrink-0">
              <div
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0
                  ${
                    isSelected
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-white/30 hover:border-white/50'
                  }
                `}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 flex-1">

        {/* Metrics Grid */}
        {showMetrics && (
          <div className="space-y-3">
            {/* Cost */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-gray-400">Cost</span>
              </div>
              <span className="text-sm font-medium text-white">{model.cost}</span>
            </div>

            {/* Latency */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-gray-400">Latency</span>
              </div>
              <span className="text-sm font-medium text-white">{model.latency}</span>
            </div>

            {/* Accuracy */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-gray-400">Accuracy</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-md ${getAccuracyColor(model.accuracy)}`}>
                {model.accuracy}%
              </span>
            </div>

            {/* Speed Score */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-gray-400">Speed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300"
                    style={{ width: `${model.speedScore}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-300 w-6 text-right">
                  {model.speedScore}
                </span>
              </div>
            </div>

            {/* Context Window */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-xs text-gray-400">Context Window</span>
              <span className="text-xs font-medium text-gray-200">
                {model.contextWindow}
              </span>
            </div>
          </div>
        )}

        {/* Selection Hint */}
        {selectable && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <p className="text-xs text-gray-500 text-center">
              {isSelected ? '✓ Selected' : 'Click to select'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
