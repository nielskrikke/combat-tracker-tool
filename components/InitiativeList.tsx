import React from 'react';
import { ParticipantItem } from './ParticipantItem';
import type { Participant, Condition } from '../types';

interface InitiativeListProps {
  participants: Participant[];
  currentIndex: number;
  onRemove: (id: string) => void;
  onUpdateHp: (id: string, newHp: number) => void;
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onAddCondition: (participantId: string, condition: Omit<Condition, 'id'>) => void;
  onRemoveCondition: (participantId: string, conditionId: string) => void;
  onViewDetails: (details: { url: string; title: string }) => void;
  onLoot: (participant: Participant) => void;
}

export const InitiativeList: React.FC<InitiativeListProps> = ({
  participants,
  currentIndex,
  onRemove,
  onUpdateHp,
  onUpdateParticipant,
  onAddCondition,
  onRemoveCondition,
  onViewDetails,
  onLoot,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
       <div className="grid grid-cols-12 gap-4 px-4 py-2 text-gray-400 font-bold uppercase text-sm border-b-2 border-gray-700 mb-2">
            <div className="col-span-1">Init</div>
            <div className="col-span-4">Name</div>
            <div className="col-span-3">HP</div>
            <div className="col-span-1">AC</div>
            <div className="col-span-3 text-right">Actions</div>
        </div>
      {participants.length > 0 ? (
        <ul className="space-y-3">
          {participants.map((p, index) => (
            <ParticipantItem
              key={p.id}
              participant={p}
              isActive={index === currentIndex}
              isCombatActive={currentIndex > -1}
              onRemove={onRemove}
              onUpdateHp={onUpdateHp}
              onUpdateParticipant={onUpdateParticipant}
              onAddCondition={onAddCondition}
              onRemoveCondition={onRemoveCondition}
              onViewDetails={onViewDetails}
              onLoot={onLoot}
            />
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">No combatants have joined the fray.</p>
          <p className="mt-2">Use the form to add characters and monsters.</p>
        </div>
      )}
    </div>
  );
};
