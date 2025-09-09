import React from 'react';
import type { SuggestedVisualization } from '../types';
import { VisualizationType } from '../types';
import { SparklesIcon, ChartBarIcon, ClockIcon, GlobeAltIcon, NetworkIcon, TableCellsIcon, ChartBubbleIcon } from './icons';

// Mock icons for different chart types
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>;
const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.044.586.06.337.033.68.053 1.028.062m0 0a2.25 2.25 0 100 2.186m0-2.186c-.348.01-.69-.03-1.028.062m0 0c0 0 0 0 0 0m-2.283 2.186a2.25 2.25 0 110-2.186m0 2.186c.195-.025.39-.044.586-.06.337-.033.68-.053 1.028.062m0 0a2.25 2.25 0 110-2.186m0 2.186c-.348-.01-.69-.03-1.028.062m0 0c0 0 0 0 0 0" /></svg>;
const FaceSmileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.008v.008H9V9.75zm6 0h.008v.008H15V9.75z" /></svg>;


const VIZ_ICONS: Record<VisualizationType, React.ReactNode> = {
    [VisualizationType.BAR_CHART]: <ChartBarIcon className="w-5 h-5" />,
    [VisualizationType.PIE_CHART]: <ChartPieIcon />,
    [VisualizationType.WORD_CLOUD]: <CloudIcon />,
    [VisualizationType.CONCEPT_MAP]: <ShareIcon />,
    [VisualizationType.SENTIMENT_ANALYSIS]: <FaceSmileIcon />,
    [VisualizationType.TIMELINE]: <ClockIcon />,
    [VisualizationType.GEO_MAP]: <GlobeAltIcon />,
    [VisualizationType.NETWORK_GRAPH]: <NetworkIcon />,
    [VisualizationType.TOPIC_HEATMAP]: <TableCellsIcon />,
    [VisualizationType.BUBBLE_CHART]: <ChartBubbleIcon />,
};

interface SuggestedVisualizationsProps {
    suggestions: SuggestedVisualization[];
    onGenerate: (vizType: VisualizationType) => void;
    isGenerating: VisualizationType | null;
}

export const SuggestedVisualizations: React.FC<SuggestedVisualizationsProps> = ({ suggestions, onGenerate, isGenerating }) => {
    if (suggestions.length === 0) return null;

    return (
        <div className="my-4 p-3 bg-base-100 rounded-lg border border-base-300/50 animate-fade-in">
            <h4 className="font-semibold text-base-content mb-3">Suggested Visualizations</h4>
            <div className="space-y-2">
                {suggestions.map((viz) => (
                    <div key={viz.type} className="bg-base-200/50 p-3 rounded-md">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                                <h5 className="font-semibold text-sm flex items-center gap-2">
                                    <span className="text-brand-primary">{VIZ_ICONS[viz.type]}</span>
                                    {viz.type}
                                </h5>
                                <p className="text-xs text-base-content-secondary mt-1">{viz.rationale}</p>
                            </div>
                            <button
                                onClick={() => onGenerate(viz.type)}
                                disabled={!!isGenerating}
                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-brand-secondary text-white hover:bg-brand-secondary/80 transition-colors flex items-center gap-1.5 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                {isGenerating === viz.type ? (
                                    <>
                                        <SparklesIcon className="w-4 h-4 animate-pulse-fast" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate'
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};