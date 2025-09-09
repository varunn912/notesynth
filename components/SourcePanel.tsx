import React, { useState, useRef, useCallback } from 'react';
import type { Source } from '../types';
import { SourceItem } from './SourceItem';
import { PlusIcon, SparklesIcon, ArrowUpTrayIcon } from './icons';

interface SourcePanelProps {
  sources: Source[];
  onAddPastedText: (content: string) => Promise<void>;
  onAddFile: (file: File) => Promise<void>;
  onToggleActive: (id: string) => void;
  onDeleteSource: (id: string) => void;
  isSummarizing: boolean;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({ sources, onAddPastedText, onAddFile, onToggleActive, onDeleteSource, isSummarizing }) => {
  const [sourceContent, setSourceContent] = useState('');
  const [showTextArea, setShowTextArea] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = async () => {
    if (sourceContent.trim()) {
      await onAddPastedText(sourceContent);
      setSourceContent('');
      setShowTextArea(false);
    }
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0 || isSummarizing) return;
    const file = files[0];
    onAddFile(file);
  }, [onAddFile, isSummarizing]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isSummarizing) return;
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect, isSummarizing]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging && !isSummarizing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileInputClick = () => {
    if (isSummarizing) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full flex flex-col bg-base-200/30 rounded-lg p-4 border border-base-300/50">
      <h2 className="text-xl font-bold mb-4">Sources</h2>
      
      {showTextArea ? (
        <div className="mb-4 animate-fade-in">
          <textarea
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            placeholder="Paste your text, notes, or article here..."
            className="w-full h-40 p-2 border border-base-300 bg-base-100 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
            disabled={isSummarizing}
          />
          <div className="flex justify-end items-center mt-2 space-x-2">
             <button
              onClick={() => setShowTextArea(false)}
              className="px-4 py-2 text-sm font-medium rounded-md text-base-content-secondary hover:bg-base-300/50 transition-colors"
              disabled={isSummarizing}
            >
              Cancel
            </button>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-brand-primary/80 transition-colors flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={isSummarizing || !sourceContent.trim()}
            >
              {isSummarizing ? (
                <>
                  <SparklesIcon className="w-4 h-4 animate-pulse-fast" />
                  Summarizing...
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  Add Source
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 animate-fade-in space-y-3">
            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                accept="application/pdf,image/*,text/*,.md,.doc,application/msword,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.csv,text/csv"
                disabled={isSummarizing}
            />
            <div
                onClick={handleFileInputClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`w-full p-6 text-center border-2 border-dashed rounded-md cursor-pointer transition-all duration-300 ${isDragging ? 'border-brand-primary bg-brand-primary/10' : 'border-base-300 hover:border-brand-primary/70'} ${isSummarizing ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-disabled={isSummarizing}
                role="button"
                tabIndex={0}
            >
                <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-base-content-secondary mb-2" />
                <p className="text-sm font-semibold text-base-content">
                    {isSummarizing ? 'Processing source...' : 'Import a file'}
                </p>
                <p className="text-xs text-base-content-secondary">
                    {isSummarizing ? 'Please wait.' : 'Drop file (PDF, DOC, DOCX, CSV, TXT, etc.)'}
                </p>
            </div>
            
            <div className="flex items-center">
                <div className="flex-grow border-t border-base-300/50"></div>
                <span className="flex-shrink mx-2 text-xs text-base-content-secondary">OR</span>
                <div className="flex-grow border-t border-base-300/50"></div>
            </div>

            <button
                onClick={() => setShowTextArea(true)}
                disabled={isSummarizing}
                className="w-full px-4 py-2 text-sm font-medium rounded-md bg-base-200/80 text-base-content hover:bg-base-300/80 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PlusIcon className="w-5 h-5" />
                Add from Pasted Text
            </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {sources.length === 0 && !showTextArea && (
          <div className="text-center text-base-content-secondary py-10">
            <p>No sources yet.</p>
            <p>Add a source to get started.</p>
          </div>
        )}
        {sources.map((source, index) => (
          <SourceItem key={source.id} source={source} onToggleActive={onToggleActive} onDelete={onDeleteSource} index={index} />
        ))}
      </div>
    </div>
  );
};