import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ClueItem } from '../types';
import { audio } from '../services/audioService';
import {
  createWatchModel,
  createWhiskeyGlassModel,
  createTrophyModel,
  createLedgerModel,
  createVialModel
} from '../three/proceduralModels';
import { createChalkAndBloodTexture } from '../three/proceduralTextures';

interface ClueInspectorModalProps {
  clue: ClueItem;
  onClose: () => void;
  onPresentInInterrogation: (clueId: string) => void;
  onBagClue: (clueId: string) => void;
}

function isSoftwareWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const ClueInspectorModal: React.FC<ClueInspectorModalProps> = ({
  clue,
  onClose,
  onPresentInInterrogation,
  onBagClue
}) => {
  const [isUvActive, setIsUvActive] = useState(false);
  const [zoomDist, setZoomDist] = useState(0.65);
  const [viewMode, setViewMode] = useState<'3d' | 'photo'>(clue.capturedPhoto ? '3d' : '3d');

  const mountRef = useRef<HTMLDivElement | null>(null);
  const uvRef = useRef(isUvActive);
  uvRef.current = isUvActive;
  const zoomRef = useRef(zoomDist);
  zoomRef.current = zoomDist;

  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = mountRef.current;
    if (!container) return;

    const isSw = isSoftwareWebGL();
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 300;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSw,
      powerPreference: 'high-performance'
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setPixelRatio(isSw ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSw;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.04, 15);
    camera.position.set(0, 0.34, 0.65);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Dark forensic evidence plinth
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.42, 0.04, 48),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.38, metalness: 0.45 })
    );
    plinth.position.y = -0.02;
    plinth.receiveShadow = true;
    scene.add(plinth);

    const rimRing = new THREE.Mesh(
      new THREE.RingGeometry(0.37, 0.382, 48),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    rimRing.rotation.x = -Math.PI / 2;
    rimRing.position.y = 0.002;
    scene.add(rimRing);

    // 3-Point Forensic Lab Studio Lighting
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.5);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    keyLight.position.set(1.2, 2.0, 1.5);
    keyLight.castShadow = !isSw;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 1.4, 5);
    rimLight.position.set(-1.1, 0.9, -1.2);
    scene.add(rimLight);

    const uvLamp = new THREE.SpotLight(0xa855f7, 0, 4, Math.PI / 4, 0.4);
    uvLamp.position.set(0.3, 1.4, 0.8);
    scene.add(uvLamp);
    scene.add(uvLamp.target);

    // Build Physical Artifact Group
    const artifactRoot = new THREE.Group();
    const uvMaterials: THREE.MeshStandardMaterial[] = [];

    if (clue.modelType === 'watch') {
      const built = createWatchModel(false);
      built.group.scale.setScalar(1.35);
      built.group.position.y = 0.025;
      artifactRoot.add(built.group);
      uvMaterials.push(...built.uvMaterials);
    } else if (clue.modelType === 'glass') {
      const built = createWhiskeyGlassModel(false);
      built.group.scale.setScalar(1.15);
      artifactRoot.add(built.group);
      uvMaterials.push(...built.uvMaterials);
    } else if (clue.modelType === 'trophy') {
      const built = createTrophyModel(false);
      built.group.scale.setScalar(0.88);
      artifactRoot.add(built.group);
      uvMaterials.push(...built.uvMaterials);
    } else if (clue.modelType === 'ledger') {
      const built = createLedgerModel();
      built.scale.setScalar(1.05);
      artifactRoot.add(built);
    } else if (clue.modelType === 'vial') {
      const built = createVialModel(false);
      built.group.scale.setScalar(1.7);
      artifactRoot.add(built.group);
      uvMaterials.push(...built.uvMaterials);
    } else if (clue.modelType === 'body') {
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.02, 0.54),
        new THREE.MeshStandardMaterial({ color: 0x3f1d2b, roughness: 0.9 })
      );
      slab.position.y = 0.01;
      artifactRoot.add(slab);
      const decal = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.5),
        new THREE.MeshStandardMaterial({ map: createChalkAndBloodTexture(), transparent: true, roughness: 0.85 })
      );
      decal.rotation.x = -Math.PI / 2;
      decal.position.y = 0.022;
      artifactRoot.add(decal);
    } else {
      // Forensic Case Dossier / Warrant Document 3D Binder
      const folder = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.02, 0.46),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 })
      );
      folder.position.y = 0.01;
      artifactRoot.add(folder);
      const page = new THREE.Mesh(
        new THREE.BoxGeometry(0.33, 0.012, 0.43),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.75 })
      );
      page.position.set(0.01, 0.022, 0.01);
      page.rotation.y = 0.05;
      artifactRoot.add(page);
    }

    scene.add(artifactRoot);

    // Drag Rotate Controls
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let targetRotY = 0.4;
    let targetPitch = 0.52;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      targetRotY += (e.clientX - lastX) * 0.01;
      targetPitch = THREE.MathUtils.clamp(targetPitch + (e.clientY - lastY) * 0.008, 0.15, 1.35);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
    };
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 420;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('resize', onResize);

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    let currentDist = zoomRef.current;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.08);
      if (!dragging) {
        targetRotY += dt * 0.35;
      }

      artifactRoot.rotation.y = THREE.MathUtils.damp(artifactRoot.rotation.y, targetRotY, 8, dt);

      currentDist = THREE.MathUtils.damp(currentDist, zoomRef.current, 7, dt);
      camera.position.set(
        0,
        Math.sin(targetPitch) * currentDist + 0.08,
        Math.cos(targetPitch) * currentDist
      );
      camera.lookAt(0, 0.09, 0);

      const uvOn = uvRef.current;
      keyLight.intensity = THREE.MathUtils.damp(keyLight.intensity, uvOn ? 0.3 : 2.2, 8, dt);
      hemi.intensity = THREE.MathUtils.damp(hemi.intensity, uvOn ? 0.14 : 0.5, 8, dt);
      uvLamp.intensity = THREE.MathUtils.damp(uvLamp.intensity, uvOn ? 5.2 : 0, 8, dt);

      uvMaterials.forEach(mat => {
        mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, uvOn ? 2.6 : 0.04, 8, dt);
        if (mat.transparent) {
          mat.opacity = THREE.MathUtils.damp(mat.opacity, uvOn ? 0.95 : 0.03, 8, dt);
        }
      });

      renderer.render(scene, camera);
      if (isSw) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    if (isSw) afterDraw(tick);
    else frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', onResize);

      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach(x => x.dispose());
          else m?.dispose();
        }
      });
      renderer.dispose();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, [clue, viewMode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
              style={{
                backgroundColor: `${clue.accentColor}25`,
                color: clue.accentColor,
                border: `1px solid ${clue.accentColor}60`
              }}
            >
              #{clue.markerNumber || 'DOC'}
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">{clue.name}</h2>
              <span className="text-[11px] font-mono text-slate-400">
                {clue.category} · {clue.location}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition"
          >
            Close [ESC]
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          
          {/* Left: Interactive 3D Artifact Viewport / Captured Forensic Photo */}
          <div className="md:col-span-6 bg-slate-950 relative border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-center justify-between p-4 min-h-[340px]">
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
              <span>{viewMode === '3d' ? 'DRAG TO ROTATE 360° · 3D LAB SCAN' : '35MM FORENSIC FIELD PHOTO'}</span>
              {clue.capturedPhoto && (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-2 py-0.5 rounded ${viewMode === '3d' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    3D Model
                  </button>
                  <button
                    onClick={() => setViewMode('photo')}
                    className={`px-2 py-0.5 rounded ${viewMode === 'photo' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    Snapped Photo
                  </button>
                </div>
              )}
            </div>

            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              {viewMode === '3d' ? (
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              ) : (
                <img
                  src={clue.capturedPhoto}
                  alt={`Forensic Photo - ${clue.name}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* UV Toggle & Zoom Controls */}
            <div className="mt-3 w-full flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  setIsUvActive(!isUvActive);
                  audio.playFlashlightClick(!isUvActive);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow ${
                  isUvActive
                    ? 'bg-purple-600 text-white border border-purple-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-700'
                }`}
              >
                <span>365nm UV Lamp: {isUvActive ? 'ACTIVE' : 'OFF'}</span>
              </button>

              {viewMode === '3d' && (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
                  <button
                    onClick={() => setZoomDist(d => Math.min(1.05, +(d + 0.12).toFixed(2)))}
                    className="px-2.5 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                  >
                    -
                  </button>
                  <span className="px-1.5 text-[11px] text-amber-400">Zoom</span>
                  <button
                    onClick={() => setZoomDist(d => Math.max(0.36, +(d - 0.12).toFixed(2)))}
                    className="px-2.5 py-0.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Forensic Dossier & Lab Findings */}
          <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-4 bg-slate-900/80 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-amber-400 block mb-1">
                  Field Summary & Description
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{clue.summary}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/30">
                <span className="text-xs font-mono font-bold uppercase text-amber-400 block mb-1">
                  Forensic Laboratory & Detective Analysis
                </span>
                <p className="text-xs text-amber-100/90 leading-relaxed">{clue.forensicDetail}</p>
              </div>

              {clue.uvFluorescentNote && (
                <div
                  className={`p-3.5 rounded-xl border transition ${
                    isUvActive
                      ? 'bg-purple-950/50 border-purple-500/70 text-purple-100'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-mono font-bold uppercase text-purple-400 block mb-1">
                    Ultraviolet Fluorescence (365nm)
                  </span>
                  <p className="text-xs leading-relaxed">{clue.uvFluorescentNote}</p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                {!clue.unlocked ? (
                  <button
                    onClick={() => {
                      audio.playClueDiscovered();
                      onBagClue(clue.id);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs font-mono transition shadow-lg"
                  >
                    Bag Clue #{clue.markerNumber}
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 px-2.5 py-1.5 bg-emerald-950/60 rounded-xl border border-emerald-800">
                    Logged in Custody
                  </span>
                )}
              </div>

              <button
                onClick={() => onPresentInInterrogation(clue.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs font-mono transition"
              >
                Confront Suspect
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
