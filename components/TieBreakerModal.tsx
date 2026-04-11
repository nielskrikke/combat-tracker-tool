

import React, { useState, useEffect } from 'react';
import type { Participant } from '../types';
import { RefreshIcon, CheckIcon } from './icons';

interface TieBreakerModalProps {
  ties: Participant[][];
  onResolve: (updatedParticipants: Participant[]) => void;
  onClose: () => void;
}

export const TieBreakerModal: React.FC<TieBreakerModalProps> = ({ ties, onResolve, onClose }) => {
  const [participantDexMods, setParticipantDexMods] = useState<Record<string, string>>({});
  const [loadingDex, setLoadingDex] = useState<Set<string>>(new Set());

  const allParticipantsInTies = ties.flat();

  useEffect(() => {
    const initialMods = allParticipantsInTies.reduce((acc, p) => {
      acc[p.id] = p.dexterityModifier?.toString() ?? '';
      return acc;
    }, {} as Record<string, string>);
    setParticipantDexMods(initialMods);
  }, [ties]);

  const handleDexChange = (id: string, value: string) => {
    setParticipantDexMods(prev => ({ ...prev, [id]: value }));
  };

  const handleFetchDex = async (participant: Participant) => {
    if (!participant.dexApiUrl) return;
    setLoadingDex(prev => new Set(prev).add(participant.id));
    try {
      const response = await fetch(`https://www.dnd5eapi.co${participant.dexApiUrl}`);
      const monsterData = await response.json();
      const dexMod = Math.floor((monsterData.dexterity - 10) / 2);
      handleDexChange(participant.id, dexMod.toString());
    } catch (error) {
      console.error("Failed to fetch monster DEX:", error);
      alert(`Could not fetch DEX for ${participant.name}. Please enter it manually.`);
    } finally {
      setLoadingDex(prev => {
        const newSet = new Set(prev);
        newSet.delete(participant.id);
        return newSet;
      });
    }
  };

  const handleResolve = () => {
    const updatedParticipants = allParticipantsInTies.map(p => ({
      ...p,
      dexterityModifier: parseInt(participantDexMods[p.id], 10),
    }));
    onResolve(updatedParticipants);
  };
  
  const allDexModsEntered = allParticipantsInTies.every(p => {
    const mod = participantDexMods[p.id];
    return mod != null && mod.trim() !== '' && !isNaN(parseInt(mod, 10));
  });

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
                    <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em]">Tie-Breaker</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40 mt-2 max-w-xs">
                        Multiple combatants share an initiative. Dexterity will decide their fate.
                    </p>
                </div>
                 <button onClick={onClose} className="p-2 text-dnd-text/40 hover:text-dnd-gold rounded-full hover:bg-white/5 transition-all text-2xl leading-none">&times;</button>
            </div>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 my-8 custom-scrollbar">
                {ties.map((group, index) => (
                    <div key={index} className="bg-black/20 p-5 rounded-xl border border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-dnd-gold mb-4 ml-1">Tie at Initiative: {group[0].initiative}</h4>
                        <div className="space-y-4">
                            {group.map(p => (
                                <div key={p.id} className="grid grid-cols-3 items-center gap-4">
                                    <span className="text-dnd-text font-sans text-lg truncate col-span-1">{p.name}</span>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="DEX Mod"
                                            value={participantDexMods[p.id] || ''}
                                            onChange={(e) => handleDexChange(p.id, e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-dnd-text text-center font-mono focus:ring-2 focus:ring-dnd-gold/50 transition-all"
                                            required
                                        />
                                        {p.dexApiUrl && (
                                            <button 
                                                onClick={() => handleFetchDex(p)} 
                                                disabled={loadingDex.has(p.id)}
                                                className="p-2 bg-white/5 hover:bg-white/10 text-dnd-gold rounded-lg border border-white/5 transition-all disabled:opacity-30"
                                                title={`Fetch DEX for ${p.name}`}
                                            >
                                                {loadingDex.has(p.id) ? (
                                                    <svg className="animate-spin h-5 w-5 text-dnd-gold" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : <RefreshIcon className="w-5 h-5"/>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                 <button
                    onClick={handleResolve}
                    disabled={!allDexModsEntered}
                    className="w-full sm:w-auto flex items-center justify-center bg-dnd-gold hover:bg-dnd-gold/80 text-black font-black uppercase tracking-[0.2em] text-[10px] py-4 px-8 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Resolve Ties
                </button>
            </div>
        </div>
    </div>
  );
};
