import React from 'react';
import type { WordCloudItem, BarChartItem, PieChartItem, ConceptMapData, SentimentData, TimelineEvent, NetworkGraphData, GeoMapData, TopicHeatmapData, BubbleChartItem } from '../types';
import { WorldMapSVG } from './WorldMapSVG';

// --- Helper Functions ---
const COLORS = ['#4f46e5', '#7c3aed', '#a855f7', '#d946ef', '#ec4899', '#f472b6'];
const CATEGORY_COLORS: Record<string, string> = {};
let colorIndex = 0;

const getColorForCategory = (category: string) => {
    if (!CATEGORY_COLORS[category]) {
        CATEGORY_COLORS[category] = COLORS[colorIndex % COLORS.length];
        colorIndex++;
    }
    return CATEGORY_COLORS[category];
};


const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const getPieSlicePath = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
};


// --- Chart Components ---

export const WordCloud: React.FC<{ data: WordCloudItem[] }> = ({ data }) => {
    const maxFreq = Math.max(...data.map(d => d.value), 1);
    const minFontSize = 12;
    const maxFontSize = 36;

    return (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 p-2">
            {data.map((item, i) => (
                <span
                    key={item.text}
                    className="animate-fade-in"
                    style={{
                        fontSize: `${minFontSize + (maxFontSize - minFontSize) * (item.value / maxFreq)}px`,
                        fontWeight: 500 + Math.round(400 * (item.value / maxFreq)),
                        color: COLORS[i % COLORS.length],
                        animationDelay: `${i * 30}ms`,
                    }}
                >
                    {item.text}
                </span>
            ))}
        </div>
    );
};

export const BarChart: React.FC<{ data: BarChartItem[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 0);
    return (
        <div className="space-y-3">
            {data.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 group animate-slide-in-up" style={{ animationDelay: `${i * 100}ms`}}>
                    <div className="w-1/4 text-right truncate text-xs font-medium">{item.name}</div>
                    <div className="w-3/4 bg-base-300/50 rounded-full h-5">
                        <div
                            className="bg-gradient-to-r from-brand-secondary to-brand-primary h-5 rounded-full flex items-center justify-end px-2 transition-all duration-1000 ease-out"
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        >
                           <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">{item.value}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


export const PieChart: React.FC<{ data: PieChartItem[] }> = ({ data }) => {
    let cumulativePercent = 0;
    return (
        <div className="flex items-center justify-around gap-4 flex-wrap">
            <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-40 md:h-40 transform -rotate-90">
                {data.map((slice, i) => {
                    const startAngle = (cumulativePercent / 100) * 360;
                    const slicePercent = slice.value;
                    cumulativePercent += slicePercent;
                    const endAngle = (cumulativePercent / 100) * 360;
                    
                    return (
                        <path
                            key={slice.name}
                            d={getPieSlicePath(50, 50, 50, startAngle, endAngle)}
                            fill={COLORS[i % COLORS.length]}
                            className="transition-transform duration-300 ease-out origin-center hover:scale-105 cursor-pointer animate-fade-in"
                            style={{ animationDelay: `${i * 100}ms`}}
                        >
                            <title>{`${slice.name}: ${slice.value.toFixed(1)}%`}</title>
                        </path>
                    );
                })}
            </svg>
             <div className="text-xs space-y-1.5">
                {data.map((slice, i) => (
                    <div key={slice.name} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms`}}>
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span>{slice.name} ({slice.value.toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ConceptMap: React.FC<{ data: ConceptMapData }> = ({ data }) => {
    const size = 250;
    const center = { x: size / 2, y: size / 2 };
    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
            <defs>
                <radialGradient id="center-grad">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#7c3aed" />
                </radialGradient>
            </defs>
            <circle cx={center.x} cy={center.y} r="30" fill="url(#center-grad)" className="animate-fade-in" />
            <text x={center.x} y={center.y} textAnchor="middle" dy=".3em" fill="white" fontSize="8" fontWeight="bold">{data.center}</text>
            
            {data.nodes.map((node, i) => {
                const angle = (i / data.nodes.length) * 2 * Math.PI;
                const nodePos = { x: center.x + Math.cos(angle) * 100, y: center.y + Math.sin(angle) * 100 };
                return (
                    <g key={node.name} className="animate-fade-in" style={{ animationDelay: `${(i+1)*150}ms`}}>
                        <line x1={center.x} y1={center.y} x2={nodePos.x} y2={nodePos.y} stroke="currentColor" className="text-base-300" strokeWidth="1" />
                        <circle cx={nodePos.x} cy={nodePos.y} r="20" fill={COLORS[i % COLORS.length]} />
                        <text x={nodePos.x} y={nodePos.y} textAnchor="middle" dy=".3em" fill="white" fontSize="6" fontWeight="bold">{node.name}</text>
                        {node.children.map((child, j) => {
                             const childAngle = angle + (j - (node.children.length - 1) / 2) * 0.25;
                             const childPos = { x: nodePos.x + Math.cos(childAngle) * 35, y: nodePos.y + Math.sin(childAngle) * 35 };
                             return (
                                <g key={child}>
                                    <line x1={nodePos.x} y1={nodePos.y} x2={childPos.x} y2={childPos.y} stroke="currentColor" className="text-base-300" strokeWidth="0.5" />
                                    <circle cx={childPos.x} cy={childPos.y} r="12" fill={COLORS[i % COLORS.length]} fillOpacity="0.7" />
                                    <text x={childPos.x} y={childPos.y} textAnchor="middle" dy=".3em" fill="white" fontSize="4">{child}</text>
                                </g>
                             )
                        })}
                    </g>
                );
            })}
        </svg>
    );
};

export const SentimentGauge: React.FC<{ data: SentimentData }> = ({ data }) => {
    const score = Math.max(-1, Math.min(1, data.score));
    const angle = score * 90; // From -90 to 90 degrees
    const colorMap = {
        Positive: '#4f46e5',
        Neutral: '#9ca3af',
        Negative: '#ef4444'
    };
    
    return (
        <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 100 60" className="w-48 h-auto">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" className="text-base-300" strokeWidth="8" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={colorMap[data.sentiment]} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 * (1 - (score + 1) / 2)}
                    className="transition-all duration-1000 ease-out"
                 />
                <g transform={`translate(50, 50) rotate(${angle})`} className="transition-transform duration-1000 ease-out">
                    <path d="M 0 0 L 0 -38" stroke="currentColor" className="text-base-content" strokeWidth="2" />
                    <circle cx="0" cy="0" r="4" fill="currentColor" className="text-base-content" />
                </g>
            </svg>
            <div className="text-center">
                <p className="font-bold text-lg" style={{ color: colorMap[data.sentiment] }}>{data.sentiment}</p>
                <p className="text-sm text-base-content-secondary">Score: {score.toFixed(2)}</p>
            </div>
        </div>
    );
};


// --- NEW VISUALIZATIONS ---

export const Timeline: React.FC<{ data: TimelineEvent[] }> = ({ data }) => (
    <div className="space-y-1">
        {data.map((event, i) => (
            <div key={i} className="relative pl-5 pb-3 border-l border-base-300 animate-slide-in-up" style={{ animationDelay: `${i * 100}ms`}}>
                <div className="absolute w-3 h-3 bg-brand-secondary rounded-full -left-1.5 top-1.5 border-2 border-base-200"></div>
                <p className="font-semibold text-base-content text-sm">{event.date}</p>
                <p className="text-xs">{event.description}</p>
            </div>
        ))}
    </div>
);

export const GeoMap: React.FC<{ data: GeoMapData }> = ({ data }) => (
    <div className="p-2 bg-base-100 rounded-md">
        <WorldMapSVG highlightedCodes={new Set(data.countryCodes)} />
    </div>
);

export const NetworkGraph: React.FC<{ data: NetworkGraphData }> = ({ data }) => {
    if (!data.nodes || data.nodes.length === 0) return <p>No network data available.</p>;
    const size = 300;
    const center = { x: size / 2, y: size / 2 };
    const radius = 120;
    const nodeMap = new Map(data.nodes.map(n => [n.id, n]));
    const nodePositions: Record<string, {x: number, y: number}> = {};

    data.nodes.forEach((node, i) => {
        const angle = (i / data.nodes.length) * 2 * Math.PI;
        nodePositions[node.id] = {
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius
        };
    });

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
             {data.links.map((link, i) => {
                 const sourcePos = nodePositions[link.source];
                 const targetPos = nodePositions[link.target];
                 if (!sourcePos || !targetPos) return null;
                 return (
                     <line
                        key={`${link.source}-${link.target}-${i}`}
                        x1={sourcePos.x} y1={sourcePos.y}
                        x2={targetPos.x} y2={targetPos.y}
                        stroke="currentColor"
                        className="text-base-300"
                        strokeWidth="1"
                     />
                 );
             })}
            {data.nodes.map((node, i) => {
                const pos = nodePositions[node.id];
                return (
                    <g key={node.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms`}}>
                        <circle cx={pos.x} cy={pos.y} r="12" fill={COLORS[i % COLORS.length]}>
                            <title>{node.label}</title>
                        </circle>
                        <text x={pos.x} y={pos.y} textAnchor="middle" dy=".3em" fill="white" fontSize="6" fontWeight="bold">{node.label.substring(0, 3)}</text>
                    </g>
                )
            })}
        </svg>
    );
};

