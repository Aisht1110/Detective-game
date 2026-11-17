/**
 * True Detective: Room 204 — 3D Interactive Noir Case Simulator
 * @license Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CameraZoneId,
  ClueItem,
  FlashlightMode,
  GameScreen,
  ModalTab,
  ProjectedMarker,
  SuspectItem
} from './types';
import {
  INITIAL_CLUES,
  INITIAL_SUSPECTS,
  INITIAL_WARRANTS,
  PAST_CASES
} from './data/caseData';
import { CrimeSceneCanvas, CrimeSceneCanvasHandle } from './three/CrimeSceneCanvas';
import { HomeScreen } from './components/HomeScreen';
import { PrecinctMapModal } from './components/PrecinctMapModal';
import { DetectiveHintsModal } from './components/DetectiveHintsModal';
import { ClueInspectorModal } from './components/ClueInspectorModal';
import { EvidenceLockerModal } from './components/EvidenceLockerModal';
import { WarrantsModal } from './components/WarrantsModal';
import { InterrogationModal } from './components/InterrogationModal';
import { CaseArchiveModal } from './components/CaseArchiveModal';
import { IndictmentModal } from './components/IndictmentModal';
import { CollapsibleBottomDock } from './components/CollapsibleBottomDock';
import { audio } from './services/audioService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('homescreen');
  const [clues, setClues] = useState<ClueItem[]>(INITIAL_CLUES);
  const [warrants, setWarrants] = useState(INITIAL_WARRANTS);
  const [suspects, setSuspects] = useState<SuspectItem[]>(INITIAL_SUSPECTS);

  const [cameraAngle, setCameraAngle] = useState<CameraZoneId>('overview');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [flashlightMode, setFlashlightMode] = useState<FlashlightMode>('normal');
  const [activeModal, setActiveModal] = useState<ModalTab>('none');
  const [inspectingClueId, setInspectingClueId] = useState<string | null>(null);
  const [interrogationClueId, setInterrogationClueId] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [projectedMarkers, setProjectedMarkers] = useState<ProjectedMarker[]>([]);
  const [hoveredClue, setHoveredClue] = useState<ClueItem | null>(null);
  const [flashOverlayVisible, setFlashOverlayVisible] = useState(false);

  const canvasRef = useRef<CrimeSceneCanvasHandle | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const handleSelectMarker = useCallback(
    (clueId: string) => {
      audio.ensureAudio();
      const target = clues.find(c => c.id === clueId);
      if (!target) return;

      if (!target.unlocked) {
        audio.playClueDiscovered();
        setClues(prev =>
          prev.map(c => (c.id === clueId ? { ...c, unlocked: true } : c))
        );
        showToast(`Bagged Evidence #${target.markerNumber || 'DOC'}: ${target.name}`);
      } else {
        audio.playFlashlightClick(false);
      }

      setInspectingClueId(clueId);
      setActiveModal('inspect');
    },
    [clues, showToast]
  );

  const handleBagClue = (clueId: string) => {
    setClues(prev =>
      prev.map(c => (c.id === clueId ? { ...c, unlocked: true } : c))
    );
    showToast('Evidence logged into Chain of Custody.');
  };

  const handleApproveWarrant = (warrantId: string, unlockedClueId: string) => {
    setWarrants(prev =>
      prev.map(w => (w.id === warrantId ? { ...w, approved: true } : w))
    );
    setClues(prev =>
      prev.map(c => (c.id === unlockedClueId ? { ...c, unlocked: true } : c))
    );
    const unlockedClue = clues.find(c => c.id === unlockedClueId);
    showToast(`Warrant Signed! Unlocked: ${unlockedClue?.name || 'Coroner File'}`);
  };

  const handleUpdateSuspectHistory = (suspectId: string, updatedSuspect: SuspectItem) => {
    setSuspects(prev =>
      prev.map(s => (s.id === suspectId ? updatedSuspect : s))
    );
  };

  const handlePresentInInterrogation = (clueId: string) => {
    setInterrogationClueId(clueId);
    setActiveModal('interrogate');
  };

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleMapNavigate = (destination: ModalTab | 'crime_scene') => {
    if (destination === 'crime_scene') {
      setCurrentScreen('crime_scene');
      setActiveModal('none');
    } else {
      setActiveModal(destination);
    }
  };

  const handleCaptureForensicPhoto = useCallback(() => {
    if (currentScreen !== 'crime_scene' || activeModal !== 'none') return;
    audio.playCameraShutter();
    setFlashOverlayVisible(true);
    window.setTimeout(() => setFlashOverlayVisible(false), 180);

    const dataUrl = canvasRef.current?.captureForensicPhoto();
    if (!dataUrl) return;

    // Attach snapshot to hovered clue, or to first unlocked clue in current camera angle, or initial report
    const targetClue =
      hoveredClue ||
      clues.find(c => c.cameraAngleId === cameraAngle && c.markerNumber) ||
      clues[0];

    if (targetClue) {
      setClues(prev =>
        prev.map(c =>
          c.id === targetClue.id
            ? { ...c, unlocked: true, capturedPhoto: dataUrl }
            : c
        )
      );
      showToast(`35mm Forensic Snapshot attached to: ${targetClue.name}`);
    }
  }, [activeModal, cameraAngle, clues, currentScreen, hoveredClue, showToast]);

  // Global keyboard shortcuts (ESC, F, U, 1-5)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === 'Escape') {
        setActiveModal('none');
        return;
      }

      if (currentScreen === 'crime_scene' && activeModal === 'none') {
        if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          handleCaptureForensicPhoto();
        } else if (e.key === 'u' || e.key === 'U') {
          setFlashlightMode(prev => {
            const next = prev === 'uv' ? 'normal' : 'uv';
            audio.playFlashlightClick(next === 'uv');
            return next;
          });
        } else if (e.key === '1') setCameraAngle('overview');
        else if (e.key === '2') setCameraAngle('desk');
        else if (e.key === '3') setCameraAngle('bed');
        else if (e.key === '4') setCameraAngle('door');
        else if (e.key === '5' || e.key === 'v' || e.key === 'V') setCameraAngle('fps');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal, currentScreen, handleCaptureForensicPhoto]);

  const handleViewportWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (currentScreen !== 'crime_scene' || activeModal !== 'none') return;
    setZoomLevel(prev => {
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      return Math.min(2.25, Math.max(1.0, +(prev + delta).toFixed(2)));
    });
  };

  const inspectingClue = inspectingClueId ? clues.find(c => c.id === inspectingClueId) || null : null;
  const unlockedCount = clues.filter(c => c.unlocked).length;
  const approvedWarrantsCount = warrants.filter(w => w.approved).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col font-sans select-none text-slate-100">
      
      {/* Top Bar Contract (No backdrop-blur over WebGL) */}
      <header className="relative z-30 h-14 bg-slate-950/95 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-8 shrink-0">
        
        {/* Brand Wordmark */}
        <div
          onClick={() => setCurrentScreen('homescreen')}
          className="flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/50 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
            #409
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
            True Detective: Room 204
          </span>
        </div>

        {/* Unboxed Metadata & Navigation Links */}
        <div className="hidden md:flex items-center gap-5 text-xs font-mono text-slate-400">
          <button
            onClick={() => setCurrentScreen('homescreen')}
            className={`transition ${currentScreen === 'homescreen' ? 'text-amber-400 font-bold' : 'hover:text-white'}`}
          >
            Briefing
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setCurrentScreen('crime_scene')}
            className={`transition ${currentScreen === 'crime_scene' ? 'text-amber-400 font-bold' : 'hover:text-white'}`}
          >
            Room 204 3D
          </button>
          <span aria-hidden="true">·</span>
          <button onClick={() => setActiveModal('map')} className="hover:text-white transition">
            District Map
          </button>
          <span aria-hidden="true">·</span>
          <button onClick={() => setActiveModal('hints')} className="text-amber-300 hover:text-white transition">
            Hints
          </button>
          <span aria-hidden="true">·</span>
          <span className="text-slate-300">Clues: {unlockedCount}/{clues.length}</span>
        </div>

        {/* Primary DA Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveModal('solve')}
            className="px-4 py-2 text-xs font-mono font-bold text-white bg-red-700 hover:bg-red-600 rounded-xl transition shadow-lg whitespace-nowrap"
          >
            File DA Indictment
          </button>
        </div>
      </header>

      {/* Main Viewport: Persistent Live 3D WebGL Crime Scene */}
      <main
        onWheel={handleViewportWheel}
        className="relative flex-1 w-full h-full overflow-hidden bg-slate-950"
      >
        {/* Live 3D Three.js WebGL Room 204 */}
        <div className="absolute inset-0 z-0">
          <CrimeSceneCanvas
            ref={canvasRef}
            cameraZone={cameraAngle}
            zoomLevel={zoomLevel}
            flashlightMode={flashlightMode}
            clues={clues}
            cinematicIdle={currentScreen === 'homescreen'}
            isPaused={activeModal !== 'none'}
            onSelectMarker={handleSelectMarker}
            onHoverClue={setHoveredClue}
            onUpdateProjectedMarkers={setProjectedMarkers}
          />
        </div>

        {/* Subtle Noir Vignette (pointer-events-none) */}
        <div
          className="fixed inset-0 z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, transparent 58%, rgba(2, 6, 23, 0.72) 100%)'
          }}
        />

        {/* Camera Flash Shutter Burst */}
        {flashOverlayVisible && (
          <div className="fixed inset-0 z-40 bg-white/85 pointer-events-none transition-opacity duration-150" />
        )}

        {/* Home Screen Overlay (Runs directly over slowly orbiting 3D scene) */}
        {currentScreen === 'homescreen' && (
          <HomeScreen
            onStartInvestigation={() => {
              audio.ensureAudio();
              setCurrentScreen('crime_scene');
            }}
            onOpenMap={() => setActiveModal('map')}
            onOpenHints={() => setActiveModal('hints')}
            unlockedCluesCount={unlockedCount}
            totalCluesCount={clues.length}
            approvedWarrantsCount={approvedWarrantsCount}
            isAudioMuted={isAudioMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Interactive 3D HUD Marker Tags & Hover Prompt (Crime Scene Mode Only) */}
        {currentScreen === 'crime_scene' && activeModal === 'none' && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Minimal Top-Center Control Hint */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-950/88 border border-slate-800 px-3.5 py-1.5 rounded-full text-[11px] font-mono text-slate-300 whitespace-nowrap shadow-lg">
              {cameraAngle === 'fps'
                ? 'WALK: WASD / Arrows · LOOK: Drag · UV: [U] · SNAP PHOTO: [F]'
                : `DRAG TO LOOK · SCROLL TO ZOOM (${zoomLevel.toFixed(1)}x) · UV BLACKLIGHT [U] · PHOTO [F]`}
            </div>

            {/* Projected Screen Markers #1 - #6 */}
            {projectedMarkers.map(m =>
              m.visible ? (
                <button
                  key={m.clueId}
                  onClick={() => handleSelectMarker(m.clueId)}
                  style={{ left: `${m.x}px`, top: `${m.y}px`, transform: 'translate(-50%, -100%)' }}
                  className={`pointer-events-auto absolute px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border shadow-md transition-transform hover:scale-110 ${
                    m.unlocked
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70'
                      : 'bg-amber-500/95 text-slate-950 border-amber-200'
                  }`}
                >
                  #{m.markerNumber} {m.unlocked ? 'BAGGED' : 'INSPECT'}
                </button>
              ) : null
            )}

            {/* Hovered Clue Inspection Banner above Bottom Dock */}
            {hoveredClue && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-amber-500/60 px-4 py-2 rounded-xl shadow-2xl text-center">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                  {hoveredClue.category} · Click to Inspect 3D Artifact
                </span>
                <span className="text-xs font-bold text-white">{hoveredClue.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-14 right-4 z-40 max-w-sm bg-slate-900/95 border-l-4 border-amber-500 text-slate-100 px-4 py-3 rounded-xl shadow-2xl">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-0.5">
              Detective Field Update
            </span>
            <p className="text-xs text-slate-200">{toastMessage}</p>
          </div>
        )}
      </main>

      {/* Collapsible Bottom Control Dock */}
      <CollapsibleBottomDock
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        cameraAngle={cameraAngle}
        onSelectCameraAngle={setCameraAngle}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        flashlightMode={flashlightMode}
        onSelectFlashlightMode={setFlashlightMode}
        onCapturePhoto={handleCaptureForensicPhoto}
        onOpenModal={setActiveModal}
        unlockedCluesCount={unlockedCount}
        totalCluesCount={clues.length}
        approvedWarrantsCount={approvedWarrantsCount}
        totalWarrantsCount={warrants.length}
        isAudioMuted={isAudioMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Modals & Overlays */}
      {activeModal === 'inspect' && inspectingClue && (
        <ClueInspectorModal
          clue={inspectingClue}
          onClose={() => setActiveModal('none')}
          onPresentInInterrogation={handlePresentInInterrogation}
          onBagClue={handleBagClue}
        />
      )}

      {activeModal === 'map' && (
        <PrecinctMapModal
          onClose={() => setActiveModal('none')}
          onNavigateToLocation={handleMapNavigate}
          unlockedCluesCount={unlockedCount}
          approvedWarrantsCount={approvedWarrantsCount}
        />
      )}

      {activeModal === 'hints' && (
        <DetectiveHintsModal
          onClose={() => setActiveModal('none')}
          unlockedCluesCount={unlockedCount}
          approvedWarrantsCount={approvedWarrantsCount}
        />
      )}

      {activeModal === 'evidence' && (
        <EvidenceLockerModal
          clues={clues}
          onClose={() => setActiveModal('none')}
          onInspect3D={clue => {
            setInspectingClueId(clue.id);
            setActiveModal('inspect');
          }}
          onConfrontSuspect={handlePresentInInterrogation}
        />
      )}

      {activeModal === 'warrants' && (
        <WarrantsModal
          warrants={warrants}
          clues={clues}
          onClose={() => setActiveModal('none')}
          onApproveWarrant={handleApproveWarrant}
        />
      )}

      {activeModal === 'interrogate' && (
        <InterrogationModal
          suspects={suspects}
          clues={clues}
          preselectedClueId={interrogationClueId}
          onClose={() => {
            setActiveModal('none');
            setInterrogationClueId(null);
          }}
          onUpdateSuspectHistory={handleUpdateSuspectHistory}
        />
      )}

      {activeModal === 'archive' && (
        <CaseArchiveModal
          cases={PAST_CASES}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'solve' && (
        <IndictmentModal
          clues={clues}
          onClose={() => setActiveModal('none')}
        />
      )}

    </div>
  );
}
