'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import ModelCategorySelector from './ModelCategorySelector';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  onModelChange?: (modelId: string) => void;
}

export default function ChatInput({ onSend, disabled, onModelChange }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="w-full">
      {/* Model Category Selector */}
      <div className="mb-4">
        <ModelCategorySelector
          selectedModel="Qwen/Qwen2.5-7B-Instruct"
          onModelChange={onModelChange || (() => {})}
        />
      </div>

      {/* Chat Input */}
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="relative bg-[#21212a]/80 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col pt-3 pb-2 px-3 shadow-2xl">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={disabled}
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none max-h-[200px] min-h-[44px] px-2 py-1 scrollbar-hide text-[15px] leading-relaxed"
            rows={1}
          />

          {/* Send Button */}
          <div className="flex items-center justify-end mt-2 pr-1">
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !disabled
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-white/5 text-gray-500'
              }`}
            >
              <ArrowUp className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-gray-500">
          AI responses can be inaccurate. Always verify.
        </div>
      </div>
    </div>
  );
}
