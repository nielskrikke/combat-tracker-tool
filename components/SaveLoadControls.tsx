
import React from 'react';
import { DownloadIcon, UploadIcon, PlusCircleIcon } from './icons';

interface SaveLoadControlsProps {
  onSave: () => void;
  onLoad: (file: File) => void;
  onAddFromFile: (file: File) => void;
  hasParticipants: boolean;
}

export const SaveLoadControls: React.FC<SaveLoadControlsProps> = ({ onSave, onLoad, onAddFromFile, hasParticipants }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, handler: (file: File) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      handler(file);
      e.target.value = ''; // Reset input to allow re-uploading the same file
    }
  };

  return (
    <div className="bg-dnd-panel/80 backdrop-blur-md rounded-xl shadow-xl p-4 border border-white/5">
      <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em] mb-4">Session State</h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={onSave}
                disabled={!hasParticipants}
                className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-dnd-gold font-black uppercase tracking-widest text-[10px] py-3 px-4 rounded-lg transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Save
            </button>
            <label className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-dnd-gold font-black uppercase tracking-widest text-[10px] py-3 px-4 rounded-lg transition-all border border-white/5 cursor-pointer">
                <UploadIcon className="w-4 h-4 mr-2" />
                Load
                <input
                    type="file"
                    className="hidden"
                    accept=".json"
                    onChange={(e) => handleFileChange(e, onLoad)}
                />
            </label>
        </div>
        <label className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-dnd-gold font-black uppercase tracking-widest text-[10px] py-3 px-4 rounded-lg transition-all border border-white/5 cursor-pointer">
            <PlusCircleIcon className="w-4 h-4 mr-2" />
            Add from File
            <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={(e) => handleFileChange(e, onAddFromFile)}
            />
        </label>
      </div>
    </div>
  );
};
