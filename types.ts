export interface Source {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  content: string;
  isActive: boolean;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isLoading?: boolean;
  timestamp: string;
}

export enum NoteboardItemType {
  SUMMARY = 'Overall Summary',
  KEY_PEOPLE = 'Key People',
  QNA = 'Key Q&A',
  VISUALIZATION = 'Data Visualization',
  PODCAST = 'Podcast',
}

export enum VisualizationType {
    WORD_CLOUD = 'Word Cloud',
    BAR_CHART = 'Bar Chart',
    PIE_CHART = 'Pie Chart',
    CONCEPT_MAP = 'Concept Map',
    SENTIMENT_ANALYSIS = 'Sentiment Analysis',
    TIMELINE = 'Timeline',
    NETWORK_GRAPH = 'Network Graph',
    GEO_MAP = 'Geographic Map',
    TOPIC_HEATMAP = 'Topic Heatmap',
    BUBBLE_CHART = 'Bubble Chart',
}

export interface SuggestedVisualization {
    type: VisualizationType;
    rationale: string;
}

// Data structures for visualizations
export interface WordCloudItem {
    text: string;
    value: number;
}

export interface BarChartItem {
    name: string;
    value: number;
}

export interface PieChartItem {
    name: string;
    value: number;
}

export interface ConceptMapData {
    center: string;
    nodes: {
        name: string;
        children: string[];
    }[];
}

export interface SentimentData {
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    score: number; // -1 to 1
}

export interface TimelineEvent {
    date: string;
    description: string;
}

export interface NetworkGraphData {
    nodes: { id: string; label: string; }[];
    links: { source: string; target: string; }[];
}

export interface GeoMapData {
    countryCodes: string[]; // e.g., ['US', 'DE', 'CN']
}

export interface TopicHeatmapData {
    sources: string[];
    topics: string[];
    matrix: number[][]; // sources.length x topics.length
}

export interface BubbleChartItem {
    name: string;
    value: number;
    category: string;
}

// --- App-specific content types ---
export interface KeyPerson {
    name: string;
    description: string;
}

export interface QnaItem {
    question: string;
    answer: string;
}

// --- Podcast Data Structure ---
export interface PodcastLine {
    speaker: string;
    line: string;
}

export interface PodcastData {
    title: string;
    script: PodcastLine[];
}


export type NoteboardContent = 
    string | 
    KeyPerson[] | 
    QnaItem[] |
    // Visualization Data Types
    WordCloudItem[] | 
    BarChartItem[] | 
    PieChartItem[] | 
    ConceptMapData | 
    SentimentData |
    TimelineEvent[] |
    NetworkGraphData |
    GeoMapData |
    TopicHeatmapData |
    BubbleChartItem[] |
    // Other Content Types
    PodcastData;

export interface NoteboardItem {
  id: string;
  type: NoteboardItemType;
  title: string;
  content: NoteboardContent;
  vizType?: VisualizationType;
}

// New interface for grouping user data
export interface UserData {
  sources: Source[];
  chatHistory: ChatMessage[];
  noteboardItems: NoteboardItem[];
  suggestedVisualizations: SuggestedVisualization[];
}