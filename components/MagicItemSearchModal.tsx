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
            <button type="button" onClick={() => setIsOpen(prev => !prev)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-left truncate">
                {selected.length === 0 ? placeholder : `${selected.length} selected: ${selected.slice(0, 2).join(', ')}${selected.length > 2 ? '...' : ''}`}
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-600 border border-gray-500 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <label key={option} className="flex items-center px-4 py-2 text-white hover:bg-purple-700 cursor-pointer capitalize">
                            <input type="checkbox" checked={selected.includes(option)} onChange={() => onChange(option)} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <span className="ml-3">{option}</span>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-medieval text-yellow-400">Magic Item Compendium</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition" aria-label="Close modal">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow flex overflow-hidden">
                    {/* Filters Pane */}
                    <aside className="w-1/3 xl:w-1/4 p-4 border-r border-gray-700 overflow-y-auto space-y-4">
                        <h3 className="text-lg font-bold text-gray-200">Filters</h3>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Keyword Search</label>
                            <input
                                type="text"
                                placeholder="e.g. fire, healing..."
                                value={filters.keyword}
                                onChange={e => handleFilterChange('keyword', e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Rarity</label>
                            <MultiSelectDropdown options={RARITIES} selected={filters.rarities} onChange={(v) => handleMultiSelectChange('rarities', v)} placeholder="Any Rarity" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                            <MultiSelectDropdown options={ITEM_TYPES} selected={filters.types} onChange={(v) => handleMultiSelectChange('types', v)} placeholder="Any Type" />
                        </div>
                        <label className="flex items-center text-white select-none">
                            <input type="checkbox" checked={filters.requiresAttunement} onChange={e => handleFilterChange('requiresAttunement', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"/>
                            <span className="ml-2">Requires Attunement</span>
                        </label>

                        <div className="pt-2 flex flex-col gap-2">
                            <button onClick={applyFilters} className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-md transition">Apply Filters</button>
                            <button onClick={resetFilters} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition flex items-center justify-center gap-2"><RefreshIcon className="w-4 h-4"/>Reset</button>
                        </div>
                    </aside>

                    {/* Results Pane */}
                    <main className="flex-grow p-4 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                <svg className="animate-spin h-10 w-10 text-white mb-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-lg">Unpacking the bag of holding...</p>
                                <p className="text-sm mt-2">{loadingProgress || "This may take a minute on the first load."}</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-400 text-sm mb-2">{filteredItems.length} of {allMagicItems.length} items shown</p>
                                {filteredItems.length > 0 ? (
                                <ul className="space-y-2">
                                    {filteredItems.map(item => (
                                        <li key={item.index}>
                                            <button onClick={() => onSelect(item.url)} className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-md transition group">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-white group-hover:text-yellow-400 transition">{item.name}</p>
                                                    <p className={`text-sm font-semibold ${
                                                        {
                                                            "Uncommon": "text-green-400",
                                                            "Rare": "text-blue-400",
                                                            "Very Rare": "text-purple-400",
                                                            "Legendary": "text-orange-400",
                                                            "Artifact": "text-red-500",
                                                            "Common": "text-gray-300",
                                                        }[item.rarity.name] || 'text-gray-300'
                                                    }`}>{item.rarity.name}</p>
                                                </div>
                                                <p className="text-xs text-gray-400 capitalize">{item.equipment_category.name}</p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <p className="text-lg">No items match your criteria.</p>
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