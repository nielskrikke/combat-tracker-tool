
import React, { useState, useMemo } from 'react';
import { ParticipantItem } from './ParticipantItem';
import type { Participant, Condition, Group } from '../types';
import { UsersIcon, CheckIcon, EditIcon } from './icons';

interface InitiativeListProps {
  participants: Participant[];
  currentIndex: number;
  onRemove: (id: string) => void;
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  onAddCondition: (participantId: string, condition: Omit<Condition, 'id'>) => void;
  onRemoveCondition: (participantId: string, conditionId: string) => void;
  onViewDetails: (details: { url?: string; description?: string; title: string }) => void;
  onLoot: (participant: Participant) => void;
  onGroup: (ids: string[]) => void;
  onUngroup: (ids: string[]) => void;
}

export const InitiativeList: React.FC<InitiativeListProps> = ({
  participants,
  currentIndex,
  onRemove,
  onUpdateParticipant,
  onAddCondition,
  onRemoveCondition,
  onViewDetails,
  onLoot,
  onGroup,
  onUngroup
}) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Group Editing State
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newGroupInitiative, setNewGroupInitiative] = useState('');

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleGroup = () => {
    onGroup(Array.from(selectedIds));
    clearSelection();
  };

  const handleUngroup = () => {
    onUngroup(Array.from(selectedIds));
    clearSelection();
  };
  
  const handleGroupInitiativeUpdate = (groupId: string, initiative: number) => {
      // Find first participant in this group
      const p = participants.find(p => p.group?.id === groupId);
      if (p) {
          // Updating one will propagate to all via App.tsx logic
          onUpdateParticipant(p.id, { initiative });
      }
      setEditingGroupId(null);
  };

  const handleGroupInitKeyDown = (e: React.KeyboardEvent, groupId: string) => {
      if (e.key === 'Enter') {
          const val = parseInt(newGroupInitiative, 10);
          if (!isNaN(val)) {
              handleGroupInitiativeUpdate(groupId, val);
          }
      } else if (e.key === 'Escape') {
          setEditingGroupId(null);
      }
  };

  // Calculate if any selected items are already grouped
  const selectedParticipants = participants.filter(p => selectedIds.has(p.id));
  const hasGroupedItems = selectedParticipants.some(p => !!p.group);

  // Group consecutive items logic
  const groupedItems = useMemo(() => {
    const groups: (Participant | { group: Group, members: Participant[] })[] = [];
    let currentGroup: { group: Group, members: Participant[] } | null = null;

    participants.forEach(p => {
        if (p.group) {
            // Check if matches the current running group
            if (currentGroup && currentGroup.group.id === p.group.id) {
                currentGroup.members.push(p);
            } else {
                // If there was a previous group running, push it
                if (currentGroup) groups.push(currentGroup);
                // Start a new group
                currentGroup = { group: p.group, members: [p] };
            }
        } else {
            // Not in a group
            if (currentGroup) {
                groups.push(currentGroup);
                currentGroup = null;
            }
            groups.push(p);
        }
    });
    // Push remaining group if any
    if (currentGroup) groups.push(currentGroup);
    return groups;
  }, [participants]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-stone-800/80 p-3 rounded-lg border border-stone-700">
        <h2 className="text-2xl font-medieval text-white">Initiative Order</h2>
        <div className="flex gap-2">
            {isSelectionMode ? (
                <>
                   <span className="text-sm text-stone-400 flex items-center mr-2">
                     {selectedIds.size} Selected
                   </span>
                   {selectedIds.size > 1 && (
                      <button 
                        onClick={handleGroup}
                        className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white text-sm rounded-md transition flex items-center gap-1"
                        title="Group Selected"
                      >
                         <UsersIcon className="w-4 h-4" /> Group
                      </button>
                   )}
                   {selectedIds.size > 0 && hasGroupedItems && (
                       <button
                         onClick={handleUngroup}
                         className="px-3 py-1 bg-stone-600 hover:bg-stone-500 text-white text-sm rounded-md transition"
                         title="Ungroup Selected"
                       >
                         Ungroup
                       </button>
                   )}
                   <button 
                     onClick={clearSelection}
                     className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-white text-sm rounded-md transition"
                   >
                     Cancel
                   </button>
                </>
            ) : (
                <button 
                  onClick={() => setIsSelectionMode(true)}
                  className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-white text-sm rounded-md transition flex items-center gap-2"
                  disabled={participants.length === 0}
                >
                   <CheckIcon className="w-4 h-4" /> Select
                </button>
            )}
        </div>
      </div>
      
      {participants.length === 0 ? (
        <div className="text-center py-12 bg-stone-800/30 rounded-lg border-2 border-dashed border-stone-700 text-stone-500">
          <p className="text-lg">The battlefield is empty.</p>
          <p>Add combatants to begin.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {groupedItems.map((item, groupIndex) => {
            // Render Group Container
            // Check for 'members' property to distinguish GroupWrapper from Participant
            if ('members' in item) { 
                const isEditing = editingGroupId === item.group.id;
                const initiative = item.members[0]?.initiative || 0;
                
                return (
                    <li key={`group-${item.group.id}-${groupIndex}`} className={`relative flex border-l-4 rounded-lg bg-stone-800/50 overflow-hidden ${item.group.color}`}>
                         {/* Group Initiative Column */}
                         <div className="w-16 bg-stone-900/40 flex flex-col items-center justify-center border-r border-stone-700 p-2 shrink-0">
                             {isEditing ? (
                                 <input
                                    type="number"
                                    value={newGroupInitiative}
                                    onChange={e => setNewGroupInitiative(e.target.value)}
                                    onKeyDown={e => handleGroupInitKeyDown(e, item.group.id)}
                                    onBlur={() => handleGroupInitiativeUpdate(item.group.id, parseInt(newGroupInitiative, 10))}
                                    className="w-12 text-center bg-stone-800 border border-stone-600 rounded text-white"
                                    autoFocus
                                 />
                             ) : (
                                <div 
                                    className="flex flex-col items-center cursor-pointer group"
                                    onClick={() => {
                                        setNewGroupInitiative(initiative.toString());
                                        setEditingGroupId(item.group.id);
                                    }}
                                    title="Edit Group Initiative"
                                >
                                    <span className="text-2xl font-bold text-white">{initiative}</span>
                                    <EditIcon className="w-4 h-4 text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                                </div>
                             )}
                         </div>

                         {/* Group Members List */}
                         <div className="flex-grow flex flex-col">
                             {item.members.map((participant) => {
                                 // We need to find the actual index in the original array for 'currentIndex' prop
                                 const originalIndex = participants.findIndex(p => p.id === participant.id);
                                 return (
                                     <ParticipantItem
                                        key={participant.id}
                                        participant={participant}
                                        isActive={originalIndex === currentIndex}
                                        isCombatActive={currentIndex > -1}
                                        onRemove={onRemove}
                                        onUpdateParticipant={onUpdateParticipant}
                                        onAddCondition={onAddCondition}
                                        onRemoveCondition={onRemoveCondition}
                                        onViewDetails={onViewDetails}
                                        onLoot={onLoot}
                                        isSelectionMode={isSelectionMode}
                                        isSelected={selectedIds.has(participant.id)}
                                        onToggleSelection={() => toggleSelection(participant.id)}
                                        isInGroup={true}
                                     />
                                 );
                             })}
                         </div>
                    </li>
                );
            } 
            
            // Render Single Participant
            else {
                const originalIndex = participants.findIndex(p => p.id === item.id);
                return (
                    <ParticipantItem
                        key={item.id}
                        participant={item}
                        isActive={originalIndex === currentIndex}
                        isCombatActive={currentIndex > -1}
                        onRemove={onRemove}
                        onUpdateParticipant={onUpdateParticipant}
                        onAddCondition={onAddCondition}
                        onRemoveCondition={onRemoveCondition}
                        onViewDetails={onViewDetails}
                        onLoot={onLoot}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedIds.has(item.id)}
                        onToggleSelection={() => toggleSelection(item.id)}
                    />
                );
            }
          })}
        </ul>
      )}
    </div>
  );
};
