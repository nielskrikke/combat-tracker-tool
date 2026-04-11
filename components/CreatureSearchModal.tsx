

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { MonsterSummary } from '../types';
import { CloseIcon, RefreshIcon } from './icons';
import { useMonsters } from './MonsterProvider';

interface CreatureSearchModalProps {
    onClose: () => void;
    onSelect: (monsterUrl: string) => void;
}

const SIZES = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
const CREATURE_TYPES = ["aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid", "monstrosity", "ooze", "plant", "undead"];
const ALIGNMENTS = ["lawful good", "neutral good", "chaotic good", "lawful neutral", "true neutral", "chaotic neutral", "lawful evil", "neutral evil", "chaotic evil", "unaligned", "any alignment"];
const CR_VALUES = ["0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];

const crToNumber = (cr: string): number => {
    if (cr.includes('/')) {
        const [num, den] = cr.split('/');
        return parseInt(num, 10) / parseInt(den, 10);
    }
    return parseInt(cr, 10);
};

const crToString = (cr: number): string => {
    if (cr === 0.125) return '1/8';
    if (cr === 0.25) return '1/4';
    if (cr === 0.5) return '1/2';
    return cr.toString();
};

const MultiSelectDropdown: React.FC<{ options: string[], selected: string[], onChange: (value: string) => void, placeholder: string }> = ({ options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);
    
    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => setIsOpen(prev => !prev)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-dnd-text text-left truncate font-sans text-xs focus:ring-2 focus:ring-dnd-gold/50 transition-all">
                {selected.length === 0 ? placeholder : `${selected.length} selected: ${selected.slice(0, 2).join(', ')}${selected.length > 2 ? '...' : ''}`}
            </button>
            {isOpen && (
                <div className="absolute z-20 w-full mt-2 bg-dnd-panel border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar p-2">
                    {options.map(option => (
                        <label key={option} className="flex items-center px-4 py-3 text-dnd-text hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                            <input type="checkbox" checked={selected.includes(option)} onChange={() => onChange(option)} className="h-5 w-5 rounded border-white/10 bg-black/40 text-dnd-gold focus:ring-dnd-gold/50 cursor-pointer" />
                            <span className="ml-4 font-sans group-hover:text-dnd-gold transition-colors capitalize">{option}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};


export const CreatureSearchModal: React.FC<CreatureSearchModalProps> = ({ onClose, onSelect }) => {
    const { allMonsters, isLoading, loadingProgress } = useMonsters();
    const [filteredMonsters, setFilteredMonsters] = useState<MonsterSummary[]>([]);
    
    const [filters, setFilters] = useState({
        minCr: '0',
        maxCr: '30',
        types: [] as string[],
        sizes: [] as string[],
        alignments: [] as string[],
        isLegendary: false,
    });

    const handleFilterChange = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleMultiSelectChange = (key: 'types' | 'sizes' | 'alignments', value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
        }));
    };
    
    const applyFilters = useCallback(() => {
        if (isLoading) return;

        const minCrNum = crToNumber(filters.minCr);
        const maxCrNum = crToNumber(filters.maxCr);

        const result = allMonsters.filter(m => {
            if (m.challenge_rating < minCrNum || m.challenge_rating > maxCrNum) return false;
            if (filters.isLegendary && (!m.legendary_actions || m.legendary_actions.length === 0)) return false;
            if (filters.sizes.length > 0 && !filters.sizes.includes(m.size)) return false;
            if (filters.types.length > 0 && !filters.types.includes(m.type)) return false;
            if (filters.alignments.length > 0 && !filters.alignments.includes(m.alignment)) return false;
            return true;
        });
        setFilteredMonsters(result.sort((a,b) => a.challenge_rating - b.challenge_rating || a.name.localeCompare(b.name)));
    }, [filters, allMonsters, isLoading]);

    useEffect(() => {
        applyFilters();
    }, [allMonsters, applyFilters]);

    const resetFilters = () => {
        setFilters({
            minCr: '0', maxCr: '30', types: [], sizes: [], alignments: [], isLegendary: false
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dnd-panel rounded-2xl shadow-2xl border border-white/10 w-full max-w-5xl h-[90vh] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dnd-gold to-transparent opacity-50"></div>
                <header className="flex justify-between items-center px-8 py-6 border-b border-white/5">
                    <h2 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em]">Creature Compendium</h2>
                    <button onClick={onClose} className="p-2 text-dnd-text/40 hover:text-dnd-gold rounded-full hover:bg-white/5 transition-all" aria-label="Close modal">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow flex overflow-hidden">
                    {/* Filters Pane */}
                    <aside className="w-1/3 xl:w-1/4 p-8 border-r border-white/5 overflow-y-auto space-y-8 custom-scrollbar">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 ml-1">Filters</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-2 ml-1">Challenge Rating</label>
                                <div className="flex items-center gap-3">
                                    <select value={filters.minCr} onChange={e => handleFilterChange('minCr', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-2 py-2 text-dnd-text font-mono text-center text-xs focus:ring-2 focus:ring-dnd-gold/50 transition-all">
                                        {CR_VALUES.map(cr => <option key={`min-${cr}`} value={cr} className="bg-dnd-panel">{cr}</option>)}
                                    </select>
                                    <span className="text-dnd-text/20 font-black uppercase tracking-widest text-[10px]">to</span>
                                     <select value={filters.maxCr} onChange={e => handleFilterChange('maxCr', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-2 py-2 text-dnd-text font-mono text-center text-xs focus:ring-2 focus:ring-dnd-gold/50 transition-all">
                                        {CR_VALUES.map(cr => <option key={`max-${cr}`} value={cr} className="bg-dnd-panel">{cr}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-2 ml-1">Type</label>
                                <MultiSelectDropdown options={CREATURE_TYPES} selected={filters.types} onChange={(v) => handleMultiSelectChange('types', v)} placeholder="Any Type" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-2 ml-1">Size</label>
                                <MultiSelectDropdown options={SIZES} selected={filters.sizes} onChange={(v) => handleMultiSelectChange('sizes', v)} placeholder="Any Size" />
                            </div>
                             <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-2 ml-1">Alignment</label>
                                <MultiSelectDropdown options={ALIGNMENTS} selected={filters.alignments} onChange={(v) => handleMultiSelectChange('alignments', v)} placeholder="Any Alignment" />
                            </div>
                            <label className="flex items-center cursor-pointer group">
                                <input type="checkbox" checked={filters.isLegendary} onChange={e => handleFilterChange('isLegendary', e.target.checked)} className="h-6 w-6 rounded border-white/10 bg-black/40 text-dnd-gold focus:ring-dnd-gold/50 cursor-pointer"/>
                                <span className="ml-3 text-[10px] font-sans text-dnd-text/60 group-hover:text-dnd-gold transition-colors">Is Legendary</span>
                            </label>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <button onClick={applyFilters} className="w-full bg-dnd-gold hover:bg-dnd-gold/80 text-black font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl transition-all shadow-lg">Apply Filters</button>
                            <button onClick={resetFilters} className="w-full bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-text font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2"><RefreshIcon className="w-4 h-4"/>Reset</button>
                        </div>
                    </aside>

                    {/* Results Pane */}
                    <main className="flex-grow p-8 overflow-y-auto custom-scrollbar bg-black/20">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <svg className="animate-spin h-12 w-12 text-dnd-gold mb-6" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-2xl font-sans font-black text-dnd-gold tracking-tight">Summoning the bestiary...</p>
                                <p className="text-xs font-black uppercase tracking-widest text-dnd-text/40 mt-4">{loadingProgress || "This may take a minute on the first load."}</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/30 mb-6 ml-1">{filteredMonsters.length} of {allMonsters.length} creatures shown</p>
                                {filteredMonsters.length > 0 ? (
                                <ul className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {filteredMonsters.map(m => (
                                        <li key={m.index}>
                                            <button onClick={() => onSelect(m.url)} className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-dnd-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-sans text-sm font-black text-dnd-text group-hover:text-dnd-gold transition-colors leading-tight">{m.name}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40 bg-black/40 px-2 py-1 rounded border border-white/5">CR {crToString(m.challenge_rating)}</p>
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40 capitalize">{m.size} {m.type}</p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-20">
                                        <p className="text-2xl font-sans italic text-dnd-text">No creatures match your criteria.</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-dnd-text/60 mt-4">Try adjusting your filters.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};
