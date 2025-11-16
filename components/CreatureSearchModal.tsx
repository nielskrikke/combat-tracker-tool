

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
            <button type="button" onClick={() => setIsOpen(prev => !prev)} className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white text-left truncate">
                {selected.length === 0 ? placeholder : `${selected.length} selected: ${selected.slice(0, 2).join(', ')}${selected.length > 2 ? '...' : ''}`}
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-stone-600 border border-stone-500 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <label key={option} className="flex items-center px-4 py-2 text-white hover:bg-amber-700 cursor-pointer capitalize">
                            <input type="checkbox" checked={selected.includes(option)} onChange={() => onChange(option)} className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
                            <span className="ml-3">{option}</span>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-stone-800 rounded-lg shadow-xl border border-stone-700 w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-stone-700">
                    <h2 className="text-2xl font-medieval text-white">Creature Compendium</h2>
                    <button onClick={onClose} className="p-1 text-stone-400 hover:text-white rounded-full hover:bg-stone-700 transition" aria-label="Close modal">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow flex overflow-hidden">
                    {/* Filters Pane */}
                    <aside className="w-1/3 xl:w-1/4 p-4 border-r border-stone-700 overflow-y-auto space-y-4">
                        <h3 className="text-lg font-bold text-stone-200">Filters</h3>
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">Challenge Rating</label>
                            <div className="flex items-center gap-2">
                                <select value={filters.minCr} onChange={e => handleFilterChange('minCr', e.target.value)} className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-2 py-2 text-white">
                                    {CR_VALUES.map(cr => <option key={`min-${cr}`} value={cr}>{cr}</option>)}
                                </select>
                                <span className="text-stone-400">to</span>
                                 <select value={filters.maxCr} onChange={e => handleFilterChange('maxCr', e.target.value)} className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-2 py-2 text-white">
                                    {CR_VALUES.map(cr => <option key={`max-${cr}`} value={cr}>{cr}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">Type</label>
                            <MultiSelectDropdown options={CREATURE_TYPES} selected={filters.types} onChange={(v) => handleMultiSelectChange('types', v)} placeholder="Any Type" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">Size</label>
                            <MultiSelectDropdown options={SIZES} selected={filters.sizes} onChange={(v) => handleMultiSelectChange('sizes', v)} placeholder="Any Size" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">Alignment</label>
                            <MultiSelectDropdown options={ALIGNMENTS} selected={filters.alignments} onChange={(v) => handleMultiSelectChange('alignments', v)} placeholder="Any Alignment" />
                        </div>
                        <label className="flex items-center text-white select-none">
                            <input type="checkbox" checked={filters.isLegendary} onChange={e => handleFilterChange('isLegendary', e.target.checked)} className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"/>
                            <span className="ml-2">Is Legendary</span>
                        </label>

                        <div className="pt-2 flex flex-col gap-2">
                            <button onClick={applyFilters} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-md transition">Apply Filters</button>
                            <button onClick={resetFilters} className="w-full bg-stone-700 hover:bg-stone-600 text-white font-bold py-2 px-4 rounded-md transition flex items-center justify-center gap-2"><RefreshIcon className="w-4 h-4"/>Reset</button>
                        </div>
                    </aside>

                    {/* Results Pane */}
                    <main className="flex-grow p-4 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-stone-400">
                                <svg className="animate-spin h-10 w-10 text-white mb-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-lg">Summoning the bestiary...</p>
                                <p className="text-sm mt-2">{loadingProgress || "This may take a minute on the first load."}</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-stone-400 text-sm mb-2">{filteredMonsters.length} of {allMonsters.length} creatures shown</p>
                                {filteredMonsters.length > 0 ? (
                                <ul className="space-y-2">
                                    {filteredMonsters.map(m => (
                                        <li key={m.index}>
                                            <button onClick={() => onSelect(m.url)} className="w-full text-left p-3 bg-stone-900/50 hover:bg-stone-700/80 rounded-md transition group">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-white group-hover:text-amber-400 transition">{m.name}</p>
                                                    <p className="text-sm text-stone-300">CR {crToString(m.challenge_rating)}</p>
                                                </div>
                                                <p className="text-xs text-stone-400 capitalize">{m.size} {m.type}</p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                ) : (
                                    <div className="text-center py-10 text-stone-500">
                                        <p className="text-lg">No creatures match your criteria.</p>
                                        <p className="mt-2">Try adjusting your filters.</p>
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
