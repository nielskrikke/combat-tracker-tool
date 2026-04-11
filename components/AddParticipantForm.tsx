
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
    'border-dnd-red/50 bg-dnd-red/10',
    'border-dnd-gold/50 bg-dnd-gold/10',
    'border-sky-500/50 bg-sky-900/10',
    'border-emerald-500/50 bg-emerald-900/10',
    'border-violet-500/50 bg-violet-900/10',
    'border-white/20 bg-white/5',
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
    <div className="bg-dnd-panel/80 backdrop-blur-md rounded-xl shadow-xl p-4 border border-white/5">
      <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em] mb-4">Add Combatant</h3>
      
      {/* Type Toggle */}
      <div className="flex rounded-lg shadow-sm mb-4 overflow-hidden border border-white/5" role="group">
        <button
          type="button"
          onClick={() => handleTypeChange('player')}
          className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 w-1/3 transition-all ${combatantType === 'player' ? 'bg-dnd-gold text-black' : 'bg-white/5 text-dnd-text/40 hover:bg-white/10'}`}
        >
          <span role="img" aria-label="Player" className="text-base">🧑</span>
          Player
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('dmpc')}
          className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 w-1/3 transition-all border-x border-white/5 ${combatantType === 'dmpc' ? 'bg-dnd-gold text-black' : 'bg-white/5 text-dnd-text/40 hover:bg-white/10'}`}
        >
          <span role="img" aria-label="DMPC" className="text-base">🎭</span>
          DMPC
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('creature')}
          className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 w-1/3 transition-all ${combatantType === 'creature' ? 'bg-dnd-gold text-black' : 'bg-white/5 text-dnd-text/40 hover:bg-white/10'}`}
        >
          <span role="img" aria-label="Creature" className="text-base">🐲</span>
          Creature
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Search Input for Creatures */}
        {(combatantType === 'creature' || combatantType === 'dmpc') && (
            <div className="relative" onBlur={() => setTimeout(() => setIsListFocused(false), 150)}>
                 <input
                    type="text"
                    placeholder="Search creatures..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsListFocused(true)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-3 pr-20 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-sans text-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button
                        type="button"
                        onClick={() => setIsSearchModalOpen(true)}
                        className="p-2 text-dnd-text/40 hover:text-dnd-gold transition-colors"
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
                        className="p-2 text-sky-400/60 hover:text-sky-400 transition-colors"
                    >
                        <LinkIcon className="w-5 h-5" />
                    </a>
                </div>
                {isListFocused && searchResults.length > 0 && (
                    <ul className="absolute z-20 w-full mt-2 bg-dnd-panel border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl">
                    {searchResults.map((monster) => (
                        <li
                        key={monster.index}
                        onClick={() => handleSelectMonster(monster.url)}
                        className="px-4 py-3 text-dnd-text hover:bg-dnd-gold hover:text-black cursor-pointer transition-colors font-sans"
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
          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-sans text-base"
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
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-sans text-sm"
                />
                <button
                    type="button"
                    onClick={handleFetchCharacterSheet}
                    className="p-2 bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-gold rounded-lg transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    disabled={isFetchingCharacterSheet || !characterSheetUrl.includes('dndbeyond.com/characters/')}
                    title="Fetch Character Data"
                >
                    {isFetchingCharacterSheet ? (
                        <svg className="animate-spin h-5 w-5 text-dnd-gold" viewBox="0 0 24 24">
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
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-text/30 ml-1">Initiative</label>
            <input
              type="number"
              placeholder="Init"
              value={initiative}
              onChange={(e) => setInitiative(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-mono text-center text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-text/30 ml-1">Armor Class</label>
            <input
              type="number"
              placeholder="AC"
              value={ac}
              onChange={(e) => setAc(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-mono text-center text-sm"
              required
              disabled={isBusy}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-text/30 ml-1">DEX Mod</label>
            <input
              type="number"
              placeholder="DEX"
              value={dexterityModifier}
              onChange={(e) => setDexterityModifier(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-mono text-center text-sm"
              disabled={isBusy}
            />
          </div>
        </div>
        
        {/* Type Specific Stats */}
        {combatantType === 'player' && (
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-text/30 ml-1">Level</label>
                    <input
                        type="number"
                        placeholder="Level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-mono text-center text-sm"
                        required
                        disabled={isLoading || isFetchingCharacterSheet}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-text/30 ml-1">Max HP</label>
                    <input
                        type="number"
                        placeholder="HP"
                        value={hp}
                        onChange={(e) => setHp(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-mono text-center text-sm"
                        disabled={isBusy}
                    />
                </div>
            </div>
        )}
        {combatantType === 'dmpc' && (
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-text/30 ml-1">Level</label>
                    <input
                        type="number"
                        placeholder="Lvl"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-mono text-center text-sm"
                        disabled={isLoading || isFetchingCharacterSheet}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-text/30 ml-1">Max HP</label>
                    <input
                        type="number"
                        placeholder="HP"
                        value={hp}
                        onChange={(e) => setHp(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-mono text-center text-sm"
                        disabled={isBusy}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-text/30 ml-1">CR</label>
                    <input
                        type="text"
                        placeholder="CR"
                        value={cr}
                        onChange={(e) => setCr(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-mono text-center text-sm"
                        disabled={isLoading || isFetchingStatblock}
                    />
                </div>
            </div>
        )}
        {combatantType === 'creature' && (
             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-text/30 ml-1">Max HP</label>
                    <input
                        type="number"
                        placeholder="HP"
                        value={hp}
                        onChange={(e) => setHp(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-mono text-center text-sm"
                        required
                        disabled={isBusy}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-text/30 ml-1">CR</label>
                    <input
                        type="text"
                        placeholder="CR"
                        value={cr}
                        onChange={(e) => setCr(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-mono text-center text-sm"
                        required
                        disabled={isLoading || isFetchingStatblock}
                    />
                </div>
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
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 focus:border-dnd-gold/50 transition-all font-sans text-sm"
                        disabled={isBusy}
                    />
                    <button
                        type="button"
                        onClick={handleFetchStatblock}
                        className="p-2 bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-gold rounded-lg transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        disabled={isFetchingStatblock || !statblockUrl}
                        title="Fetch Statblock Data"
                    >
                        {isFetchingStatblock ? (
                            <svg className="animate-spin h-4 w-4 text-dnd-gold" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <RefreshIcon className="w-4 h-4"/>
                        )}
                    </button>
                                  <button
                        type="button"
                        onClick={() => setIsEditingDescription(true)}
                        className={`p-2 rounded-lg transition-all flex-shrink-0 relative border border-white/5 ${description ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-dnd-text/40 hover:bg-white/10 hover:text-dnd-gold'}`}
                        title="Add Custom Description"
                    >
                        <PencilSquareIcon className="w-4 h-4"/>
                        {description && (
                            <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                        )}
                    </button>
                </div>
                {/* Legendary options */}
                <div className="space-y-3 pt-2">
                     <div className="flex items-center gap-4">
                        <label className="flex items-center text-xs font-black uppercase tracking-widest text-dnd-text/40 select-none w-1/2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={hasLegendaryResistances}
                                onChange={(e) => setHasLegendaryResistances(e.target.checked)}
                                className="h-4 w-4 rounded border-white/10 bg-black/40 text-dnd-gold focus:ring-dnd-gold/50"
                            />
                            <span className="ml-2 group-hover:text-dnd-gold transition-colors">Legendary Resistances</span>
                        </label>
                        {hasLegendaryResistances && (
                            <input
                                type="number"
                                value={legendaryResistances}
                                onChange={(e) => setLegendaryResistances(parseInt(e.target.value, 10))}
                                className="w-20 bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-dnd-text text-sm font-mono text-center focus:ring-2 focus:ring-dnd-gold/50"
                                min="1"
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center text-xs font-black uppercase tracking-widest text-dnd-text/40 select-none w-1/2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={hasLegendaryActions}
                                onChange={(e) => setHasLegendaryActions(e.target.checked)}
                                className="h-4 w-4 rounded border-white/10 bg-black/40 text-dnd-gold focus:ring-dnd-gold/50"
                            />
                            <span className="ml-2 group-hover:text-dnd-gold transition-colors">Legendary Actions</span>
                        </label>
                        {hasLegendaryActions && (
                            <input
                                type="number"
                                value={legendaryActions}
                                onChange={(e) => setLegendaryActions(parseInt(e.target.value, 10))}
                                className="w-20 bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-dnd-text text-sm font-mono text-center focus:ring-2 focus:ring-dnd-gold/50"
                                min="1"
                            />
                        )}
                    </div>
                </div>
            </>
        )}

        {(combatantType === 'creature' || combatantType === 'dmpc') && (
            <div className="space-y-3 pt-4 mt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40">Loot Inventory</h4>
                    <a 
                        href="https://www.aidedd.org/dnd-filters/magic-items.php" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title="Open Magic Item Database in new tab"
                        aria-label="Open Magic Item Database in new tab"
                        className="text-sky-400/60 hover:text-sky-400 transition-colors"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </a>
                </div>
                 {/* Inventory List */}
                {inventory.length > 0 && (
                    <ul className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {inventory.map((item, index) => (
                            <li key={index} className="flex items-center justify-between bg-black/20 p-2 rounded-lg text-sm border border-white/5">
                                <span className="text-dnd-text/80 font-sans truncate">{item.amount}x {item.name}</span>
                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-dnd-red/60 hover:text-dnd-red p-1 rounded-full transition-colors"><TrashIcon className="w-4 h-4"/></button>
                            </li>
                        ))}
                    </ul>
                )}
                 <div className="flex rounded-lg shadow-sm overflow-hidden border border-white/5" role="group">
                    <button
                        type="button"
                        onClick={() => handleInventoryModeChange('magic')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest flex-grow transition-all ${inventoryMode === 'magic' ? 'bg-dnd-gold text-black' : 'bg-white/5 text-dnd-text/40 hover:bg-white/10'}`}
                    >
                        Magic Item
                    </button>
                    <button
                        type="button"
                        onClick={() => handleInventoryModeChange('custom')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest flex-grow transition-all border-l border-white/5 ${inventoryMode === 'custom' ? 'bg-dnd-gold text-black' : 'bg-white/5 text-dnd-text/40 hover:bg-white/10'}`}
                    >
                        Custom Item
                    </button>
                </div>

                {inventoryMode === 'magic' ? (
                    <div className="flex items-start gap-2">
                        <input type="number" placeholder="Qty" value={newItemAmount} onChange={e => setNewItemAmount(e.target.value)} min="1" className="bg-black/20 border border-white/10 rounded-lg px-3 py-3 text-dnd-text focus:ring-2 focus:ring-dnd-gold/50 transition-all w-16 text-center font-mono"/>
                        <div className="relative flex-grow" onBlur={() => setTimeout(() => setIsMagicItemListFocused(false), 150)}>
                            <input 
                                type="text" 
                                placeholder="Search magic items..." 
                                value={magicItemSearchQuery} 
                                onChange={e => setMagicItemSearchQuery(e.target.value)}
                                onFocus={() => setIsMagicItemListFocused(true)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-3 pl-3 pr-10 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 transition-all font-sans"
                            />
                             <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <button
                                    type="button"
                                    onClick={() => setIsMagicItemSearchModalOpen(true)}
                                    className="p-2 text-dnd-text/40 hover:text-dnd-gold transition-colors"
                                    title="Advanced Magic Item Search"
                                    aria-label="Advanced Magic Item Search"
                                >
                                    <FilterIcon className="w-5 h-5" />
                                </button>
                            </div>
                            {isMagicItemListFocused && magicItemSearchResults.length > 0 && (
                                <ul className="absolute z-20 w-full mt-2 bg-dnd-panel border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl">
                                {magicItemSearchResults.map((item) => (
                                    <li
                                    key={item.index}
                                    onClick={() => handleSelectMagicItem(item)}
                                    className="px-4 py-3 text-dnd-text hover:bg-dnd-gold hover:text-black cursor-pointer transition-colors font-sans"
                                    >
                                    {item.name}
                                    </li>
                                ))}
                                </ul>
                            )}
                            {newItemName && <p className="text-[10px] text-dnd-gold/60 mt-1 ml-1">Selected: <span className="font-black uppercase tracking-widest">{newItemName}</span></p>}
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAddItem}
                            disabled={!newItemName.trim()}
                            className="flex-shrink-0 p-3 bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-gold rounded-lg transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add Item"
                        >
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <input type="number" placeholder="Qty" value={newItemAmount} onChange={e => setNewItemAmount(e.target.value)} min="1" className="bg-black/20 border border-white/10 rounded-lg px-3 py-3 text-dnd-text focus:ring-2 focus:ring-dnd-gold/50 transition-all w-16 text-center font-mono"/>
                        <input type="text" placeholder="Item Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="flex-1 min-w-0 bg-black/20 border border-white/10 rounded-lg px-3 py-3 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 transition-all font-sans"/>
                        
                        {isUrlInputVisible && (
                            <input 
                                type="url" 
                                placeholder="URL" 
                                value={newItemUrl} 
                                onChange={e => setNewItemUrl(e.target.value)} 
                                className="flex-1 min-w-0 bg-black/20 border border-white/10 rounded-lg px-3 py-3 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 transition-all font-sans"
                                autoFocus
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => setIsEditingItemDescription(true)}
                            className={`p-3 rounded-lg transition-all flex-shrink-0 relative border border-white/5 ${newItemDescription ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-dnd-text/40 hover:bg-white/10 hover:text-dnd-gold'}`}
                            title="Add Custom Description"
                        >
                            <PencilSquareIcon className="w-5 h-5"/>
                            {newItemDescription && (
                               <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsUrlInputVisible(prev => !prev)}
                            className={`p-3 rounded-lg transition-all flex-shrink-0 border border-white/5 ${isUrlInputVisible ? 'bg-sky-900/40 text-sky-400 border-sky-500/30' : 'bg-white/5 text-dnd-text/40 hover:bg-white/10 hover:text-dnd-gold'}`}
                            title={isUrlInputVisible ? "Hide URL Field" : "Add Item URL"}
                        >
                            <LinkIcon className="w-5 h-5"/>
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={handleAddItem}
                            disabled={!newItemName.trim()}
                            className="flex-shrink-0 p-3 bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-gold rounded-lg transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add Item"
                        >
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                    </div>
                )}
            </div>
        )}

        <div className="flex gap-3 pt-4">
            <button
            type="submit"
            className="flex-grow flex items-center justify-center bg-dnd-gold hover:bg-dnd-gold/80 text-black font-black uppercase tracking-[0.2em] text-[10px] py-3 px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(201,173,106,0.15)] hover:shadow-[0_0_30px_rgba(201,173,106,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            disabled={!isValid || isBusy}
            >
            {isBusy ? (
                <svg className="animate-spin h-4 w-4 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <PlusCircleIcon className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Loading...' : (isFetchingCharacterSheet || isFetchingStatblock) ? 'Fetching...' : 'Summon One'}
            </button>
            
            <button
                type="button"
                onClick={() => setIsAddMultipleModalOpen(true)}
                className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-dnd-gold py-3 px-6 rounded-lg transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                disabled={!isValid || isBusy}
                title="Add Multiple / Groups"
            >
                <SquaresPlusIcon className="w-5 h-5" />
            </button>
        </div>
      </form>
    </div>
    
    {isAddMultipleModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsAddMultipleModalOpen(false)}>
            <div className="bg-dnd-panel rounded-2xl shadow-2xl p-8 border border-white/10 w-full max-w-md m-4 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dnd-gold to-transparent opacity-50"></div>
                <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em] mb-6">Summon Horde</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-2 ml-1">Quantity</label>
                        <input
                            type="number"
                            min="2"
                            value={multipleCount}
                            onChange={e => setMultipleCount(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-dnd-text text-xl font-mono text-center focus:ring-2 focus:ring-dnd-gold/50 transition-all"
                        />
                    </div>
                    
                    <div className="bg-black/20 p-6 rounded-xl space-y-4 border border-white/5">
                         <label className="flex items-center gap-4 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isInitiativeGroup}
                                onChange={e => setIsInitiativeGroup(e.target.checked)}
                                className="h-6 w-6 rounded border-white/10 bg-black/40 text-dnd-gold focus:ring-dnd-gold/50"
                            />
                            <div>
                                <span className="text-dnd-text font-sans text-lg group-hover:text-dnd-gold transition-colors">Initiative Group</span>
                                <span className="text-xs text-dnd-text/40 block">Visually group them in the initiative list.</span>
                            </div>
                        </label>
                        
                        <label className={`flex items-center gap-4 cursor-pointer group ${!isInitiativeGroup ? 'opacity-30 cursor-not-allowed' : ''}`}>
                            <input
                                type="checkbox"
                                checked={isSharedHealth}
                                onChange={e => setIsSharedHealth(e.target.checked)}
                                disabled={!isInitiativeGroup}
                                className="h-6 w-6 rounded border-white/10 bg-black/40 text-dnd-gold focus:ring-dnd-gold/50"
                            />
                            <div>
                                <span className="text-dnd-text font-sans text-lg group-hover:text-dnd-gold transition-colors">Shared Health Pool</span>
                                <span className="text-xs text-dnd-text/40 block">Creates a single "Mob" unit with combined HP.</span>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            onClick={() => setIsAddMultipleModalOpen(false)}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-text rounded-xl transition-all font-black uppercase tracking-widest text-[10px]"
                        >
                            Retreat
                        </button>
                        <button
                            onClick={handleAddMultipleSubmit}
                            className="px-8 py-3 bg-dnd-gold hover:bg-dnd-gold/80 text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg"
                        >
                            Summon {multipleCount}
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