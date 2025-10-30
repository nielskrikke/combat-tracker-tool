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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="statblock-modal-title"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="statblock-modal-title" className="text-xl font-medieval text-yellow-400">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-grow p-1">
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0 rounded-b-lg"
          />
        </div>
      </div>
    </div>
  );
};
