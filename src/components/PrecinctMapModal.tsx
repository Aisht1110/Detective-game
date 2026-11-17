import React, { useState } from 'react';
import { MAP_LOCATIONS } from '../data/caseData';
import { MapLocation, ModalTab } from '../types';
import { audio } from '../services/audioService';

interface PrecinctMapModalProps {
  onClose: () => void;
  onNavigateToLocation: (tab: ModalTab | 'crime_scene') => void;
  unlockedCluesCount: number;
  approvedWarrantsCount: number;
}

export const PrecinctMapModal: React.FC<PrecinctMapModalProps> = ({
  onClose,
  onNavigateToLocation,
  unlockedCluesCount,
  approvedWarrantsCount
}) => {
  const [selectedId, setSelectedId] = useState<string>(MAP_LOCATIONS[0].id);
  const selectedLoc = MAP_LOCATIONS.find(l => l.id === selectedId) || MAP_LOCATIONS[0];

  const handleTravel = (loc: MapLocation) => {
    audio.playClueDiscovered();
    onNavigateToLocation(loc.tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90">
      <div className="w-full max-w-5xl h-[86vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/50 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
              MAP
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Metropolitan Police District & Tactical Homicide Map
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Sector 4 Grid · Starlight Motel Corridor & Precinct Dispatch
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition"
          >
            Close Map [ESC]
          </button>
        </div>

        {/* Interactive Split: Tactical Noir Vector Map + Selected Sector Dispatch Card */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left: Tactical Noir City Grid SVG */}
          <div className="lg:col-span-8 relative bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden min-h-[300px]">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full opacity-55 pointer-events-none"
            >
              {/* Noir Street Grid */}
              <defs>
                <pattern id="noirGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.3" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#noirGrid)" />

              {/* Major Arterials & River */}
              <path d="M 0 58 Q 40 48, 100 62" fill="none" stroke="#0f172a" strokeWidth="5" />
              <path d="M 0 58 Q 40 48, 100 62" fill="none" stroke="#1e3a8a" strokeWidth="0.6" strokeDasharray="1.5 1" />

              {/* Transit Corridors Linking Map Nodes */}
              <line x1="20" y1="38" x2="52" y2="24" stroke="#f59e0b" strokeWidth="0.45" strokeDasharray="1.4 1" />
              <line x1="52" y1="24" x2="80" y2="44" stroke="#38bdf8" strokeWidth="0.45" strokeDasharray="1.4 1" />
              <line x1="52" y1="24" x2="48" y2="74" stroke="#38bdf8" strokeWidth="0.45" strokeDasharray="1.4 1" />
              <line x1="20" y1="38" x2="22" y2="76" stroke="#a855f7" strokeWidth="0.4" strokeDasharray="1 1" />
              <line x1="48" y1="74" x2="78" y2="78" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1.4 1" />
              <line x1="80" y1="44" x2="78" y2="78" stroke="#ef4444" strokeWidth="0.4" strokeDasharray="1 1" />
            </svg>

            {/* District Watermark */}
            <div className="absolute top-3 left-4 pointer-events-none text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              SECTOR 04 // RAIN ADVISORIES IN EFFECT · PAYPHONE CALL ORIGIN: STARLIGHT BLVD
            </div>

            {/* Interactive Map Pins */}
            {MAP_LOCATIONS.map(loc => {
              const isSelected = loc.id === selectedId;
              const isCrimeScene = loc.id === 'loc_motel';
              const isDA = loc.id === 'loc_da_office';
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedId(loc.id)}
                  onDoubleClick={() => handleTravel(loc)}
                  style={{
                    left: `${loc.coordinates.x}%`,
                    top: `${loc.coordinates.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className={`absolute z-10 text-left transition-all rounded-xl px-2.5 py-1.5 border shadow-lg ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 scale-105 z-20'
                      : isCrimeScene
                      ? 'bg-slate-900/95 text-amber-300 border-amber-500/70 hover:border-amber-400'
                      : isDA
                      ? 'bg-slate-900/95 text-red-300 border-red-600/70 hover:border-red-400'
                      : 'bg-slate-900/95 text-slate-200 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected
                          ? 'bg-slate-950'
                          : isCrimeScene
                          ? 'bg-amber-400'
                          : isDA
                          ? 'bg-red-500'
                          : 'bg-cyan-400'
                      }`}
                    />
                    <span className="text-[11px] font-mono font-bold whitespace-nowrap">
                      {loc.name.split('—')[0].trim()}
                    </span>
                  </div>
                  <span
                    className={`block text-[9px] font-mono ${
                      isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {loc.status}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Location Dispatch Briefing */}
          <div className="lg:col-span-4 p-5 bg-slate-900/90 flex flex-col justify-between overflow-y-auto space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-bold">
                  {selectedLoc.status}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  GRID {selectedLoc.coordinates.x}°N · {selectedLoc.coordinates.y}°W
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {selectedLoc.name}
                </h3>
                <p className="text-xs font-mono text-amber-300/80 mt-0.5">{selectedLoc.subtitle}</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedLoc.description}
              </p>

              {/* Live Case Status Strip */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Evidence Bagged:</span>
                  <span className="text-amber-400 font-bold">{unlockedCluesCount} / 10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Signed Warrants:</span>
                  <span className="text-cyan-400 font-bold">{approvedWarrantsCount} / 3</span>
                </div>
              </div>

              {/* Quick List of All Precinct Locations */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Quick Precinct Directory
                </span>
                {MAP_LOCATIONS.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedId(loc.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                      loc.id === selectedId
                        ? 'bg-amber-500/15 border border-amber-500/50 text-amber-300'
                        : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{loc.name}</span>
                    <span className="text-[10px] shrink-0 ml-2">&rarr;</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleTravel(selectedLoc)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs sm:text-sm transition shadow-xl"
            >
              Dispatch to {selectedLoc.badgeLabel} &rarr;
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
