import React from 'react';
import type { NoteboardItem, KeyPerson, QnaItem, SuggestedVisualization, PodcastData } from '../types';
import { NoteboardItemType, VisualizationType } from '../types';
import { NoteboardCard } from './NoteboardCard';
import { SuggestedVisualizations } from './SuggestedVisualizations';
import { SparklesIcon, BookOpenIcon, MicrophoneIcon, ClockIcon, NetworkIcon, GlobeAltIcon, TableCellsIcon, ChartBubbleIcon, ChartBarIcon } from './icons';
import { WordCloud, BarChart, PieChart, ConceptMap, SentimentGauge, Timeline, GeoMap, NetworkGraph, TopicHeatmap, BubbleChart } from './DataVisualizations';
import { PodcastPlayer } from './PodcastPlayer';


// Mock icons as we can't install libraries
const UserGroupIconSVG = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12.004 0M7.5 10.5a3 3 0 116 0 3 3 0 01-6 0zM19.5 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const QuestionMarkCircleIconSVG = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>;

const ICONS_MAP: Record<string, React.ReactNode> = {
    [NoteboardItemType.SUMMARY]: <BookOpenIcon className="w-5 h-5" />,
    [NoteboardItemType.KEY_PEOPLE]: <UserGroupIconSVG />,
    [NoteboardItemType.QNA]: <QuestionMarkCircleIconSVG />,
    [NoteboardItemType.VISUALIZATION]: <ChartBarIcon className="w-5 h-5" />,
    [NoteboardItemType.PODCAST]: <MicrophoneIcon className="w-5 h-5" />,
};

const VIZ_ICONS_MAP: Record<VisualizationType, React.ReactNode> = {
    [VisualizationType.TIMELINE]: <ClockIcon className="w-5 h-5" />,
    [VisualizationType.NETWORK_GRAPH]: <NetworkIcon className="w-5 h-5" />,
    [VisualizationType.GEO_MAP]: <GlobeAltIcon className="w-5 h-5" />,
    [VisualizationType.TOPIC_HEATMAP]: <TableCellsIcon className="w-5 h-5" />,
    [VisualizationType.BUBBLE_CHART]: <ChartBubbleIcon className="w-5 h-5" />,
    [VisualizationType.WORD_CLOUD]: <ChartBarIcon className="w-5 h-5" />,
    [VisualizationType.BAR_CHART]: <ChartBarIcon className="w-5 h-5" />,
    [VisualizationType.PIE_CHART]: <ChartBarIcon className="w-5 h-5" />,
    [VisualizationType.CONCEPT_MAP]: <ChartBarIcon className="w-5 h-5" />,
    [VisualizationType.SENTIMENT_ANALYSIS]: <ChartBarIcon className="w-5 h-5" />,
};

const ShimmeringLoader = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-base-200 p-4 rounded-lg h-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-base-100/10 to-transparent animate-shimmer -translate-x-full"></div>
            </div>
        ))}
    </div>
);

interface NoteboardPanelProps {
  items: NoteboardItem[];
  suggestedVisualizations: SuggestedVisualization[];
  onGenerate: () => void;
  onGenerateVisualization: (vizType: VisualizationType) => void;
  onGeneratePodcast: () => void;
  isLoading: boolean;
  isGeneratingVisualization: VisualizationType | null;
  isGeneratingPodcast: boolean;
  hasActiveSources: boolean;
}

