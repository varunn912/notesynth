import React, { useState, useEffect, useRef } from 'react';
import type { PodcastData } from '../types';

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.648c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zm9 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);

export const PodcastPlayer: React.FC<{ data: PodcastData }> = ({ data }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLineIndex, setCurrentLineIndex] = useState(-1);
    const scriptIndexRef = useRef(0);
    const currentLineDivRef = useRef<HTMLDivElement>(null);

    // Cleanup: stop speaking when the component unmounts or data changes
    useEffect(() => {
        return () => {
            speechSynthesis.cancel();
        };
    }, [data]);

    // Scroll the currently spoken line into view
    useEffect(() => {
        currentLineDivRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [currentLineIndex]);

    const play = () => {
        if (speechSynthesis.speaking) return;

        const speakLine = (index: number) => {
            // Check if we've reached the end of the script
            if (index >= data.script.length) {
                setIsPlaying(false);
                setCurrentLineIndex(-1);
                scriptIndexRef.current = 0; // Reset for next play
                return;
            }

            const line = data.script[index];
            const utterance = new SpeechSynthesisUtterance(`${line.speaker}: ${line.line}`);

            // Set properties for the utterance
            utterance.onstart = () => {
                setCurrentLineIndex(index);
            };

            utterance.onend = () => {
                // When one line ends, move to the next
                scriptIndexRef.current = index + 1;
                speakLine(scriptIndexRef.current);
            };

            utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
                // 'canceled' and 'interrupted' are expected when stopping speech. Don't log them as errors.
                if (event.error === 'canceled' || event.error === 'interrupted') {
                    return;
                }
                console.error('Speech synthesis error:', event.error);
                setIsPlaying(false); // Stop playback on actual error
            };
            
            // Try to find a good voice
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                const voice = voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
                if(voice) utterance.voice = voice;
            }

            speechSynthesis.speak(utterance);
        };

        setIsPlaying(true);
        // Start speaking from the current index (for resuming)
        speakLine(scriptIndexRef.current);
    };

    const pause = () => {
        // Cancel is more reliable than pause across browsers
        speechSynthesis.cancel();
        setIsPlaying(false);
        // The scriptIndexRef remains at its current position, so 'play' will resume from there
    };

    const handlePlayPause = () => {
        // The speech synthesis API needs to load voices, which can be asynchronous.
        // This ensures that we try to play only after voices are available.
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = () => {
                if (!isPlaying) play();
            };
            // Fallback for browsers that don't fire onvoiceschanged reliably
            setTimeout(() => { if (!isPlaying && speechSynthesis.getVoices().length > 0) play(); }, 500);
        }
        
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    return (
        <div className="bg-base-100 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={handlePlayPause}
                    className="w-12 h-12 flex-shrink-0 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-brand-primary/80 transition-colors"
                >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <div>
                    <p className="text-sm text-base-content-secondary">Podcast</p>
                    <h4 className="font-bold text-base-content">{data.title}</h4>
                </div>
            </div>
            <div className="h-48 overflow-y-auto p-3 bg-base-200 rounded-md space-y-3 text-sm">
                {data.script.map((line, index) => (
                    <div
                        key={index}
                        ref={index === currentLineIndex ? currentLineDivRef : null}
                        className={`p-2 rounded-md transition-colors duration-300 ${index === currentLineIndex ? 'bg-brand-secondary/30' : ''}`}
                    >
                        <strong className="text-brand-primary">{line.speaker}:</strong>
                        <span className="ml-2 text-base-content-secondary">{line.line}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};