
import React, { useState } from 'react';
import type { Participant, Condition } from '../types';
import { PlusCircleIcon, TrashIcon } from './icons';

interface ConditionManagerProps {
  participant: Participant;
  onAdd: (condition: Omit<Condition, 'id'>) => void;
  onRemove: (conditionId: string) => void;
  onClose: () => void;
}

const categorizedConditions = {
    "Official Conditions": [
      "Blinded", "Charmed", "Deafened", "Exhaustion", "Frightened", "Grappled",
      "Incapacitated", "Invisible", "Paralyzed", "Petrified", "Poisoned",
      "Prone", "Restrained", "Stunned", "Unconscious"
    ],
    "Common Spell Effects": [
      "Bane",
      "Blessed",
      "Enlarged",
      "Faerie Fire",
      "Fly",
      "Guidance",
      "Haste",
      "Hex",
      "Hunter's Mark",
      "Mage Armor",
      "Reduced",
      "Shield of Faith",
      "Slowed"
    ],
    "Temporary Defenses": [
        "Resistance to Acid",
        "Resistance to Cold",
        "Resistance to Fire",
        "Resistance to Force",
        "Resistance to Lightning",
        "Resistance to Necrotic",
        "Resistance to Poison",
        "Resistance to Psychic",
        "Resistance to Radiant",
        "Resistance to Thunder",
        "Resistance to Bludgeoning",
        "Resistance to Piercing",
        "Resistance to Slashing",
        "Vulnerability to Fire",
        "Vulnerability to Cold",
    ]
  };

export const ConditionManager: React.FC<ConditionManagerProps> = ({
  participant,
  onAdd,
  onRemove,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('1');
  const [isPermanent, setIsPermanent] = useState(false);

  const isConcentrating = participant.conditions.some(c => c.name === 'Concentrating');

  const handleConcentrationToggle = () => {
    if (isConcentrating) {
      const concentrationCondition = participant.conditions.find(c => c.name === 'Concentrating');
      if (concentrationCondition) {
        onRemove(concentrationCondition.id);
      }
    } else {
      onAdd({
        name: 'Concentrating',
        duration: Infinity,
      });
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAdd({
      name,
      duration: isPermanent ? Infinity : parseInt(duration, 10) || 1,
    });
    setName('');
    setDuration('1');
    setIsPermanent(false);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-stone-800 rounded-lg shadow-xl p-6 border border-stone-700 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-medieval text-white">
                Conditions for {participant.name}
            </h3>
            <button onClick={onClose} className="text-stone-400 text-3xl leading-none hover:text-white">&times;</button>
        </div>

        {/* Current Conditions */}
        <div className="mb-6 max-h-40 overflow-y-auto pr-2">
            <h4 className="text-lg font-bold text-stone-300 mb-2">Active Conditions</h4>
            {participant.conditions.length > 0 ? (
                <ul className="space-y-2">
                    {participant.conditions.map(c => (
                        <li key={c.id} className="flex justify-between items-center bg-stone-700 p-2 rounded-md">
                            <span>
                                {c.name}
                                <span className="text-stone-400 ml-2">
                                    ({c.duration === Infinity ? 'Permanent' : `${c.duration} rounds left`})
                                </span>
                            </span>
                            <button onClick={() => onRemove(c.id)} className="p-1 text-red-400 hover:text-red-300">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-stone-500">No active conditions.</p>
            )}
        </div>

        {/* Add Condition Form */}
        <div>
            <h4 className="text-lg font-bold text-stone-300 mb-3">Add Status / Condition</h4>
            
            <div className="flex items-center bg-stone-700 p-3 rounded-md mb-4">
                <input
                    id="concentration-status"
                    type="checkbox"
                    checked={isConcentrating}
                    onChange={handleConcentrationToggle}
                    className="h-5 w-5 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="concentration-status" className="ml-3 block text-md font-medium text-white">
                    Is Concentrating?
                </label>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
                <div>
                    <label htmlFor="condition-name" className="block text-sm font-medium text-stone-400 mb-1">Condition Name</label>
                    <input
                        id="condition-name"
                        type="text"
                        list="conditions-list"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g. Blessed"
                    />
                    <datalist id="conditions-list">
                        {Object.entries(categorizedConditions).map(([category, conditions]) => (
                            <optgroup key={category} label={category}>
                                {conditions.map(c => <option key={c} value={c} />)}
                            </optgroup>
                        ))}
                    </datalist>
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                        <label htmlFor="condition-duration" className="block text-sm font-medium text-stone-400 mb-1">Duration (rounds)</label>
                        <input
                            id="condition-duration"
                            type="number"
                            min="1"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-stone-900/50 border border-stone-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 disabled:bg-stone-600"
                            disabled={isPermanent}
                        />
                    </div>
                    <div className="flex items-center h-full pb-2">
                        <input
                            id="condition-permanent"
                            type="checkbox"
                            checked={isPermanent}
                            onChange={(e) => setIsPermanent(e.target.checked)}
                            className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor="condition-permanent" className="ml-2 block text-sm text-stone-300">Permanent</label>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!name}
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Add Condition
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
