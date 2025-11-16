

import React, { useMemo } from 'react';
import type { Participant } from '../types';
import { calculateDifficulty } from '../services/difficultyCalculator';
import { D20Icon } from './icons';

interface EncounterDifficultyProps {
  participants: Participant[];
}

const getDifficultyTextClass = (difficulty: string) => {
    switch (difficulty) {
        case 'Trivial': return 'text-stone-300';
        case 'Easy': return 'text-emerald-300';
        case 'Medium': return 'text-sky-300';
        case 'Hard': return 'text-amber-300';
        case 'Deadly': return 'text-red-300';
        default: return 'text-stone-300';
    }
};

export const EncounterDifficulty: React.FC<EncounterDifficultyProps> = ({ participants }) => {
  const difficultyInfo = useMemo(() => calculateDifficulty(participants), [participants]);

  return (
    <div className="bg-stone-800/50 rounded-lg shadow-lg p-6 border border-stone-700">
      <h3 className="text-2xl font-medieval text-white mb-4">Encounter Difficulty</h3>
      {!difficultyInfo ? (
        <div className="text-center py-4 text-stone-500">
          <p>Add players with levels and creatures with CR to calculate difficulty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-stone-900/50 rounded-lg">
            <div className="flex-grow text-center sm:text-left">
                <p className="text-sm text-stone-400">Calculated Difficulty</p>
                <p className={`text-3xl font-bold ${getDifficultyTextClass(difficultyInfo.difficulty)}`}>
                    {difficultyInfo.difficulty}
                </p>
            </div>
             <div className="text-center sm:text-right">
                <p className="text-sm text-stone-400">Adjusted XP</p>
                <p className="text-3xl font-bold text-white">{difficultyInfo.adjustedXp.toLocaleString()}</p>
             </div>
          </div>

          <div className="text-sm text-stone-400">
            <p className="text-center mb-2">Party Thresholds for {difficultyInfo.playerCount} player(s):</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                <div className="bg-emerald-900/50 p-2 rounded">
                    <p className="font-bold text-emerald-400">Easy</p>
                    <p className="text-white">{difficultyInfo.partyThresholds.easy.toLocaleString()} XP</p>
                </div>
                 <div className="bg-sky-900/50 p-2 rounded">
                    <p className="font-bold text-sky-400">Medium</p>
                    <p className="text-white">{difficultyInfo.partyThresholds.medium.toLocaleString()} XP</p>
                </div>
                 <div className="bg-amber-900/50 p-2 rounded">
                    <p className="font-bold text-amber-400">Hard</p>
                    <p className="text-white">{difficultyInfo.partyThresholds.hard.toLocaleString()} XP</p>
                </div>
                 <div className="bg-red-900/50 p-2 rounded">
                    <p className="font-bold text-red-400">Deadly</p>
                    <p className="text-white">{difficultyInfo.partyThresholds.deadly.toLocaleString()} XP</p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
