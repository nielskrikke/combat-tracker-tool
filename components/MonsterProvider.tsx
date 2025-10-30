import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from 'react';
import type { MonsterSummary } from '../types';

interface MonsterContextType {
    allMonsters: MonsterSummary[];
    isLoading: boolean;
    loadingProgress: string;
}

const MonsterContext = createContext<MonsterContextType>({
    allMonsters: [],
    isLoading: true,
    loadingProgress: '',
});

export const useMonsters = () => useContext(MonsterContext);

export const MonsterProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [allMonsters, setAllMonsters] = useState<MonsterSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState('');

    useEffect(() => {
        const loadMonsters = async () => {
            const cacheKey = 'dnd_monsters_cache_v1';
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    setAllMonsters(JSON.parse(cached));
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                console.error("Failed to read from cache", error);
                localStorage.removeItem(cacheKey);
            }
            
            setIsLoading(true);
            setLoadingProgress('Initializing bestiary...');
            try {
                const listRes = await fetch('https://www.dnd5eapi.co/api/monsters');
                const listData = await listRes.json();
                const monsterList: { index: string, name: string, url: string }[] = listData.results;

                const details: MonsterSummary[] = [];
                for (let i = 0; i < monsterList.length; i++) {
                    setLoadingProgress(`Loading ${monsterList[i].name} (${i + 1}/${monsterList.length})`);
                    try {
                        const detailRes = await fetch(`https://www.dnd5eapi.co${monsterList[i].url}`);
                        const data = await detailRes.json();
                        details.push({
                            index: data.index,
                            name: data.name,
                            url: monsterList[i].url,
                            challenge_rating: data.challenge_rating,
                            type: data.type,
                            size: data.size,
                            alignment: data.alignment,
                            legendary_actions: data.legendary_actions,
                            hit_points: data.hit_points,
                            armor_class: data.armor_class,
                            dexterity: data.dexterity,
                            damage_vulnerabilities: data.damage_vulnerabilities || [],
                            damage_resistances: data.damage_resistances || [],
                            damage_immunities: data.damage_immunities || [],
                            condition_immunities: data.condition_immunities || [],
                            special_abilities: data.special_abilities || [],
                        });
                    } catch (e) { console.error(`Failed to fetch ${monsterList[i].name}`, e); }
                }

                setAllMonsters(details);
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(details));
                } catch (error) {
                    console.error("Failed to write to cache", error);
                }
            } catch (error) {
                console.error("Failed to load monster list", error);
                setLoadingProgress('Error loading monster data.');
            } finally {
                setIsLoading(false);
                setLoadingProgress(''); // Clear progress when done
            }
        };

        loadMonsters();
    }, []);

    const value = { allMonsters, isLoading, loadingProgress };

    return (
        <MonsterContext.Provider value={value}>
            {children}
        </MonsterContext.Provider>
    );
};
