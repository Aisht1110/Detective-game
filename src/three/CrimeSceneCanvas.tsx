import React, { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import {
  CameraZoneId,
  ClueItem,
  FlashlightMode,
  ProjectedMarker
} from '../types';
import {
  createMotelRoomScene,
  createEvidenceMarker,
  createWatchModel,
  createWhiskeyGlassModel,
  createTrophyModel,
  createLedgerModel,
  createVialModel
} from './proceduralModels';

export interface CrimeSceneCanvasHandle {
  captureForensicPhoto: () => string | null;
}

interface CrimeSceneCanvasProps {
  cameraZone: CameraZoneId;
  zoomLevel: number;
  flashlightMode: FlashlightMode;
  clues: ClueItem[];
  cinematicIdle: boolean;
  isPaused: boolean;
  onSelectMarker: (clueId: string) => void;
  onHoverClue: (clue: ClueItem | null) => void;
  onUpdateProjectedMarkers: (markers: ProjectedMarker[]) => void;
}

// Pre-allocated math helpers (Zero GC in render loop)
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _currentLook = new THREE.Vector3(0, 0.9, -0.3);
const _projVec = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _moveVec = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _rayAimPoint = new THREE.Vector3();
const _planeGround = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.6);

interface CameraPreset {
  pos: [number, number, number];
  look: [number, number, number];
}

const CAMERA_PRESETS: Record<Exclude<CameraZoneId, 'fps'>, CameraPreset> = {
  overview: { pos: [-0.25, 2.08, 2.45], look: [0.15, 0.72, -0.65] },
  desk: { pos: [0.85, 1.56, -0.05], look: [2.15, 0.76, -1.45] },
  bed: { pos: [0.45, 1.48, -0.75], look: [-1.25, 0.56, -2.1] },
  door: { pos: [1.35, 1.42, 0.35], look: [2.85, 0.68, 2.15] }
};

interface MarkerAnchorDef {
  clueId: string;
  markerNumber: number;
  label: string;
  markerPos: [number, number, number];
  markerRotY?: number;
  hitCenter: [number, number, number];
  hitSize: [number, number, number];
}

const MARKER_DEFS: MarkerAnchorDef[] = [
  {
    clueId: 'clue_corpse_inspection',
    markerNumber: 1,
    label: 'Chalk Outline & Scalp Wound',
    markerPos: [0.62, 0.0, 0.72],
    markerRotY: -0.35,
    hitCenter: [0.1, 0.14, 0.42],
    hitSize: [1.6, 0.3, 1.4]
  },
  {
    clueId: 'clue_broken_watch',
    markerNumber: 2,
    label: 'Broken Gold Watch (11:42)',
    markerPos: [-0.88, 0.0, 0.74],
    markerRotY: 0.45,
    hitCenter: [-0.68, 0.14, 0.65],
    hitSize: [0.55, 0.3, 0.55]
  },
  {
    clueId: 'clue_whiskey_glass',
    markerNumber: 3,
    label: 'Crystal Whiskey Tumbler',
    markerPos: [-0.82, 0.64, -2.28],
    markerRotY: 0.2,
    hitCenter: [-0.96, 0.78, -2.32],
    hitSize: [0.5, 0.35, 0.45]
  },
  {
    clueId: 'clue_bloody_trophy',
    markerNumber: 4,
    label: 'Brass Trophy Weapon',
    markerPos: [1.14, 0.0, -0.76],
    markerRotY: -0.5,
    hitCenter: [1.32, 0.2, -0.82],
    hitSize: [0.6, 0.45, 0.6]
  },
  {
    clueId: 'clue_financial_ledger',
    markerNumber: 5,
    label: 'Embezzlement Ledger ($400k)',
    markerPos: [1.74, 0.816, -1.26],
    markerRotY: -0.25,
    hitCenter: [2.05, 0.9, -1.38],
    hitSize: [0.75, 0.28, 0.65]
  },
  {
    clueId: 'clue_cyanide_vial',
    markerNumber: 6,
    label: 'Potassium Cyanide Vial #88',
    markerPos: [2.78, 0.0, 1.56],
    markerRotY: -2.4,
    hitCenter: [3.0, 0.2, 1.66],
    hitSize: [0.6, 0.45, 0.6]
  }
];

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
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

