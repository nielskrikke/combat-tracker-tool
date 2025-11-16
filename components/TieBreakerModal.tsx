

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
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
        <div 
            className="bg-stone-800 rounded-lg shadow-xl p-6 border border-stone-700 w-full max-w-lg m-4"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-medieval text-white">Initiative Tie-Breaker</h3>
                    <p className="text-stone-400 mt-2 text-sm max-w-prose">
                        Some combatants have the same initiative. Enter their Dexterity modifier to determine the correct turn order. Higher DEX mod goes first.
                    </p>
                </div>
                 <button onClick={onClose} className="text-stone-400 text-3xl leading-none hover:text-white">&times;</button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 my-6 border-y border-stone-700 py-4">
                {ties.map((group, index) => (
                    <div key={index} className="bg-stone-900/50 p-4 rounded-lg">
                        <h4 className="font-bold text-lg text-amber-500 mb-3">Tie at Initiative: {group[0].initiative}</h4>
                        <div className="space-y-3">
                            {group.map(p => (
                                <div key={p.id} className="grid grid-cols-3 items-center gap-3">
                                    <span className="text-white font-medium truncate col-span-1">{p.name}</span>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="DEX Mod"
                                            value={participantDexMods[p.id] || ''}
                                            onChange={(e) => handleDexChange(p.id, e.target.value)}
                                            className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-1.5 text-white text-center focus:ring-2 focus:ring-amber-500"
                                            required
                                        />
                                        {p.dexApiUrl && (
                                            <button 
                                                onClick={() => handleFetchDex(p)} 
                                                disabled={loadingDex.has(p.id)}
                                                className="p-2 bg-stone-600 hover:bg-stone-500 text-white font-semibold rounded-md transition duration-300 ease-in-out disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                                title={`Fetch DEX for ${p.name}`}
                                            >
                                                {loadingDex.has(p.id) ? (
                                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
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
                    className="flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Resolve Ties
                </button>
            </div>
        </div>
    </div>
  );
};
