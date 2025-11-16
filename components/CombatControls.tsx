

import React from 'react';
import { PlayIcon, ArrowRightIcon, ArrowLeftIcon, RefreshIcon, TrashIcon } from './icons';

interface CombatControlsProps {
  round: number;
  isCombatStarted: boolean;
  onStart: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEnd: () => void;
  onReset: () => void;
  onClear: () => void;
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
  onClear,
  hasParticipants
}) => {
  return (
    <div className="bg-stone-800/50 rounded-lg shadow-lg p-6 border border-stone-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-medieval text-white">Combat Controls</h3>
        {isCombatStarted && (
          <div className="text-center">
            <div className="text-sm text-stone-400">Round</div>
            <div className="text-4xl font-bold text-white">{round}</div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {!isCombatStarted ? (
          <button
            onClick={onStart}
            disabled={!hasParticipants}
            className="col-span-2 flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Start Combat
          </button>
        ) : (
          <>
            <button
              onClick={onPrev}
              className="flex items-center justify-center bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Prev
            </button>
            <button
              onClick={onNext}
              className="flex items-center justify-center bg-stone-600 hover:bg-stone-500 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Next
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          </>
        )}
        <button
          onClick={onEnd}
          disabled={!isCombatStarted}
          className="col-span-2 sm:col-span-1 flex items-center justify-center bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          End Combat
        </button>
        <button
          onClick={onReset}
          disabled={!hasParticipants}
          className="col-span-2 sm:col-span-1 flex items-center justify-center bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshIcon className="w-5 h-5 mr-2" />
          Long Rest
        </button>
        <button
          onClick={onClear}
          disabled={!hasParticipants}
          className="col-span-2 flex items-center justify-center bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrashIcon className="w-5 h-5 mr-2" />
          Clear battlefield
        </button>
      </div>
    </div>
  );
};
