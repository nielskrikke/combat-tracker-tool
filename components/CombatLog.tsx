
import React from 'react';
import type { LogEntry } from '../types';

interface CombatLogProps {
    entries: LogEntry[];
}

const getEntryStyle = (type: LogEntry['type']) => {
    switch (type) {
        case 'damage': return 'text-red-400';
        case 'death': return 'text-red-500 font-bold uppercase';
        case 'healing': return 'text-emerald-400';
        case 'condition_add': return 'text-violet-400';
        case 'condition_remove': return 'text-violet-300 italic';
        case 'turn_start': return 'text-dnd-gold font-semibold';
        case 'info':
        default:
            return 'text-dnd-text/40 italic';
    }
};

export const CombatLog: React.FC<CombatLogProps> = ({ entries }) => {
    return (
        <div className="bg-dnd-panel/80 backdrop-blur-md rounded-xl shadow-xl p-4 border border-white/5">
            <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em] mb-4">Combat Log</h3>
            <div className="h-64 bg-black/20 rounded-lg p-3 overflow-y-auto pr-2 space-y-1.5 text-[10px] font-mono leading-relaxed">
                {entries.length === 0 ? (
                    <p className="text-dnd-text/20 italic text-center pt-12 font-sans">The log is empty. Start combat to begin recording actions.</p>
                ) : (
                    entries.map(entry => (
                        <div key={entry.id} className="flex gap-4 items-baseline border-b border-white/5 pb-2 last:border-0">
                            <div className="text-dnd-text/30 w-32 text-right flex-shrink-0 font-black uppercase tracking-tighter">
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
