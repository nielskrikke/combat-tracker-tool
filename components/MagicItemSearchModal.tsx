

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { MagicItemSummary } from '../types';
import { CloseIcon, RefreshIcon } from './icons';
import { useMagicItems } from './MagicItemProvider';

interface MagicItemSearchModalProps {
    onClose: () => void;
    onSelect: (itemUrl: string) => void;
}

const ITEM_TYPES = ["Wand", "Armor", "Potion", "Ring", "Rod", "Scroll", "Staff", "Wondrous Item", "Weapon"];
const RARITIES = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"];


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
                            <span className="ml-4 font-sans group-hover:text-dnd-gold transition-colors">{option}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};


export const MagicItemSearchModal: React.FC<MagicItemSearchModalProps> = ({ onClose, onSelect }) => {
    const { allMagicItems, isLoading, loadingProgress } = useMagicItems();
    const [filteredItems, setFilteredItems] = useState<MagicItemSummary[]>([]);
    
    const [filters, setFilters] = useState({
        keyword: '',
        types: [] as string[],
        rarities: [] as string[],
        requiresAttunement: false,
    });

    const handleFilterChange = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleMultiSelectChange = (key: 'types' | 'rarities', value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
        }));
    };
    
    const applyFilters = useCallback(() => {
        if (isLoading) return;

        const lowerCaseKeyword = filters.keyword.toLowerCase();

        const result = allMagicItems.filter(item => {
            if (filters.requiresAttunement && item.requires_attunement !== 'attuned') return false;
            if (filters.types.length > 0 && !filters.types.includes(item.equipment_category.name)) return false;
            if (filters.rarities.length > 0 && !filters.rarities.includes(item.rarity.name)) return false;
            if (lowerCaseKeyword) {
                const description = item.desc.join(' ').toLowerCase();
                const name = item.name.toLowerCase();
                if (!description.includes(lowerCaseKeyword) && !name.includes(lowerCaseKeyword)) {
                    return false;
                }
            }
            return true;
        });
        setFilteredItems(result.sort((a,b) => a.name.localeCompare(b.name)));
    }, [filters, allMagicItems, isLoading]);

    useEffect(() => {
        applyFilters();
    }, [allMagicItems, applyFilters]);

    const resetFilters = () => {
        setFilters({
            keyword: '', types: [], rarities: [], requiresAttunement: false
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dnd-panel rounded-2xl shadow-2xl border border-white/10 w-full max-w-5xl h-[90vh] flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dnd-gold to-transparent opacity-50"></div>
                <header className="flex justify-between items-center px-8 py-6 border-b border-white/5">
                    <h2 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em]">Magic Item Compendium</h2>
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
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-2 ml-1">Keyword Search</label>
                                <input
                                    type="text"
                                    placeholder="e.g. fire, healing..."
                                    value={filters.keyword}
                                    onChange={e => handleFilterChange('keyword', e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 transition-all font-sans text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-2 ml-1">Rarity</label>
                                <MultiSelectDropdown options={RARITIES} selected={filters.rarities} onChange={(v) => handleMultiSelectChange('rarities', v)} placeholder="Any Rarity" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-2 ml-1">Type</label>
                                <MultiSelectDropdown options={ITEM_TYPES} selected={filters.types} onChange={(v) => handleMultiSelectChange('types', v)} placeholder="Any Type" />
                            </div>
                            <label className="flex items-center cursor-pointer group">
                                <input type="checkbox" checked={filters.requiresAttunement} onChange={e => handleFilterChange('requiresAttunement', e.target.checked)} className="h-6 w-6 rounded border-white/10 bg-black/40 text-dnd-gold focus:ring-dnd-gold/50 cursor-pointer"/>
                                <span className="ml-3 text-[10px] font-sans text-dnd-text/60 group-hover:text-dnd-gold transition-colors">Requires Attunement</span>
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
                                <p className="text-2xl font-sans font-black text-dnd-gold tracking-tight">Unpacking the bag of holding...</p>
                                <p className="text-xs font-black uppercase tracking-widest text-dnd-text/40 mt-4">{loadingProgress || "This may take a minute on the first load."}</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/30 mb-6 ml-1">{filteredItems.length} of {allMagicItems.length} items shown</p>
                                {filteredItems.length > 0 ? (
                                <ul className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {filteredItems.map(item => (
                                        <li key={item.index}>
                                            <button onClick={() => onSelect(item.url)} className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-dnd-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-sans text-sm font-black text-dnd-text group-hover:text-dnd-gold transition-colors leading-tight">{item.name}</p>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-black/40 border border-white/5 ${
                                                        {
                                                            "Uncommon": "text-emerald-400 border-emerald-400/20",
                                                            "Rare": "text-sky-400 border-sky-400/20",
                                                            "Very Rare": "text-violet-400 border-violet-400/20",
                                                            "Legendary": "text-dnd-gold border-dnd-gold/20",
                                                            "Artifact": "text-dnd-red border-dnd-red/20",
                                                            "Common": "text-dnd-text/40 border-white/5",
                                                        }[item.rarity.name] || 'text-dnd-text/40'
                                                    }`}>{item.rarity.name}</p>
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40">{item.equipment_category.name}</p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-20">
                                        <p className="text-2xl font-sans italic text-dnd-text">No items match your criteria.</p>
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
