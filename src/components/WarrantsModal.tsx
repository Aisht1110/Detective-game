import React, { useState } from 'react';
import { WarrantItem, ClueItem } from '../types';
import { audio } from '../services/audioService';

interface WarrantsModalProps {
  warrants: WarrantItem[];
  clues: ClueItem[];
  onClose: () => void;
  onApproveWarrant: (warrantId: string, unlockedClueId: string) => void;
}

export const WarrantsModal: React.FC<WarrantsModalProps> = ({
  warrants,
  clues,
  onClose,
  onApproveWarrant
}) => {
  const [selectedEv1, setSelectedEv1] = useState<Record<string, string>>({});
  const [selectedEv2, setSelectedEv2] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { type: 'success' | 'error'; msg: string }>>({});

  const unlockedClues = clues.filter(c => c.unlocked);

  const handleSubmitWarrant = (warrant: WarrantItem) => {
    const ev1 = selectedEv1[warrant.id];
    const ev2 = selectedEv2[warrant.id];

    if (!ev1 || !ev2) {
      setFeedback(prev => ({
        ...prev,
        [warrant.id]: {
          type: 'error',
          msg: 'Judge Vance requires TWO pieces of corroborating forensic evidence.'
        }
      }));
      return;
    }

    if (ev1 === ev2) {
      setFeedback(prev => ({
        ...prev,
        [warrant.id]: {
          type: 'error',
          msg: 'You cannot submit the same piece of evidence twice. Select two distinct items.'
        }
      }));
      return;
    }

    const picked = [ev1, ev2];
    const hasBoth = warrant.requiredClues.every(req => picked.includes(req));

    if (hasBoth) {
      audio.playGavelStrike(true);
      setFeedback(prev => ({
        ...prev,
        [warrant.id]: {
          type: 'success',
          msg: 'WARRANT APPROVED & EXECUTED. Judicial order signed by Superior Court.'
        }
      }));
      onApproveWarrant(warrant.id, warrant.unlocksClueId);
    } else {
      audio.playGavelStrike(false);
      setFeedback(prev => ({
        ...prev,
        [warrant.id]: {
          type: 'error',
          msg: 'DENIED FOR INSUFFICIENT PROBABLE CAUSE. Review the required evidence hint and search Room 204 more thoroughly.'
        }
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90">
      <div className="w-full max-w-5xl h-[84vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
              02
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Judicial Warrants & Probable Cause Applications
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Superior Court of California · Presiding Judge Evelyn Vance
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

        {/* Probable Cause Protocol Banner */}
        <div className="px-5 py-3 bg-cyan-950/20 border-b border-cyan-900/40 text-xs text-cyan-200 flex items-center gap-2">
          <span className="font-mono font-bold text-cyan-400 uppercase tracking-wider">Legal Protocol:</span>
          <span>
            Judicial warrants require <strong>two corroborating evidence items</strong> demonstrating probable cause before court authorization.
          </span>
        </div>

        {/* Warrants Cards Grid */}
        <div className="flex-1 p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {warrants.map(w => {
            const unlockedClue = clues.find(c => c.id === w.unlocksClueId);
            const status = feedback[w.id];

            if (w.approved) {
              return (
                <div
                  key={w.id}
                  className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/50 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-bold border border-emerald-700">
                        WARRANT APPROVED
                      </span>
                      <span className="text-emerald-400 font-mono text-xs">SIGNED</span>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight">{w.title}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{w.authority}</p>

                    <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-800/40 space-y-1">
                      <span className="text-xs font-bold text-emerald-400 block">
                        Unlocked: {unlockedClue?.name}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {unlockedClue?.summary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-900/50 text-[11px] font-mono text-emerald-300">
                    File in Evidence Locker
                  </div>
                </div>
              );
            }

            return (
              <div
                key={w.id}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                      Probable Cause Required
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight">{w.title}</h3>
                  <p className="text-[11px] font-mono text-slate-400">{w.authority}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{w.description}</p>
                  
                  <p className="text-[11px] text-amber-400/90 italic">
                    Hint: {w.hint}
                  </p>

                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Supporting Evidence Item #1
                      </label>
                      <select
                        value={selectedEv1[w.id] || ''}
                        onChange={e => setSelectedEv1(prev => ({ ...prev, [w.id]: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Select Evidence Item --</option>
                        {unlockedClues.map(c => (
                          <option key={c.id} value={c.id}>
                            #{c.markerNumber || 'DOC'} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Supporting Evidence Item #2
                      </label>
                      <select
                        value={selectedEv2[w.id] || ''}
                        onChange={e => setSelectedEv2(prev => ({ ...prev, [w.id]: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Select Evidence Item --</option>
                        {unlockedClues.map(c => (
                          <option key={c.id} value={c.id}>
                            #{c.markerNumber || 'DOC'} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {status && (
                    <div
                      className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                        status.type === 'success'
                          ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-200'
                          : 'bg-red-950/80 border border-red-700 text-red-200'
                      }`}
                    >
                      {status.msg}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSubmitWarrant(w)}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2 rounded-xl text-xs font-mono transition shadow-lg"
                >
                  Submit Probable Cause Petition
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
