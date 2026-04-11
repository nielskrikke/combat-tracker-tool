
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-dnd-panel rounded-2xl shadow-2xl p-8 border border-white/10 w-full max-w-lg m-4 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dnd-gold to-transparent opacity-50"></div>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em]">Reinforcements</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40 mt-2">Set initiative for incoming combatants.</p>
                    </div>
                     <button onClick={onClose} className="p-2 text-dnd-text/40 hover:text-dnd-gold rounded-full hover:bg-white/5 transition-all text-2xl leading-none">&times;</button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 my-8 custom-scrollbar">
                    {creatures.map(p => (
                        <div key={p.id} className="flex items-center justify-between gap-4 p-4 bg-black/20 rounded-xl border border-white/5 group hover:border-dnd-gold/30 transition-all">
                            <span className="text-dnd-text font-sans text-lg truncate">{p.name}</span>
                            <div className="flex flex-col items-end">
                                <label className="text-[10px] font-black uppercase tracking-widest text-dnd-text/20 mb-1">Initiative</label>
                                <input
                                    type="number"
                                    value={initiatives[p.id] || ''}
                                    onChange={(e) => handleInitiativeChange(p.id, e.target.value)}
                                    className="w-20 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text text-center font-mono focus:ring-2 focus:ring-dnd-gold/50 transition-all"
                                    required
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                        onClick={onClose}
                        className="flex-1 sm:flex-none items-center justify-center bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-text font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-xl transition-all border border-white/5"
                    >
                        Cancel
                    </button>
                     <button
                        onClick={handleConfirm}
                        disabled={!allInitiativesValid}
                        className="flex-1 sm:flex-none flex items-center justify-center bg-dnd-gold hover:bg-dnd-gold/80 text-black font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Add to Combat
                    </button>
                </div>
            </div>
        </div>
    );
};