export const CrimeSceneCanvas = forwardRef<CrimeSceneCanvasHandle, CrimeSceneCanvasProps>(
  (
    {
      cameraZone,
      zoomLevel,
      flashlightMode,
      clues,
      cinematicIdle,
      isPaused,
      onSelectMarker,
      onHoverClue,
      onUpdateProjectedMarkers
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Mutable refs read inside the WebGL loop without re-creating renderer
    const propsRef = useRef({
      cameraZone,
      zoomLevel,
      flashlightMode,
      clues,
      cinematicIdle,
      isPaused,
      onSelectMarker,
      onHoverClue,
      onUpdateProjectedMarkers
    });
    propsRef.current = {
      cameraZone,
      zoomLevel,
      flashlightMode,
      clues,
      cinematicIdle,
      isPaused,
      onSelectMarker,
      onHoverClue,
      onUpdateProjectedMarkers
    };

    const markerGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
    const markerAnchorsRef = useRef<Map<string, THREE.Vector3>>(new Map());
    const captureFnRef = useRef<(() => string | null) | null>(null);

    useImperativeHandle(ref, () => ({
      captureForensicPhoto: () => {
        if (captureFnRef.current) {
          return captureFnRef.current();
        }
        return null;
      }
    }));

    // Update marker tent visual state when clues change (locked yellow -> bagged emerald)
    useEffect(() => {
      MARKER_DEFS.forEach(def => {
        const group = markerGroupsRef.current.get(def.clueId);
        const clue = clues.find(c => c.id === def.clueId);
        if (!group || !clue) return;
        const wasUnlocked = group.userData.unlocked === true;
        if (wasUnlocked !== clue.unlocked) {
          group.userData.unlocked = clue.unlocked;
          group.clear();
          const rebuilt = createEvidenceMarker(def.markerNumber, clue.unlocked);
          rebuilt.traverse(obj => {
            obj.userData.clueId = def.clueId;
          });
          group.add(rebuilt);
        }
      });
    }, [clues]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const isSoftwareGl = detectSoftwareWebGL();
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance'
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x040711);
      scene.fog = new THREE.FogExp2(0x040711, 0.065);

      const camera = new THREE.PerspectiveCamera(52, width / height, 0.08, 45);
      camera.position.set(-0.25, 2.08, 2.45);
      camera.lookAt(_currentLook);

      // Studio PBR Environment Reflections
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();

      // Build Motel Room 204 Architecture & Atmosphere
      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const roomHandles = createMotelRoomScene(maxAniso);
      scene.add(roomHandles.roomGroup);

      // Lighting Rig: Cool/Warm Chiaroscuro Noir + Exterior Police Sirens
      const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 0.34);
      scene.add(hemiLight);

      const moonDirLight = new THREE.DirectionalLight(0x7dd3fc, 0.72);
      moonDirLight.position.set(-7.5, 3.2, -0.6);
      moonDirLight.target.position.set(0.5, 0.4, -0.2);
      moonDirLight.castShadow = !isSoftwareGl;
      moonDirLight.shadow.mapSize.set(1024, 1024);
      moonDirLight.shadow.camera.near = 1;
      moonDirLight.shadow.camera.far = 16;
      moonDirLight.shadow.camera.left = -4;
      moonDirLight.shadow.camera.right = 4;
      moonDirLight.shadow.camera.top = 3;
      moonDirLight.shadow.camera.bottom = -3;
      moonDirLight.shadow.bias = -0.0005;
      moonDirLight.shadow.normalBias = 0.02;
      scene.add(moonDirLight);
      scene.add(moonDirLight.target);

      const redSiren = new THREE.PointLight(0xef4444, 0.9, 9, 1.5);
      redSiren.position.set(-5.4, 2.2, -1.8);
      scene.add(redSiren);

      const blueSiren = new THREE.PointLight(0x3b82f6, 0.9, 9, 1.5);
      blueSiren.position.set(-5.4, 2.2, 0.6);
      scene.add(blueSiren);

      // Flashlight SpotLight + Volumetric Beam + Camera Flash Burst Light
      const flashlight = new THREE.SpotLight(0xfffbeb, 5.2, 11, Math.PI / 5.5, 0.48, 1.3);
      flashlight.castShadow = !isSoftwareGl;
      flashlight.shadow.bias = -0.0004;
      scene.add(flashlight);
      scene.add(flashlight.target);

      const beamGeo = new THREE.ConeGeometry(0.65, 3.6, 24, 1, true);
      beamGeo.translate(0, -1.8, 0);
      beamGeo.rotateX(Math.PI / 2);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xfef3c7,
        transparent: true,
        opacity: 0.045,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const flashlightCone = new THREE.Mesh(beamGeo, beamMat);
      scene.add(flashlightCone);

      const flashBurstLight = new THREE.PointLight(0xffffff, 0, 12, 1.2);
      scene.add(flashBurstLight);

      // --- Populate Interactive 3D Forensic Evidence Props & Markers ---
      const uvDynamicMaterials: THREE.MeshStandardMaterial[] = [...roomHandles.uvReactiveParts];
      const interactableHitMeshes: THREE.Object3D[] = [];

      // Marker #2: Broken Gold Watch on carpet near chalk hand
      const watchBuild = createWatchModel(false);
      watchBuild.group.position.set(-0.62, 0.018, 0.62);
      watchBuild.group.rotation.y = 0.72;
      scene.add(watchBuild.group);
      uvDynamicMaterials.push(...watchBuild.uvMaterials);

      // Marker #3: Crystal Whiskey Tumbler on Nightstand
      const glassBuild = createWhiskeyGlassModel(false);
      glassBuild.group.position.set(-1.02, 0.64, -2.28);
      scene.add(glassBuild.group);
      uvDynamicMaterials.push(...glassBuild.uvMaterials);

      // Marker #4: Brass Trophy on floor near desk
      const trophyBuild = createTrophyModel(false);
      trophyBuild.group.position.set(1.42, 0.06, -0.82);
      trophyBuild.group.rotation.set(Math.PI / 2 - 0.1, 0.45, 0.7);
      scene.add(trophyBuild.group);
      uvDynamicMaterials.push(...trophyBuild.uvMaterials);

      // Marker #5: Embezzlement Audit Ledger on Executive Desk
      const ledgerGroup = createLedgerModel();
      ledgerGroup.position.set(2.14, 0.816, -1.42);
      ledgerGroup.rotation.y = -0.22;
      scene.add(ledgerGroup);

      // Marker #6: Potassium Cyanide Vial beside Wastebasket
      const vialBuild = createVialModel(false);
      vialBuild.group.position.set(2.98, 0.046, 1.62);
      vialBuild.group.rotation.set(Math.PI / 2, 0.4, -0.9);
      scene.add(vialBuild.group);
      uvDynamicMaterials.push(...vialBuild.uvMaterials);

      // Build Evidence Markers & Invisible Raycast Collision Hitboxes (Layer 1)
      MARKER_DEFS.forEach(def => {
        const clue = propsRef.current.clues.find(c => c.id === def.clueId);
        const isUnlocked = Boolean(clue?.unlocked);

        const holder = new THREE.Group();
        holder.position.set(...def.markerPos);
        if (def.markerRotY) holder.rotation.y = def.markerRotY;
        holder.userData.unlocked = isUnlocked;
        holder.userData.clueId = def.clueId;

        const markerMesh = createEvidenceMarker(def.markerNumber, isUnlocked);
        markerMesh.traverse(obj => {
          obj.userData.clueId = def.clueId;
        });
        holder.add(markerMesh);
        scene.add(holder);
        markerGroupsRef.current.set(def.clueId, holder);
        markerAnchorsRef.current.set(
          def.clueId,
          new THREE.Vector3(def.markerPos[0], def.markerPos[1] + 0.3, def.markerPos[2])
        );

        const hitBox = new THREE.Mesh(
          new THREE.BoxGeometry(...def.hitSize),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        hitBox.position.set(...def.hitCenter);
        hitBox.layers.set(1);
        hitBox.userData.clueId = def.clueId;
        scene.add(hitBox);
        interactableHitMeshes.push(hitBox);
      });

      // Post-Processing on Hardware GPU only
      let composer: EffectComposer | null = null;
      if (!isSoftwareGl) {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(width, height),
          0.42,
          0.38,
          0.86
        );
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());
      } else {
        // Software WebGL keeps exact same scene without multi-pass bloom
      }

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      // Pointer, Keyboard (FPS WASD), & Raycast State
      const keysDown: Record<string, boolean> = {};
      const pointerNdc = new THREE.Vector2(0, 0);
      let isDragging = false;
      let dragMoved = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let lookYaw = 0;
      let lookPitch = -0.15;
      let fpsPos = new THREE.Vector3(0, 1.56, 2.1);
      let lastZone: CameraZoneId = propsRef.current.cameraZone;
      let lastHoverCheck = 0;
      let hoveredClueId: string | null = null;
      let flashFade = 0;

      const raycaster = new THREE.Raycaster();
      raycaster.layers.set(1);

      const updatePointer = (clientX: number, clientY: number) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      };

      const onPointerDown = (e: PointerEvent) => {
        if (propsRef.current.isPaused || propsRef.current.cinematicIdle) return;
        isDragging = true;
        dragMoved = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        updatePointer(e.clientX, e.clientY);
      };

      const onPointerMove = (e: PointerEvent) => {
        updatePointer(e.clientX, e.clientY);
        if (isDragging && !propsRef.current.isPaused && !propsRef.current.cinematicIdle) {
          const dx = e.clientX - dragStartX;
          const dy = e.clientY - dragStartY;
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            dragMoved = true;
          }
          const sensitivity = propsRef.current.cameraZone === 'fps' ? 0.0035 : 0.0022;
          lookYaw -= dx * sensitivity;
          lookPitch = THREE.MathUtils.clamp(lookPitch - dy * sensitivity, -1.0, 0.75);
          dragStartX = e.clientX;
          dragStartY = e.clientY;
        }

        const now = performance.now();
        if (now - lastHoverCheck > 45 && !propsRef.current.isPaused && !propsRef.current.cinematicIdle) {
          lastHoverCheck = now;
          raycaster.setFromCamera(pointerNdc, camera);
          const hits = raycaster.intersectObjects(interactableHitMeshes, false);
          const hitId = hits.length > 0 ? (hits[0].object.userData.clueId as string) : null;
          if (hitId !== hoveredClueId) {
            hoveredClueId = hitId;
            renderer.domElement.style.cursor = hitId ? 'pointer' : 'crosshair';
            const found = hitId ? propsRef.current.clues.find(c => c.id === hitId) || null : null;
            propsRef.current.onHoverClue(found);
          }
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        if (!dragMoved && !propsRef.current.isPaused && !propsRef.current.cinematicIdle) {
          updatePointer(e.clientX, e.clientY);
          raycaster.setFromCamera(pointerNdc, camera);
          const hits = raycaster.intersectObjects(interactableHitMeshes, false);
          if (hits.length > 0) {
            const clueId = hits[0].object.userData.clueId as string;
            if (clueId) propsRef.current.onSelectMarker(clueId);
          }
        }
      };

      const onKeyDown = (e: KeyboardEvent) => {
        keysDown[e.code] = true;
      };
      const onKeyUp = (e: KeyboardEvent) => {
        keysDown[e.code] = false;
      };

      const onResize = () => {
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (composer) {
          composer.setSize(w, h);
        }
      };

      const canvasEl = renderer.domElement;
      canvasEl.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('resize', onResize);

      // Expose imperative photo snapshot function
      captureFnRef.current = () => {
        flashFade = 1.0;
        flashBurstLight.position.copy(camera.position);
        flashBurstLight.intensity = 14;
        if (composer) composer.render();
        else renderer.render(scene, camera);
        try {
          return renderer.domElement.toDataURL('image/jpeg', 0.88);
        } catch {
          return null;
        }
      };

      // Animation Loop with Software-WebGL afterDraw Pacing
      let frameId = 0;
      let disposed = false;
      const clock = new THREE.Clock();
      let lastProjectionEmit = 0;

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
        const elapsed = clock.getElapsedTime();
        const state = propsRef.current;

        // Reset drag offsets when switching preset zone
        if (state.cameraZone !== lastZone) {
          lastZone = state.cameraZone;
          if (state.cameraZone === 'fps') {
            fpsPos.copy(camera.position);
            fpsPos.y = 1.56;
            fpsPos.x = THREE.MathUtils.clamp(fpsPos.x, -3.2, 3.2);
            fpsPos.z = THREE.MathUtils.clamp(fpsPos.z, -2.2, 2.2);
          } else {
            lookYaw = 0;
            lookPitch = 0;
          }
        }

        // 1. Camera Placement (Cinematic Idle vs Preset Glide vs First-Person WASD)
        if (state.cinematicIdle) {
          const orbitAngle = elapsed * 0.14;
          _targetPos.set(Math.sin(orbitAngle) * 2.55, 1.92 + Math.sin(elapsed * 0.25) * 0.12, Math.cos(orbitAngle) * 2.15 + 0.15);
          _targetLook.set(0.15, 0.72, -0.55);
          camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetPos.x, 3.5, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetPos.y, 3.5, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetPos.z, 3.5, dt);
          _currentLook.x = THREE.MathUtils.damp(_currentLook.x, _targetLook.x, 3.5, dt);
          _currentLook.y = THREE.MathUtils.damp(_currentLook.y, _targetLook.y, 3.5, dt);
          _currentLook.z = THREE.MathUtils.damp(_currentLook.z, _targetLook.z, 3.5, dt);
          camera.lookAt(_currentLook);
        } else if (state.cameraZone === 'fps') {
          if (!state.isPaused) {
            _forward.set(-Math.sin(lookYaw), 0, -Math.cos(lookYaw)).normalize();
            _right.crossVectors(_forward, _up).normalize();
            _moveVec.set(0, 0, 0);
            if (keysDown['KeyW'] || keysDown['ArrowUp']) _moveVec.add(_forward);
            if (keysDown['KeyS'] || keysDown['ArrowDown']) _moveVec.sub(_forward);
            if (keysDown['KeyD'] || keysDown['ArrowRight']) _moveVec.add(_right);
            if (keysDown['KeyA'] || keysDown['ArrowLeft']) _moveVec.sub(_right);
            if (_moveVec.lengthSq() > 0) {
              _moveVec.normalize().multiplyScalar(2.4 * dt);
              fpsPos.add(_moveVec);
              fpsPos.x = THREE.MathUtils.clamp(fpsPos.x, -3.25, 3.25);
              fpsPos.z = THREE.MathUtils.clamp(fpsPos.z, -2.35, 2.35);
            }
          }
          camera.position.x = THREE.MathUtils.damp(camera.position.x, fpsPos.x, 8, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.56, 8, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, fpsPos.z, 8, dt);

          const cosP = Math.cos(lookPitch);
          _targetLook.set(
            camera.position.x - Math.sin(lookYaw) * cosP * 2.0,
            camera.position.y + Math.sin(lookPitch) * 2.0,
            camera.position.z - Math.cos(lookYaw) * cosP * 2.0
          );
          camera.lookAt(_targetLook);
        } else {
          const preset = CAMERA_PRESETS[state.cameraZone] || CAMERA_PRESETS.overview;
          const swayX = THREE.MathUtils.clamp(lookYaw * 0.45, -0.55, 0.55);
          const swayY = THREE.MathUtils.clamp(lookPitch * 0.3, -0.25, 0.35);
          _targetPos.set(preset.pos[0] + swayX, preset.pos[1] + swayY, preset.pos[2]);
          _targetLook.set(preset.look[0] + swayX * 0.5, preset.look[1] - swayY * 0.3, preset.look[2]);

          camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetPos.x, 5.5, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetPos.y, 5.5, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetPos.z, 5.5, dt);
          _currentLook.x = THREE.MathUtils.damp(_currentLook.x, _targetLook.x, 5.5, dt);
          _currentLook.y = THREE.MathUtils.damp(_currentLook.y, _targetLook.y, 5.5, dt);
          _currentLook.z = THREE.MathUtils.damp(_currentLook.z, _targetLook.z, 5.5, dt);
          camera.lookAt(_currentLook);
        }

        // Smooth Zoom FOV
        const targetFov = 52 / Math.max(1, state.zoomLevel);
        if (Math.abs(camera.fov - targetFov) > 0.05) {
          camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 7, dt);
          camera.updateProjectionMatrix();
        }

        // 2. Dynamic Noir Room Atmosphere (Rain, Dust, Ceiling Fan, Neon Sign Flicker, Sirens)
        roomHandles.ceilingFan.rotation.y += dt * 1.9;

        const rainAttr = roomHandles.rainPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
        const rainArr = rainAttr.array as Float32Array;
        for (let i = 0; i < rainArr.length; i += 3) {
          rainArr[i + 1] -= dt * 7.8;
          if (rainArr[i + 1] < 0) rainArr[i + 1] = 4.0;
        }
        rainAttr.needsUpdate = true;

        const dustAttr = roomHandles.dustPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
        const dustArr = dustAttr.array as Float32Array;
        for (let i = 0; i < dustArr.length; i += 3) {
          dustArr[i + 1] += Math.sin(elapsed * 0.8 + i) * dt * 0.035;
          dustArr[i] += Math.cos(elapsed * 0.6 + i) * dt * 0.02;
        }
        dustAttr.needsUpdate = true;

        // Neon Motel Sign flicker
        const flicker = Math.sin(elapsed * 22) > 0.92 && Math.cos(elapsed * 7) > 0.4 ? 0.45 : 1.75;
        roomHandles.neonSignMat.emissiveIntensity = flicker;
        roomHandles.neonLight.intensity = flicker * 0.85;

        // Alternating Police Sirens outside blinds
        const sirenWave = Math.sin(elapsed * 5.2);
        redSiren.intensity = sirenWave > 0 ? sirenWave * 1.45 : 0.08;
        blueSiren.intensity = sirenWave < 0 ? -sirenWave * 1.45 : 0.08;

        // 3. Flashlight & 365nm UV Blacklight Mode
        const isUv = state.flashlightMode === 'uv';
        const isLightOn = state.flashlightMode !== 'off';

        const uvMat = roomHandles.uvFootprintsMesh.material as THREE.MeshBasicMaterial;
        const targetUvOpacity = isUv ? 0.92 : 0.0;
        uvMat.opacity = THREE.MathUtils.damp(uvMat.opacity, targetUvOpacity, 8, dt);

        uvDynamicMaterials.forEach(m => {
          const targetEmissive = isUv ? 2.4 : 0.03;
          m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, targetEmissive, 8, dt);
          if (m.transparent) {
            m.opacity = THREE.MathUtils.damp(m.opacity, isUv ? 0.95 : 0.04, 8, dt);
          }
        });

        // Dim room lights slightly during UV scan so fluorescence pops dramatically
        roomHandles.ceilingLight.intensity = THREE.MathUtils.damp(
          roomHandles.ceilingLight.intensity,
          isUv ? 0.25 : 0.82,
          6,
          dt
        );
        roomHandles.bankerLight.intensity = THREE.MathUtils.damp(
          roomHandles.bankerLight.intensity,
          isUv ? 0.95 : 2.35,
          6,
          dt
        );

        flashlight.position.copy(camera.position).addScaledVector(_up, -0.08);
        if (state.cinematicIdle || state.cameraZone === 'fps') {
          camera.getWorldDirection(_forward);
          _rayAimPoint.copy(camera.position).addScaledVector(_forward, 4.0);
        } else {
          raycaster.setFromCamera(pointerNdc, camera);
          if (!raycaster.ray.intersectPlane(_planeGround, _rayAimPoint)) {
            camera.getWorldDirection(_forward);
            _rayAimPoint.copy(camera.position).addScaledVector(_forward, 4.0);
          }
        }
        flashlight.target.position.copy(_rayAimPoint);
        flashlight.intensity = isLightOn ? (isUv ? 6.4 : 5.2) : 0;
        flashlight.color.setHex(isUv ? 0xa855f7 : 0xfffbeb);

        flashlightCone.visible = isLightOn;
        flashlightCone.position.copy(flashlight.position);
        flashlightCone.lookAt(_rayAimPoint);
        beamMat.color.setHex(isUv ? 0xa855f7 : 0xfef3c7);
        beamMat.opacity = isUv ? 0.075 : 0.038;

        // Camera flash burst decay
        if (flashFade > 0.01) {
          flashFade = THREE.MathUtils.damp(flashFade, 0, 10, dt);
          flashBurstLight.intensity = flashFade * 14;
        } else {
          flashBurstLight.intensity = 0;
        }

        // 4. Render Scene
        if (composer) composer.render();
        else renderer.render(scene, camera);

        // 5. Project 3D Marker Coordinates to HUD (throttled ~24fps to avoid React churn)
        const nowMs = performance.now();
        if (!state.cinematicIdle && nowMs - lastProjectionEmit > 42) {
          lastProjectionEmit = nowMs;
          const cw = container.clientWidth || window.innerWidth;
          const ch = container.clientHeight || window.innerHeight;
          const projected: ProjectedMarker[] = MARKER_DEFS.map(def => {
            const anchor = markerAnchorsRef.current.get(def.clueId)!;
            _projVec.copy(anchor).project(camera);
            const inFront = _projVec.z >= -1 && _projVec.z <= 1;
            const x = ((_projVec.x + 1) / 2) * cw;
            const y = ((-_projVec.y + 1) / 2) * ch;
            const onScreen = inFront && x > 32 && x < cw - 32 && y > 32 && y < ch - 70;
            const clue = state.clues.find(c => c.id === def.clueId);
            return {
              clueId: def.clueId,
              markerNumber: def.markerNumber,
              label: def.label,
              x,
              y,
              visible: onScreen,
              unlocked: Boolean(clue?.unlocked)
            };
          });
          state.onUpdateProjectedMarkers(projected);
        }

        if (isSoftwareGl) afterDraw(tick);
        else frameId = requestAnimationFrame(tick);
      };

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        canvasEl.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('resize', onResize);

        scene.traverse(obj => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
            obj.geometry?.dispose();
            const mat = obj.material;
            if (Array.isArray(mat)) mat.forEach(m => m.dispose());
            else mat?.dispose();
          }
        });
        if (composer) composer.dispose();
        renderer.dispose();
        if (canvasEl.parentNode === container) {
          container.removeChild(canvasEl);
        }
      };
    }, []);

    return <div ref={containerRef} className="w-full h-full relative" />;
  }
);

CrimeSceneCanvas.displayName = 'CrimeSceneCanvas';
