
import React, { useState, useEffect, useRef } from 'react';
import type { Participant, Condition } from '../types';
import { ShieldIcon, HeartIcon, TrashIcon, EditIcon, CheckIcon, PlusIcon, BookOpenIcon, DiamondIcon, StarIcon, LootIcon } from './icons';
import { ConditionManager } from './ConditionManager';
import { HealthManagerModal } from './HealthManagerModal';

interface ParticipantItemProps {
  participant: Participant;
  isActive: boolean;
  isCombatActive: boolean;
  onRemove: (id: string) => void;
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onAddCondition: (participantId: string, condition: Omit<Condition, 'id'>) => void;
  onRemoveCondition: (participantId: string, conditionId: string) => void;
  onViewDetails: (details: { url?: string; description?: string; title: string }) => void;
  onLoot: (participant: Participant) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  isInGroup?: boolean;
}

const TraitGrid: React.FC<{ participant: Participant }> = ({ participant }) => {
    const { damageVulnerabilities, damageResistances, damageImmunities, conditionImmunities } = participant;

    const hasTraits = [damageVulnerabilities, damageResistances, damageImmunities, conditionImmunities].some(arr => arr && arr.length > 0);
    if (!hasTraits) return null;

    const leftColHasItems = (damageVulnerabilities && damageVulnerabilities.length > 0) || (damageResistances && damageResistances.length > 0);
    const rightColHasItems = (damageImmunities && damageImmunities.length > 0) || (conditionImmunities && conditionImmunities.length > 0);

    return (
        <div className={`col-span-12 mt-3 pt-3 border-t border-stone-700/60 grid grid-cols-1 ${leftColHasItems && rightColHasItems ? 'md:grid-cols-2' : ''} gap-x-6 gap-y-4 text-xs`}>
            {/* Left Column: Vulnerabilities & Resistances */}
            {leftColHasItems && (
                <div>
                    {damageVulnerabilities && damageVulnerabilities.length > 0 && (
                        <div className="mb-3">
                            <h5 className="font-bold text-red-400 mb-1 uppercase tracking-wider">Vulnerable</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {damageVulnerabilities.map(v => <span key={v} className="px-2 py-1 bg-red-900/50 text-red-300 rounded">{v}</span>)}
                            </div>
                        </div>
                    )}
                    {damageResistances && damageResistances.length > 0 && (
                        <div>
                            <h5 className="font-bold text-sky-400 mb-1 uppercase tracking-wider">Resistant</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {damageResistances.map(r => <span key={r} className="px-2 py-1 bg-sky-900/50 text-sky-300 rounded">{r}</span>)}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Right Column: Immunities */}
            {rightColHasItems && (
                <div>
                    {damageImmunities && damageImmunities.length > 0 && (
                        <div className="mb-3">
                            <h5 className="font-bold text-violet-400 mb-1 uppercase tracking-wider">Damage Immune</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {damageImmunities.map(i => <span key={i} className="px-2 py-1 bg-violet-900/50 text-violet-300 rounded">{i}</span>)}
                            </div>
                        </div>
                    )}
                    {conditionImmunities && conditionImmunities.length > 0 && (
                        <div>
                            <h5 className="font-bold text-stone-400 mb-1 uppercase tracking-wider">Condition Immune</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {conditionImmunities.map(ci => <span key={ci} className="px-2 py-1 bg-stone-700/50 text-stone-300 rounded">{ci}</span>)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const LegendaryTracker: React.FC<{
    label: string;
    max: number;
    used: number;
    onUpdate: (newUsed: number) => void;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    colorClass: string;
    usedColorClass: string;
}> = ({ label, max, used, onUpdate, Icon, colorClass, usedColorClass }) => {
    
    const toggleUsage = (index: number) => {
        const newUsed = index + 1 === used ? index : index + 1;
        onUpdate(newUsed);
    };

    return (
        <div>
            <h5 className={`font-bold text-sm ${colorClass} uppercase tracking-wider`}>{label}</h5>
            <div className="flex flex-wrap gap-1.5 mt-1">
                {Array.from({ length: max }).map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => toggleUsage(i)}
                        className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-800 focus:ring-white rounded-full transition-colors"
                        aria-label={`${label} ${i + 1} of ${max}. ${i < used ? 'Used' : 'Available'}.`}
                    >
                        <Icon className={`w-6 h-6 ${i < used ? usedColorClass : colorClass}`} />
                    </button>
                ))}
            </div>
        </div>
    );
};

const DeathSaveTracker: React.FC<{
    participant: Participant;
    onUpdate: (updates: Partial<Participant>) => void;
}> = ({ participant, onUpdate }) => {
    const s = participant.deathSavesSuccess || 0;
    const f = participant.deathSavesFailure || 0;

    const setSuccess = (val: number) => onUpdate({ deathSavesSuccess: val === s ? val - 1 : val });
    const setFailure = (val: number) => onUpdate({ deathSavesFailure: val === f ? val - 1 : val });

    return (
        <div className="flex flex-col gap-2 p-2 bg-stone-900/40 rounded border border-stone-700">
            <div className="flex items-center justify-between gap-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-tighter">Successes</span>
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                            <button
                                key={i}
                                onClick={() => setSuccess(i)}
                                className={`w-5 h-5 rounded-full border transition-all ${i <= s ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'border-stone-600 hover:border-emerald-500/50'}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-tighter">Failures</span>
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                            <button
                                key={i}
                                onClick={() => setFailure(i)}
                                className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${i <= f ? 'bg-red-600 border-red-500 shadow-[0_0_8px_rgba(220,38,38,0.3)]' : 'border-stone-600 hover:border-red-500/50'}`}
                            >
                                {i <= f && <span className="text-[8px] text-white">💀</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {f >= 3 && <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest animate-pulse">Deceased</p>}
            {s >= 3 && <p className="text-[10px] text-emerald-500 font-bold text-center uppercase tracking-widest">Stable</p>}
        </div>
    );
};


export const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  isActive,
  isCombatActive,
  onRemove,
  onUpdateParticipant,
  onAddCondition,
  onRemoveCondition,
  onViewDetails,
  onLoot,
  isSelectionMode,
  isSelected,
  onToggleSelection,
  isInGroup
}) => {
  const [isManagingHealth, setIsManagingHealth] = useState(false);
  const [isManagingConditions, setIsManagingConditions] = useState(false);
  const [isEditingInitiative, setIsEditingInitiative] = useState(false);
  const [newInitiative, setNewInitiative] = useState(participant.initiative.toString());
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const confirmDeleteTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isEditingInitiative) {
        setNewInitiative(participant.initiative.toString());
    }
  }, [participant.initiative, isEditingInitiative]);
  
  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
        if (confirmDeleteTimeoutRef.current) {
            clearTimeout(confirmDeleteTimeoutRef.current);
        }
    };
  }, []);

  const handleInitiativeUpdate = () => {
    const initiativeValue = parseInt(newInitiative, 10);
    if (!isNaN(initiativeValue) && initiativeValue !== participant.initiative) {
      onUpdateParticipant(participant.id, { initiative: initiativeValue });
    }
    setIsEditingInitiative(false);
  };

  const handleInitiativeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInitiativeUpdate();
    } else if (e.key === 'Escape') {
      setIsEditingInitiative(false);
      setNewInitiative(participant.initiative.toString());
    }
  };

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
        if (confirmDeleteTimeoutRef.current) {
            clearTimeout(confirmDeleteTimeoutRef.current);
        }
        onRemove(participant.id);
    } else {
        setIsConfirmingDelete(true);
        confirmDeleteTimeoutRef.current = window.setTimeout(() => {
            setIsConfirmingDelete(false);
        }, 3000); // 3 seconds to confirm
    }
  };


  const handleLootClick = () => {
    onLoot(participant);
  };

  const hasHp = typeof participant.hp === 'number' && typeof participant.maxHp === 'number' && participant.maxHp > 0;
  const currentHp = participant.hp ?? 0;
  const maxHp = participant.maxHp ?? 1;
  const tempHp = participant.tempHp ?? 0;

  // HP Bar calculations
  const hpPercentage = hasHp ? (currentHp / maxHp) * 100 : 0;
  const hpColorClass = hpPercentage > 50 ? 'bg-emerald-500' : hpPercentage > 25 ? 'bg-amber-500' : 'bg-red-600';
  
  const totalEffectiveHp = currentHp + tempHp;
  const totalBarFillPercentage = hasHp ? (Math.min(totalEffectiveHp, maxHp) / maxHp) * 100 : 0;

  const hpSegmentPercentage = totalEffectiveHp > 0 ? (currentHp / totalEffectiveHp) * 100 : 0;
  const tempHpSegmentPercentage = totalEffectiveHp > 0 ? (tempHp / totalEffectiveHp) * 100 : 0;

  const isDead = typeof participant.hp === 'number' && participant.hp <= 0;
  const isTrulyDead = isDead && (participant.isInstantDead || (participant.deathSavesFailure && participant.deathSavesFailure >= 3));
  
  const hasLegendaryResistances = participant.type !== 'player' && participant.legendaryResistances && participant.legendaryResistances > 0;
  const hasLegendaryActions = participant.type !== 'player' && participant.legendaryActions && participant.legendaryActions > 0;
  const showLootButton = !isCombatActive && isDead && (participant.type === 'creature' || participant.type === 'dmpc');

  const detailsUrl = participant.characterSheetUrl || participant.statblockUrl;
  const hasDetails = detailsUrl || participant.description;
  
  // Style calculations
  const baseClasses = `
    relative grid grid-cols-12 gap-x-4 gap-y-2 items-center p-3 transition-all duration-300
    ${isDead ? 'opacity-70' : ''}
    ${isTrulyDead ? 'opacity-50 grayscale' : ''}
  `;
  
  // Group vs Single Styles
  const containerClasses = isInGroup 
    ? `${baseClasses} border-b border-stone-700/50 last:border-0 ${isActive ? 'bg-amber-900/20' : ''}`
    : `${baseClasses} rounded-lg ${isActive ? 'bg-stone-700/80 ring-2 ring-amber-500' : 'bg-stone-800/50 hover:bg-stone-700/80'}`;

  const selectionCheckbox = isSelectionMode ? (
    <div className={`absolute ${isInGroup ? 'left-2' : '-left-3'} top-1/2 -translate-y-1/2 z-10`}>
        <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={onToggleSelection}
            className="h-5 w-5 rounded-full border-stone-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
        />
    </div>
  ) : null;

  return (
    <>
      <div className={containerClasses}>
        {selectionCheckbox}
        
        {/* Initiative Column (Hidden if in group) */}
        {!isInGroup ? (
            <div className="col-span-1 text-2xl font-bold text-center flex items-center justify-center">
                {isEditingInitiative ? (
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={newInitiative}
                            onChange={(e) => setNewInitiative(e.target.value)}
                            onKeyDown={handleInitiativeKeyDown}
                            onBlur={handleInitiativeUpdate}
                            className="w-16 bg-stone-900 text-white text-center rounded-md p-1 border border-stone-600 text-xl"
                            autoFocus
                        />
                        <button onClick={handleInitiativeUpdate} className="p-1 text-emerald-400 hover:text-emerald-300 rounded-full">
                            <CheckIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ) : (
                    <div 
                        className="flex items-center justify-center gap-2 group cursor-pointer p-1 rounded-md"
                        onClick={() => setIsEditingInitiative(true)}
                        title="Click to edit initiative"
                    >
                        <span>{participant.initiative}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400">
                            <EditIcon className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </div>
        ) : (
             <div className="hidden"></div>
        )}
        
        {/* Main Content: Name & Status */}
        <div className={`${isInGroup ? 'col-span-5' : 'col-span-4'} flex flex-col`}>
          <div className="flex items-center gap-2">
             <span role="img" aria-label={participant.type} className="text-xl">
                {participant.type === 'player' ? '🧑' : participant.type === 'dmpc' ? '🎭' : '🐲'}
             </span>
            <span className={`font-bold text-lg ${isTrulyDead ? 'line-through text-stone-400' : isDead ? 'text-red-300' : 'text-white'}`}>
                {participant.name}
            </span>
             {hasDetails ? (
                <button 
                    onClick={() => {
                      if (participant.description) {
                        onViewDetails({ description: participant.description, title: `${participant.name}'s Description` });
                      } else if (detailsUrl) {
                        onViewDetails({ url: detailsUrl, title: `${participant.name}'s Sheet` });
                      }
                    }}
                    title={participant.description ? 'View Description' : (participant.characterSheetUrl ? 'View Character Sheet' : 'View Statblock')}
                >
                    <BookOpenIcon className="w-5 h-5 text-stone-400 hover:text-amber-400 transition" />
                </button>
            ) : null}
          </div>
          {isTrulyDead && <span className="text-[10px] text-red-500 font-bold ml-7 uppercase tracking-widest">Deceased</span>}
          {isDead && !isTrulyDead && <span className="text-[10px] text-red-400 font-bold ml-7 uppercase tracking-widest animate-pulse">Unconscious</span>}
          <div className="flex flex-wrap gap-1 mt-1 ml-7">
              {participant.conditions.map(condition => (
                  <span key={condition.id} className="px-2 py-0.5 text-xs bg-violet-800 text-violet-100 rounded-full">
                      {condition.name} {condition.duration !== Infinity && `(${condition.duration})`}
                  </span>
              ))}
          </div>
        </div>

        {/* HP Bar or Death Saves */}
        <div className="col-span-3 flex flex-col justify-center">
            {isDead && (participant.type === 'player' || participant.type === 'dmpc') ? (
                <DeathSaveTracker 
                    participant={participant} 
                    onUpdate={(u) => onUpdateParticipant(participant.id, u)} 
                />
            ) : hasHp ? (
                <>
                    <div className="flex items-center gap-2 text-sm">
                        <span>
                            {currentHp}
                            {tempHp > 0 && <span className="text-sky-400 font-bold"> +{tempHp}</span>}
                            &nbsp;/ {maxHp}
                        </span>
                    </div>
                    <div className="w-full bg-stone-900 rounded-full h-2.5 mt-1">
                        <div
                            className="h-2.5 flex"
                            style={{ width: `${totalBarFillPercentage}%` }}
                            title={`HP: ${currentHp}, Temp HP: ${tempHp}`}
                        >
                            {currentHp > 0 && (
                                <div
                                    className={`${hpColorClass} h-full ${tempHp <= 0 ? 'rounded-full' : 'rounded-l-full'}`}
                                    style={{ width: `${hpSegmentPercentage}%` }}
                                ></div>
                            )}
                            {tempHp > 0 && (
                                <div
                                    className={`bg-sky-400 h-full ${currentHp <= 0 ? 'rounded-full' : 'rounded-r-full'}`}
                                    style={{ width: `${tempHpSegmentPercentage}%` }}
                                ></div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-stone-500 text-sm">HP not tracked</div>
            )}
        </div>

        {/* AC */}
        <div className="col-span-1 flex items-center justify-center gap-1">
          <ShieldIcon className="w-5 h-5 text-sky-400" />
          <span className="font-bold text-lg">{participant.ac}</span>
        </div>

        {/* Actions */}
        <div className="col-span-3 flex items-center justify-end gap-1">
          {showLootButton ? (
             <button 
                onClick={handleLootClick}
                className="p-2 bg-amber-700/80 hover:bg-amber-600 text-white font-bold text-sm rounded-md transition flex items-center gap-1"
                aria-label={`Loot ${participant.name}`}
            >
                <LootIcon className="w-4 h-4" />
                Loot
            </button>
          ) : !isTrulyDead ? (
              <>
                 <button 
                    onClick={() => setIsManagingConditions(true)}
                    className="p-2 bg-stone-600 hover:bg-stone-500 text-white rounded-md transition"
                    aria-label={`Manage conditions for ${participant.name}`}
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setIsManagingHealth(true)} 
                    className="p-2 bg-stone-600 hover:bg-stone-500 text-white rounded-md transition"
                    disabled={!hasHp}
                    aria-label={`Manage health for ${participant.name}`}
                >
                    <HeartIcon className="w-4 h-4"/>
                </button>
              </>
          ) : null}
          <button
            onClick={handleDeleteClick}
            onBlur={() => {
                if (isConfirmingDelete) {
                    if (confirmDeleteTimeoutRef.current) clearTimeout(confirmDeleteTimeoutRef.current);
                    setIsConfirmingDelete(false);
                }
            }}
            className={`p-2 rounded-md transition ${
                isConfirmingDelete 
                ? 'bg-red-700 text-white' 
                : 'bg-stone-600 hover:bg-red-700 text-white'
            }`}
            aria-label={isConfirmingDelete ? `Confirm removal of ${participant.name}` : `Remove ${participant.name}`}
            >
            {isConfirmingDelete ? <CheckIcon className="w-4 h-4" /> : <TrashIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Legendary & Traits Rows */}
        {(hasLegendaryResistances || hasLegendaryActions) && (
            <div className={`col-span-12 mt-3 pt-3 border-t border-stone-700/60 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 ${isInGroup ? 'pl-2' : ''}`}>
                {hasLegendaryResistances && (
                    <LegendaryTracker
                        label="Legendary Resistances"
                        max={participant.legendaryResistances!}
                        used={participant.legendaryResistancesUsed!}
                        onUpdate={(newUsed) => onUpdateParticipant(participant.id, { legendaryResistancesUsed: newUsed })}
                        Icon={DiamondIcon}
                        colorClass="text-amber-400"
                        usedColorClass="text-stone-600"
                    />
                )}
                {hasLegendaryActions && (
                    <LegendaryTracker
                        label="Legendary Actions"
                        max={participant.legendaryActions!}
                        used={participant.legendaryActionsUsed!}
                        onUpdate={(newUsed) => onUpdateParticipant(participant.id, { legendaryActionsUsed: newUsed })}
                        Icon={StarIcon}
                        colorClass="text-sky-400"
                        usedColorClass="text-stone-600"
                    />
                )}
            </div>
        )}

        {(participant.type === 'creature' || participant.type === 'dmpc') && <TraitGrid participant={participant} />}
      </div>
      
      {/* Modals */}
      {isManagingConditions && (
        <ConditionManager
          participant={participant}
          onAdd={(condition) => onAddCondition(participant.id, condition)}
          onRemove={(conditionId) => onRemoveCondition(participant.id, conditionId)}
          onClose={() => setIsManagingConditions(false)}
        />
      )}
      {isManagingHealth && (
        <HealthManagerModal
            participant={participant}
            onUpdateParticipant={onUpdateParticipant}
            onClose={() => setIsManagingHealth(false)}
        />
      )}
    </>
  );
};
