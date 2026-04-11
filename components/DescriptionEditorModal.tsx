

import React, { useState } from 'react';
import { CloseIcon, CheckIcon } from './icons';

interface DescriptionEditorModalProps {
  initialDescription: string;
  onSave: (description: string) => void;
  onClose: () => void;
}

export const DescriptionEditorModal: React.FC<DescriptionEditorModalProps> = ({ initialDescription, onSave, onClose }) => {
  const [description, setDescription] = useState(initialDescription);

  const handleSave = () => {
    onSave(description);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="desc-editor-title"
    >
      <div
        className="bg-dnd-panel rounded-lg shadow-xl border border-white/10 w-full max-w-2xl h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 id="desc-editor-title" className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em]">
            Custom Description Editor
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-dnd-text/40 hover:text-white rounded-full hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-grow p-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-full bg-black/40 border border-white/10 rounded-md p-3 text-white focus:ring-2 focus:ring-dnd-gold/50 transition resize-none font-sans"
            placeholder="Enter a custom description, lore, or notes for this creature..."
            autoFocus
          />
        </div>
        <footer className="p-4 border-t border-white/10 flex justify-end gap-4">
            <button
                onClick={onClose}
                className="bg-white/5 hover:bg-white/10 text-dnd-text/60 font-black uppercase tracking-widest text-[10px] py-2 px-6 rounded-md transition duration-300 border border-white/5"
            >
                Cancel
            </button>
             <button
                onClick={handleSave}
                className="flex items-center justify-center bg-dnd-gold hover:bg-dnd-gold/80 text-black font-black uppercase tracking-widest text-[10px] py-2 px-6 rounded-md transition duration-300 shadow-lg"
            >
                <CheckIcon className="w-5 h-5 mr-2" />
                Save Description
            </button>
        </footer>
      </div>
    </div>
  );
};
