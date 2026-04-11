

import React, { useMemo, useState } from 'react';
import type { Participant } from '../types';
import { calculateDifficulty } from '../services/difficultyCalculator';
import { D20Icon, ChevronDownIcon, ChevronUpIcon } from './icons';

interface EncounterDifficultyProps {
  participants: Participant[];
}

const getDifficultyTextClass = (difficulty: string) => {
    switch (difficulty) {
        case 'Trivial': return 'text-dnd-text/40';
        case 'Easy': return 'text-emerald-300';
        case 'Medium': return 'text-sky-300';
        case 'Hard': return 'text-dnd-gold';
        case 'Deadly': return 'text-dnd-red';
        default: return 'text-dnd-text/40';
    }
};

export const EncounterDifficulty: React.FC<EncounterDifficultyProps> = ({ participants }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const difficultyInfo = useMemo(() => calculateDifficulty(participants), [participants]);

  return (
    <div className="bg-dnd-panel/80 backdrop-blur-md rounded-xl shadow-xl p-4 border border-white/5">
      <div className="flex justify-between items-center mb-4 cursor-pointer group" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em] group-hover:text-dnd-gold transition-colors">Difficulty</h3>
        <button className="text-dnd-text/20 group-hover:text-dnd-gold transition-colors">
          {isCollapsed ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronUpIcon className="w-3 h-3" />}
        </button>
      </div>
      
      {!isCollapsed && (
        <>
          {!difficultyInfo ? (
            <div className="text-center py-6 text-dnd-text/20 bg-black/20 rounded-lg border border-white/5">
              <p className="font-sans italic text-sm">Add players and creatures to calculate challenge.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                <div className="flex-grow text-center sm:text-left">
                    <p className="text-[8px] font-black uppercase tracking-widest text-dnd-text/40">Challenge Level</p>
                    <p className={`text-3xl font-black tracking-tighter ${getDifficultyTextClass(difficultyInfo.difficulty)}`}>
                        {difficultyInfo.difficulty}
                    </p>
                </div>
                 <div className="text-center sm:text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-dnd-text/40">Adjusted XP</p>
                    <p className="text-3xl font-black text-white tracking-tighter drop-shadow-sm">{difficultyInfo.adjustedXp.toLocaleString()}</p>
                 </div>
              </div>

              <div className="text-[8px] font-black uppercase tracking-widest text-dnd-text/30">
                <p className="text-center mb-3">Party Thresholds ({difficultyInfo.playerCount} Heroes)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    <div className="bg-emerald-900/20 p-2 rounded border border-emerald-500/20">
                        <p className="text-emerald-400 mb-0.5">Easy</p>
                        <p className="text-white text-xs font-mono">{difficultyInfo.partyThresholds.easy.toLocaleString()}</p>
                    </div>
                     <div className="bg-sky-900/20 p-2 rounded border border-sky-500/20">
                        <p className="text-sky-400 mb-0.5">Medium</p>
                        <p className="text-white text-xs font-mono">{difficultyInfo.partyThresholds.medium.toLocaleString()}</p>
                    </div>
                     <div className="bg-dnd-gold/10 p-2 rounded border border-dnd-gold/20">
                        <p className="text-dnd-gold mb-0.5">Hard</p>
                        <p className="text-white text-xs font-mono">{difficultyInfo.partyThresholds.hard.toLocaleString()}</p>
                    </div>
                     <div className="bg-dnd-red/10 p-2 rounded border border-dnd-red/20">
                        <p className="text-dnd-red mb-0.5">Deadly</p>
                        <p className="text-white text-xs font-mono">{difficultyInfo.partyThresholds.deadly.toLocaleString()}</p>
                    </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
