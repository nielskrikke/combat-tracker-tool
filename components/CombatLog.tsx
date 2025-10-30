import React from 'react';
import type { LogEntry } from '../types';

interface CombatLogProps {
    entries: LogEntry[];
}

const getEntryStyle = (type: LogEntry['type']) => {
    switch (type) {
        case 'damage': return 'text-red-400';
        case 'death': return 'text-red-500 font-bold uppercase';
        case 'healing': return 'text-green-400';
        case 'condition_add': return 'text-purple-400';
        case 'condition_remove': return 'text-purple-300 italic';
        case 'turn_start': return 'text-yellow-400 font-semibold';
        case 'info':
        default:
            return 'text-gray-400 italic';
    }
};

export const CombatLog: React.FC<CombatLogProps> = ({ entries }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-2xl font-medieval text-yellow-400 mb-4">Combat Log</h3>
            <div className="h-72 bg-gray-900/50 rounded-md p-4 overflow-y-auto pr-2 space-y-2 text-sm font-mono">
                {entries.length === 0 ? (
                    <p className="text-gray-500 italic text-center pt-8">The log is empty. Start combat to begin recording actions.</p>
                ) : (
                    entries.map(entry => (
                        <div key={entry.id} className="flex gap-4 items-baseline">
                            <div className="text-gray-500 w-28 text-right flex-shrink-0">
                                {entry.round > 0 ? `R${entry.round} | ${entry.actorName}` : entry.actorName}
                            </div>
                            <div className={`flex-grow ${getEntryStyle(entry.type)}`}>
                                {entry.message}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
