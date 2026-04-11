
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
        <div className={`col-span-12 mt-3 pt-3 border-t border-white/10 grid grid-cols-1 ${leftColHasItems && rightColHasItems ? 'md:grid-cols-2' : ''} gap-x-6 gap-y-4 text-xs`}>
            {/* Left Column: Vulnerabilities & Resistances */}
            {leftColHasItems && (
                <div>
                    {damageVulnerabilities && damageVulnerabilities.length > 0 && (
                        <div className="mb-3">
                            <h5 className="font-bold text-dnd-red/80 mb-1 uppercase tracking-wider">Vulnerable</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {damageVulnerabilities.map(v => <span key={v} className="px-2 py-1 bg-dnd-red/20 text-dnd-red rounded">{v}</span>)}
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
                            <h5 className="font-bold text-dnd-text/40 mb-1 uppercase tracking-wider">Condition Immune</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {conditionImmunities.map(ci => <span key={ci} className="px-2 py-1 bg-white/5 text-dnd-text/60 rounded">{ci}</span>)}
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
                        className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dnd-dark focus:ring-white rounded-full transition-colors"
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
        <div className="flex flex-col gap-2 p-2 bg-black/40 rounded border border-white/10">
            <div className="flex items-center justify-between gap-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-dnd-text/40 uppercase tracking-tighter">Successes</span>
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                            <button
                                key={i}
                                onClick={() => setSuccess(i)}
                                className={`w-5 h-5 rounded-full border transition-all ${i <= s ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'border-white/10 hover:border-emerald-500/50'}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <span className="text-[10px] font-bold text-dnd-text/40 uppercase tracking-tighter">Failures</span>
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                            <button
                                key={i}
                                onClick={() => setFailure(i)}
                                className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${i <= f ? 'bg-dnd-red border-dnd-red shadow-[0_0_8px_rgba(220,38,38,0.3)]' : 'border-white/10 hover:border-dnd-red/50'}`}
                            >
                                {i <= f && <span className="text-[8px] text-white">💀</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {f >= 3 && <p className="text-[10px] text-dnd-red font-bold text-center uppercase tracking-widest animate-pulse">Deceased</p>}
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
  const hpColorClass = hpPercentage > 50 ? 'bg-emerald-500' : hpPercentage > 25 ? 'bg-dnd-gold' : 'bg-dnd-red';
  
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
    relative grid grid-cols-12 gap-x-3 gap-y-1.5 items-center p-3 transition-all duration-300
    ${isDead ? 'opacity-70' : ''}
    ${isTrulyDead ? 'opacity-50 grayscale' : ''}
  `;
  
  // Group vs Single Styles
  const containerClasses = isInGroup 
    ? `${baseClasses} border-b border-white/5 last:border-0 ${isActive ? 'bg-dnd-gold/5' : ''}`
    : `${baseClasses} rounded-xl bg-dnd-panel/80 backdrop-blur-md border border-white/5 shadow-xl ${isActive ? 'ring-2 ring-dnd-gold/50 shadow-dnd-gold/10' : 'hover:bg-dnd-panel'}`;

  const selectionCheckbox = isSelectionMode ? (
    <div className={`absolute ${isInGroup ? 'left-2' : '-left-3'} top-1/2 -translate-y-1/2 z-10`}>
        <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={onToggleSelection}
            className="h-5 w-5 rounded-full border-white/10 bg-black/20 text-dnd-gold focus:ring-dnd-gold cursor-pointer"
        />
    </div>
  ) : null;

  return (
    <>
      <div className={containerClasses}>
        {selectionCheckbox}
        
        {/* Initiative Column (Hidden if in group) */}
        {!isInGroup ? (
            <div className="col-span-1 text-2xl font-black text-center flex items-center justify-center text-dnd-gold drop-shadow-sm">
                {isEditingInitiative ? (
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={newInitiative}
                            onChange={(e) => setNewInitiative(e.target.value)}
                            onKeyDown={handleInitiativeKeyDown}
                            onBlur={handleInitiativeUpdate}
                            className="w-12 bg-dnd-dark text-dnd-gold text-center rounded-md p-0.5 border border-dnd-gold/30 text-lg font-black"
                            autoFocus
                        />
                        <button onClick={handleInitiativeUpdate} className="p-0.5 text-emerald-400 hover:text-emerald-300 rounded-full">
                            <CheckIcon className="w-4 h-4"/>
                        </button>
                    </div>
                ) : (
                    <div 
                        className="flex items-center justify-center gap-1.5 group cursor-pointer p-0.5 rounded-md"
                        onClick={() => setIsEditingInitiative(true)}
                        title="Click to edit initiative"
                    >
                        <span>{participant.initiative}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-dnd-gold/40">
                            <EditIcon className="w-3 h-3" />
                        </div>
                    </div>
                )}
            </div>
        ) : (
             <div className="hidden"></div>
        )}
        
        {/* Main Content: Name & Status */}
        <div className={`${isInGroup ? 'col-span-5' : 'col-span-4'} flex flex-col`}>
          <div className="flex items-center gap-1.5">
             <span role="img" aria-label={participant.type} className="text-lg">
                {participant.type === 'player' ? '🧑' : participant.type === 'dmpc' ? '🎭' : '🐲'}
             </span>
            <span className={`font-sans font-bold text-lg tracking-tight ${isTrulyDead ? 'line-through text-dnd-text/40' : isDead ? 'text-dnd-red/80' : 'text-white'}`}>
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
                    <BookOpenIcon className="w-4 h-4 text-dnd-text/40 hover:text-dnd-gold transition" />
                </button>
            ) : null}
          </div>
          {isTrulyDead && <span className="text-[9px] text-dnd-red font-black ml-6 uppercase tracking-widest">Deceased</span>}
          {isDead && !isTrulyDead && <span className="text-[9px] text-dnd-red/60 font-black ml-6 uppercase tracking-widest animate-pulse">Unconscious</span>}
          <div className="flex flex-wrap gap-1 mt-0.5 ml-6">
              {participant.conditions.map(condition => (
                  <span key={condition.id} className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-dnd-gold/10 text-dnd-gold border border-dnd-gold/20 rounded">
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
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-dnd-text/60">
                        <span>
                            {currentHp}
                            {tempHp > 0 && <span className="text-sky-400"> +{tempHp}</span>}
                            &nbsp;/ {maxHp}
                        </span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                            className="h-full flex"
                            style={{ width: `${totalBarFillPercentage}%` }}
                            title={`HP: ${currentHp}, Temp HP: ${tempHp}`}
                        >
                            {currentHp > 0 && (
                                <div
                                    className={`${hpColorClass} h-full`}
                                    style={{ width: `${hpSegmentPercentage}%` }}
                                ></div>
                            )}
                            {tempHp > 0 && (
                                <div
                                    className={`bg-sky-400 h-full`}
                                    style={{ width: `${tempHpSegmentPercentage}%` }}
                                ></div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-dnd-text/20 text-[10px] font-black uppercase tracking-widest">HP not tracked</div>
            )}
        </div>

        {/* AC */}
        <div className="col-span-1 flex items-center justify-center gap-1">
          <ShieldIcon className="w-3.5 h-3.5 text-dnd-text/40" />
          <span className="font-mono font-bold text-base text-dnd-text/80">{participant.ac}</span>
        </div>

        {/* Actions */}
        <div className="col-span-3 flex items-center justify-end gap-1">
          {showLootButton ? (
             <button 
                onClick={handleLootClick}
                className="px-2 py-1 bg-dnd-gold text-black font-black text-[9px] uppercase tracking-widest rounded transition-all hover:brightness-110 shadow-lg shadow-dnd-gold/10 flex items-center gap-1"
                aria-label={`Loot ${participant.name}`}
            >
                <LootIcon className="w-2.5 h-2.5" />
                Loot
            </button>
          ) : !isTrulyDead ? (
              <>
                 <button 
                    onClick={() => setIsManagingConditions(true)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-gold rounded transition-all border border-white/5"
                    aria-label={`Manage conditions for ${participant.name}`}
                >
                    <PlusIcon className="w-3.5 h-3.5" />
                </button>
                <button 
                    onClick={() => setIsManagingHealth(true)} 
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-gold rounded transition-all border border-white/5"
                    disabled={!hasHp}
                    aria-label={`Manage health for ${participant.name}`}
                >
                    <HeartIcon className="w-3.5 h-3.5"/>
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
            className={`p-1.5 rounded transition-all border ${
                isConfirmingDelete 
                ? 'bg-dnd-red border-dnd-red text-white' 
                : 'bg-white/5 hover:bg-dnd-red/20 hover:border-dnd-red/40 text-dnd-text/40 hover:text-dnd-red border-white/5'
            }`}
            aria-label={isConfirmingDelete ? `Confirm removal of ${participant.name}` : `Remove ${participant.name}`}
            >
            {isConfirmingDelete ? <CheckIcon className="w-3.5 h-3.5" /> : <TrashIcon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Legendary & Traits Rows */}
        {(hasLegendaryResistances || hasLegendaryActions) && (
            <div className={`col-span-12 mt-3 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 ${isInGroup ? 'pl-2' : ''}`}>
                {hasLegendaryResistances && (
                    <LegendaryTracker
                        label="Legendary Resistances"
                        max={participant.legendaryResistances!}
                        used={participant.legendaryResistancesUsed!}
                        onUpdate={(newUsed) => onUpdateParticipant(participant.id, { legendaryResistancesUsed: newUsed })}
                        Icon={DiamondIcon}
                        colorClass="text-dnd-gold"
                        usedColorClass="text-white/10"
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
                        usedColorClass="text-white/10"
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
