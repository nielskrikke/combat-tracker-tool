
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="loot-modal-title"
      >
        <div
          className="bg-dnd-panel rounded-2xl shadow-2xl p-8 border border-white/10 w-full max-w-md m-4 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dnd-gold to-transparent opacity-50"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 id="loot-modal-title" className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em] flex items-center gap-4">
              <LootIcon className="w-4 h-4" />
              Loot
            </h3>
            <button onClick={onClose} className="p-2 text-dnd-text/40 hover:text-dnd-gold rounded-full hover:bg-white/5 transition-all text-2xl leading-none">&times;</button>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40 mb-6 ml-1">Spoils from {participant.name}</p>

          {(!participant.inventory || participant.inventory.length === 0) ? (
            <div className="bg-black/20 p-8 rounded-xl border border-white/5 text-center">
                <p className="text-dnd-text/20 italic font-sans">This combatant has no loot.</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {participant.inventory.map((item, index) => (
                <li key={index} className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center group hover:border-dnd-gold/30 transition-all">
                  <span className="text-dnd-text font-sans text-lg">{item.amount}x {item.name}</span>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-black uppercase tracking-widest text-sky-400/60 hover:text-sky-400 transition-colors"
                    >
                      Details
                    </a>
                  ) : item.description ? (
                     <button
                        onClick={() => setViewingItem(item)}
                        className="text-[10px] font-black uppercase tracking-widest text-sky-400/60 hover:text-sky-400 transition-colors"
                    >
                        Description
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          
          <div className="mt-8">
              <button
                  onClick={onClose}
                  className="w-full bg-white/5 hover:bg-white/10 text-dnd-text/60 hover:text-dnd-text font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all border border-white/5"
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
