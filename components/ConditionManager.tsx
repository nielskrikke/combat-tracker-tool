
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-dnd-panel rounded-2xl shadow-2xl p-8 border border-white/10 w-full max-w-md m-4 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dnd-gold to-transparent opacity-50"></div>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em]">
                Conditions
            </h3>
            <button onClick={onClose} className="p-2 text-dnd-text/40 hover:text-dnd-gold rounded-full hover:bg-white/5 transition-all text-2xl leading-none">&times;</button>
        </div>

        <p className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40 mb-4 ml-1">Managing {participant.name}</p>

        {/* Current Conditions */}
        <div className="mb-8 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/30 mb-3 ml-1">Active Conditions</h4>
            {participant.conditions.length > 0 ? (
                <ul className="space-y-2">
                    {participant.conditions.map(c => (
                        <li key={c.id} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-dnd-text font-sans text-lg">{c.name}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40">
                                    {c.duration === Infinity ? 'Permanent' : `${c.duration} rounds left`}
                                </span>
                            </div>
                            <button onClick={() => onRemove(c.id)} className="p-2 text-dnd-red/60 hover:text-dnd-red transition-colors">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-dnd-text/20 italic font-sans px-1">No active conditions.</p>
            )}
        </div>

        {/* Add Condition Form */}
        <div className="space-y-6">
            <div className="flex items-center bg-black/20 p-4 rounded-xl border border-white/5 group cursor-pointer" onClick={handleConcentrationToggle}>
                <input
                    id="concentration-status"
                    type="checkbox"
                    checked={isConcentrating}
                    onChange={(e) => e.stopPropagation()} // Let the div handle it
                    className="h-6 w-6 rounded border-white/10 bg-black/40 text-dnd-gold focus:ring-dnd-gold/50 cursor-pointer"
                />
                <label htmlFor="concentration-status" className="ml-4 block text-lg font-sans text-dnd-text group-hover:text-dnd-gold transition-colors cursor-pointer">
                    Is Concentrating?
                </label>
            </div>

            <form onSubmit={handleAdd} className="space-y-5">
                <div>
                    <label htmlFor="condition-name" className="block text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-2 ml-1">Condition Name</label>
                    <input
                        id="condition-name"
                        type="text"
                        list="conditions-list"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-dnd-text placeholder:text-dnd-text/20 focus:ring-2 focus:ring-dnd-gold/50 transition-all font-sans"
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
                        <label htmlFor="condition-duration" className="block text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-2 ml-1">Duration (rounds)</label>
                        <input
                            id="condition-duration"
                            type="number"
                            min="1"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-dnd-text focus:ring-2 focus:ring-dnd-gold/50 transition-all font-mono text-center disabled:opacity-30"
                            disabled={isPermanent}
                        />
                    </div>
                    <div className="flex items-center h-full pb-3">
                        <label className="flex items-center cursor-pointer group">
                            <input
                                id="condition-permanent"
                                type="checkbox"
                                checked={isPermanent}
                                onChange={(e) => setIsPermanent(e.target.checked)}
                                className="h-5 w-5 rounded border-white/10 bg-black/40 text-dnd-gold focus:ring-dnd-gold/50"
                            />
                            <span className="ml-3 text-xs font-black uppercase tracking-widest text-dnd-text/40 group-hover:text-dnd-gold transition-colors">Permanent</span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center bg-dnd-gold hover:bg-dnd-gold/80 text-black font-black uppercase tracking-[0.2em] text-xs py-4 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
