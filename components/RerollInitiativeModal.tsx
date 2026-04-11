
import React, { useState, useEffect } from 'react';
import type { Participant } from '../types';
import { CheckIcon, UploadIcon } from './icons';

interface RerollInitiativeModalProps {
  loadedState: {
    participants: Participant[];
    currentIndex: number;
    round: number;
  };
  onConfirmLoadAsIs: (loadedState: any) => void;
  onConfirmUpdateInitiative: (updatedParticipants: Participant[]) => void;
  onClose: () => void;
}

export const RerollInitiativeModal: React.FC<RerollInitiativeModalProps> = ({ loadedState, onConfirmLoadAsIs, onConfirmUpdateInitiative, onClose }) => {
    const [initiatives, setInitiatives] = useState<Record<string, string>>({});

    useEffect(() => {
        const initialInitiatives = loadedState.participants.reduce((acc, p) => {
            acc[p.id] = p.initiative.toString();
            return acc;
        }, {} as Record<string, string>);
        setInitiatives(initialInitiatives);
    }, [loadedState.participants]);

    const handleInitiativeChange = (id: string, value: string) => {
        setInitiatives(prev => ({ ...prev, [id]: value }));
    };

    const handleUpdateAndReset = () => {
        const updatedParticipants = loadedState.participants.map(p => ({
            ...p,
            initiative: parseInt(initiatives[p.id], 10) || 0,
        }));
        onConfirmUpdateInitiative(updatedParticipants);
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
                        <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em]">Update Initiative</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40 mt-2 max-w-xs">Session loaded. Adjust initiative values or restore the previous state.</p>
                    </div>
                     <button onClick={onClose} className="p-2 text-dnd-text/40 hover:text-dnd-gold rounded-full hover:bg-white/5 transition-all text-2xl leading-none">&times;</button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 my-8 custom-scrollbar">
                    {loadedState.participants.map(p => (
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
                        onClick={() => onConfirmLoadAsIs(loadedState)}
                        className="flex-1 sm:flex-none flex items-center justify-center bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-text font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-xl transition-all border border-white/5"
                    >
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Load As-Is
                    </button>
                     <button
                        onClick={handleUpdateAndReset}
                        disabled={!allInitiativesValid}
                        className="flex-1 sm:flex-none flex items-center justify-center bg-dnd-gold hover:bg-dnd-gold/80 text-black font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Update & Reset
                    </button>
                </div>
            </div>
        </div>
    );
};
