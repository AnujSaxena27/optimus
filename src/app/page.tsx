import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Hero Section - Compact, doesn't scroll */}
      <section className="flex-shrink-0 text-center w-full pt-4 pb-3 px-4 animate-fade-in-up z-10 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hugging Face Model Routing</span>
          </div>
          
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1 text-white">
            Multi-Model <span className="text-gradient">AI Inference</span>
          </h1>
          
          <p className="text-xs text-gray-400">
            Intelligent routing across Hugging Face models
          </p>
        </div>
      </section>

      {/* Main Chat Area - Takes remaining space, ChatInterface handles scroll */}
      <div className="flex-1 w-full overflow-hidden flex flex-col animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <ChatInterface />
      </div>
    </div>
  );
}
