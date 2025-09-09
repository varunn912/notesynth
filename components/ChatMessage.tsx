import React from 'react';
import type { ChatMessage } from '../types';
import { SparklesIcon } from './icons';

interface ChatMessageProps {
  message: ChatMessage;
}

// A simple markdown-like renderer for citations
const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[Source: ".*?"\])/g);
    return parts.map((part, index) => {
        const match = part.match(/\[Source: "(.*?)"\]/);
        if (match) {
            return (
                <span key={index} className="bg-brand-secondary/20 text-brand-secondary/90 text-xs font-semibold px-2 py-1 rounded-md ml-1 inline-block">
                    {match[1]}
                </span>
            );
        }
        return <span key={index}>{part}</span>;
    });
};

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col my-2 animate-slide-in-up ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-5 h-5 text-white" />
                </div>
            )}
            <div className={`max-w-xl p-4 rounded-lg ${isUser ? 'bg-brand-primary text-white' : 'bg-base-200 text-base-content'}`}>
                {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-base-content-secondary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-base-content-secondary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-base-content-secondary rounded-full animate-pulse"></div>
                    </div>
                ) : (
                <div className="whitespace-pre-wrap leading-relaxed">{renderTextWithCitations(message.text)}</div>
                )}
            </div>
        </div>
        {!message.isLoading && <p className="text-xs text-base-content-secondary/50 mt-1 px-2">{message.timestamp}</p>}
    </div>
  );
};