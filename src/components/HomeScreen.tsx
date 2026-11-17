import React from 'react';
import { audio } from '../services/audioService';

interface HomeScreenProps {
  onStartInvestigation: () => void;
  onOpenMap: () => void;
  onOpenHints: () => void;
  unlockedCluesCount: number;
  totalCluesCount: number;
  approvedWarrantsCount: number;
  isAudioMuted: boolean;
  onToggleMute: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartInvestigation,
  onOpenMap,
  onOpenHints,
  unlockedCluesCount,
  totalCluesCount,
  approvedWarrantsCount,
  isAudioMuted,
  onToggleMute
}) => {
  return (
    <div className="relative z-20 w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 pb-24 pointer-events-none overflow-y-auto">
      
      {/* Dark Noir Scrim over live orbiting 3D WebGL Room 204 */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.45)_0%,rgba(2,6,23,0.88)_100%)]" />

      {/* Main Dossier Briefing Panel (Solid translucent surface — zero backdrop-blur over WebGL) */}
      <div className="relative z-30 pointer-events-auto w-full max-w-3xl bg-slate-950/90 border border-slate-700/90 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col space-y-5">
        
        {/* Top Header Badge & Audio Control */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/50 flex items-center justify-center text-amber-400 font-mono font-bold text-sm">
              #409
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold block">
                HOMICIDE DIVISION · LIVE 3D CRIME SCENE SIMULATION
              </span>
              <span className="text-xs text-slate-400 font-mono">
                STARLIGHT MOTEL · ROOM 204 · CODE 187
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              audio.ensureAudio();
              onToggleMute();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition text-xs font-mono"
          >
            {isAudioMuted ? 'Audio: Muted' : 'Noir Audio: Active'}
          </button>
        </div>

        {/* Title & Core Hook */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            TRUE DETECTIVE: ROOM 204
          </h1>
          <p className="text-xs sm:text-sm text-amber-300/90 font-mono">
            THE MIDNIGHT POISONING OF VICTOR VANCE — INTERACTIVE 3D INVESTIGATION
          </p>
        </div>

        {/* Case Dossier Summary Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800">
            <span>SCENE: Starlight Motel #204</span>
            <span>TIME: 00:30 HRS Past Midnight</span>
            <span className="text-red-400 font-semibold">STATUS: Open Homicide</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            At 12:05 AM, an anonymous 911 call placed from an exterior payphone led patrol to Room 204.
            Found dead on the carpet was <strong className="text-white">Victor Vance (46)</strong>, co-founder of Vance Chemical Labs.
            A shallow temple laceration sits beside an overturned brass trophy, yet forensic anomalies suggest a deeper conspiracy.
            Crucially, Victor&apos;s divorce and a <strong className="text-amber-300">$2,000,000 life insurance policy</strong> were set to expire at midnight.
          </p>

          <p className="text-[11px] text-amber-400/95 font-mono leading-relaxed">
            Step directly inside the live 3D crime scene behind this briefing: sweep your 365nm UV blacklight, walk in first-person (WASD), photograph forensic clues [F], execute judicial warrants, and break suspects under interrogation.
          </p>
        </div>

        {/* Progress Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Forensic Clues</span>
            <span className="text-base sm:text-lg font-bold font-mono text-amber-400">
              {unlockedCluesCount} / {totalCluesCount}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Court Warrants</span>
            <span className="text-base sm:text-lg font-bold font-mono text-cyan-400">
              {approvedWarrantsCount} / 3
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Suspects</span>
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
              3 Held
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Next Objective</span>
            <span className="text-xs font-bold font-mono text-white">
              {unlockedCluesCount < 4 ? 'Sweep Room 204' : approvedWarrantsCount < 2 ? 'File Warrants' : 'Interrogate'}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audio.ensureAudio();
                onOpenMap();
              }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold transition"
            >
              District Map
            </button>

            <button
              onClick={() => {
                audio.ensureAudio();
                onOpenHints();
              }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-mono text-xs font-bold transition"
            >
              Detective Hints
            </button>
          </div>

          <button
            onClick={() => {
              audio.ensureAudio();
              onStartInvestigation();
            }}
            className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-sm transition shadow-xl"
          >
            {unlockedCluesCount > 2 ? 'Resume 3D Investigation' : 'Enter Crime Scene (Room 204)'}
          </button>
        </div>

      </div>
    </div>
  );
};
