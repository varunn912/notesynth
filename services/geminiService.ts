import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Source, ChatMessage, SuggestedVisualization, PodcastData } from '../types';
import { VisualizationType } from '../types';


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const chatModel = 'gemini-2.5-flash';
let chatInstance: Chat | null = null;

const getChatInstance = (sources: Source[]): Chat => {
    const activeSourcesContent = sources
        .filter(s => s.isActive)
        .map(s => `--- SOURCE: "${s.title}" ---\n${s.content}`)
        .join('\n\n');
    
    const systemInstruction = `You are a helpful research assistant called NOTESYNTH. Your goal is to answer the user's questions based *exclusively* on the information contained in the provided sources. Do not use any external knowledge. When you use information from a source, you MUST cite it at the end of the sentence like this: [Source: "${"Source Title"}]. If the answer cannot be found in the sources, you must state: "I could not find an answer to that in the provided sources."\n\nHere are the available sources:\n${activeSourcesContent}`;

    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: chatModel,
            config: {
                systemInstruction: systemInstruction,
            },
        });
    }
    // This is a simplification. In a real app, you'd want to manage chat instances more carefully,
    // potentially creating a new one if the sources change drastically.
    // For now, we'll reuse the instance.
    return chatInstance;
}

export const summarizePastedText = async (content: string): Promise<{ title: string; summary: string; keywords: string[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: chatModel,
            contents: `Analyze the following text and provide a concise title (max 7 words), a one-paragraph summary, and up to 5 relevant keywords.\n\nTEXT:\n${content}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A concise title for the text, maximum 7 words." },
                        summary: { type: Type.STRING, description: "A one-paragraph summary of the text." },
                        keywords: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of up to 5 relevant keywords."
                        }
                    },
                    required: ["title", "summary", "keywords"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error summarizing source:", error);
        throw new Error("Failed to summarize the source. Please check the content and try again.");
    }
};

export const processFileUpload = async (file: { mimeType: string; data: string }): Promise<{ title: string; summary: string; keywords: string[]; content: string }> => {
    let textResponse = '';
    try {
        const prompt = `Analyze the provided document. Your task is to extract its full text content and generate metadata.
You MUST return a single, valid JSON object and nothing else. No markdown, no explanations.
The JSON object must follow this structure:
{
  "title": "A concise title, maximum 7 words",
  "summary": "A one-paragraph summary of the document's content.",
  "keywords": ["an", "array", "of", "up to 5", "keywords"],
  "content": "The complete, raw text extracted from the document. All characters inside this string, such as quotes ("), backslashes (\\), and newlines (\\n), MUST be correctly escaped to form a valid JSON string."
}
Ensure the 'content' field is properly escaped.`;

        const response = await ai.models.generateContent({
            model: chatModel,
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: file.mimeType,
                            data: file.data,
                        },
                    },
                ],
            },
        });

        textResponse = response.text.trim();
        const jsonStr = textResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error processing file:", error);
        if (error instanceof SyntaxError) {
            console.error("Failed to parse JSON from model response:", textResponse);
            throw new Error("The AI returned a malformed analysis of the file. This can happen with very complex documents. Please try another file.");
        }
        if (error instanceof Error && error.message.includes('supported')) {
             throw new Error("The uploaded file type is not supported by the AI model.");
        }
        throw new Error("Failed to process the file. It might be corrupted or an unsupported format.");
    }
};


export const generateNoteboard = async (sources: Source[]): Promise<any> => {
    const activeSourcesContent = sources
        .filter(s => s.isActive)
        .map(s => `--- SOURCE: "${s.title}" ---\n${s.content}`)
        .join('\n\n');

    if (!activeSourcesContent) {
        return { summary: "No active sources to generate insights from.", key_people: [], qna: [], suggested_visualizations: [] };
    }

    const vizTypes = Object.values(VisualizationType).join(', ');

    const response = await ai.models.generateContent({
        model: chatModel,
        contents: `Based on the following documents, generate a JSON object containing:
1. An overall summary of all documents combined.
2. A list of key people or entities mentioned, with a brief description of each.
3. A list of 3 potential questions a user might ask, with answers.
4. An array of suggested visualizations. Analyze the content and suggest the most insightful visualization types from this list: [${vizTypes}]. For each suggestion, provide a 'type' and a brief 'rationale' explaining why it's a good fit for the given documents.

DOCUMENTS:\n${activeSourcesContent}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING, description: "A comprehensive summary combining all provided sources." },
                    key_people: {
                        type: Type.ARRAY,
                        description: "List of key people or entities and their significance.",
                        items: {
                            type: Type.OBJECT,
                            properties: { name: { type: Type.STRING }, description: { type: Type.STRING } },
                             required: ["name", "description"]
                        }
                    },
                    qna: {
                        type: Type.ARRAY,
                        description: "Potential questions and answers derived from the text.",
                        items: {
                            type: Type.OBJECT,
                            properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } },
                            required: ["question", "answer"]
                        }
                    },
                    suggested_visualizations: {
                        type: Type.ARRAY,
                        description: "An array of suggested visualization objects.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: Object.values(VisualizationType) },
                                rationale: { type: Type.STRING }
                            },
                            required: ["type", "rationale"]
                        }
                    }
                },
                required: ["summary", "key_people", "qna", "suggested_visualizations"]
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const generateVisualizationData = async (sources: Source[], vizType: VisualizationType): Promise<any> => {
    const activeSources = sources.filter(s => s.isActive);
    const activeSourcesContent = activeSources
        .map(s => `--- SOURCE: "${s.title}" ---\n${s.content}`)
        .join('\n\n');

    let prompt = '';
    let schema: any = {};

    switch (vizType) {
        case VisualizationType.WORD_CLOUD:
            prompt = `From the provided text, extract the 30 most frequent and meaningful words (excluding common stop words). Return a JSON array of objects, each with 'text' and 'value' (frequency).`;
            schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["text", "value"] } };
            break;
        case VisualizationType.BAR_CHART:
            prompt = `Identify the top 5-7 key topics, themes, or entities in the text and their relative prominence or frequency. Return as JSON for a bar chart: an array of objects with 'name' and 'value'.`;
            schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["name", "value"] } };
            break;
        case VisualizationType.PIE_CHART:
            prompt = `Categorize the content into 3-5 main themes. Estimate the percentage of the text dedicated to each. Return a JSON array for a pie chart: objects with 'name' and 'value' (percentage), ensuring values sum to 100.`;
            schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ["name", "value"] } };
            break;
        case VisualizationType.CONCEPT_MAP:
            prompt = `Create a concept map from the text. Identify ONE central concept and 4-5 key sub-concepts that branch from it. For each sub-concept, list 2-3 related ideas. Return a single JSON object with a 'center' (string) and 'nodes' (array of objects with 'name' and 'children' array).`;
            schema = { type: Type.OBJECT, properties: { center: { type: Type.STRING }, nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, children: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "children"] } } }, required: ["center", "nodes"] };
            break;
        case VisualizationType.SENTIMENT_ANALYSIS:
            prompt = `Analyze the overall sentiment of the text. Return a single JSON object with 'sentiment' ('Positive', 'Negative', or 'Neutral') and a numeric 'score' from -1.0 (very negative) to 1.0 (very positive).`;
            schema = { type: Type.OBJECT, properties: { sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] }, score: { type: Type.NUMBER } }, required: ["sentiment", "score"] };
            break;
        case VisualizationType.TIMELINE:
             prompt = `Create a chronological timeline of the most important events from the text. Return a JSON array of objects, each with a 'date' and a 'description'.`;
             schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["date", "description"] } };
             break;
        case VisualizationType.NETWORK_GRAPH:
            prompt = `Identify key entities (people, organizations, concepts) and their relationships from the text. Return a JSON object with 'nodes' (an array of objects with 'id' and 'label') and 'links' (an array of objects with 'source' and 'target' IDs). Limit to the 10 most important nodes.`;
            schema = { type: Type.OBJECT, properties: { nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, label: { type: Type.STRING } }, required: ['id', 'label'] } }, links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, target: { type: Type.STRING } }, required: ['source', 'target'] } } }, required: ['nodes', 'links'] };
            break;
        case VisualizationType.GEO_MAP:
            prompt = `From the text, list all countries mentioned. Return a JSON object containing a single key "countryCodes" which is an array of the two-letter ISO 3166-1 alpha-2 codes for each country (e.g., ["US", "DE", "JP"]).`;
            schema = { type: Type.OBJECT, properties: { countryCodes: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['countryCodes'] };
            break;
        case VisualizationType.TOPIC_HEATMAP:
            const sourceTitles = activeSources.map(s => s.title);
            prompt = `Analyze the content of the following documents. Identify the 5 most prominent shared topics. Then, for each document, rate the prevalence of each topic on a scale from 0 to 10. The document titles are: ${sourceTitles.join(', ')}. Return a JSON object with 'sources' (an array of the document titles), 'topics' (an array of the identified topic names), and 'matrix' (a 2D array of scores, where matrix[i][j] is the score for sources[i] and topics[j]).`;
            schema = { type: Type.OBJECT, properties: { sources: { type: Type.ARRAY, items: { type: Type.STRING } }, topics: { type: Type.ARRAY, items: { type: Type.STRING } }, matrix: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.NUMBER } } } }, required: ['sources', 'topics', 'matrix'] };
            break;
        case VisualizationType.BUBBLE_CHART:
            prompt = `Categorize key entities or concepts from the text into 3-5 logical groups. Determine a relative size for each entity based on its importance or frequency. Return a JSON array of objects, each with 'name', 'value' (for size), and 'category' (for color/grouping).`;
            schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER }, category: { type: Type.STRING } }, required: ['name', 'value', 'category'] } };
            break;
        default:
            throw new Error("Unknown visualization type");
    }

    const response = await ai.models.generateContent({
        model: chatModel,
        contents: `${prompt}\n\nDOCUMENTS:\n${activeSourcesContent}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const generatePodcastScript = async (sources: Source[]): Promise<PodcastData> => {
    const activeSourcesContent = sources
        .filter(s => s.isActive)
        .map(s => `--- SOURCE: "${s.title}" ---\n${s.content}`)
        .join('\n\n');

    if (!activeSourcesContent) {
        throw new Error("No active sources for podcast generation.");
    }
    
    const response = await ai.models.generateContent({
        model: chatModel,
        contents: `You are a podcast script writer. Based on the provided documents, write a short, engaging podcast episode. The podcast should have a catchy 'title' and a 'script' with at least two distinct speakers (e.g., 'Host', 'Expert', or named characters). The script should be an array of objects, each with a 'speaker' and their 'line'. Return ONLY a single JSON object with this structure, and nothing else.

DOCUMENTS:\n${activeSourcesContent}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy title for the podcast episode." },
                    script: {
                        type: Type.ARRAY,
                        description: "The dialogue script for the podcast.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                speaker: { type: Type.STRING, description: "The name of the speaker." },
                                line: { type: Type.STRING, description: "The line of dialogue." }
                            },
                            required: ["speaker", "line"]
                        }
                    }
                },
                required: ["title", "script"]
            }
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const getChatStream = async (history: ChatMessage[], sources: Source[], question: string) => {
    // Reset chat if sources change. A more sophisticated implementation could be used.
    chatInstance = null;
    const chat = getChatInstance(sources);
    
    // For simplicity in this example, we're not passing the whole history to a new chat instance
    // but relying on the system prompt's source context.
    return chat.sendMessageStream({ message: question });
};