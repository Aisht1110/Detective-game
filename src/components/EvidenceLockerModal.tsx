import React, { useState } from 'react';
import { ClueItem } from '../types';

interface EvidenceLockerModalProps {
  clues: ClueItem[];
  onClose: () => void;
  onInspect3D: (clue: ClueItem) => void;
  onConfrontSuspect: (clueId: string) => void;
}

export const EvidenceLockerModal: React.FC<EvidenceLockerModalProps> = ({
  clues,
  onClose,
  onInspect3D,
  onConfrontSuspect
}) => {
  const [selectedClueId, setSelectedClueId] = useState<string>(clues[0]?.id || '');
  const activeClue = clues.find(c => c.id === selectedClueId) || clues[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90">
      <div className="w-full max-w-5xl h-[84vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
              01
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Forensic Evidence Locker & Chain of Custody
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {clues.filter(c => c.unlocked).length} of {clues.length} pieces of evidence bagged ·{' '}
                {clues.filter(c => Boolean(c.capturedPhoto)).length} field photos logged
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition"
          >
            Return to Scene [ESC]
          </button>
        </div>

        {/* 2-Column Split: Clue Roster + Detailed Dossier */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Clue Roster */}
          <div className="md:col-span-5 border-r border-slate-800 p-4 overflow-y-auto space-y-2 bg-slate-950/50">
            {clues.map(clue => {
              const isSelected = clue.id === selectedClueId;
              if (!clue.unlocked) {
                return (
                  <div
                    key={clue.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 opacity-60 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 font-mono text-xs">
                        ?
                      </div>
                      <div>
                        <p className="text-xs font-mono text-slate-500 font-semibold">UNDISCOVERED CLUE</p>
                        <p className="text-[10px] text-slate-600">{clue.location}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={clue.id}
                  onClick={() => setSelectedClueId(clue.id)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono font-bold text-xs"
                      style={{
                        backgroundColor: `${clue.accentColor}25`,
                        color: clue.accentColor,
                        border: `1px solid ${clue.accentColor}60`
                      }}
                    >
                      #{clue.markerNumber || 'DOC'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-snug truncate">{clue.name}</p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {clue.category}
                      </span>
                    </div>
                  </div>
                  {clue.capturedPhoto && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                      35mm
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Forensic Dossier */}
          <div className="md:col-span-7 p-6 overflow-y-auto flex flex-col justify-between bg-slate-900/60 space-y-4">
            {activeClue ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                    {activeClue.category} · {activeClue.location}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Logged in Custody
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {activeClue.name}
                </h3>

                {activeClue.capturedPhoto && (
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <div className="px-3 py-1 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                      <span>35MM FORENSIC SCENE SNAPSHOT</span>
                      <span>ROOM 204 EVIDENCE ARCHIVE</span>
                    </div>
                    <img
                      src={activeClue.capturedPhoto}
                      alt={activeClue.name}
                      className="w-full max-h-44 object-cover"
                    />
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeClue.summary}
                </p>

                <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-500/30">
                  <span className="text-xs font-mono font-bold uppercase text-amber-400 block mb-1">
                    Forensic Laboratory & Detective Notes
                  </span>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {activeClue.forensicDetail}
                  </p>
                </div>

                {activeClue.uvFluorescentNote && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40">
                    <span className="text-xs font-mono font-bold uppercase text-purple-400 block mb-1">
                      Ultraviolet Trace Findings (365nm)
                    </span>
                    <p className="text-xs text-purple-200 leading-relaxed">
                      {activeClue.uvFluorescentNote}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {activeClue && (
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => onInspect3D(activeClue)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs font-mono transition shadow-lg flex items-center gap-1.5"
                >
                  <span>Open 3D Physical Inspector</span>
                </button>

                <button
                  onClick={() => onConfrontSuspect(activeClue.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs font-mono transition"
                >
                  Slam on Interrogation Table
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
