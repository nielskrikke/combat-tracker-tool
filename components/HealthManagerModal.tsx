
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
    iconColorClass: string;
    buttonColorClass: string;
    placeholder?: string;
}> = ({ Icon, label, value, onChange, onConfirm, buttonText, iconColorClass, buttonColorClass, placeholder }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onConfirm();
        }
    };
    
    return (
        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-dnd-text/40 mb-3 ml-1">
                <Icon className={`w-4 h-4 ${iconColorClass}`} />
                {label}
            </label>
            <div className="flex gap-2">
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-dnd-text focus:ring-2 focus:ring-dnd-gold/50 transition-all font-mono text-center"
                    placeholder={placeholder || 'Amount'}
                    autoFocus={label === "Damage"} // Autofocus damage input
                />
                <button
                    onClick={onConfirm}
                    className={`px-6 py-2 text-black font-black uppercase tracking-widest text-[10px] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${buttonColorClass}`}
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
    const currentMaxHp = participant.maxHp || 0;

    const tempHpDamage = Math.min(currentTempHp, damageAmount);
    const newTempHp = currentTempHp - tempHpDamage;
    
    const remainingDamage = damageAmount - tempHpDamage;
    const newHp = Math.max(0, currentHp - remainingDamage);

    // Instant Death rule: If remaining damage (after temp hp) reduces you to 0 HP
    // and the leftover damage equals or exceeds your HP maximum.
    const excessDamage = remainingDamage - currentHp;
    const isInstantDead = excessDamage >= currentMaxHp && (participant.type === 'player' || participant.type === 'dmpc');

    onUpdateParticipant(participant.id, { 
        hp: newHp, 
        tempHp: newTempHp, 
        isInstantDead: isInstantDead || participant.isInstantDead 
    });
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
            Vitality
          </h3>
          <button onClick={onClose} className="p-2 text-dnd-text/40 hover:text-dnd-gold rounded-full hover:bg-white/5 transition-all">
            <CloseIcon className="w-6 h-6"/>
          </button>
        </div>
        
        <p className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40 mb-4 ml-1">Managing {participant.name}</p>

        <div className="text-center bg-black/20 p-6 rounded-2xl mb-8 border border-white/5 shadow-inner">
            <span className="text-3xl font-sans font-black text-dnd-text tracking-tight">
                {participant.hp}
                {(participant.tempHp ?? 0) > 0 && <span className="text-sky-400"> +{participant.tempHp}</span>}
                <span className="text-dnd-text/20 mx-2">/</span>
                {participant.maxHp} <span className="text-sm font-black uppercase tracking-widest text-dnd-text/40 ml-1">HP</span>
            </span>
        </div>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            <ActionInput 
                Icon={HeartMinusIcon}
                label="Damage"
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
                onConfirm={handleDamage}
                buttonText="Strike"
                iconColorClass="text-dnd-red"
                buttonColorClass="bg-dnd-red hover:bg-dnd-red/80 text-white"
            />
            <ActionInput 
                Icon={HeartPlusIcon}
                label="Heal"
                value={heal}
                onChange={(e) => setHeal(e.target.value)}
                onConfirm={handleHeal}
                buttonText="Mend"
                iconColorClass="text-emerald-400"
                buttonColorClass="bg-emerald-500 hover:bg-emerald-400 text-black"
            />
             <ActionInput 
                Icon={TempHpIcon}
                label="Temporary HP"
                value={tempHp}
                onChange={(e) => setTempHp(e.target.value)}
                onConfirm={handleSetTempHp}
                buttonText="Fortify"
                iconColorClass="text-sky-400"
                buttonColorClass="bg-sky-500 hover:bg-sky-400 text-black"
            />
             <ActionInput 
                Icon={MaxHpIcon}
                label="Max HP"
                value={maxHp}
                onChange={(e) => setMaxHp(e.target.value)}
                onConfirm={handleSetMaxHp}
                buttonText="Alter"
                iconColorClass="text-dnd-gold"
                buttonColorClass="bg-dnd-gold hover:bg-dnd-gold/80 text-black"
            />
        </div>
      </div>
    </div>
  );
};