export const TopicHeatmap: React.FC<{ data: TopicHeatmapData }> = ({ data }) => {
    const { sources, topics, matrix } = data;
    const getHeatColor = (value: number) => `rgba(79, 70, 229, ${Math.max(0.1, value / 10)})`;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
                <thead>
                    <tr>
                        <th className="p-2 border-b border-r border-base-300"></th>
                        {topics.map(topic => (
                            <th key={topic} className="p-2 border-b border-base-300 text-center font-semibold text-base-content" title={topic}>
                                <div className="truncate w-16">{topic}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sources.map((source, i) => (
                        <tr key={source} className="animate-slide-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                            <td className="p-2 border-r border-base-300 font-semibold text-base-content truncate" title={source}>
                                <div className="truncate w-20">{source}</div>
                            </td>
                            {matrix[i].map((value, j) => (
                                <td key={j} className="p-0 border-b border-base-300/50">
                                    <div className="w-full h-full p-2 text-center" style={{ backgroundColor: getHeatColor(value) }}>
                                        {value}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const BubbleChart: React.FC<{ data: BubbleChartItem[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const categories = [...new Set(data.map(d => d.category))];
    
    return (
        <div className="space-y-4">
            {categories.map((category, i) => (
                <div key={category} className="animate-fade-in" style={{ animationDelay: `${i * 150}ms`}}>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                         <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColorForCategory(category) }} />
                         {category}
                    </h4>
                    <div className="flex flex-wrap items-end gap-2">
                        {data.filter(d => d.category === category).map(item => (
                            <div
                                key={item.name}
                                title={`${item.name} (${item.value})`}
                                className="rounded-full flex items-center justify-center p-1"
                                style={{
                                    width: `${20 + 60 * (item.value / maxValue)}px`,
                                    height: `${20 + 60 * (item.value / maxValue)}px`,
                                    backgroundColor: getColorForCategory(category),
                                    color: 'white',
                                }}
                            >
                                <span className="text-xs truncate">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};