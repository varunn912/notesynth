import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { ChatMessageComponent } from './ChatMessage';
import { SendIcon, LogoIcon } from './icons';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  hasActiveSources: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading, hasActiveSources }) => {
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading && hasActiveSources) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-base-100 rounded-lg">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center text-base-content-secondary animate-fade-in">
            <LogoIcon className="w-16 h-16 mb-4"/>
            <h2 className="text-2xl font-bold text-base-content mb-2">NOTESYNTH</h2>
            <p>Your AI-powered research space.</p>
            {!hasActiveSources ? (
                <p className="mt-4 p-3 bg-yellow-900/50 text-yellow-300 border border-yellow-700 rounded-lg">
                    Please add a source and make it active to start chatting.
                </p>
            ) : (
                <p className="mt-4 p-3 bg-base-200/50 border border-base-300/50 rounded-lg">
                    Ask a question about your active sources to begin.
                </p>
            )}
          </div>
        ) : (
          <div>
            {messages.map((msg) => (
              <ChatMessageComponent key={msg.id} message={msg} />
            ))}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>
      <div className="p-4 border-t border-base-300/50">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={hasActiveSources ? "Ask a question about your sources..." : "Activate a source to start"}
            className="w-full bg-base-200 text-base-content p-3 pr-12 rounded-lg border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none resize-none transition-all"
            rows={1}
            disabled={isLoading || !hasActiveSources}
          />
          <button
            onClick={handleSend}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-white transition-colors disabled:text-gray-500 disabled:cursor-not-allowed enabled:bg-brand-primary enabled:hover:bg-brand-primary/80"
            disabled={isLoading || !input.trim() || !hasActiveSources}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};