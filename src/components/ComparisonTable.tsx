'use client';

import { TrendingUp, Zap, Gauge, X } from 'lucide-react';
import { Model } from './ModelCard';

interface ComparisonTableProps {
  models: Model[];
  onRemoveModel?: (modelId: string) => void;
}

export default function ComparisonTable({
  models,
  onRemoveModel,
}: ComparisonTableProps) {
  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-4">
          <Gauge className="w-6 h-6 text-yellow-400" />
        </div>
        <p className="text-gray-300 font-medium mb-2">No models selected</p>
        <p className="text-sm text-gray-500">
          Select models from the grid to compare their metrics
        </p>
      </div>
    );
  }

  // Calculate best performers
  const lowestCost = Math.min(...models.map(m => parseFloat(m.costPerMTok)));
  const lowestLatency = Math.min(...models.map(m => m.latencyMs));
  const highestAccuracy = Math.max(...models.map(m => m.accuracy));
  const highestSpeed = Math.max(...models.map(m => m.speedScore));

  const getMetricBadge = (
    value: number,
    best: number,
    isAscending: boolean = false
  ) => {
    const isBest = isAscending ? value === best : value === best;
    if (isBest) return 'ring-1 ring-yellow-500/50 bg-yellow-500/10 text-yellow-400 font-semibold';
    return 'text-gray-300';
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Model
            </th>
            <th className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider group">
                <span>Cost</span>
                <span className="text-yellow-400 text-xl opacity-0 group-hover:opacity-100 transition-opacity">★</span>
              </div>
            </th>
            <th className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider group">
                <Gauge className="w-3 h-3" />
                <span>Latency</span>
              </div>
            </th>
            <th className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <TrendingUp className="w-3 h-3" />
                <span>Accuracy</span>
              </div>
            </th>
            <th className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <Zap className="w-3 h-3" />
                <span>Speed</span>
              </div>
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Provider
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Context
            </th>
            {onRemoveModel && <th className="px-4 py-3 w-8" />}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {models.map((model, idx) => (
            <tr
              key={model.id}
              className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                idx % 2 === 0 ? 'bg-white/[2%]' : 'bg-white/[0.5%]'
              }`}
            >
              {/* Model Name */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {model.name}
                    </p>
                    <p className="text-xs text-gray-500">{model.id}</p>
                  </div>
                </div>
              </td>

              {/* Cost */}
              <td className="px-4 py-4 text-center">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    lowestCost === parseFloat(model.costPerMTok)
                      ? 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30'
                      : 'text-gray-300'
                  }`}
                >
                  <span>$</span>
                  <span>{model.cost}</span>
                </div>
              </td>

              {/* Latency */}
              <td className="px-4 py-4 text-center">
                <div
                  className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    lowestLatency === model.latencyMs
                      ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30'
                      : 'text-gray-300'
                  }`}
                >
                  {model.latency}
                </div>
              </td>

              {/* Accuracy */}
              <td className="px-4 py-4 text-center">
                <div
                  className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    highestAccuracy === model.accuracy
                      ? 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30'
                      : 'text-gray-300'
                  }`}
                >
                  {model.accuracy}%
                </div>
              </td>

              {/* Speed Score */}
              <td className="px-4 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        highestSpeed === model.speedScore
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 opacity-60'
                      }`}
                      style={{ width: `${model.speedScore}%` }}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium w-8 text-right ${
                      highestSpeed === model.speedScore
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {model.speedScore}
                  </span>
                </div>
              </td>

              {/* Provider */}
              <td className="px-4 py-4 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/30">
                  {model.provider}
                </span>
              </td>

              {/* Context */}
              <td className="px-4 py-4 text-center">
                <span className="text-sm font-medium text-gray-300">
                  {model.contextWindow}
                </span>
              </td>

              {/* Remove Button */}
              {onRemoveModel && (
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => onRemoveModel(model.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Legend
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-gray-400">Lowest Cost</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-gray-400">Lowest Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-gray-400">Highest Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-gray-400">Highest Speed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
