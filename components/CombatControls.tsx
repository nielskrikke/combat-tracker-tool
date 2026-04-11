
import React from 'react';
import { PlayIcon, ArrowRightIcon, ArrowLeftIcon, RefreshIcon, TrashIcon, ExternalLinkIcon } from './icons';

interface CombatControlsProps {
  round: number;
  isCombatStarted: boolean;
  onStart: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEnd: () => void;
  onReset: () => void;
  onClear: () => void;
  onOpenPlayerView: () => void;
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
  onOpenPlayerView,
  hasParticipants
}) => {
  return (
    <div className="bg-dnd-panel/80 backdrop-blur-md rounded-xl shadow-xl p-4 border border-white/5 relative">
      <button
        onClick={onOpenPlayerView}
        className="absolute top-2 right-2 p-1.5 text-dnd-text/40 hover:text-dnd-gold transition-colors bg-black/20 rounded border border-white/5"
        title="Pop-out Player View (Separate Tab)"
      >
        <ExternalLinkIcon className="w-4 h-4" />
      </button>

      <div className="flex justify-between items-center mb-4 pr-10">
        <h3 className="text-[10px] font-black text-dnd-text/40 uppercase tracking-[0.2em]">Controls</h3>
        {isCombatStarted && (
          <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-dnd-text/40">Round</div>
            <div className="text-3xl font-black text-white drop-shadow-sm">{round}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {!isCombatStarted ? (
          <button
            onClick={onStart}
            disabled={!hasParticipants}
            className="col-span-2 flex items-center justify-center bg-dnd-gold hover:brightness-110 text-black font-black uppercase tracking-widest py-3 px-3 text-[10px] rounded transition-all shadow-lg shadow-dnd-gold/10 disabled:bg-white/5 disabled:text-dnd-text/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            Start Combat
          </button>
        ) : (
          <>
            <button
              onClick={onPrev}
              className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-dnd-text/80 font-black uppercase tracking-widest py-3 px-3 text-[10px] rounded transition-all border border-white/5"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Prev
            </button>
            <button
              onClick={onNext}
              className="flex items-center justify-center bg-dnd-gold hover:brightness-110 text-black font-black uppercase tracking-widest py-3 px-3 text-[10px] rounded transition-all shadow-lg shadow-dnd-gold/10"
            >
              Next
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          </>
        )}
        
        <button
          onClick={onEnd}
          disabled={!isCombatStarted}
          className="col-span-2 sm:col-span-1 flex items-center justify-center bg-dnd-red/20 hover:bg-dnd-red/30 text-dnd-red font-black uppercase tracking-widest py-2.5 px-3 text-[10px] rounded transition-all border border-dnd-red/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          End Combat
        </button>
        <button
          onClick={onReset}
          disabled={!hasParticipants}
          className="col-span-2 sm:col-span-1 flex items-center justify-center bg-white/5 hover:bg-white/10 text-dnd-text/60 font-black uppercase tracking-widest py-2.5 px-3 text-[10px] rounded transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshIcon className="w-4 h-4 mr-2" />
          Long Rest
        </button>
        <button
          onClick={onClear}
          disabled={!hasParticipants}
          className="col-span-2 flex items-center justify-center bg-white/5 hover:bg-white/10 text-dnd-text/40 hover:text-dnd-red font-black uppercase tracking-widest py-2.5 px-3 text-[10px] rounded transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Clear battlefield
        </button>
      </div>
    </div>
  );
};
