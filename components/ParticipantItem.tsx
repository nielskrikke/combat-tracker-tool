import React, { useState, useEffect } from 'react';
import type { Participant, Condition } from '../types';
import { ShieldIcon, HeartIcon, TrashIcon, EditIcon, CheckIcon, PlusIcon, BookOpenIcon, DiamondIcon, StarIcon, LootIcon } from './icons';
import { ConditionManager } from './ConditionManager';

interface ParticipantItemProps {
  participant: Participant;
  isActive: boolean;
  isCombatActive: boolean;
  onRemove: (id: string) => void;
  onUpdateHp: (id: string, newHp: number) => void;
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onAddCondition: (participantId: string, condition: Omit<Condition, 'id'>) => void;
  onRemoveCondition: (participantId: string, conditionId: string) => void;
  onViewDetails: (details: { url: string; title: string }) => void;
  onLoot: (participant: Participant) => void;
}

const TraitGrid: React.FC<{ participant: Participant }> = ({ participant }) => {
    const { damageVulnerabilities, damageResistances, damageImmunities, conditionImmunities } = participant;

    const hasTraits = [damageVulnerabilities, damageResistances, damageImmunities, conditionImmunities].some(arr => arr && arr.length > 0);
    if (!hasTraits) return null;

    const leftColHasItems = (damageVulnerabilities && damageVulnerabilities.length > 0) || (damageResistances && damageResistances.length > 0);
    const rightColHasItems = (damageImmunities && damageImmunities.length > 0) || (conditionImmunities && conditionImmunities.length > 0);

    return (
        <div className={`col-span-12 mt-3 pt-3 border-t border-gray-700/60 grid grid-cols-1 ${leftColHasItems && rightColHasItems ? 'md:grid-cols-2' : ''} gap-x-6 gap-y-4 text-xs`}>
            {/* Left Column: Vulnerabilities & Resistances */}
            {leftColHasItems && (
                <div>
                    {damageVulnerabilities && damageVulnerabilities.length > 0 && (
                        <div className="mb-3">
                            <h5 className="font-bold text-red-400 mb-1 uppercase tracking-wider">Vulnerable</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {damageVulnerabilities.map(v => <span key={v} className="px-2 py-1 bg-red-900/80 text-red-200 rounded">{v}</span>)}
                            </div>
                        </div>
                    )}
                    {damageResistances && damageResistances.length > 0 && (
                        <div>
                            <h5 className="font-bold text-cyan-400 mb-1 uppercase tracking-wider">Resistant</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {damageResistances.map(r => <span key={r} className="px-2 py-1 bg-cyan-900/80 text-cyan-200 rounded">{r}</span>)}
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
                            <h5 className="font-bold text-purple-400 mb-1 uppercase tracking-wider">Damage Immune</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {damageImmunities.map(i => <span key={i} className="px-2 py-1 bg-purple-900/80 text-purple-200 rounded">{i}</span>)}
                            </div>
                        </div>
                    )}
                    {conditionImmunities && conditionImmunities.length > 0 && (
                        <div>
                            <h5 className="font-bold text-gray-400 mb-1 uppercase tracking-wider">Condition Immune</h5>
                            <div className="flex flex-wrap gap-1.5">
                                {conditionImmunities.map(ci => <span key={ci} className="px-2 py-1 bg-gray-600/80 text-gray-200 rounded">{ci}</span>)}
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
                        className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white rounded-full transition-colors"
                        aria-label={`${label} ${i + 1} of ${max}. ${i < used ? 'Used' : 'Available'}.`}
                    >
                        <Icon className={`w-6 h-6 ${i < used ? usedColorClass : colorClass}`} />
                    </button>
                ))}
            </div>
        </div>
    );
};


export const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  isActive,
  isCombatActive,
  onRemove,
  onUpdateHp,
  onUpdateParticipant,
  onAddCondition,
  onRemoveCondition,
  onViewDetails,
  onLoot,
}) => {
  const [isEditingHp, setIsEditingHp] = useState(false);
  const [currentHp, setCurrentHp] = useState(participant.hp ?? 0);
  const [isManagingConditions, setIsManagingConditions] = useState(false);
  const [isEditingInitiative, setIsEditingInitiative] = useState(false);
  const [newInitiative, setNewInitiative] = useState(participant.initiative.toString());

  useEffect(() => {
    setCurrentHp(participant.hp ?? 0);
  }, [participant.hp]);

  useEffect(() => {
    if (!isEditingInitiative) {
        setNewInitiative(participant.initiative.toString());
    }
  }, [participant.initiative, isEditingInitiative]);


  const handleHpUpdate = () => {
    onUpdateHp(participant.id, currentHp);
    setIsEditingHp(false);
  };
  
  const handleHpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleHpUpdate();
    }
  };

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

  const handleLootClick = () => {
    onLoot(participant);
  };

  const hasHp = typeof participant.hp === 'number' && typeof participant.maxHp === 'number' && participant.maxHp > 0;
  const hpPercentage = hasHp ? (participant.hp / participant.maxHp) * 100 : 0;
  const hpColorClass = hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-600';

  const isDead = typeof participant.hp === 'number' && participant.hp <= 0;

  const hasLegendaryResistances = participant.type !== 'player' && participant.legendaryResistances && participant.legendaryResistances > 0;
  const hasLegendaryActions = participant.type !== 'player' && participant.legendaryActions && participant.legendaryActions > 0;

  const showLootButton = !isCombatActive && isDead && (participant.type === 'creature' || participant.type === 'dmpc');


  return (
    <>
      <li
        className={`
          grid grid-cols-12 gap-x-4 gap-y-2 items-center p-3 rounded-lg transition-all duration-300
          ${isActive ? 'bg-yellow-900/50 ring-2 ring-yellow-400' : 'bg-gray-700/50 hover:bg-gray-700'}
          ${isDead ? 'opacity-50' : ''}
        `}
      >
        <div className="col-span-1 text-2xl font-bold text-center flex items-center justify-center">
            {isEditingInitiative ? (
                 <div className="flex items-center gap-1">
                    <input
                        type="number"
                        value={newInitiative}
                        onChange={(e) => setNewInitiative(e.target.value)}
                        onKeyDown={handleInitiativeKeyDown}
                        onBlur={handleInitiativeUpdate}
                        className="w-16 bg-gray-900 text-white text-center rounded-md p-1 border border-gray-500 text-xl"
                        autoFocus
                    />
                    <button onClick={handleInitiativeUpdate} className="p-1 text-green-400 hover:text-green-300 rounded-full">
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
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                        <EditIcon className="w-4 h-4" />
                    </div>
                </div>
            )}
        </div>
        <div className="col-span-4 flex flex-col">
          <div className="flex items-center gap-2">
             <span role="img" aria-label={participant.type} className="text-xl">
                {participant.type === 'player' ? '🧑' : participant.type === 'dmpc' ? '🎭' : '🐲'}
             </span>
            <span className={`font-bold text-lg ${isDead ? 'line-through text-gray-400' : 'text-white'}`}>
                {participant.name}
            </span>
             {(participant.statblockUrl || participant.characterSheetUrl) ? (
                <button 
                    onClick={() => {
                      const url = participant.characterSheetUrl || participant.statblockUrl;
                      if (url) {
                        onViewDetails({ url, title: `${participant.name}'s Sheet` });
                      }
                    }}
                    title={participant.characterSheetUrl ? 'View Character Sheet' : 'View Statblock'}
                >
                    <BookOpenIcon className="w-5 h-5 text-gray-400 hover:text-yellow-400 transition" />
                </button>
            ) : null}
          </div>
          {isDead && <span className="text-xs text-red-500 font-bold ml-7">DEFEATED</span>}
          <div className="flex flex-wrap gap-1 mt-1 ml-7">
              {participant.conditions.map(condition => (
                  <span key={condition.id} className="px-2 py-0.5 text-xs bg-indigo-600 text-indigo-100 rounded-full">
                      {condition.name} {condition.duration !== Infinity && `(${condition.duration})`}
                  </span>
              ))}
          </div>
        </div>

        <div className="col-span-3 flex flex-col justify-center">
            {hasHp ? (
                <>
                    <div className="flex items-center gap-2">
                        <HeartIcon className="w-4 h-4 text-red-400" />
                        <span>{participant.hp} / {participant.maxHp}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2.5 mt-1">
                        <div className={`${hpColorClass} h-2.5 rounded-full`} style={{ width: `${hpPercentage}%` }}></div>
                    </div>
                </>
            ) : (
                <div className="text-gray-500 text-sm">HP not tracked</div>
            )}
        </div>

        <div className="col-span-1 flex items-center justify-center gap-1">
          <ShieldIcon className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-lg">{participant.ac}</span>
        </div>

        <div className="col-span-3 flex items-center justify-end gap-1">
          {showLootButton ? (
             <button 
                onClick={handleLootClick}
                className="p-2 bg-yellow-600/80 hover:bg-yellow-700 text-white font-bold text-sm rounded-md transition flex items-center gap-1"
                aria-label={`Loot ${participant.name}`}
            >
                <LootIcon className="w-4 h-4" />
                Loot
            </button>
          ) : !isDead ? (
              <>
                 <button 
                    onClick={() => setIsManagingConditions(true)}
                    className="p-2 bg-indigo-600/80 hover:bg-indigo-700 text-white rounded-md transition"
                    aria-label={`Manage conditions for ${participant.name}`}
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
                {isEditingHp && hasHp ? (
                    <div className="flex items-center">
                        <input 
                            type="number"
                            value={currentHp}
                            onChange={(e) => setCurrentHp(parseInt(e.target.value, 10))}
                            onKeyDown={handleHpKeyDown}
                            className="w-20 bg-gray-900 text-white text-center rounded-l-md p-1 border border-gray-500"
                            autoFocus
                        />
                        <button onClick={handleHpUpdate} className="p-2 bg-green-600 hover:bg-green-700 rounded-r-md">
                            <CheckIcon className="w-4 h-4"/>
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditingHp(true)} className="p-2 bg-gray-600 hover:bg-gray-500 rounded-md" disabled={!hasHp}>
                        <EditIcon className="w-4 h-4"/>
                    </button>
                )}
              </>
          ) : null}
          <button
            onClick={() => onRemove(participant.id)}
            className="p-2 bg-red-800/80 hover:bg-red-700 text-white rounded-md transition"
            aria-label={`Remove ${participant.name}`}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        {(hasLegendaryResistances || hasLegendaryActions) && (
            <div className="col-span-12 mt-3 pt-3 border-t border-gray-700/60 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {hasLegendaryResistances && (
                    <LegendaryTracker
                        label="Legendary Resistances"
                        max={participant.legendaryResistances!}
                        used={participant.legendaryResistancesUsed!}
                        onUpdate={(newUsed) => onUpdateParticipant(participant.id, { legendaryResistancesUsed: newUsed })}
                        Icon={DiamondIcon}
                        colorClass="text-yellow-300"
                        usedColorClass="text-gray-600"
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
                        usedColorClass="text-gray-600"
                    />
                )}
            </div>
        )}

        {(participant.type === 'creature' || participant.type === 'dmpc') && <TraitGrid participant={participant} />}
      </li>
      {isManagingConditions && (
        <ConditionManager
          participant={participant}
          onAdd={(condition) => onAddCondition(participant.id, condition)}
          onRemove={(conditionId) => onRemoveCondition(participant.id, conditionId)}
          onClose={() => setIsManagingConditions(false)}
        />
      )}
    </>
  );
};
