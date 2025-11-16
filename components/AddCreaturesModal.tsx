
import React, { useState, useEffect } from 'react';
import type { Participant } from '../types';
import { CheckIcon } from './icons';

interface AddCreaturesModalProps {
  creatures: Participant[];
  onConfirm: (updatedCreatures: Participant[]) => void;
  onClose: () => void;
}

export const AddCreaturesModal: React.FC<AddCreaturesModalProps> = ({ creatures, onConfirm, onClose }) => {
    const [initiatives, setInitiatives] = useState<Record<string, string>>({});

    useEffect(() => {
        const initialInitiatives = creatures.reduce((acc, p) => {
            acc[p.id] = p.initiative.toString();
            return acc;
        }, {} as Record<string, string>);
        setInitiatives(initialInitiatives);
    }, [creatures]);

    const handleInitiativeChange = (id: string, value: string) => {
        setInitiatives(prev => ({ ...prev, [id]: value }));
    };

    const handleConfirm = () => {
        const updatedCreatures = creatures.map(p => ({
            ...p,
            initiative: parseInt(initiatives[p.id], 10) || 0,
        }));
        onConfirm(updatedCreatures);
    };
    
    // Fix: Explicitly type 'val' as a string to resolve type inference issue.
    const allInitiativesValid = Object.values(initiatives).every((val: string) => val.trim() !== '' && !isNaN(parseInt(val, 10)));

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-stone-800 rounded-lg shadow-xl p-6 border border-stone-700 w-full max-w-lg m-4 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-medieval text-white">Add Creatures to Combat</h3>
                        <p className="text-stone-400 mt-2 text-sm max-w-prose">Set the initiative for the creatures being added from the file.</p>
                    </div>
                     <button onClick={onClose} className="text-stone-400 text-3xl leading-none hover:text-white absolute top-3 right-4">&times;</button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 my-6 border-y border-stone-700 py-4">
                    {creatures.map(p => (
                        <div key={p.id} className="flex items-center justify-between gap-4 px-2">
                            <span className="text-white font-medium truncate">{p.name}</span>
                            <input
                                type="number"
                                value={initiatives[p.id] || ''}
                                onChange={(e) => handleInitiativeChange(p.id, e.target.value)}
                                className="w-24 bg-stone-900/50 border border-stone-600 rounded-md px-3 py-1 text-white text-center focus:ring-2 focus:ring-amber-500"
                                required
                            />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center bg-stone-700 hover:bg-stone-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                    >
                        Cancel
                    </button>
                     <button
                        onClick={handleConfirm}
                        disabled={!allInitiativesValid}
                        className="flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckIcon className="w-5 h-5 mr-2" />
                        Add Creatures
                    </button>
                </div>
            </div>
        </div>
    );
};
