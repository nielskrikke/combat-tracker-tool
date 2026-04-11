

import React, { useState, useCallback } from 'react';
import type { Participant } from '../types';
import { generateSceneDescription } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface SceneDescriberProps {
    participants: Participant[];
    currentIndex: number;
    round: number;
}

export const SceneDescriber: React.FC<SceneDescriberProps> = ({ participants, currentIndex, round }) => {
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = useCallback(async () => {
        if (currentIndex < 0 || participants.length === 0) {
            setError("Combat must be started to describe the scene.");
            return;
        }
        setIsLoading(true);
        setError('');
        setDescription('');
        try {
            const result = await generateSceneDescription(participants, currentIndex, round);
            setDescription(result);
        } catch (err) {
            console.error(err);
            setError("Failed to generate scene. The AI may be resting.");
        } finally {
            setIsLoading(false);
        }
    }, [participants, currentIndex, round]);

    return (
        <div className="bg-dnd-panel/80 backdrop-blur-md rounded-xl shadow-xl p-4 border border-white/5">
            <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em] mb-4">Scene Describer (AI DM)</h3>
            <button
                onClick={handleGenerate}
                disabled={isLoading || currentIndex < 0}
                className="w-full flex items-center justify-center bg-dnd-gold hover:bg-dnd-gold/80 text-black font-black uppercase tracking-[0.2em] text-[10px] py-3 px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(201,173,106,0.15)] hover:shadow-[0_0_30px_rgba(201,173,106,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Conjuring a vision...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Describe The Scene
                    </>
                )}
            </button>
            {error && <p className="text-dnd-red text-[10px] mt-4 text-center font-black uppercase tracking-widest">{error}</p>}
            {description && (
                 <div className="mt-4 p-4 bg-black/20 border border-white/10 rounded-xl max-h-60 overflow-y-auto custom-scrollbar">
                    <p className="text-dnd-text font-sans leading-relaxed whitespace-pre-wrap text-sm">{description}</p>
                 </div>
            )}
        </div>
    );
};
