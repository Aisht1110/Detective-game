import React from 'react';
import { PastCaseItem } from '../types';

interface CaseArchiveModalProps {
  cases: PastCaseItem[];
  onClose: () => void;
}

export const CaseArchiveModal: React.FC<CaseArchiveModalProps> = ({ cases, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90">
      <div className="w-full max-w-5xl h-[84vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-purple-400 font-mono font-bold text-xs">
              04
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Precinct Cold Case Archives & Precedents
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Cross-referenced historical case files with linked forensic patterns
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

        {/* Advisory Banner */}
        <div className="px-5 py-3 bg-purple-950/20 border-b border-purple-900/40 text-xs text-purple-200 flex items-center gap-2">
          <span className="font-mono font-bold text-purple-400 uppercase tracking-wider">Field Guidance:</span>
          <span>
            Previous precinct homicides provide crucial forensic precedents regarding staged blunt trauma and insurance expiration clauses.
          </span>
        </div>

        {/* Cold Cases Grid */}
        <div className="flex-1 p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {cases.map(c => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold"
                    style={{
                      backgroundColor: `${c.accentColor}20`,
                      color: c.accentColor,
                      border: `1px solid ${c.accentColor}60`
                    }}
                  >
                    {c.code}
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px]">{c.status}</span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight">{c.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{c.summary}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase block mb-1">
                  Investigative Pattern Match
                </span>
                <p className="text-xs text-amber-100/90 leading-relaxed">{c.connection}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