export const NoteboardPanel: React.FC<NoteboardPanelProps> = ({ items, suggestedVisualizations, onGenerate, onGenerateVisualization, onGeneratePodcast, isLoading, isGeneratingVisualization, isGeneratingPodcast, hasActiveSources }) => {
  
  const renderContent = (item: NoteboardItem) => {
    switch (item.type) {
      case NoteboardItemType.SUMMARY:
        return <p>{item.content as string}</p>;
      case NoteboardItemType.KEY_PEOPLE:
        return (item.content as KeyPerson[]).map((person, i) => (
          <div key={i} className="py-2 border-b border-base-300/50 last:border-b-0">
            <p className="font-semibold text-base-content">{person.name}</p>
            <p>{person.description}</p>
          </div>
        ));
      case NoteboardItemType.QNA:
        return (item.content as QnaItem[]).map((q, i) => (
          <div key={i} className="py-2 border-b border-base-300/50 last:border-b-0">
            <p className="font-semibold text-base-content">{q.question}</p>
            <p>{q.answer}</p>
          </div>
        ));
      case NoteboardItemType.PODCAST:
        return <PodcastPlayer data={item.content as PodcastData} />;
      case NoteboardItemType.VISUALIZATION:
        switch(item.vizType) {
            case VisualizationType.WORD_CLOUD: return <WordCloud data={item.content as any} />;
            case VisualizationType.BAR_CHART: return <BarChart data={item.content as any} />;
            case VisualizationType.PIE_CHART: return <PieChart data={item.content as any} />;
            case VisualizationType.CONCEPT_MAP: return <ConceptMap data={item.content as any} />;
            case VisualizationType.SENTIMENT_ANALYSIS: return <SentimentGauge data={item.content as any} />;
            case VisualizationType.TIMELINE: return <Timeline data={item.content as any} />;
            case VisualizationType.GEO_MAP: return <GeoMap data={item.content as any} />;
            case VisualizationType.NETWORK_GRAPH: return <NetworkGraph data={item.content as any} />;
            case VisualizationType.TOPIC_HEATMAP: return <TopicHeatmap data={item.content as any} />;
            case VisualizationType.BUBBLE_CHART: return <BubbleChart data={item.content as any} />;
            default: return null;
        }
      default:
        return null;
    }
  }

  return (
    <div className="h-full flex flex-col bg-base-200/30 rounded-lg p-4 border border-base-300/50">
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <h2 className="text-xl font-bold">Noteboard</h2>
        <div className="flex gap-2">
            <button
              onClick={onGeneratePodcast}
              disabled={isLoading || isGeneratingPodcast || !hasActiveSources}
              className="px-3 py-2 text-xs font-medium rounded-md bg-gradient-to-r from-pink-500 to-orange-400 text-white hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <MicrophoneIcon className={`w-4 h-4 ${isGeneratingPodcast ? 'animate-pulse-fast' : ''}`} />
              <span className="hidden sm:inline">{isGeneratingPodcast ? 'Writing...' : 'Gen Podcast'}</span>
            </button>
            <button
              onClick={onGenerate}
              disabled={isLoading || isGeneratingPodcast || !hasActiveSources}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gradient-to-r from-brand-secondary to-brand-primary text-white hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <SparklesIcon className={`w-4 h-4 ${isLoading ? 'animate-pulse-fast' : ''}`} />
              {isLoading ? 'Generating...' : 'Gen Insights'}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {(isLoading || isGeneratingPodcast) && items.length === 0 && (
            <ShimmeringLoader />
        )}
        
        <SuggestedVisualizations 
            suggestions={suggestedVisualizations}
            onGenerate={onGenerateVisualization}
            isGenerating={isGeneratingVisualization}
        />

        {!hasActiveSources && (
          <div className="text-center text-base-content-secondary py-10">
            <p>Activate a source to generate insights.</p>
          </div>
        )}

        {hasActiveSources && items.length === 0 && !isLoading && !isGeneratingPodcast && suggestedVisualizations.length === 0 && (
            <div className="text-center text-base-content-secondary py-10">
                <p>Click "Generate Insights"</p>
                <p>to build your noteboard.</p>
            </div>
        )}

        {items.map((item, index) => (
          <NoteboardCard 
            key={item.id} 
            title={item.title} 
            icon={item.type === NoteboardItemType.VISUALIZATION ? VIZ_ICONS_MAP[item.vizType!] : ICONS_MAP[item.type]}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            {renderContent(item)}
          </NoteboardCard>
        ))}
      </div>
    </div>
  );
};