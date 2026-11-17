import React, { useState } from 'react';
import { DETECTIVE_HINTS } from '../data/caseData';
import { DetectiveHint } from '../types';
import { audio } from '../services/audioService';

interface DetectiveHintsModalProps {
  onClose: () => void;
  unlockedCluesCount: number;
  approvedWarrantsCount: number;
}

export const DetectiveHintsModal: React.FC<DetectiveHintsModalProps> = ({
  onClose,
  unlockedCluesCount,
  approvedWarrantsCount
}) => {
  const [hints, setHints] = useState<DetectiveHint[]>(DETECTIVE_HINTS);

  const handleRevealHint = (hintId: string) => {
    audio.playClueDiscovered();
    setHints(prev =>
      prev.map(h => (h.id === hintId ? { ...h, revealed: true } : h))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90">
      <div className="w-full max-w-4xl h-[86vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
              HINT
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Detective's Field Logbook & Progressive Hints
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Starlight Motel Homicide · Lead Investigator Field Notes
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition"
          >
            Close Notes [ESC]
          </button>
        </div>

        {/* Milestone Tracker Bar */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold uppercase">Investigative Status:</span>
            <span>{unlockedCluesCount >= 6 ? 'Scene Fully Bagged' : 'Evidence Searching'}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Clues: {unlockedCluesCount}/10</span>
            <span>Warrants: {approvedWarrantsCount}/3</span>
          </div>
        </div>

        {/* Hints List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
          {hints.map((h, idx) => (
            <div
              key={h.id}
              className={`p-4 rounded-2xl border transition ${
                h.revealed
                  ? 'bg-slate-900/90 border-slate-700'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono font-bold text-[10px]">
                    STAGE {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-tight">{h.title}</h3>
                </div>

                {h.revealed ? (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    DECRYPTED
                  </span>
                ) : (
                  <button
                    onClick={() => handleRevealHint(h.id)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-[10px] font-mono transition shadow"
                  >
                    Reveal Detective Hint
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans mb-2">
                <strong>Current Lead:</strong> {h.lead}
              </p>

              {h.revealed ? (
                <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 text-xs text-amber-100/90 leading-relaxed font-mono">
                  &rarr; {h.hint}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-500">
                  Click 'Reveal Detective Hint' above to unseal this investigative clue.
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
