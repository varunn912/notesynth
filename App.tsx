import React, { useState, useCallback, useEffect } from 'react';
import mammoth from 'mammoth';
import { SourcePanel } from './components/SourcePanel';
import { ChatPanel } from './components/ChatPanel';
import { NoteboardPanel } from './components/NoteboardPanel';
import { AuthScreen } from './components/AuthScreen';
import { ArrowRightOnRectangleIcon, LogoIcon } from './components/icons';
import type { UserData, Source, ChatMessage, NoteboardItem, SuggestedVisualization } from './types';
import { NoteboardItemType, VisualizationType } from './types';
import { 
    summarizePastedText, 
    processFileUpload, 
    generateNoteboard, 
    getChatStream,
    generateVisualizationData,
    generatePodcastScript,
} from './services/geminiService';
import * as dbService from './services/dbService';
import { getISTTimestamp } from './utils/time';

const initialAppData: UserData = {
    sources: [],
    chatHistory: [],
    noteboardItems: [],
    suggestedVisualizations: [],
};

const App: React.FC = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Consolidated App State
    const [appData, setAppData] = useState<UserData>(initialAppData);
    
    // UI/Error State
    const [error, setError] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const [isGeneratingNoteboard, setIsGeneratingNoteboard] = useState(false);
    const [isGeneratingVisualization, setIsGeneratingVisualization] = useState<VisualizationType | null>(null);
    const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
    
    const { sources, chatHistory, noteboardItems, suggestedVisualizations } = appData;

    // --- Auth and Data Persistence ---

    // Effect for initial load: check for a logged-in user
    useEffect(() => {
        const currentUser = dbService.getCurrentUser();
        if (currentUser) {
            handleLoginSuccess(currentUser);
        }
    }, []); // Empty array ensures this runs only once on mount

    // Effect for saving data whenever it changes
    useEffect(() => {
        if (isAuthenticated && userEmail) {
            dbService.saveUserData(userEmail, appData);
        }
    }, [appData, isAuthenticated, userEmail]);

    const handleLoginSuccess = useCallback((email: string) => {
        const userData = dbService.loadUserData(email);
        setAppData(userData);
        dbService.setCurrentUser(email);
        setUserEmail(email);
        setIsAuthenticated(true);
    }, []);

    const handleLogout = useCallback(() => {
        dbService.clearCurrentUser();
        setUserEmail(null);
        setIsAuthenticated(false);
        setAppData(initialAppData); // Reset all user data
        setError(null);
    }, []);


    // --- Core App Logic ---

    const handleAddPastedText = useCallback(async (content: string) => {
        setIsSummarizing(true);
        setError(null);
        try {
            const { title, summary, keywords } = await summarizePastedText(content);
            const newSource: Source = {
                id: `source-${Date.now()}`,
                title,
                summary,
                keywords,
                content,
                isActive: true,
                timestamp: getISTTimestamp(),
            };
            setAppData(prev => ({ ...prev, sources: [newSource, ...prev.sources] }));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsSummarizing(false);
        }
    }, []);

    const handleAddFile = useCallback(async (file: File) => {
        setIsSummarizing(true);
        setError(null);
    
        const processTextContent = async (textContent: string) => {
            if (!textContent) throw new Error("Could not extract text from the file.");
            const { title, summary, keywords } = await summarizePastedText(textContent);
            const newSource: Source = {
                id: `source-${Date.now()}`,
                title, summary, keywords, content: textContent,
                isActive: true,
                timestamp: getISTTimestamp(),
            };
            setAppData(prev => ({ ...prev, sources: [newSource, ...prev.sources] }));
        };

        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        try {
            if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith('.docx')) {
                const arrayBuffer = await file.arrayBuffer();
                const { value } = await mammoth.extractRawText({ arrayBuffer });
                await processTextContent(value);
            } else if (fileType === 'text/csv' || fileName.endsWith('.csv') || fileType === 'application/msword' || fileName.endsWith('.doc')) {
                const textContent = await file.text();
                await processTextContent(textContent);
            } else { // Handle other files (PDF, images, etc.) with Gemini
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                const base64Data = dataUrl.split(',')[1];
                if (!base64Data) throw new Error("Could not read file data.");
                
                const { title, summary, keywords, content } = await processFileUpload({ mimeType: file.type, data: base64Data });
                const newSource: Source = {
                    id: `source-${Date.now()}`,
                    title, summary, keywords, content,
                    isActive: true,
                    timestamp: getISTTimestamp(),
                };
                setAppData(prev => ({ ...prev, sources: [newSource, ...prev.sources] }));
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred while processing the file.');
        } finally {
            setIsSummarizing(false);
        }
    }, []);

    const handleToggleActiveSource = useCallback((id: string) => {
        setAppData(prev => ({
            ...prev,
            sources: prev.sources.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
        }));
    }, []);

    const handleDeleteSource = useCallback((id: string) => {
        setAppData(prev => ({
            ...prev,
            sources: prev.sources.filter(s => s.id !== id)
        }));
    }, []);

    const handleSendMessage = useCallback(async (text: string) => {
        setIsChatting(true);
        setError(null);
        
        const userMessage: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', text, timestamp: getISTTimestamp() };
        const assistantMessage: ChatMessage = { id: `msg-${Date.now() + 1}`, role: 'assistant', text: '', isLoading: true, timestamp: getISTTimestamp() };
        
        setAppData(prev => ({ ...prev, chatHistory: [...prev.chatHistory, userMessage, assistantMessage] }));

        try {
            const stream = await getChatStream(chatHistory, sources, text);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setAppData(prev => ({
                    ...prev,
                    chatHistory: prev.chatHistory.map(msg => 
                        msg.id === assistantMessage.id ? { ...msg, text: fullResponse } : msg
                    )
                }));
            }
            setAppData(prev => ({
                ...prev,
                chatHistory: prev.chatHistory.map(msg => 
                    msg.id === assistantMessage.id ? { ...msg, isLoading: false, timestamp: getISTTimestamp() } : msg
                )
            }));
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during chat.';
            setError(errorMessage);
            setAppData(prev => ({
                ...prev,
                chatHistory: prev.chatHistory.map(msg => 
                    msg.id === assistantMessage.id ? { ...msg, text: `Error: ${errorMessage}`, isLoading: false } : msg
                )
            }));
        } finally {
            setIsChatting(false);
        }
    }, [chatHistory, sources]);

    const handleGenerateNoteboard = useCallback(async () => {
        setIsGeneratingNoteboard(true);
        setError(null);
        setAppData(prev => ({...prev, noteboardItems: [], suggestedVisualizations: [] }));
        try {
            const data = await generateNoteboard(sources);
            const newItems: NoteboardItem[] = [];
            if (data.summary) newItems.push({ id: 'nb-summary', type: NoteboardItemType.SUMMARY, title: 'Overall Summary', content: data.summary });
            if (data.key_people?.length) newItems.push({ id: 'nb-people', type: NoteboardItemType.KEY_PEOPLE, title: 'Key People', content: data.key_people });
            if (data.qna?.length) newItems.push({ id: 'nb-qna', type: NoteboardItemType.QNA, title: 'Key Q&A', content: data.qna });
            
            setAppData(prev => ({
                ...prev,
                noteboardItems: newItems,
                suggestedVisualizations: data.suggested_visualizations || []
            }));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate noteboard.');
        } finally {
            setIsGeneratingNoteboard(false);
        }
    }, [sources]);

    const handleGenerateVisualization = useCallback(async (vizType: VisualizationType) => {
        setIsGeneratingVisualization(vizType);
        setError(null);
        try {
            const vizData = await generateVisualizationData(sources, vizType);
            const newItem: NoteboardItem = {
                id: `nb-viz-${vizType}-${Date.now()}`,
                type: NoteboardItemType.VISUALIZATION,
                vizType: vizType,
                title: vizType,
                content: vizData
            };
            setAppData(prev => ({
                ...prev,
                noteboardItems: [...prev.noteboardItems, newItem],
                suggestedVisualizations: prev.suggestedVisualizations.filter(v => v.type !== vizType)
            }));
        } catch (e) {
            setError(e instanceof Error ? e.message : `Failed to generate ${vizType}.`);
        } finally {
            setIsGeneratingVisualization(null);
        }
    }, [sources]);
    
    const handleGeneratePodcast = useCallback(async () => {
        setIsGeneratingPodcast(true);
        setError(null);
        try {
            const podcastData = await generatePodcastScript(sources);
            const newItem: NoteboardItem = {
                id: `nb-podcast-${Date.now()}`,
                type: NoteboardItemType.PODCAST,
                title: podcastData.title,
                content: podcastData,
            };
            setAppData(prev => ({ ...prev, noteboardItems: [...prev.noteboardItems, newItem] }));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate Podcast.');
        } finally {
            setIsGeneratingPodcast(false);
        }
    }, [sources]);
    
    const hasActiveSources = sources.some(s => s.isActive);
    
    if (!isAuthenticated) {
        return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="h-screen w-screen bg-base-100 flex flex-col p-4">
             <header className="flex-shrink-0 mb-4 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <LogoIcon className="w-7 h-7" />
                    <h1 className="text-2xl font-bold text-base-content">
                        NOTESYNTH
                    </h1>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-sm text-base-content-secondary hidden sm:block">{userEmail}</span>
                    <button onClick={handleLogout} className="flex items-center gap-2 p-2 rounded-lg text-base-content-secondary hover:bg-base-200 hover:text-base-content transition-colors">
                        <ArrowRightOnRectangleIcon className="w-5 h-5"/>
                        <span className="hidden md:inline">Logout</span>
                    </button>
                 </div>
             </header>

            {error && (
                <div className="mb-4 p-3 bg-red-900/50 text-red-200 border border-red-700/50 rounded-lg text-sm animate-fade-in flex justify-between items-center shadow-lg">
                    <span><strong>Error:</strong> {error}</span>
                    <button onClick={() => setError(null)} className="ml-4 font-bold text-lg leading-none p-1 rounded-full hover:bg-red-500/20">&times;</button>
                </div>
            )}
             
             <main className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-4 overflow-hidden">
                <div className="lg:col-span-3 h-full overflow-hidden">
                    <SourcePanel
                        sources={sources}
                        onAddPastedText={handleAddPastedText}
                        onAddFile={handleAddFile}
                        onToggleActive={handleToggleActiveSource}
                        onDeleteSource={handleDeleteSource}
                        isSummarizing={isSummarizing}
                    />
                </div>
                <div className="lg:col-span-4 h-full overflow-hidden">
                    <ChatPanel
                        messages={chatHistory}
                        onSendMessage={handleSendMessage}
                        isLoading={isChatting}
                        hasActiveSources={hasActiveSources}
                    />
                </div>
                <div className="lg:col-span-3 h-full overflow-hidden">
                    <NoteboardPanel
                        items={noteboardItems}
                        suggestedVisualizations={suggestedVisualizations}
                        onGenerate={handleGenerateNoteboard}
                        onGenerateVisualization={handleGenerateVisualization}
                        onGeneratePodcast={handleGeneratePodcast}
                        isLoading={isGeneratingNoteboard}
                        isGeneratingVisualization={isGeneratingVisualization}
                        isGeneratingPodcast={isGeneratingPodcast}
                        hasActiveSources={hasActiveSources}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;