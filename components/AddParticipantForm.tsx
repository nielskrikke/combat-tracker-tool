
import React, { useState, useEffect, useMemo } from 'react';
import type { Participant, InventoryItem } from '../types';
import { PlusCircleIcon, RefreshIcon, TrashIcon, PlusIcon, LinkIcon, FilterIcon, PencilSquareIcon, SquaresPlusIcon } from './icons';
import { CreatureSearchModal } from './CreatureSearchModal';
import { MagicItemSearchModal } from './MagicItemSearchModal';
import { DescriptionEditorModal } from './DescriptionEditorModal';
import { useMonsters } from './MonsterProvider';
import { useMagicItems } from './MagicItemProvider';

interface AddParticipantFormProps {
  onAdd: (participant: Omit<Participant, 'id'> | Omit<Participant, 'id'>[]) => void;
}

interface ItemIndex {
    index: string;
    name: string;
    url: string;
}

const getRandomColor = () => {
  const colors = [
    'border-red-500 bg-red-900/20',
    'border-orange-500 bg-orange-900/20',
    'border-amber-500 bg-amber-900/20',
    'border-yellow-500 bg-yellow-900/20',
    'border-lime-500 bg-lime-900/20',
    'border-green-500 bg-green-900/20',
    'border-emerald-500 bg-emerald-900/20',
    'border-teal-500 bg-teal-900/20',
    'border-cyan-500 bg-cyan-900/20',
    'border-sky-500 bg-sky-900/20',
    'border-blue-500 bg-blue-900/20',
    'border-indigo-500 bg-indigo-900/20',
    'border-violet-500 bg-violet-900/20',
    'border-purple-500 bg-purple-900/20',
    'border-fuchsia-500 bg-fuchsia-900/20',
    'border-pink-500 bg-pink-900/20',
    'border-rose-500 bg-rose-900/20',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};


export const AddParticipantForm: React.FC<AddParticipantFormProps> = ({ onAdd }) => {
  const [combatantType, setCombatantType] = useState<'player' | 'creature' | 'dmpc'>('player');
  const [name, setName] = useState('');
  const [initiative, setInitiative] = useState('');
  const [level, setLevel] = useState('');
  const [hp, setHp] = useState('');
  const [ac, setAc] = useState('');
  const [dexterityModifier, setDexterityModifier] = useState('');
  const [cr, setCr] = useState('');
  const [statblockUrl, setStatblockUrl] = useState<string>('');
  const [characterSheetUrl, setCharacterSheetUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [dexApiUrl, setDexApiUrl] = useState<string>('');
  
  const [damageVulnerabilities, setDamageVulnerabilities] = useState<string[]>([]);
  const [damageResistances, setDamageResistances] = useState<string[]>([]);
  const [damageImmunities, setDamageImmunities] = useState<string[]>([]);
  const [conditionImmunities, setConditionImmunities] = useState<string[]>([]);

  const [hasLegendaryResistances, setHasLegendaryResistances] = useState(false);
  const [legendaryResistances, setLegendaryResistances] = useState(3);
  const [hasLegendaryActions, setHasLegendaryActions] = useState(false);
  const [legendaryActions, setLegendaryActions] = useState(3);
  
  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('1');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [isEditingItemDescription, setIsEditingItemDescription] = useState(false);
  const [isUrlInputVisible, setIsUrlInputVisible] = useState(false);
  const [inventoryMode, setInventoryMode] = useState<'magic' | 'custom'>('magic');
  const [magicItemSearchQuery, setMagicItemSearchQuery] = useState('');
  const { allMagicItems } = useMagicItems();
  const [magicItemSearchResults, setMagicItemSearchResults] = useState<ItemIndex[]>([]);
  const [isMagicItemListFocused, setIsMagicItemListFocused] = useState(false);
  const [isMagicItemSearchModalOpen, setIsMagicItemSearchModalOpen] = useState(false);


  const [searchQuery, setSearchQuery] = useState('');
  const { allMonsters: allMonstersFromContext } = useMonsters();
  const [searchResults, setSearchResults] = useState<ItemIndex[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListFocused, setIsListFocused] = useState(false);
  const [isFetchingCharacterSheet, setIsFetchingCharacterSheet] = useState(false);
  const [isFetchingStatblock, setIsFetchingStatblock] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Add Multiple State
  const [isAddMultipleModalOpen, setIsAddMultipleModalOpen] = useState(false);
  const [multipleCount, setMultipleCount] = useState('2');
  const [isInitiativeGroup, setIsInitiativeGroup] = useState(false);
  const [isSharedHealth, setIsSharedHealth] = useState(false);

  const allMonstersForSearch = useMemo(() => {
    return allMonstersFromContext.map(m => ({ index: m.index, name: m.name, url: m.url }));
  }, [allMonstersFromContext]);
  
  const allMagicItemsForSearch = useMemo(() => {
    return allMagicItems.map(item => ({ index: item.index, name: item.name, url: item.url }));
  }, [allMagicItems]);

  useEffect(() => {
    if (searchQuery.length > 1 && (combatantType === 'creature' || combatantType === 'dmpc')) {
      const filtered = allMonstersForSearch.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 8)); // Limit results for performance
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allMonstersForSearch, combatantType]);

  useEffect(() => {
    if (magicItemSearchQuery.length > 1) {
        const filtered = allMagicItemsForSearch.filter(item =>
            item.name.toLowerCase().includes(magicItemSearchQuery.toLowerCase())
        );
        setMagicItemSearchResults(filtered.slice(0, 8)); // Limit results
    } else {
        setMagicItemSearchResults([]);
    }
  }, [magicItemSearchQuery, allMagicItemsForSearch]);

  const handleFetchCharacterSheet = async () => {
    if (!characterSheetUrl) {
        alert("Please enter a URL.");
        return;
    }
    const match = characterSheetUrl.match(/dndbeyond\.com\/characters\/(\d+)/);
    if (!match) {
        alert("Please enter a valid D&D Beyond character sheet URL.");
        return;
    }
    const characterId = match[1];

    setIsFetchingCharacterSheet(true);
    try {
        const apiUrl = `https://character-service.dndbeyond.com/character/v5/character/${characterId}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch character data from D&D Beyond API.');
        }
        const characterData = await response.json();

        if (!characterData.success || !characterData.data) {
            throw new Error('Invalid data received from D&D Beyond API.');
        }
        
        const data = characterData.data;

        const charName = data.name;
        
        let acValue: number | undefined = undefined;
        if (typeof data.armorClass === 'number') {
            acValue = data.armorClass;
        } else {
            const acStat = data.stats.find((s: any) => s.id === 7);
            if (acStat && typeof acStat.value === 'number') {
                acValue = acStat.value;
            }
        }

        let totalHp = 0;
        if (data.overrideHitPoints) {
            totalHp = data.overrideHitPoints;
        } else {
            totalHp = data.baseHitPoints || 0;
        }
        totalHp += data.bonusHitPoints || 0;
        
        const conStat = data.stats.find((s: any) => s.id === 3);
        const conScore = (conStat?.value || 10) + (conStat?.bonus || 0);
        const conModifier = Math.floor((conScore - 10) / 2);
        
        const charLevel = data.classes.reduce((acc: number, currentClass: any) => acc + currentClass.level, 0);

        totalHp += conModifier * charLevel;
        
        const hpValue = Math.max(1, totalHp);
        
        const dexStat = data.stats.find((s: any) => s.id === 2);
        const dexScore = (dexStat?.value || 10) + (dexStat?.bonus || 0);
        const dexModifier = Math.floor((dexScore - 10) / 2);

        if (charName) setName(charName);
        if (acValue !== undefined) setAc(acValue.toString());
        if (hpValue) setHp(hpValue.toString());
        if (charLevel > 0) setLevel(charLevel.toString());
        setDexterityModifier(dexModifier.toString());

    } catch (error) {
        console.error("Error fetching or parsing D&D Beyond character sheet:", error);
        alert("Could not fetch character data. The API might be down, the character sheet is private, or the CORS proxy failed. Please enter the details manually.");
    } finally {
        setIsFetchingCharacterSheet(false);
    }
  };

  const handleFetchStatblock = async () => {
    if (!statblockUrl || (!statblockUrl.startsWith('http://') && !statblockUrl.startsWith('https://'))) {
        alert("Please enter a valid statblock URL.");
        return;
    }

    setIsFetchingStatblock(true);
    try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(statblockUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch from URL. Status: ${response.status}`);
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Use text content for robust parsing
        const text = doc.body.innerText;
        const extract = (regex: RegExp) => text.match(regex)?.[1]?.trim() ?? null;
        const extractList = (regex: RegExp) => extract(regex)?.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) ?? [];

        const parsedName = doc.querySelector('h1')?.textContent?.trim();
        if (parsedName) setName(parsedName);

        const parsedAc = extract(/Armor Class\s*(\d+)/i);
        if (parsedAc) setAc(parsedAc);

        const parsedHp = extract(/Hit Points\s*(\d+)/i);
        if (parsedHp) setHp(parsedHp);
        
        const parsedCr = extract(/Challenge\s*([\d/]+)/i);
        if (parsedCr) {
            setCr(parsedCr);
        }

        // --- Dexterity Parsing ---
        let dexMod: string | null = null;
        let match = text.match(/Dexterity\s+\d+\s*\(([+-]?\d+)\)/i);
        if (match && match[1]) {
            dexMod = match[1];
        }

        if (!dexMod) {
            const flatText = text.replace(/\s+/g, ' ');
            const headerMatch = flatText.match(/STR\s+DEX\s+CON\s+INT\s+WIS\s+CHA\s+/i);
            if (headerMatch && typeof headerMatch.index === 'number') {
                const textAfterHeader = flatText.substring(headerMatch.index + headerMatch[0].length);
                const values = textAfterHeader.match(/(\d+\s*\([+-]?\d+\))|(\d+)/g);
                if (values && values.length > 1) {
                    const dexValue = values[1]; // DEX is the second stat
                    const modMatch = dexValue.match(/[+-]\d+/);
                    if (modMatch) {
                        dexMod = modMatch[0];
                    } else if (!isNaN(parseInt(dexValue, 10))) {
                        const score = parseInt(dexValue, 10);
                        dexMod = String(Math.floor((score - 10) / 2));
                    }
                }
            }
        }

        if (dexMod) {
            setDexterityModifier(dexMod.replace('+', ''));
        }
        
        setDamageVulnerabilities(extractList(/Damage Vulnerabilities\s*([^\n\r;]+)/i));
        setDamageResistances(extractList(/Damage Resistances\s*([^\n\r;]+)/i));
        setDamageImmunities(extractList(/Damage Immunities\s*([^\n\r;]+)/i));
        setConditionImmunities(extractList(/Condition Immunities\s*([^\n\r;]+)/i));

        const lrMatch = text.match(/Legendary Resistance(?:s)?\s*\((\d+)\/Day\)/i);
        if (lrMatch && lrMatch[1]) {
            setHasLegendaryResistances(true);
            setLegendaryResistances(parseInt(lrMatch[1], 10));
        } else {
            setHasLegendaryResistances(false);
        }

        if (/Legendary Actions/i.test(text)) {
            setHasLegendaryActions(true);
            setLegendaryActions(3); // Default to 3, as it's not always specified
        } else {
            setHasLegendaryActions(false);
        }

    } catch (error) {
        console.error("Error fetching or parsing statblock:", error);
        alert("Could not fetch or parse statblock data. The URL might be incorrect, the site might be blocking requests, or the format is unsupported. Please enter details manually.");
    } finally {
        setIsFetchingStatblock(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setInitiative('');
    setLevel('');
    setHp('');
    setAc('');
    setDexterityModifier('');
    setCr('');
    setSearchQuery('');
    setSearchResults([]);
    setStatblockUrl('');
    setCharacterSheetUrl('');
    setDescription('');
    setIsEditingDescription(false);
    setDexApiUrl('');
    setDamageVulnerabilities([]);
    setDamageResistances([]);
    setDamageImmunities([]);
    setConditionImmunities([]);
    setHasLegendaryActions(false);
    setLegendaryActions(3);
    setHasLegendaryResistances(false);
    setLegendaryResistances(3);
    setInventory([]);
    setNewItemName('');
    setNewItemAmount('1');
    setNewItemUrl('');
    setNewItemDescription('');
    setIsUrlInputVisible(false);
    setInventoryMode('magic');
    setMagicItemSearchQuery('');
    
    // Multiple Reset
    setMultipleCount('2');
    setIsInitiativeGroup(false);
    setIsSharedHealth(false);
  };

  const handleSelectMonster = async (monsterUrl: string) => {
    setIsLoading(true);
    setSearchQuery('');
    setSearchResults([]);
    
    const monsterData = allMonstersFromContext.find(m => m.url === monsterUrl);

    if (!monsterData) {
        alert("Could not find monster data. It might still be loading in the background. Please try again in a moment.");
        setIsLoading(false);
        return;
    }

    try {
      setName(monsterData.name);
      setHp(monsterData.hit_points.toString());
      const acValue = monsterData.armor_class?.[0]?.value ?? 10;
      setAc(acValue.toString());
      setCr(monsterData.challenge_rating.toString());
      const dexMod = Math.floor((monsterData.dexterity - 10) / 2);
      setDexterityModifier(dexMod.toString());
      setDexApiUrl(monsterUrl);
      const slug = monsterData.name.toLowerCase().replace(/[\s/]/g, '-');
      setStatblockUrl(`https://www.aidedd.org/dnd/monstres.php?vo=${slug}`);
      
      setDamageVulnerabilities(monsterData.damage_vulnerabilities || []);
      setDamageResistances(monsterData.damage_resistances || []);
      setDamageImmunities(monsterData.damage_immunities || []);
      setConditionImmunities((monsterData.condition_immunities || []).map((ci) => ci.name));

      const lrAbility = monsterData.special_abilities?.find((a) => 
        a.name.startsWith('Legendary Resistance')
      );
      if (lrAbility) {
        const match = lrAbility.name.match(/\((\d+)\/Day\)/);
        setHasLegendaryResistances(true);
        setLegendaryResistances(match ? parseInt(match[1], 10) : 3);
      } else {
        setHasLegendaryResistances(false);
        setLegendaryResistances(3);
      }

      if (monsterData.legendary_actions && monsterData.legendary_actions.length > 0) {
        setHasLegendaryActions(true);
        setLegendaryActions(3);
      } else {
        setHasLegendaryActions(false);
        setLegendaryActions(3);
      }

    } catch (error) {
      console.error("Failed to process monster details:", error);
      alert("An error occurred while processing monster details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromSearch = async (monsterUrl: string) => {
    await handleSelectMonster(monsterUrl);
    setIsSearchModalOpen(false);
  };

  const getCommonParticipantData = () => {
    const isCreature = combatantType === 'creature';
    const isPlayerOrDMPC = combatantType === 'player' || combatantType === 'dmpc';
    const hpValue = hp ? parseInt(hp, 10) : undefined;
    let crValue: number | undefined;
    if (cr) {
        try {
            // eslint-disable-next-line no-eval
            const evaluatedCr = eval(cr.toString());
            if (typeof evaluatedCr === 'number') {
                crValue = evaluatedCr;
            }
        } catch (err) {
            console.warn("Could not parse CR value:", cr);
        }
    }

    return {
        initiative: parseInt(initiative, 10),
        hp: hpValue,
        maxHp: hpValue,
        tempHp: 0,
        ac: parseInt(ac, 10),
        conditions: [],
        type: combatantType,
        level: isPlayerOrDMPC && level ? parseInt(level, 10) : undefined,
        cr: (isCreature || combatantType === 'dmpc') ? crValue : undefined,
        statblockUrl: isCreature || combatantType === 'dmpc' ? statblockUrl : undefined,
        characterSheetUrl: isPlayerOrDMPC ? characterSheetUrl : undefined,
        description: description || undefined,
        dexterityModifier: dexterityModifier ? parseInt(dexterityModifier, 10) : undefined,
        dexApiUrl: isCreature || combatantType === 'dmpc' ? dexApiUrl : undefined,
        damageVulnerabilities: (combatantType === 'creature' || combatantType === 'dmpc') ? damageVulnerabilities : [],
        damageResistances: (combatantType === 'creature' || combatantType === 'dmpc') ? damageResistances : [],
        damageImmunities: (combatantType === 'creature' || combatantType === 'dmpc') ? damageImmunities : [],
        conditionImmunities: (combatantType === 'creature' || combatantType === 'dmpc') ? conditionImmunities : [],
        legendaryResistances: (combatantType !== 'player' && hasLegendaryResistances) ? legendaryResistances : undefined,
        legendaryResistancesUsed: (combatantType !== 'player' && hasLegendaryResistances) ? 0 : undefined,
        legendaryActions: (combatantType !== 'player' && hasLegendaryActions) ? legendaryActions : undefined,
        legendaryActionsUsed: (combatantType !== 'player' && hasLegendaryActions) ? 0 : undefined,
        inventory: (combatantType === 'creature' || combatantType === 'dmpc') ? inventory : undefined,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !initiative || !ac) return; // Basic validation
    
    const baseData = getCommonParticipantData();
    onAdd({ ...baseData, name });
    resetForm();
  };

  const handleAddMultipleSubmit = () => {
      if (!name || !initiative || !ac) return;
      const count = parseInt(multipleCount, 10);
      if (count < 1) return;

      const baseData = getCommonParticipantData();
      
      // Shared Health Logic: Create ONE participant representing a mob
      // Only applicable if grouped
      if (isInitiativeGroup && isSharedHealth) {
         const hpVal = baseData.hp || 0;
         const totalHp = hpVal * count;
         const sharedName = `${name} (x${count})`;
         
         onAdd({
             ...baseData,
             name: sharedName,
             hp: totalHp,
             maxHp: totalHp,
             individualMaxHp: hpVal > 0 ? hpVal : undefined,
             group: {
                 id: `${Date.now()}-group`,
                 name: sharedName,
                 color: getRandomColor()
             }
         });
      } else {
         // Create N participants
         const groupId = isInitiativeGroup ? `${Date.now()}-group` : undefined;
         const groupColor = isInitiativeGroup ? getRandomColor() : undefined;
         const groupName = isInitiativeGroup ? `${name}s` : undefined;
         
         const listToAdd: Omit<Participant, 'id'>[] = [];
         
         for (let i = 0; i < count; i++) {
             listToAdd.push({
                 ...baseData,
                 name: `${name} ${i + 1}`,
                 // conditionally add group property only if isInitiativeGroup is true
                 ...(isInitiativeGroup ? {
                    group: {
                        id: groupId!,
                        name: groupName!,
                        color: groupColor!
                    }
                 } : {})
             });
         }
         
         onAdd(listToAdd);
      }
      
      setIsAddMultipleModalOpen(false);
      resetForm();
  };

  const handleAddItem = () => {
    if (newItemName.trim() !== '') {
        setInventory(prev => [...prev, { 
            name: newItemName.trim(), 
            amount: parseInt(newItemAmount, 10) || 1,
            url: newItemUrl.trim() || undefined,
            description: newItemDescription.trim() || undefined,
        }]);
        setNewItemName('');
        setNewItemUrl('');
        setNewItemAmount('1');
        setNewItemDescription('');
        setIsUrlInputVisible(false);
        setMagicItemSearchQuery('');
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
      setInventory(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleInventoryModeChange = (mode: 'magic' | 'custom') => {
    setInventoryMode(mode);
    setNewItemName('');
    setNewItemAmount('1');
    setNewItemUrl('');
    setNewItemDescription('');
    setIsUrlInputVisible(false);
    setMagicItemSearchQuery('');
  };

  const handleSelectMagicItem = (item: ItemIndex) => {
    setNewItemName(item.name);
    const slug = item.index;
    setNewItemUrl(`https://www.aidedd.org/dnd/om.php?vo=${slug}`);
    setMagicItemSearchQuery(item.name);
    setMagicItemSearchResults([]);
    setIsMagicItemListFocused(false);
  };
  
  const handleSelectMagicItemFromModal = (itemUrl: string) => {
    const itemData = allMagicItems.find(i => i.url === itemUrl);
    if (itemData) {
        handleSelectMagicItem(itemData);
    }
    setIsMagicItemSearchModalOpen(false);
  };

  const handleTypeChange = (type: 'player' | 'creature' | 'dmpc') => {
    resetForm();
    setCombatantType(type);
  }
  
  const isValid = name && initiative && ac && (combatantType !== 'player' || !!level) && (combatantType !== 'creature' || (!!hp && !!cr));
  const isBusy = isLoading || isFetchingCharacterSheet || isFetchingStatblock;

  return (
    <>
    <div className="bg-stone-800/50 rounded-lg shadow-lg p-6 border border-stone-700">
      <h3 className="text-2xl font-medieval text-white mb-4">Add Combatant</h3>
      
      {/* Type Toggle */}
      <div className="flex rounded-md shadow-sm mb-4" role="group">
        <button
          type="button"
          onClick={() => handleTypeChange('player')}
          className={`px-4 py-2 text-sm font-medium text-white rounded-l-lg flex items-center justify-center gap-2 w-1/3 transition-colors ${combatantType === 'player' ? 'bg-amber-700' : 'bg-stone-700 hover:bg-stone-600'}`}
        >
          <span role="img" aria-label="Player" className="text-lg">🧑</span>
          Player
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('dmpc')}
          className={`px-4 py-2 text-sm font-medium text-white flex items-center justify-center gap-2 w-1/3 transition-colors border-y-0 border-x border-stone-900/50 ${combatantType === 'dmpc' ? 'bg-amber-700' : 'bg-stone-700 hover:bg-stone-600'}`}
        >
          <span role="img" aria-label="DMPC" className="text-lg">🎭</span>
          DMPC
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('creature')}
          className={`px-4 py-2 text-sm font-medium text-white rounded-r-lg flex items-center justify-center gap-2 w-1/3 transition-colors ${combatantType === 'creature' ? 'bg-amber-700' : 'bg-stone-700 hover:bg-stone-600'}`}
        >
          <span role="img" aria-label="Creature" className="text-lg">🐲</span>
          Creature
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input for Creatures */}
        {(combatantType === 'creature' || combatantType === 'dmpc') && (
            <div className="relative" onBlur={() => setTimeout(() => setIsListFocused(false), 150)}>
                 <input
                    type="text"
                    placeholder="Search creatures..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsListFocused(true)}
                    className="w-full bg-stone-900/50 border border-stone-600 rounded-md pl-3 pr-20 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button
                        type="button"
                        onClick={() => setIsSearchModalOpen(true)}
                        className="p-1 text-stone-400 hover:text-white transition-colors"
                        title="Advanced Creature Search"
                        aria-label="Advanced Creature Search"
                    >
                        <FilterIcon className="w-5 h-5" />
                    </button>
                    <a 
                        href="https://www.aidedd.org/dnd-filters/monsters.php" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title="Open Monster Database in new tab"
                        aria-label="Open Monster Database in new tab"
                        className="p-1 text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        <LinkIcon className="w-5 h-5" />
                    </a>
                </div>
                {isListFocused && searchResults.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-stone-700 border border-stone-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((monster) => (
                        <li
                        key={monster.index}
                        onClick={() => handleSelectMonster(monster.url)}
                        className="px-4 py-2 text-white hover:bg-amber-700 cursor-pointer"
                        >
                        {monster.name}
                        </li>
                    ))}
                    </ul>
                )}
            </div>
        )}
        
        {/* Name Input */}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          required
          disabled={isBusy}
        />
        
         {/* D&D Beyond Import */}
         {(combatantType === 'player' || combatantType === 'dmpc') && (
            <div className="flex items-center gap-2">
                <input
                    type="url"
                    placeholder="D&D Beyond URL (Optional)"
                    value={characterSheetUrl}
                    onChange={(e) => setCharacterSheetUrl(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                />
                <button
                    type="button"
                    onClick={handleFetchCharacterSheet}
                    className="p-2 bg-stone-600 hover:bg-stone-500 text-white font-semibold rounded-md transition duration-300 ease-in-out disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    disabled={isFetchingCharacterSheet || !characterSheetUrl.includes('dndbeyond.com/characters/')}
                    title="Fetch Character Data"
                >
                    {isFetchingCharacterSheet ? (
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <RefreshIcon className="w-5 h-5"/>
                    )}
                </button>
            </div>
        )}
        
        {/* Core Stats */}
        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Init"
            value={initiative}
            onChange={(e) => setInitiative(e.target.value)}
            className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            required
          />
           <input
            type="number"
            placeholder="AC"
            value={ac}
            onChange={(e) => setAc(e.target.value)}
            className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            required
            disabled={isBusy}
          />
          <input
            type="number"
            placeholder="DEX Mod"
            value={dexterityModifier}
            onChange={(e) => setDexterityModifier(e.target.value)}
            className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            disabled={isBusy}
          />
        </div>
        
        {/* Type Specific Stats */}
        {combatantType === 'player' && (
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="number"
                    placeholder="Level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    required
                    disabled={isLoading || isFetchingCharacterSheet}
                />
                <input
                    type="number"
                    placeholder="HP (Optional)"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    disabled={isBusy}
                />
            </div>
        )}
        {combatantType === 'dmpc' && (
            <div className="grid grid-cols-3 gap-4">
                <input
                    type="number"
                    placeholder="Level (Optional)"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    disabled={isLoading || isFetchingCharacterSheet}
                />
                <input
                    type="number"
                    placeholder="HP (Optional)"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    disabled={isBusy}
                />
                 <input
                    type="text"
                    placeholder="CR (Optional)"
                    value={cr}
                    onChange={(e) => setCr(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    disabled={isLoading || isFetchingStatblock}
                />
            </div>
        )}
        {combatantType === 'creature' && (
             <div className="grid grid-cols-2 gap-4">
                <input
                    type="number"
                    placeholder="HP"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    required
                    disabled={isBusy}
                />
                <input
                    type="text"
                    placeholder="CR"
                    value={cr}
                    onChange={(e) => setCr(e.target.value)}
                    className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    required
                    disabled={isBusy}
                />
            </div>
        )}

        {(combatantType === 'creature' || combatantType === 'dmpc') && (
            <>
                <div className="flex items-center gap-2">
                    <input
                        type="url"
                        placeholder="Statblock URL (Optional)"
                        value={statblockUrl}
                        onChange={(e) => setStatblockUrl(e.target.value)}
                        className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                        disabled={isBusy}
                    />
                     <button
                        type="button"
                        onClick={handleFetchStatblock}
                        className="p-2 bg-stone-600 hover:bg-stone-500 text-white font-semibold rounded-md transition duration-300 ease-in-out disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        disabled={isFetchingStatblock || !statblockUrl}
                        title="Fetch Statblock Data"
                    >
                        {isFetchingStatblock ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <RefreshIcon className="w-5 h-5"/>
                        )}
                    </button>
                     <button
                        type="button"
                        onClick={() => setIsEditingDescription(true)}
                        className={`p-2 font-semibold rounded-md transition duration-300 ease-in-out flex-shrink-0 relative ${description ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-stone-600 hover:bg-stone-500 text-white'}`}
                        title="Add Custom Description"
                    >
                        <PencilSquareIcon className="w-5 h-5"/>
                        {description && (
                            <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-amber-400 ring-2 ring-stone-800"></span>
                        )}
                    </button>
                </div>
                {/* Legendary options */}
                <div className="space-y-3 pt-2">
                     <div className="flex items-center gap-4">
                        <label className="flex items-center text-sm text-stone-300 select-none w-1/2">
                            <input
                                type="checkbox"
                                checked={hasLegendaryResistances}
                                onChange={(e) => setHasLegendaryResistances(e.target.checked)}
                                className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="ml-2">Legendary Resistances</span>
                        </label>
                        {hasLegendaryResistances && (
                            <input
                                type="number"
                                value={legendaryResistances}
                                onChange={(e) => setLegendaryResistances(parseInt(e.target.value, 10))}
                                className="w-20 bg-stone-900/50 border border-stone-600 rounded-md px-2 py-1 text-white text-sm"
                                min="1"
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center text-sm text-stone-300 select-none w-1/2">
                            <input
                                type="checkbox"
                                checked={hasLegendaryActions}
                                onChange={(e) => setHasLegendaryActions(e.target.checked)}
                                className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="ml-2">Legendary Actions</span>
                        </label>
                        {hasLegendaryActions && (
                            <input
                                type="number"
                                value={legendaryActions}
                                onChange={(e) => setLegendaryActions(parseInt(e.target.value, 10))}
                                className="w-20 bg-stone-900/50 border border-stone-600 rounded-md px-2 py-1 text-white text-sm"
                                min="1"
                            />
                        )}
                    </div>
                </div>
            </>
        )}

        {(combatantType === 'creature' || combatantType === 'dmpc') && (
            <div className="space-y-3 pt-3 mt-3 border-t border-stone-700">
                <div className="flex items-center gap-2">
                    <h4 className="text-md font-bold text-stone-300">Loot Inventory (Optional)</h4>
                    <a 
                        href="https://www.aidedd.org/dnd-filters/magic-items.php" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title="Open Magic Item Database in new tab"
                        aria-label="Open Magic Item Database in new tab"
                        className="text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </a>
                </div>
                 {/* Inventory List */}
                {inventory.length > 0 && (
                    <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {inventory.map((item, index) => (
                            <li key={index} className="flex items-center justify-between bg-stone-900/50 p-2 rounded-md text-sm">
                                <span className="text-stone-300 truncate">{item.amount}x {item.name}</span>
                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-300 p-1 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                            </li>
                        ))}
                    </ul>
                )}
                 <div className="flex rounded-md shadow-sm" role="group">
                    <button
                        type="button"
                        onClick={() => handleInventoryModeChange('magic')}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-l-lg flex-grow transition-colors ${inventoryMode === 'magic' ? 'bg-stone-600' : 'bg-stone-700 hover:bg-stone-600'}`}
                    >
                        Search Magic Item
                    </button>
                    <button
                        type="button"
                        onClick={() => handleInventoryModeChange('custom')}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-r-lg flex-grow transition-colors border-l border-stone-900/50 ${inventoryMode === 'custom' ? 'bg-stone-600' : 'bg-stone-700 hover:bg-stone-600'}`}
                    >
                        Add Custom Item
                    </button>
                </div>

                {inventoryMode === 'magic' ? (
                    <div className="flex items-start gap-2">
                        <input type="number" placeholder="Qty" value={newItemAmount} onChange={e => setNewItemAmount(e.target.value)} min="1" className="bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition w-16 text-center"/>
                        <div className="relative flex-grow" onBlur={() => setTimeout(() => setIsMagicItemListFocused(false), 150)}>
                            <input 
                                type="text" 
                                placeholder="Search magic items..." 
                                value={magicItemSearchQuery} 
                                onChange={e => setMagicItemSearchQuery(e.target.value)}
                                onFocus={() => setIsMagicItemListFocused(true)}
                                className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 pl-3 pr-10 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                            />
                             <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <button
                                    type="button"
                                    onClick={() => setIsMagicItemSearchModalOpen(true)}
                                    className="p-1 text-stone-400 hover:text-white transition-colors"
                                    title="Advanced Magic Item Search"
                                    aria-label="Advanced Magic Item Search"
                                >
                                    <FilterIcon className="w-5 h-5" />
                                </button>
                            </div>
                            {isMagicItemListFocused && magicItemSearchResults.length > 0 && (
                                <ul className="absolute z-20 w-full mt-1 bg-stone-700 border border-stone-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {magicItemSearchResults.map((item) => (
                                    <li
                                    key={item.index}
                                    onClick={() => handleSelectMagicItem(item)}
                                    className="px-4 py-2 text-white hover:bg-amber-700 cursor-pointer"
                                    >
                                    {item.name}
                                    </li>
                                ))}
                                </ul>
                            )}
                            {newItemName && <p className="text-xs text-stone-400 mt-1">Selected: <span className="font-semibold text-stone-300">{newItemName}</span></p>}
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAddItem}
                            disabled={!newItemName.trim()}
                            className="flex-shrink-0 p-2 mt-px bg-stone-600 hover:bg-stone-500 text-white font-bold rounded-md transition disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add Item"
                        >
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <input type="number" placeholder="Qty" value={newItemAmount} onChange={e => setNewItemAmount(e.target.value)} min="1" className="bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition w-16 text-center"/>
                        <input type="text" placeholder="Item Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="flex-1 min-w-0 bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
                        
                        {isUrlInputVisible && (
                            <input 
                                type="url" 
                                placeholder="URL" 
                                value={newItemUrl} 
                                onChange={e => setNewItemUrl(e.target.value)} 
                                className="flex-1 min-w-0 bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                                autoFocus
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => setIsEditingItemDescription(true)}
                            className={`p-2 rounded-md transition flex-shrink-0 relative ${newItemDescription ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-stone-600 hover:bg-stone-500 text-stone-300'}`}
                            title="Add Custom Description"
                        >
                            <PencilSquareIcon className="w-5 h-5"/>
                            {newItemDescription && (
                               <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-amber-400 ring-2 ring-stone-800"></span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsUrlInputVisible(prev => !prev)}
                            className={`p-2 rounded-md transition flex-shrink-0 ${isUrlInputVisible ? 'bg-sky-700 text-white' : 'bg-stone-600 hover:bg-stone-500 text-stone-300'}`}
                            title={isUrlInputVisible ? "Hide URL Field" : "Add Item URL"}
                        >
                            <LinkIcon className="w-5 h-5"/>
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={handleAddItem}
                            disabled={!newItemName.trim()}
                            className="flex-shrink-0 p-2 bg-stone-600 hover:bg-stone-500 text-white font-bold rounded-md transition disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add Item"
                        >
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                    </div>
                )}
            </div>
        )}

        <div className="flex gap-2">
            <button
            type="submit"
            className="flex-grow flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            disabled={!isValid || isBusy}
            >
            {isBusy ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <PlusCircleIcon className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Loading...' : (isFetchingCharacterSheet || isFetchingStatblock) ? 'Fetching...' : 'Add One'}
            </button>
            
            <button
                type="button"
                onClick={() => setIsAddMultipleModalOpen(true)}
                className="flex items-center justify-center bg-stone-600 hover:bg-stone-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                disabled={!isValid || isBusy}
                title="Add Multiple / Groups"
            >
                <SquaresPlusIcon className="w-5 h-5" />
            </button>
        </div>
      </form>
    </div>
    
    {isAddMultipleModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIsAddMultipleModalOpen(false)}>
            <div className="bg-stone-800 rounded-lg shadow-xl p-6 border border-stone-700 w-full max-w-sm m-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-medieval text-white mb-4">Add Multiple Combatants</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Quantity</label>
                        <input
                            type="number"
                            min="2"
                            value={multipleCount}
                            onChange={e => setMultipleCount(e.target.value)}
                            className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    
                    <div className="bg-stone-900/50 p-3 rounded-md space-y-3">
                         <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isInitiativeGroup}
                                onChange={e => setIsInitiativeGroup(e.target.checked)}
                                className="h-5 w-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                            />
                            <div>
                                <span className="text-white block">Initiative Group</span>
                                <span className="text-xs text-stone-400">Visually group them in the list.</span>
                            </div>
                        </label>
                        
                        <label className={`flex items-center gap-3 cursor-pointer ${!isInitiativeGroup ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <input
                                type="checkbox"
                                checked={isSharedHealth}
                                onChange={e => setIsSharedHealth(e.target.checked)}
                                disabled={!isInitiativeGroup} // Usually shared health implies they act as a group, but technically separate. We'll simplify UI.
                                className="h-5 w-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                            />
                            <div>
                                <span className="text-white block">Shared Health Pool</span>
                                <span className="text-xs text-stone-400">Creates a single "Mob" unit with combined HP.</span>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setIsAddMultipleModalOpen(false)}
                            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-md transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddMultipleSubmit}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-md transition"
                        >
                            Add {multipleCount}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )}

    {isEditingDescription && (
        <DescriptionEditorModal
            initialDescription={description}
            onSave={(newDesc) => {
                setDescription(newDesc);
                setIsEditingDescription(false);
            }}
            onClose={() => setIsEditingDescription(false)}
        />
    )}
    {isEditingItemDescription && (
        <DescriptionEditorModal
            initialDescription={newItemDescription}
            onSave={(newDesc) => {
                setNewItemDescription(newDesc);
                setIsEditingItemDescription(false);
            }}
            onClose={() => setIsEditingItemDescription(false)}
        />
    )}
    {isSearchModalOpen && (
        <CreatureSearchModal
            onClose={() => setIsSearchModalOpen(false)}
            onSelect={handleSelectFromSearch}
        />
    )}
    {isMagicItemSearchModalOpen && (
        <MagicItemSearchModal
            onClose={() => setIsMagicItemSearchModalOpen(false)}
            onSelect={handleSelectMagicItemFromModal}
        />
    )}
    </>
  );
};