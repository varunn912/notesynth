import React from 'react';
import type { Source } from '../types';
import { TrashIcon, BookOpenIcon } from './icons';

interface SourceItemProps {
  source: Source;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

export const SourceItem: React.FC<SourceItemProps> = ({ source, onToggleActive, onDelete, index }) => {
  return (
    <div 
      className={`relative p-4 border rounded-lg transition-all duration-300 animate-slide-in-up hover:shadow-lg hover:-translate-y-1 hover:border-brand-secondary/30 ${source.isActive ? 'border-brand-primary bg-base-200/50' : 'border-base-300 bg-base-200'}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-10">
            <h3 className="font-bold text-base-content flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-brand-secondary" />
                {source.title}
            </h3>
            <p className="text-sm text-base-content-secondary mt-1 line-clamp-2">{source.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {source.keywords.map((keyword, index) => (
                    <span key={index} className="text-xs bg-base-300 text-base-content-secondary px-2 py-0.5 rounded-full">
                        {keyword}
                    </span>
                ))}
            </div>
            <p className="text-xs text-base-content-secondary/70 mt-3">{source.timestamp}</p>
        </div>
        <div className="absolute top-3 right-3 flex items-center space-x-1">
            <input
                type="checkbox"
                checked={source.isActive}
                onChange={() => onToggleActive(source.id)}
                className="w-5 h-5 rounded bg-base-100 border-base-300 text-brand-primary focus:ring-2 focus:ring-brand-primary focus:ring-offset-base-200 cursor-pointer"
                title="Toggle active state for chat"
            />
            <button onClick={() => onDelete(source.id)} className="p-1.5 text-base-content-secondary hover:text-red-500 transition-colors rounded-full hover:bg-red-500/10">
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};