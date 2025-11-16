
import React, { useState } from 'react';
import type { Participant, InventoryItem } from '../types';
import { CloseIcon, LootIcon } from './icons';
import { DescriptionViewerModal } from './DescriptionViewerModal';

interface LootModalProps {
  participant: Participant;
  onClose: () => void;
}

export const LootModal: React.FC<LootModalProps> = ({ participant, onClose }) => {
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loot-modal-title"
      >
        <div
          className="bg-stone-800 rounded-lg shadow-xl p-6 border border-stone-700 w-full max-w-md m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 id="loot-modal-title" className="text-2xl font-medieval text-white flex items-center gap-3">
              <LootIcon className="w-8 h-8" />
              Loot from {participant.name}
            </h3>
            <button onClick={onClose} className="text-stone-400 text-3xl leading-none hover:text-white">&times;</button>
          </div>
          
          <div className="my-4 border-t border-stone-700"></div>

          {(!participant.inventory || participant.inventory.length === 0) ? (
            <p className="text-stone-400 text-center py-4">This combatant has no loot.</p>
          ) : (
            <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {participant.inventory.map((item, index) => (
                <li key={index} className="bg-stone-700 p-3 rounded-md flex justify-between items-center">
                  <span className="text-white">{item.amount}x {item.name}</span>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      Details
                    </a>
                  ) : item.description ? (
                     <button
                        onClick={() => setViewingItem(item)}
                        className="text-sm text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        View Description
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          
          <div className="mt-6 text-right">
              <button
                  onClick={onClose}
                  className="bg-stone-700 hover:bg-stone-600 text-white font-bold py-2 px-6 rounded-md transition duration-300"
              >
                  Close
              </button>
          </div>
        </div>
      </div>
      {viewingItem && (
        <DescriptionViewerModal
            description={viewingItem.description || ''}
            title={viewingItem.name}
            onClose={() => setViewingItem(null)}
        />
      )}
    </>
  );
};
