import React, { useMemo } from 'react';
import type { Participant } from '../types';
import { calculateDifficulty } from '../services/difficultyCalculator';
import { D20Icon } from './icons';

interface EncounterDifficultyProps {
  participants: Participant[];
}

export const EncounterDifficulty: React.FC<EncounterDifficultyProps> = ({ participants }) => {
  const difficultyInfo = useMemo(() => calculateDifficulty(participants), [participants]);

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'Trivial': return 'bg-gray-600 text-gray-200';
      case 'Easy': return 'bg-green-700 text-green-100';
      case 'Medium': return 'bg-blue-700 text-blue-100';
      case 'Hard': return 'bg-yellow-600 text-yellow-100';
      case 'Deadly': return 'bg-red-700 text-red-100';
      default: return 'bg-gray-700';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <h3 className="text-2xl font-medieval text-yellow-400 mb-4">Encounter Difficulty</h3>
      {!difficultyInfo ? (
        <div className="text-center py-4 text-gray-500">
          <p>Add players with levels and creatures with CR to calculate difficulty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-900/50 rounded-lg">
            <div className="flex-grow text-center sm:text-left">
                <p className="text-sm text-gray-400">Calculated Difficulty</p>
                <p className={`text-3xl font-bold ${getDifficultyClass(difficultyInfo.difficulty).replace('bg-', 'text-').split(' ')[0]}`}>
                    {difficultyInfo.difficulty}
                </p>
            </div>
             <div className="text-center sm:text-right">
                <p className="text-sm text-gray-400">Adjusted XP</p>
                <p className="text-3xl font-bold text-white">{difficultyInfo.adjustedXp.toLocaleString()}</p>
             </div>
          </div>

          <div className="text-sm text-gray-400">
            <p className="text-center mb-2">Party Thresholds for {difficultyInfo.playerCount} player(s):</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                <div className="bg-green-900/50 p-2 rounded">
                    <p className="font-bold text-green-300">Easy</p>
                    <p className="text-white">{difficultyInfo.partyThresholds.easy.toLocaleString()} XP</p>
                </div>
                 <div className="bg-blue-900/50 p-2 rounded">
                    <p className="font-bold text-blue-300">Medium</p>
                    <p className="text-white">{difficultyInfo.partyThresholds.medium.toLocaleString()} XP</p>
                </div>
                 <div className="bg-yellow-900/50 p-2 rounded">
                    <p className="font-bold text-yellow-300">Hard</p>
                    <p className="text-white">{difficultyInfo.partyThresholds.hard.toLocaleString()} XP</p>
                </div>
                 <div className="bg-red-900/50 p-2 rounded">
                    <p className="font-bold text-red-300">Deadly</p>
                    <p className="text-white">{difficultyInfo.partyThresholds.deadly.toLocaleString()} XP</p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};