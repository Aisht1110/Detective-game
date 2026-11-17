import React, { useEffect, useState } from 'react';
import { CameraZoneId, FlashlightMode, ModalTab, GameScreen } from '../types';
import { audio } from '../services/audioService';

interface CollapsibleBottomDockProps {
  currentScreen: GameScreen;
  onSelectScreen: (screen: GameScreen) => void;
  cameraAngle: CameraZoneId;
  onSelectCameraAngle: (angle: CameraZoneId) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  flashlightMode: FlashlightMode;
  onSelectFlashlightMode: (mode: FlashlightMode) => void;
  onCapturePhoto: () => void;
  onOpenModal: (tab: ModalTab) => void;
  unlockedCluesCount: number;
  totalCluesCount: number;
  approvedWarrantsCount: number;
  totalWarrantsCount: number;
  isAudioMuted: boolean;
  onToggleMute: () => void;
}

export const CollapsibleBottomDock: React.FC<CollapsibleBottomDockProps> = ({
  currentScreen,
  onSelectScreen,
  cameraAngle,
  onSelectCameraAngle,
  zoomLevel,
  onZoomChange,
  flashlightMode,
  onSelectFlashlightMode,
  onCapturePhoto,
  onOpenModal,
  unlockedCluesCount,
  totalCluesCount,
  approvedWarrantsCount,
  totalWarrantsCount,
  isAudioMuted,
  onToggleMute
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const cameraButtons: { id: CameraZoneId; label: string }[] = [
    { id: 'overview', label: '01 Room' },
    { id: 'desk', label: '02 Desk' },
    { id: 'bed', label: '03 Bed' },
    { id: 'door', label: '04 Door' },
    { id: 'fps', label: 'Walk FPS' }
  ];

  return (
    <div
      className="fixed z-40 transition-transform duration-300 ease-out"
      style={{
        bottom: '12px',
        left: '50%',
        transform: isCollapsed ? 'translate(-50%, calc(100% - 22px))' : 'translate(-50%, 0)',
        maxWidth: 'min(1220px, 98vw)',
        width: '100%'
      }}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center -mb-2 relative z-10">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-3.5 py-1 rounded-full text-[10px] font-mono shadow-xl transition"
        >
          {isCollapsed ? '▴ Show Detective Dock [H]' : '▾ Cinema Mode [H]'}
        </button>
      </div>

      {/* Main Dock Container (Solid RGBA surface — no backdrop-blur over WebGL) */}
      <div className="bg-slate-950/95 border border-slate-700/90 rounded-2xl shadow-2xl p-2 flex flex-wrap items-center justify-between gap-2">
        
        {/* Screen & Navigation Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => onSelectScreen('homescreen')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap ${
              currentScreen === 'homescreen'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Briefing
          </button>

          <button
            onClick={() => onSelectScreen('crime_scene')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap ${
              currentScreen === 'crime_scene'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Room 204
          </button>

          <button
            onClick={() => onOpenModal('map')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 transition whitespace-nowrap"
          >
            Map
          </button>

          <button
            onClick={() => onOpenModal('hints')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-amber-300 hover:text-white hover:bg-slate-800 transition whitespace-nowrap"
          >
            Hints
          </button>
        </div>

        {/* 3D Camera Angles, Zoom, Flashlight/UV & 35mm Shutter (Crime Scene active) */}
        {currentScreen === 'crime_scene' && (
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {cameraButtons.map(btn => (
                <button
                  key={btn.id}
                  onClick={() => onSelectCameraAngle(btn.id)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition whitespace-nowrap ${
                    cameraAngle === btn.id
                      ? 'bg-slate-800 text-amber-400 font-bold border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Flashlight & UV 365nm Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                onClick={() => {
                  const next = flashlightMode === 'normal' ? 'off' : 'normal';
                  audio.playFlashlightClick(false);
                  onSelectFlashlightMode(next);
                }}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition whitespace-nowrap ${
                  flashlightMode === 'normal'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Torch
              </button>
              <button
                onClick={() => {
                  const next = flashlightMode === 'uv' ? 'normal' : 'uv';
                  audio.playFlashlightClick(next === 'uv');
                  onSelectFlashlightMode(next);
                }}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition whitespace-nowrap ${
                  flashlightMode === 'uv'
                    ? 'bg-purple-600 text-white font-bold border border-purple-400'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                UV 365nm
              </button>
            </div>

            {/* Zoom & 35mm Photo Shutter */}
            <div className="hidden xl:flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono">
              <button
                onClick={() => onZoomChange(Math.max(1.0, +(zoomLevel - 0.25).toFixed(2)))}
                className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                title="Zoom Out"
              >
                -
              </button>
              <span className="px-1 text-amber-400">{zoomLevel.toFixed(1)}x</span>
              <button
                onClick={() => onZoomChange(Math.min(2.25, +(zoomLevel + 0.25).toFixed(2)))}
                className="px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                title="Zoom In"
              >
                +
              </button>
            </div>

            <button
              onClick={onCapturePhoto}
              className="bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/80 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold transition whitespace-nowrap"
              title="Snap 35mm Forensic Scene Photo [F]"
            >
              Snap Photo [F]
            </button>
          </div>
        )}

        {/* Investigation Modals & Solve */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenModal('evidence')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Evidence</span>
            <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 rounded-full">
              {unlockedCluesCount}/{totalCluesCount}
            </span>
          </button>

          <button
            onClick={() => onOpenModal('warrants')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Warrants</span>
            <span className="bg-cyan-500 text-slate-950 font-bold text-[10px] px-1.5 rounded-full">
              {approvedWarrantsCount}/{totalWarrantsCount}
            </span>
          </button>

          <button
            onClick={() => onOpenModal('interrogate')}
            className="bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-mono transition whitespace-nowrap"
          >
            Interrogate
          </button>

          <button
            onClick={() => onOpenModal('archive')}
            className="bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-mono transition hidden 2xl:inline-flex whitespace-nowrap"
          >
            Archives
          </button>

          <button
            onClick={() => onOpenModal('solve')}
            className="bg-red-950 hover:bg-red-800 text-red-100 border border-red-700 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap"
          >
            Solve
          </button>

          <button
            onClick={onToggleMute}
            className="px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-mono text-[11px] transition"
            title={isAudioMuted ? 'Unmute Ambient Audio' : 'Mute Ambient Audio'}
          >
            {isAudioMuted ? 'Mute' : 'SFX'}
          </button>
        </div>

      </div>
    </div>
  );
};
