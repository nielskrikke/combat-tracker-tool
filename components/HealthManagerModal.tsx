import React, { useState } from 'react';
import type { Participant } from '../types';
import { HeartMinusIcon, HeartPlusIcon, TempHpIcon, MaxHpIcon, CloseIcon } from './icons';

interface HealthManagerModalProps {
  participant: Participant;
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onClose: () => void;
}

const ActionInput: React.FC<{
    Icon: React.ElementType;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onConfirm: () => void;
    buttonText: string;
    colorClass: string;
    placeholder?: string;
}> = ({ Icon, label, value, onChange, onConfirm, buttonText, colorClass, placeholder }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onConfirm();
        }
    };
    
    return (
        <div className="bg-gray-700/50 p-4 rounded-lg">
            <label className="flex items-center gap-2 text-lg font-bold text-gray-200 mb-2">
                <Icon className={`w-6 h-6 ${colorClass}`} />
                {label}
            </label>
            <div className="flex gap-2">
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 transition"
                    placeholder={placeholder || 'Amount'}
                    autoFocus={label === "Damage"} // Autofocus damage input
                />
                <button
                    onClick={onConfirm}
                    className={`px-4 py-2 text-white font-semibold rounded-md transition duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0 bg-${colorClass.split('-')[1]}-600 hover:bg-${colorClass.split('-')[1]}-700`}
                    disabled={!value}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}

export const HealthManagerModal: React.FC<HealthManagerModalProps> = ({ participant, onUpdateParticipant, onClose }) => {
  const [damage, setDamage] = useState('');
  const [heal, setHeal] = useState('');
  const [maxHp, setMaxHp] = useState((participant.maxHp || '').toString());
  const [tempHp, setTempHp] = useState('');

  const handleDamage = () => {
    const damageAmount = parseInt(damage, 10);
    if (isNaN(damageAmount) || damageAmount <= 0) return;

    const currentTempHp = participant.tempHp || 0;
    const currentHp = participant.hp || 0;

    const tempHpDamage = Math.min(currentTempHp, damageAmount);
    const newTempHp = currentTempHp - tempHpDamage;
    
    const remainingDamage = damageAmount - tempHpDamage;
    const newHp = Math.max(0, currentHp - remainingDamage);

    onUpdateParticipant(participant.id, { hp: newHp, tempHp: newTempHp });
    onClose();
  };

  const handleHeal = () => {
    const healAmount = parseInt(heal, 10);
    if (isNaN(healAmount) || healAmount <= 0) return;

    const currentHp = participant.hp || 0;
    const currentMaxHp = participant.maxHp || 0;
    const newHp = Math.min(currentMaxHp, currentHp + healAmount);

    onUpdateParticipant(participant.id, { hp: newHp });
    onClose();
  };

  const handleSetTempHp = () => {
    const tempHpAmount = parseInt(tempHp, 10);
    if (isNaN(tempHpAmount) || tempHpAmount < 0) return;
    
    // Per D&D rules, new Temp HP replaces old unless the old is greater.
    const newTempHp = Math.max(participant.tempHp || 0, tempHpAmount);

    onUpdateParticipant(participant.id, { tempHp: newTempHp });
    onClose();
  };
  
  const handleSetMaxHp = () => {
    const maxHpAmount = parseInt(maxHp, 10);
    if (isNaN(maxHpAmount) || maxHpAmount < 1) return;
    
    // Ensure current HP isn't higher than new max HP
    const newHp = Math.min(participant.hp || 0, maxHpAmount);

    onUpdateParticipant(participant.id, { hp: newHp, maxHp: maxHpAmount });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-600 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-medieval text-yellow-400">
            Health Manager: {participant.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6"/>
          </button>
        </div>
        
        <div className="text-center bg-gray-900/50 p-3 rounded-lg mb-4">
            <span className="text-2xl font-bold text-white">
                {participant.hp}
                {(participant.tempHp ?? 0) > 0 && <span className="text-sky-400"> +{participant.tempHp}</span>}
                / {participant.maxHp} HP
            </span>
        </div>

        <div className="space-y-4">
            <ActionInput 
                Icon={HeartMinusIcon}
                label="Damage"
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
                onConfirm={handleDamage}
                buttonText="Apply"
                colorClass="text-red-400"
            />
            <ActionInput 
                Icon={HeartPlusIcon}
                label="Heal"
                value={heal}
                onChange={(e) => setHeal(e.target.value)}
                onConfirm={handleHeal}
                buttonText="Apply"
                colorClass="text-green-400"
            />
             <ActionInput 
                Icon={TempHpIcon}
                label="Set Temporary HP"
                value={tempHp}
                onChange={(e) => setTempHp(e.target.value)}
                onConfirm={handleSetTempHp}
                buttonText="Set"
                colorClass="text-sky-400"
            />
             <ActionInput 
                Icon={MaxHpIcon}
                label="Set Max HP"
                value={maxHp}
                onChange={(e) => setMaxHp(e.target.value)}
                onConfirm={handleSetMaxHp}
                buttonText="Set"
                colorClass="text-yellow-400"
            />
        </div>
      </div>
    </div>
  );
};
