
import React from 'react';
import { PlayIcon, ArrowRightIcon, ArrowLeftIcon, RefreshIcon } from './icons';

interface CombatControlsProps {
  round: number;
  isCombatStarted: boolean;
  onStart: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEnd: () => void;
  onReset: () => void;
  hasParticipants: boolean;
}

export const CombatControls: React.FC<CombatControlsProps> = ({
  round,
  isCombatStarted,
  onStart,
  onNext,
  onPrev,
  onEnd,
  onReset,
  hasParticipants
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-medieval text-yellow-400">Combat Controls</h3>
        {isCombatStarted && (
          <div className="text-center">
            <div className="text-sm text-gray-400">Round</div>
            <div className="text-4xl font-bold text-white">{round}</div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {!isCombatStarted ? (
          <button
            onClick={onStart}
            disabled={!hasParticipants}
            className="col-span-2 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Start Combat
          </button>
        ) : (
          <>
            <button
              onClick={onPrev}
              className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Prev
            </button>
            <button
              onClick={onNext}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Next
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          </>
        )}
        <button
          onClick={onEnd}
          disabled={!isCombatStarted}
          className="col-span-2 sm:col-span-1 flex items-center justify-center bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          End Combat
        </button>
        <button
          onClick={onReset}
          disabled={!hasParticipants}
          className="col-span-2 sm:col-span-1 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <RefreshIcon className="w-5 h-5 mr-2" />
          Reset
        </button>
      </div>
    </div>
  );
};
