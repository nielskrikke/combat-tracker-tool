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
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <h3 className="text-2xl font-medieval text-yellow-400 mb-4">Session State</h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={onSave}
                disabled={!hasParticipants}
                className="flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Save
            </button>
            <label className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out cursor-pointer">
                <UploadIcon className="w-5 h-5 mr-2" />
                Load
                <input
                    type="file"
                    className="hidden"
                    accept=".json"
                    onChange={(e) => handleFileChange(e, onLoad)}
                />
            </label>
        </div>
        <label className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out cursor-pointer">
            <PlusCircleIcon className="w-5 h-5 mr-2" />
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