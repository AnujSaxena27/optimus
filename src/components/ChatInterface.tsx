'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import ChatInput from './ChatInput';
import { useAuth } from '@/context/AuthContext';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('Qwen/Qwen2.5-7B-Instruct');
  const [authError, setAuthError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { session, loading } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    // Check authentication
    if (!session?.access_token) {
      setAuthError('Please sign in to use the chat feature');
      return;
    }

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: text,
          model: selectedModelId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        
        // Handle 401 Unauthorized (JWT issue)
        if (response.status === 401) {
          setAuthError('Your session has expired. Please sign in again.');
          throw new Error('Invalid or expired JWT token');
        }
        
        const errorMsg = data?.error || data?.message || `Failed to fetch response (${response.status})`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      const newAiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.data?.reply || data.reply || 'Empty response.' 
      };
      
      setMessages((prev) => [...prev, newAiMsg]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Show auth error separately
      if (errorMessage.includes('Invalid or expired JWT')) {
        setAuthError('Authentication failed. Please refresh and sign in again.');
      }
      
      const newAiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: `Error: ${errorMessage}` 
      };
      setMessages((prev) => [...prev, newAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Auth & Loading Alerts - Fixed at top, doesn't scroll */}
      {authError && (
        <div className="flex-shrink-0 bg-red-500/10 border-b border-red-500/30 text-red-400 px-4 py-2 text-sm animate-in fade-in duration-200">
          {authError}
        </div>
      )}

      {loading && (
        <div className="flex-shrink-0 bg-blue-500/10 border-b border-blue-500/30 text-blue-400 px-4 py-2 text-sm animate-in fade-in duration-200">
          Loading authentication...
        </div>
      )}

      {/* Messages Area - ONLY this section scrolls */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent px-4 pb-8">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-gray-500 text-sm">
            <p>Start a conversation by typing a message below</p>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto space-y-6 py-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div className={`flex max-w-[85%] sm:max-w-[75%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className="shrink-0 mt-1">
                    {msg.role === 'assistant' ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#2a2a35] border border-white/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`py-3 px-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/30 text-gray-100 rounded-tr-sm' 
                      : 'bg-gray-800/40 text-gray-200 rounded-tl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex w-full justify-start animate-fade-in-up">
                <div className="flex max-w-[85%] sm:max-w-[75%] gap-3 flex-row">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="py-3 px-4 rounded-2xl bg-gray-800/40 rounded-tl-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse-soft"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse-soft" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse-soft" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - FIXED at bottom, never moves during scroll */}
      <div className="flex-shrink-0 w-full border-t border-white/5 bg-[#0f0f13] sticky bottom-0 px-4 py-4">
        <ChatInput onSend={handleSend} disabled={isTyping} onModelChange={setSelectedModelId} />
      </div>
    </div>
  );
}
