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
        className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-full max-w-2xl h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="desc-editor-title" className="text-xl font-medieval text-yellow-400">
            Custom Description Editor
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-grow p-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-full bg-gray-900/50 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-red-500 transition resize-none"
            placeholder="Enter a custom description, lore, or notes for this creature..."
            autoFocus
          />
        </div>
        <footer className="p-4 border-t border-gray-700 flex justify-end gap-4">
            <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition duration-300"
            >
                Cancel
            </button>
             <button
                onClick={handleSave}
                className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition duration-300"
            >
                <CheckIcon className="w-5 h-5 mr-2" />
                Save Description
            </button>
        </footer>
      </div>
    </div>
  );
};
