

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
        <div className="bg-stone-800/50 rounded-lg shadow-lg p-6 border border-stone-700">
            <h3 className="text-2xl font-medieval text-white mb-4">Scene Describer (AI DM)</h3>
            <button
                onClick={handleGenerate}
                disabled={isLoading || currentIndex < 0}
                className="w-full flex items-center justify-center bg-stone-700 hover:bg-stone-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Conjuring a vision...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Describe The Scene
                    </>
                )}
            </button>
            {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
            {description && (
                 <div className="mt-4 p-4 bg-stone-900/50 border border-stone-600 rounded-md max-h-60 overflow-y-auto">
                    <p className="text-stone-300 whitespace-pre-wrap">{description}</p>
                 </div>
            )}
        </div>
    );
};
