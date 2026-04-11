
import React from 'react';
import { CloseIcon } from './icons';

interface StatblockModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export const StatblockModal: React.FC<StatblockModalProps> = ({ url, title, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="statblock-modal-title"
    >
      <div
        className="bg-dnd-panel rounded-2xl shadow-2xl border border-white/10 w-full max-w-4xl h-[90vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dnd-gold to-transparent opacity-50"></div>
        <header className="flex justify-between items-center px-6 py-4 border-b border-white/5">
          <h2 id="statblock-modal-title" className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-dnd-text/40 hover:text-dnd-gold rounded-full hover:bg-white/5 transition-all"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-grow p-0 bg-black/20">
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
