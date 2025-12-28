
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AddParticipantForm } from './components/AddParticipantForm';
import { InitiativeList } from './components/InitiativeList';
import { CombatControls } from './components/CombatControls';
import { SaveLoadControls } from './components/SaveLoadControls';
import { StatblockModal } from './components/StatblockModal';
import { DescriptionViewerModal } from './components/DescriptionViewerModal';
import { RerollInitiativeModal } from './components/RerollInitiativeModal';
import { AddCreaturesModal } from './components/AddCreaturesModal';
import { LootModal } from './components/LootModal';
import { EncounterDifficulty } from './components/EncounterDifficulty';
import { TieBreakerModal } from './components/TieBreakerModal';
import { CombatLog } from './components/CombatLog';
import type { Participant, Condition, LogEntry } from './types';
import { D20Icon } from './components/icons';

interface SavedState {
  participants: Participant[];
  currentIndex: number;
  round: number;
  combatLog: LogEntry[];
}

const SYNC_CHANNEL = 'dnd_combat_sync';

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

/** 
 * Player View Component
 * A simplified, read-only view of the initiative for the players.
 */
const PlayerView: React.FC<{
  participants: Participant[];
  currentIndex: number;
  round: number;
}> = ({ participants, currentIndex, round }) => {
  const sorted = useMemo(() => {
    return [...participants].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      const dexA = a.dexterityModifier ?? -Infinity;
      const dexB = b.dexterityModifier ?? -Infinity;
      if (dexB !== dexA) return dexB - dexA;
      return a.name.localeCompare(b.name);
    });
  }, [participants]);

  const getVitality = (p: Participant) => {
    if (typeof p.hp !== 'number' || typeof p.maxHp !== 'number' || p.maxHp <= 0) {
      return { label: 'Unknown', color: 'text-stone-500' };
    }
    const percent = (p.hp / p.maxHp) * 100;
    if (percent > 75) return { label: 'Unscathed', color: 'text-emerald-400' };
    if (percent > 50) return { label: 'Bruised', color: 'text-lime-400' };
    if (percent > 25) return { label: 'Wounded', color: 'text-orange-400' };
    return { label: 'Crippled', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen bg-stone-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col items-center mb-12 border-b border-stone-800 pb-8">
          <h1 className="text-4xl font-medieval text-amber-500 flex items-center gap-4 mb-2">
            <D20Icon className="w-8 h-8" />
            Initiative Order
            <D20Icon className="w-8 h-8" />
          </h1>
          {round > 0 ? (
            <div className="text-stone-400 text-xl font-medieval uppercase tracking-widest">
              Round <span className="text-white text-3xl font-bold">{round}</span>
            </div>
          ) : (
            <div className="text-stone-500 text-lg italic">Waiting for combat to begin...</div>
          )}
        </header>

        {/* Column Headers */}
        <div className="hidden md:grid grid-cols-12 gap-6 px-6 mb-4 text-xs font-bold uppercase tracking-widest text-stone-500">
          <div className="col-span-1 text-center">Init</div>
          <div className="col-span-8">Combatant</div>
          <div className="col-span-3 text-right pr-4">Vitality</div>
        </div>

        <ul className="space-y-4">
          {sorted.map((p, idx) => {
            const isActive = idx === currentIndex;
            const isDefeated = p.hp === 0;
            const vitality = getVitality(p);
            
            return (
              <li 
                key={p.id} 
                className={`
                  relative grid grid-cols-12 items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl border-2 transition-all duration-500
                  ${isActive 
                    ? 'bg-amber-900/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-105 z-10' 
                    : 'bg-stone-900/40 border-stone-800 scale-100 opacity-90'}
                  ${isDefeated ? 'opacity-40 grayscale blur-[0.5px]' : ''}
                `}
              >
                {/* Initiative Column */}
                <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                  <div className={`
                    w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0
                    ${isActive ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'}
                  `}>
                    {p.initiative}
                  </div>
                </div>

                {/* Info Column */}
                <div className="col-span-7 md:col-span-8 flex flex-col gap-1 overflow-hidden">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span role="img" aria-label={p.type} className="text-xl sm:text-2xl">
                        {p.type === 'player' ? '🧑' : p.type === 'dmpc' ? '🎭' : '🐲'}
                    </span>
                    <span className={`text-xl sm:text-2xl font-medieval truncate ${isActive ? 'text-white' : 'text-stone-300'}`}>
                      {p.name}
                    </span>
                    {isActive && (
                      <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                        Turn
                      </span>
                    )}
                  </div>
                  
                  {/* Conditions */}
                  <div className="flex flex-wrap gap-1">
                    {p.conditions.map(c => (
                      <span key={c.id} className="bg-violet-900/60 text-violet-200 border border-violet-700/50 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        {c.name} {c.duration !== Infinity && `(${c.duration})`}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vitality Column */}
                <div className="col-span-3 text-right pr-2">
                   <div className={`text-sm sm:text-lg font-bold uppercase tracking-wide ${vitality.color}`}>
                     {vitality.label}
                   </div>
                   {isActive && (
                      <div className="text-amber-500 animate-[bounce_1s_infinite_horizontal] mt-2 hidden md:block">
                        <svg className="w-6 h-6 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </div>
                   )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [round, setRound] = useState<number>(0);
  const [combatLog, setCombatLog] = useState<LogEntry[]>([]);
  const [detailsToShow, setDetailsToShow] = useState<{ url?: string; description?: string; title: string } | null>(null);
  const [loadedStateForReroll, setLoadedStateForReroll] = useState<SavedState | null>(null);
  const [creaturesToAdd, setCreaturesToAdd] = useState<Participant[] | null>(null);
  const [participantToFind, setParticipantToFind] = useState<string | null>(null);
  const [lootingParticipant, setLootingParticipant] = useState<Participant | null>(null);
  const [ties, setTies] = useState<Participant[][] | null>(null);

  // Sync state across windows - switched to Hash for Safari compatibility with Blob URLs
  const [isPlayerView, setIsPlayerView] = useState(() => window.location.hash === '#player');
  const channel = useMemo(() => new BroadcastChannel(SYNC_CHANNEL), []);

  useEffect(() => {
    const handleHashChange = () => setIsPlayerView(window.location.hash === '#player');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Effect for Broadcasting (DM only)
  useEffect(() => {
    if (!isPlayerView) {
      channel.postMessage({
        type: 'SYNC',
        participants,
        currentIndex,
        round
      });
      // Also save to localStorage for window refreshes/initial loads
      localStorage.setItem('combat_state_sync', JSON.stringify({ participants, currentIndex, round }));
    }
  }, [participants, currentIndex, round, isPlayerView, channel]);

  // Effect for Listening (Player View only)
  useEffect(() => {
    if (isPlayerView) {
      // Load initial state
      const initial = localStorage.getItem('combat_state_sync');
      if (initial) {
        try {
          const data = JSON.parse(initial);
          setParticipants(data.participants);
          setCurrentIndex(data.currentIndex);
          setRound(data.round);
        } catch (e) { console.error("Sync error", e); }
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'SYNC') {
          setParticipants(event.data.participants);
          setCurrentIndex(event.data.currentIndex);
          setRound(event.data.round);
        }
      };
      channel.addEventListener('message', handleMessage);
      return () => channel.removeEventListener('message', handleMessage);
    }
  }, [isPlayerView, channel]);

  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      if (b.initiative !== a.initiative) {
        return b.initiative - a.initiative;
      }
      const dexA = a.dexterityModifier ?? -Infinity;
      const dexB = b.dexterityModifier ?? -Infinity;
      if (dexB !== dexA) {
        return dexB - dexA;
      }
      return a.name.localeCompare(b.name); // Fallback to name sort
    });
  }, [participants]);

  const addLogEntry = useCallback((message: string, type: LogEntry['type'], actorNameOverride?: string) => {
    const actor = sortedParticipants[currentIndex];
    const newEntry: LogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        round: round > 0 ? round : 0,
        actorName: actorNameOverride || actor?.name || 'System',
        message,
        type,
    };
    setCombatLog(prev => [...prev, newEntry]);
  }, [currentIndex, round, sortedParticipants]);

  // Effect to reset legendary actions at the start of a participant's turn
  useEffect(() => {
    if (currentIndex > -1 && sortedParticipants.length > 0) {
      const currentParticipant = sortedParticipants[currentIndex];
      if (
        currentParticipant &&
        typeof currentParticipant.legendaryActions === 'number' &&
        currentParticipant.legendaryActionsUsed !== 0
      ) {
        // It's this participant's turn, reset their actions
        setParticipants(prev =>
          prev.map(p =>
            p.id === currentParticipant.id ? { ...p, legendaryActionsUsed: 0 } : p
          )
        );
      }
    }
  }, [currentIndex, sortedParticipants]);

  // Effect to correctly set the current index after adding new creatures to an ongoing combat
  useEffect(() => {
    if (participantToFind && sortedParticipants.length > 0) {
        const newIndex = sortedParticipants.findIndex(p => p.id === participantToFind);
        if (newIndex > -1) {
            setCurrentIndex(newIndex);
        }
        setParticipantToFind(null); // Reset after use
    }
  }, [sortedParticipants, participantToFind]);

  const findTies = useCallback((participantsList: Participant[]): Participant[][] => {
    const initiatives = new Map<number, Participant[]>();
    participantsList.forEach(p => {
        if (!initiatives.has(p.initiative)) {
            initiatives.set(p.initiative, []);
        }
        initiatives.get(p.initiative)!.push(p);
    });

    const tiesFound: Participant[][] = [];
    initiatives.forEach(group => {
        if (group.length > 1) {
            const needsResolution = group.some(p => typeof p.dexterityModifier !== 'number');
            if (needsResolution) {
                tiesFound.push(group);
            }
        }
    });
    return tiesFound;
  }, []);

  const handleAddParticipant = (participantOrList: Omit<Participant, 'id'> | Omit<Participant, 'id'>[]) => {
    const inputList = Array.isArray(participantOrList) ? participantOrList : [participantOrList];
    
    const newItems = inputList.map((p, i) => ({
        ...p,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`
    }));
    
    const newParticipants = [...participants, ...newItems];
    
    if (currentIndex > -1) { // If combat is active, check for ties immediately
      const tiesToResolve = findTies(newParticipants);
      if (tiesToResolve.length > 0) {
        setParticipants(newParticipants); // Add participant to state first
        setTies(tiesToResolve); // Then open modal
        return;
      }
    }
    setParticipants(newParticipants);
  };

  const handleRemoveParticipant = (id: string) => {
    const participantToRemove = participants.find(p => p.id === id);
    if (participantToRemove) {
      addLogEntry(`${participantToRemove.name} was removed from combat.`, 'info');
    }

    if (lootingParticipant?.id === id) {
      setLootingParticipant(null);
    }

    const removedIndex = sortedParticipants.findIndex(p => p.id === id);
    const newParticipants = participants.filter(p => p.id !== id);
    setParticipants(newParticipants);

    if (newParticipants.length === 0) {
      setCurrentIndex(-1);
      setRound(0);
      return;
    }

    if (currentIndex > -1) {
      if (removedIndex < currentIndex) {
        setCurrentIndex(prev => prev - 1);
      } else if (removedIndex === currentIndex) {
         if (currentIndex >= newParticipants.length) {
            setCurrentIndex(0);
            setRound(prev => prev + 1);
         }
      }
    }
  };
  
  const handleUpdateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    const participant = participants.find(p => p.id === id);
    if (!participant) return;

    // Log HP changes
    if (updates.hp !== undefined && typeof participant.hp === 'number') {
        const oldHp = participant.hp;
        const newHp = Math.max(0, updates.hp);
        if (newHp < oldHp) {
            addLogEntry(`${participant.name} takes ${oldHp - newHp} damage.`, 'damage');
        } else if (newHp > oldHp) {
            addLogEntry(`${participant.name} heals for ${newHp - oldHp} hit points.`, 'healing');
        }
        if (newHp <= 0 && oldHp > 0) {
            addLogEntry(`${participant.name} has been defeated!`, 'death');
        }
    }
    
    // Log Temp HP changes
    if (updates.tempHp !== undefined) {
         const oldTempHp = participant.tempHp || 0;
         const newTempHp = Math.max(0, updates.tempHp);
         if (newTempHp > oldTempHp) {
             addLogEntry(`${participant.name} gains ${newTempHp - oldTempHp} temporary hit points.`, 'info');
         }
    }

    if (currentIndex > -1 && updates.initiative !== undefined && sortedParticipants[currentIndex]) {
        setParticipantToFind(sortedParticipants[currentIndex].id);
    }

    // Logic for Mob Count Update (Shared Health)
    let finalUpdates = { ...updates };
    if (updates.hp !== undefined && participant.individualMaxHp && participant.individualMaxHp > 0) {
        const newHp = Math.max(0, updates.hp);
        const count = Math.ceil(newHp / participant.individualMaxHp);
        // Look for (xN) pattern to replace
        if (/\(x\d+\)/.test(participant.name)) {
             finalUpdates.name = participant.name.replace(/\(x\d+\)/, `(x${count})`);
        }
    }

    setParticipants(prev => {
        // Check if we are updating initiative for a grouped participant
        if (finalUpdates.initiative !== undefined && participant.group) {
            // Update all participants in the same group
            return prev.map(p => {
                if (p.group && p.group.id === participant.group!.id) {
                    return { ...p, ...finalUpdates };
                }
                return p;
            });
        }
        
        // Otherwise just update the single participant
        return prev.map(p => (p.id === id ? { ...p, ...finalUpdates } : p));
    });
  }, [participants, currentIndex, sortedParticipants, addLogEntry]);

  const handleStart = () => {
    if (participants.length > 0) {
      const tiesToResolve = findTies(participants);
      if (tiesToResolve.length > 0) {
        setTies(tiesToResolve);
        return;
      }
      setCombatLog([]); // Clear log for new combat
      const firstParticipant = sortedParticipants[0];
      setRound(1);
      setCurrentIndex(0);
      
      const newLog: LogEntry[] = [
        { id: `${Date.now()}-start`, round: 1, actorName: 'System', message: 'Combat has started! Round 1 begins.', type: 'info' },
        { id: `${Date.now()}-turn`, round: 1, actorName: firstParticipant.name, message: `It is now ${firstParticipant.name}'s turn.`, type: 'turn_start' }
      ];
      setCombatLog(newLog);
    }
  };

  const handleNext = () => {
    if (sortedParticipants.length > 0) {
      let currentRound = round;
      const nextIndex = (currentIndex + 1) % sortedParticipants.length;
      
      if (nextIndex === 0) {
        currentRound = round + 1;
        setRound(currentRound);
        addLogEntry(`Round ${currentRound} begins.`, 'info');
        // New round begins, update condition durations
        setParticipants(prev => prev.map(p => ({
            ...p,
            conditions: p.conditions
                .map(c => ({ ...c, duration: c.duration !== Infinity ? c.duration - 1 : Infinity }))
                .filter(c => c.duration > 0 || c.duration === Infinity)
        })));
      }

      const nextParticipant = sortedParticipants[nextIndex];
      addLogEntry(`It is now ${nextParticipant.name}'s turn.`, 'turn_start', nextParticipant.name);
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrev = () => {
     if (sortedParticipants.length > 0) {
      const prevIndex = (currentIndex - 1 + sortedParticipants.length) % sortedParticipants.length;
       if (currentIndex === 0) {
         setRound(prev => Math.max(1, prev - 1));
       }
      setCurrentIndex(prevIndex);
    }
  };

  const handleEndCombat = () => {
    addLogEntry('Combat has ended.', 'info');
    setCurrentIndex(-1);
    setRound(0);
    setParticipants(prev =>
      prev.filter(p => {
        if (p.type === 'player') return true; // Always keep players
        
        const isDefeated = typeof p.hp === 'number' && p.hp <= 0;
        if (!isDefeated) return true; // Keep anyone not defeated

        // At this point, it's a defeated non-player. Keep only if they have loot.
        const hasLoot = p.inventory && p.inventory.length > 0;
        return hasLoot;
      })
    );
  };

  const handleResetCombat = () => {
    if (confirm("Are you sure you want to simulate a long rest? This will reset all combatants to full health, remove all conditions, and reset resources. This cannot be undone.")) {
        setParticipants(prev => prev.map(p => ({
            ...p,
            hp: p.maxHp,
            tempHp: 0,
            conditions: [],
            legendaryResistancesUsed: 0,
            legendaryActionsUsed: 0,
        })));
        setCurrentIndex(-1);
        setRound(0);
        setCombatLog([]);
        addLogEntry('Combat has been reset.', 'info');
    }
  };

  const handleClearInitiative = () => {
    setParticipants([]);
    setCurrentIndex(-1);
    setRound(0);
    setCombatLog([]);
    addLogEntry('Battlefield has been cleared.', 'info', 'System');
  };

  const handleAddCondition = (participantId: string, condition: Omit<Condition, 'id'>) => {
    const participant = participants.find(p => p.id === participantId);
    if (participant) {
        addLogEntry(`${participant.name} is now ${condition.name}.`, 'condition_add');
    }
    setParticipants(prev => prev.map(p => {
        if (p.id === participantId) {
            return {
                ...p,
                conditions: [...p.conditions, { ...condition, id: Date.now().toString() }]
            };
        }
        return p;
    }));
  };

  const handleRemoveCondition = (participantId: string, conditionId: string) => {
      const participant = participants.find(p => p.id === participantId);
      if (participant) {
        const condition = participant.conditions.find(c => c.id === conditionId);
        if (condition) {
            addLogEntry(`${participant.name} is no longer ${condition.name}.`, 'condition_remove');
        }
      }
      setParticipants(prev => prev.map(p => {
          if (p.id === participantId) {
              return {
                  ...p,
                  conditions: p.conditions.filter(c => c.id !== conditionId)
              };
          }
          return p;
      }));
  };

  const handleSaveState = () => {
    try {
      const stateToSave: SavedState = {
        participants,
        currentIndex,
        round,
        combatLog,
      };
      const dataStr = JSON.stringify(stateToSave, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `dnd-initiative-save-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to save state:", error);
      alert("An error occurred while trying to save the session.");
    }
  };

  const handleLoadState = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          throw new Error("Failed to read file content.");
        }
        const loadedState = JSON.parse(result);

        if (
          Array.isArray(loadedState.participants) &&
          typeof loadedState.currentIndex === 'number' &&
          typeof loadedState.round === 'number'
        ) {
          const stateWithLog: SavedState = {
            ...loadedState,
            combatLog: loadedState.combatLog || []
          };
          setLoadedStateForReroll(stateWithLog);
        } else {
          throw new Error("Invalid save file format.");
        }
      } catch (error) {
        console.error("Failed to load state:", error);
        alert("Error: Could not load the save file. It may be corrupted or in an incorrect format.");
      }
    };
    reader.onerror = () => {
      alert("Error: Failed to read the selected file.");
    };
    reader.readAsText(file);
  };

  const handleAddCreaturesFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') throw new Error("Failed to read file content.");
        const loadedState: SavedState = JSON.parse(result);

        if (!Array.isArray(loadedState.participants)) throw new Error("Invalid save file format.");
        
        const creaturesOnly = loadedState.participants.filter(p => p.type === 'creature');
        if (creaturesOnly.length > 0) {
            setCreaturesToAdd(creaturesOnly);
        } else {
            alert("The selected file contains no creatures to add.");
        }
      } catch (error) {
        console.error("Failed to load creatures from file:", error);
        alert("Error: Could not load creatures from the file. It may be corrupted or in an incorrect format.");
      }
    };
    reader.onerror = () => {
      alert("Error: Failed to read the selected file.");
    };
    reader.readAsText(file);
  };

  const handleConfirmAddCreatures = (creaturesWithNewInitiative: Participant[]) => {
    if (currentIndex > -1 && sortedParticipants[currentIndex]) {
        setParticipantToFind(sortedParticipants[currentIndex].id);
    }

    const newCreaturesWithIds = creaturesWithNewInitiative.map((c, index) => ({
        ...c,
        id: `${Date.now()}-${c.name}-${index}` // More robust ID
    }));

    const newTotalParticipants = [...participants, ...newCreaturesWithIds];

    if (currentIndex > -1) { // Only check for ties if combat is already running
        const tiesToResolve = findTies(newTotalParticipants);
        if (tiesToResolve.length > 0) {
            setParticipants(newTotalParticipants);
            setTies(tiesToResolve);
            setCreaturesToAdd(null);
            return;
        }
    }

    setParticipants(newTotalParticipants);
    setCreaturesToAdd(null);
  };

  const handleConfirmLoadAsIs = (stateToLoad: SavedState) => {
    setParticipants(stateToLoad.participants);
    setCurrentIndex(stateToLoad.currentIndex);
    setRound(stateToLoad.round);
    setCombatLog(stateToLoad.combatLog || []);
    setLoadedStateForReroll(null);
  };

  const handleConfirmUpdateInitiative = (updatedParticipants: Participant[]) => {
      setParticipants(updatedParticipants);
      setCurrentIndex(-1);
      setRound(0);
      setCombatLog([]);
      setLoadedStateForReroll(null);
  };

  const handleCancelLoad = () => {
      setLoadedStateForReroll(null);
  };

  const handleResolveTies = (updatedParticipantsFromModal: Participant[]) => {
    const updatedMap = new Map(updatedParticipantsFromModal.map(p => [p.id, p]));
    setParticipants(prev => prev.map(p => updatedMap.get(p.id) || p));
    setTies(null);

    // If combat wasn't started, start it now.
    if (currentIndex === -1 && round === 0) {
      handleStart();
    }
  };

  const handleOpenPlayerView = () => {
    const baseUrl = window.location.href.split('#')[0].split('?')[0];
    const playerUrl = `${baseUrl}#player`;
    window.open(playerUrl, '_blank');
  };

  // Grouping Logic
  const handleGroupParticipants = (ids: string[]) => {
      if (ids.length < 2) return;
      const groupId = `${Date.now()}-group`;
      const color = getRandomColor();
      
      // Determine Shared Initiative: Use the initiative of the first participant in the selected list (or sort them first)
      const firstP = participants.find(p => p.id === ids[0]);
      const sharedInitiative = firstP ? firstP.initiative : 0;
      const groupName = firstP ? `${firstP.name} Group` : 'Group';

      setParticipants(prev => prev.map(p => {
          if (ids.includes(p.id)) {
              return {
                  ...p,
                  initiative: sharedInitiative, // Sync initiative
                  group: { id: groupId, name: groupName, color }
              };
          }
          return p;
      }));
  };
  
  const handleUngroupParticipants = (ids: string[]) => {
       setParticipants(prev => prev.map(p => {
          if (ids.includes(p.id)) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { group, ...rest } = p;
              return rest;
          }
          return p;
      }));
  };

  if (isPlayerView) {
    return <PlayerView participants={participants} currentIndex={currentIndex} round={round} />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-medieval text-amber-500 flex items-center justify-center gap-4">
            <D20Icon className="w-12 h-12" />
            Encounter Tracker
            <D20Icon className="w-12 h-12" />
          </h1>
          <p className="text-stone-400 mt-2">The battle awaits. May the dice be ever in your favor.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <InitiativeList
              participants={sortedParticipants}
              currentIndex={currentIndex}
              onRemove={handleRemoveParticipant}
              onUpdateParticipant={handleUpdateParticipant}
              onAddCondition={handleAddCondition}
              onRemoveCondition={handleRemoveCondition}
              onViewDetails={setDetailsToShow}
              onLoot={setLootingParticipant}
              onGroup={handleGroupParticipants}
              onUngroup={handleUngroupParticipants}
            />
            <CombatLog entries={combatLog} />
          </div>

          <div className="space-y-8">
            <CombatControls
              round={round}
              isCombatStarted={currentIndex > -1}
              onStart={handleStart}
              onNext={handleNext}
              onPrev={handlePrev}
              onEnd={handleEndCombat}
              onReset={handleResetCombat}
              onClear={handleClearInitiative}
              onOpenPlayerView={handleOpenPlayerView}
              hasParticipants={participants.length > 0}
            />
            <EncounterDifficulty participants={participants} />
            <AddParticipantForm onAdd={handleAddParticipant} />
            <SaveLoadControls 
              onSave={handleSaveState}
              onLoad={handleLoadState}
              onAddFromFile={handleAddCreaturesFromFile}
              hasParticipants={participants.length > 0}
            />
          </div>
        </div>
      </div>
       {detailsToShow?.url && (
        <StatblockModal 
          url={detailsToShow.url}
          title={detailsToShow.title}
          onClose={() => setDetailsToShow(null)}
        />
      )}
      {detailsToShow?.description && (
        <DescriptionViewerModal
          description={detailsToShow.description}
          title={detailsToShow.title}
          onClose={() => setDetailsToShow(null)}
        />
      )}
      {loadedStateForReroll && (
        <RerollInitiativeModal
          loadedState={loadedStateForReroll}
          onConfirmLoadAsIs={handleConfirmLoadAsIs}
          onConfirmUpdateInitiative={handleConfirmUpdateInitiative}
          onClose={handleCancelLoad}
        />
      )}
      {creaturesToAdd && (
        <AddCreaturesModal
            creatures={creaturesToAdd}
            onConfirm={handleConfirmAddCreatures}
            onClose={() => setCreaturesToAdd(null)}
        />
      )}
      {lootingParticipant && (
        <LootModal 
          participant={lootingParticipant}
          onClose={() => setLootingParticipant(null)}
        />
      )}
      {ties && (
        <TieBreakerModal
            ties={ties}
            onResolve={handleResolveTies}
            onClose={() => setTies(null)}
        />
      )}
    </div>
  );
};

export default App;
