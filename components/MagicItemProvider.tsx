import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import type { MagicItemSummary } from '../types';

interface MagicItemContextType {
    allMagicItems: MagicItemSummary[];
    isLoading: boolean;
    loadingProgress: string;
}

const MagicItemContext = createContext<MagicItemContextType>({
    allMagicItems: [],
    isLoading: true,
    loadingProgress: '',
});

export const useMagicItems = () => useContext(MagicItemContext);

export const MagicItemProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [allMagicItems, setAllMagicItems] = useState<MagicItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState('');

    useEffect(() => {
        const loadMagicItems = async () => {
            const cacheKey = 'dnd_magic_items_cache_v1';
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    setAllMagicItems(JSON.parse(cached));
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                console.error("Failed to read magic items from cache", error);
                localStorage.removeItem(cacheKey);
            }
            
            setIsLoading(true);
            setLoadingProgress('Initializing magic item compendium...');
            try {
                const listRes = await fetch('https://www.dnd5eapi.co/api/magic-items');
                const listData = await listRes.json();
                const itemList: { index: string, name: string, url: string }[] = listData.results;

                const details: MagicItemSummary[] = [];
                for (let i = 0; i < itemList.length; i++) {
                    setLoadingProgress(`Loading ${itemList[i].name} (${i + 1}/${itemList.length})`);
                    try {
                        const detailRes = await fetch(`https://www.dnd5eapi.co${itemList[i].url}`);
                        const data = await detailRes.json();
                        
                        const descriptionText = (data.desc || []).join(' ').toLowerCase();
                        const needsAttunement = data.requires_attunement === true || descriptionText.includes('attunement');

                        details.push({
                            index: data.index,
                            name: data.name,
                            url: itemList[i].url,
                            rarity: data.rarity,
                            equipment_category: data.equipment_category,
                            requires_attunement: needsAttunement ? 'attuned' : '',
                            desc: data.desc,
                        });
                    } catch (e) { console.error(`Failed to fetch ${itemList[i].name}`, e); }
                }

                setAllMagicItems(details);
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(details));
                } catch (error) {
                    console.error("Failed to write magic items to cache", error);
                }
            } catch (error) {
                console.error("Failed to load magic item list", error);
                setLoadingProgress('Error loading magic item data.');
            } finally {
                setIsLoading(false);
                setLoadingProgress('');
            }
        };

        loadMagicItems();
    }, []);

    const value = { allMagicItems, isLoading, loadingProgress };

    return (
        <MagicItemContext.Provider value={value}>
            {children}
        </MagicItemContext.Provider>
    );
};