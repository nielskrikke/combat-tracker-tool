import React from 'react';
import { CloseIcon } from './icons';
import { MarkdownRenderer } from './MarkdownRenderer';

interface DescriptionViewerModalProps {
  description: string;
  title: string;
  onClose: () => void;
}

export const DescriptionViewerModal: React.FC<DescriptionViewerModalProps> = ({ description, title, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="desc-viewer-title"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="desc-viewer-title" className="text-xl font-medieval text-yellow-400">
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
        <div className="flex-grow p-6 overflow-y-auto prose prose-invert prose-p:text-gray-300 prose-headings:text-yellow-400 prose-strong:text-white prose-ul:list-disc prose-li:text-gray-300">
          <MarkdownRenderer markdown={description} />
        </div>
      </div>
    </div>
  );
};