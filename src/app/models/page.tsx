'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import ModelComparison from '@/components/ModelComparison';

export default function ModelsPage() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-[#0f0f15] to-black">
      {/* Navigation Bar - Sticky */}
      <div className="flex-shrink-0 sticky top-0 z-40 w-full bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Chat
          </Link>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden py-12">
        <div className="container mx-auto px-4 flex flex-col gap-12">
          {/* Header Section */}
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hugging Face Models</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              LLM Models in Use
            </h1>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Browse, select, and compare powerful language models from Hugging Face.
              View detailed metrics including cost, latency, and performance.
            </p>
          </div>

          {/* Model Comparison Component */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <ModelComparison />
          </div>
        </div>
      </main>
    </div>
  );
}
