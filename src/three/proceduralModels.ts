import * as THREE from 'three';
import {
  createCarpetPBR,
  createWoodPBR,
  createWallpaperPBR,
  createChalkAndBloodTexture,
  createUvFootprintsTexture,
  createMarkerNumberTexture,
  createWatchDialTexture,
  createLedgerTexture,
  createVialLabelTexture,
  createNeonMotelTexture,
  createDoorPlaqueTexture,
  createPoliceTapeTexture,
  createUvPrintTexture,
  createPaintingTexture
} from './proceduralTextures';

export interface SceneDynamicHandles {
  roomGroup: THREE.Group;
  bankerLight: THREE.PointLight;
  ceilingLight: THREE.PointLight;
  ceilingFan: THREE.Group;
  neonSignMat: THREE.MeshStandardMaterial;
  neonLight: THREE.PointLight;
  uvFootprintsMesh: THREE.Mesh;
  uvReactiveParts: THREE.MeshStandardMaterial[];
  rainPoints: THREE.Points;
  dustPoints: THREE.Points;
}

export function createEvidenceMarker(markerNumber: number, unlocked: boolean): THREE.Group {
  const group = new THREE.Group();
  group.name = `marker_${markerNumber}`;

  const numTex = createMarkerNumberTexture(markerNumber, unlocked);

  const tentMat = new THREE.MeshStandardMaterial({
    color: unlocked ? 0x10b981 : 0xf59e0b,
    roughness: 0.35,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  const faceMat = new THREE.MeshStandardMaterial({
    map: numTex,
    roughness: 0.3,
    metalness: 0.05,
    emissive: unlocked ? 0x059669 : 0xd97706,
    emissiveIntensity: 0.18
  });

  // 1. Front A-frame face
  const leftFace = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.22), faceMat);
  leftFace.position.set(0, 0.095, 0.045);
  leftFace.rotation.x = -Math.PI / 6;
  leftFace.castShadow = true;
  group.add(leftFace);

  // 2. Back A-frame face
  const rightFace = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.22), tentMat);
  rightFace.position.set(0, 0.095, -0.045);
  rightFace.rotation.x = Math.PI / 6;
  rightFace.castShadow = true;
  group.add(rightFace);

  // 3. Stabilizer base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.19, 0.012, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
  );
  base.position.y = 0.006;
  group.add(base);

  // 4. Ground locator ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.18, 32),
    new THREE.MeshBasicMaterial({
      color: unlocked ? 0x10b981 : 0xf59e0b,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.003;
  group.add(ring);

  return group;
}

export function createWatchModel(isUv = false): {
  group: THREE.Group;
  uvMaterials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();
  const uvMaterials: THREE.MeshStandardMaterial[] = [];

  const brushedGold = new THREE.MeshPhysicalMaterial({
    color: 0xfbbf24,
    roughness: 0.16,
    metalness: 0.94,
    anisotropy: 0.8,
    clearcoat: 0.4
  });

  // 1. Main gold watch case
  const caseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.045, 36), brushedGold);
  caseMesh.castShadow = true;
  group.add(caseMesh);

  // 2. Beveled gold bezel ring
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.136, 0.014, 16, 36), brushedGold);
  bezel.rotation.x = Math.PI / 2;
  bezel.position.y = 0.022;
  group.add(bezel);

  // 3. Champagne dial frozen at 11:42
  const dial = new THREE.Mesh(
    new THREE.CircleGeometry(0.126, 36),
    new THREE.MeshStandardMaterial({
      map: createWatchDialTexture(),
      roughness: 0.25,
      metalness: 0.55
    })
  );
  dial.rotation.x = -Math.PI / 2;
  dial.position.y = 0.024;
  group.add(dial);

  // 4. Fractured sapphire crystal dome
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.01, 36),
    new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.35,
      roughness: 0.06,
      metalness: 0.1,
      ior: 1.77,
      clearcoat: 1.0
    })
  );
  glass.position.y = 0.028;
  group.add(glass);

  // 5. Winding crown & pushers
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.032, 16), brushedGold);
  crown.rotation.z = Math.PI / 2;
  crown.position.set(0.155, 0, 0);
  group.add(crown);

  // 6. Lugs (4 gold lugs)
  [
    [-0.06, -0.14],
    [0.06, -0.14],
    [-0.06, 0.14],
    [0.06, 0.14]
  ].forEach(([lx, lz]) => {
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.024, 0.05), brushedGold);
    lug.position.set(lx, -0.005, lz);
    group.add(lug);
  });

  // 7. Torn alligator leather straps
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x26120b,
    roughness: 0.78,
    metalness: 0.05
  });
  const topStrap = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.016, 0.22), leatherMat);
  topStrap.position.set(0, -0.005, -0.24);
  topStrap.rotation.x = 0.06;
  group.add(topStrap);

  const tornStrap = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.016, 0.14), leatherMat);
  tornStrap.position.set(0, -0.008, 0.21);
  tornStrap.rotation.x = -0.12;
  group.add(tornStrap);

  // 8. UV Skin cell transfer glow on clasp
  const uvSpotMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: isUv ? 2.2 : 0,
    transparent: true,
    opacity: isUv ? 0.9 : 0,
    roughness: 0.4
  });
  uvMaterials.push(uvSpotMat);
  const uvSpot = new THREE.Mesh(new THREE.RingGeometry(0.025, 0.055, 24), uvSpotMat);
  uvSpot.rotation.x = -Math.PI / 2;
  uvSpot.position.set(0, 0.004, 0.2);
  group.add(uvSpot);

  return { group, uvMaterials };
}

export function createWhiskeyGlassModel(isUv = false): {
  group: THREE.Group;
  uvMaterials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();
  const uvMaterials: THREE.MeshStandardMaterial[] = [];

  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.46,
    roughness: 0.06,
    metalness: 0.08,
    ior: 1.55,
    clearcoat: 1.0,
    depthWrite: false
  });

  // 1. Cut-crystal 8-faceted tumbler outer body
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.092, 0.23, 8), crystalMat);
  glass.position.y = 0.12;
  glass.castShadow = true;
  glass.renderOrder = 2;
  group.add(glass);

  // 2. Heavy crystal base puck
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.045, 16), crystalMat);
  base.position.y = 0.0225;
  group.add(base);

  // 3. Aged amber scotch liquid
  const scotch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.096, 0.084, 0.075, 24),
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.12,
      metalness: 0.15,
      transparent: true,
      opacity: 0.85
    })
  );
  scotch.position.y = 0.075;
  group.add(scotch);

  // 4. Floating melting ice cube inside scotch
  const ice = new THREE.Mesh(
    new THREE.BoxGeometry(0.065, 0.06, 0.065),
    new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.55,
      roughness: 0.15
    })
  );
  ice.position.set(0.015, 0.095, -0.01);
  ice.rotation.set(0.3, 0.5, 0.2);
  group.add(ice);

  // 5. Crimson Velvet #4 lipstick print on glass rim
  const lipstick = new THREE.Mesh(
    new THREE.TorusGeometry(0.109, 0.012, 10, 24, Math.PI / 2.6),
    new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.45,
      metalness: 0.05
    })
  );
  lipstick.rotation.x = Math.PI / 2;
  lipstick.rotation.z = Math.PI / 4;
  lipstick.position.y = 0.232;
  group.add(lipstick);

  // 6. Crystalline Potassium Cyanide salt residue at bottom (fluoresces cyan under UV!)
  const saltMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    roughness: 0.3,
    emissive: 0x06b6d4,
    emissiveIntensity: isUv ? 2.6 : 0.05
  });
  uvMaterials.push(saltMat);
  const salt = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.065, 0.014, 16), saltMat);
  salt.position.y = 0.048;
  group.add(salt);

  return { group, uvMaterials };
}

export function createTrophyModel(isUv = false): {
  group: THREE.Group;
  uvMaterials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();
  const uvMaterials: THREE.MeshStandardMaterial[] = [];

  const walnutMat = new THREE.MeshStandardMaterial({
    color: 0x231309,
    roughness: 0.55,
    metalness: 0.08
  });

  const brassMat = new THREE.MeshPhysicalMaterial({
    color: 0xd97706,
    roughness: 0.22,
    metalness: 0.9,
    anisotropy: 0.65
  });

  // 1. Stepped walnut pedestal base
  const baseLower = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.065, 0.24), walnutMat);
  baseLower.position.y = 0.0325;
  baseLower.castShadow = true;
  group.add(baseLower);

  const baseUpper = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.03, 0.19), walnutMat);
  baseUpper.position.y = 0.08;
  group.add(baseUpper);

  // 2. Engraved brass dedication plate
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(0.17, 0.042),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.92 })
  );
  plaque.position.set(0, 0.035, 0.121);
  group.add(plaque);

  // 3. Lathe-profiled chalice stem & cup
  const stemPoints = [
    new THREE.Vector2(0.07, 0),
    new THREE.Vector2(0.05, 0.04),
    new THREE.Vector2(0.028, 0.12),
    new THREE.Vector2(0.045, 0.18),
    new THREE.Vector2(0.11, 0.31),
    new THREE.Vector2(0.12, 0.34),
    new THREE.Vector2(0.095, 0.34),
    new THREE.Vector2(0.02, 0.21)
  ];
  const cup = new THREE.Mesh(new THREE.LatheGeometry(stemPoints, 24), brassMat);
  cup.position.y = 0.095;
  cup.castShadow = true;
  group.add(cup);

  // 4. Twin curved brass handles
  const handleCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.095, 0.39, 0),
    new THREE.Vector3(-0.165, 0.36, 0),
    new THREE.Vector3(-0.145, 0.27, 0),
    new THREE.Vector3(-0.06, 0.25, 0)
  ]);
  const handleL = new THREE.Mesh(new THREE.TubeGeometry(handleCurveL, 16, 0.012, 8, false), brassMat);
  group.add(handleL);

  const handleCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.095, 0.39, 0),
    new THREE.Vector3(0.165, 0.36, 0),
    new THREE.Vector3(0.145, 0.27, 0),
    new THREE.Vector3(0.06, 0.25, 0)
  ]);
  const handleR = new THREE.Mesh(new THREE.TubeGeometry(handleCurveR, 16, 0.012, 8, false), brassMat);
  group.add(handleR);

  // 5. Blood smear on sharp pedestal corner
  const blood = new THREE.Mesh(
    new THREE.PlaneGeometry(0.075, 0.048),
    new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.94
    })
  );
  blood.position.set(0.075, 0.035, 0.122);
  group.add(blood);

  // 6. UV Latent Fingerprint Ridges on stem
  const printMat = new THREE.MeshStandardMaterial({
    map: createUvPrintTexture(),
    emissive: 0xfbbf24,
    emissiveMap: createUvPrintTexture(),
    emissiveIntensity: isUv ? 2.2 : 0,
    transparent: true,
    opacity: isUv ? 0.95 : 0
  });
  uvMaterials.push(printMat);
  const printPatch = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), printMat);
  printPatch.position.set(-0.02, 0.33, 0.095);
  group.add(printPatch);

  return { group, uvMaterials };
}

export function createLedgerModel(): THREE.Group {
  const group = new THREE.Group();

  // 1. Stacked spreadsheets
  const stack = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.025, 0.46),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.85 })
  );
  stack.position.y = 0.0125;
  stack.castShadow = true;
  group.add(stack);

  // 2. Top audit page with -$400k red mark
  const topPage = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.45),
    new THREE.MeshStandardMaterial({
      map: createLedgerTexture(),
      roughness: 0.72
    })
  );
  topPage.rotation.x = -Math.PI / 2;
  topPage.position.y = 0.026;
  group.add(topPage);

  // 3. Second crooked sheet underneath
  const secondSheet = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.008, 0.44),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.88 })
  );
  secondSheet.position.set(0.05, 0.004, 0.03);
  secondSheet.rotation.y = 0.18;
  group.add(secondSheet);

  // 4. Steel bulldog binder clip
  const clip = new THREE.Mesh(
    new THREE.BoxGeometry(0.075, 0.02, 0.038),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35, metalness: 0.85 })
  );
  clip.position.set(0, 0.03, -0.21);
  group.add(clip);

  // 5. Red Fountain Pen lying across ledger
  const pen = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.007, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.25, metalness: 0.5 })
  );
  pen.rotation.z = Math.PI / 2;
  pen.rotation.y = -0.45;
  pen.position.set(0.08, 0.033, 0.12);
  group.add(pen);

  return group;
}

export function createVialModel(isUv = false): {
  group: THREE.Group;
  uvMaterials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();
  const uvMaterials: THREE.MeshStandardMaterial[] = [];

  const amberGlass = new THREE.MeshPhysicalMaterial({
    color: 0x92400e,
    transparent: true,
    opacity: 0.72,
    roughness: 0.1,
    metalness: 0.08,
    ior: 1.52,
    clearcoat: 1.0
  });

  // 1. Amber glass vial cylinder
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.15, 24), amberGlass);
  body.position.y = 0.075;
  body.castShadow = true;
  group.add(body);

  // 2. Shoulder & neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.044, 0.036, 24), amberGlass);
  neck.position.y = 0.168;
  group.add(neck);

  // 3. Rubber laboratory stopper
  const stopper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.024, 0.032, 24),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 })
  );
  stopper.position.y = 0.195;
  group.add(stopper);

  // 4. Hazard label
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0475, 0.0475, 0.095, 24, 1, true, 0, Math.PI * 1.6),
    new THREE.MeshStandardMaterial({
      map: createVialLabelTexture(),
      roughness: 0.5,
      side: THREE.DoubleSide
    })
  );
  label.position.y = 0.075;
  group.add(label);

  // 5. Residual KCN crystals (bright electric cyan under UV)
  const kcnMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x06b6d4,
    emissiveIntensity: isUv ? 2.8 : 0.1,
    roughness: 0.3
  });
  uvMaterials.push(kcnMat);
  const crystals = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.022, 16), kcnMat);
  crystals.position.y = 0.015;
  group.add(crystals);

  return { group, uvMaterials };
}

/**
 * Constructs the full atmospheric Room 204 Motel Crime Scene
 */
export function createMotelRoomScene(maxAnisotropy: number): SceneDynamicHandles {
  const roomGroup = new THREE.Group();
  roomGroup.name = 'room_204_master';

  const uvReactiveParts: THREE.MeshStandardMaterial[] = [];

  const carpetPBR = createCarpetPBR();
  carpetPBR.map.anisotropy = maxAnisotropy;
  const woodDarkPBR = createWoodPBR(true);
  const woodLightPBR = createWoodPBR(false);
  const wallPBR = createWallpaperPBR();
  wallPBR.map.anisotropy = maxAnisotropy;

  const darkWoodMat = new THREE.MeshStandardMaterial({
    map: woodDarkPBR.map,
    bumpMap: woodDarkPBR.bumpMap,
    bumpScale: 0.012,
    roughness: 0.52,
    metalness: 0.06
  });

  const oakMat = new THREE.MeshStandardMaterial({
    map: woodLightPBR.map,
    bumpMap: woodLightPBR.bumpMap,
    bumpScale: 0.012,
    roughness: 0.48,
    metalness: 0.05
  });

  const wallMat = new THREE.MeshStandardMaterial({
    map: wallPBR.map,
    bumpMap: wallPBR.bumpMap,
    bumpScale: 0.015,
    roughness: 0.88,
    metalness: 0.04
  });

  // --- 1. FLOOR & BURGUNDY CARPET (8m x 6m) ---
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 6),
    new THREE.MeshStandardMaterial({
      map: carpetPBR.map,
      bumpMap: carpetPBR.bumpMap,
      bumpScale: 0.02,
      roughness: 0.92,
      metalness: 0.02
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // --- 2. CHALK OUTLINE & BLOOD DECAL (Marker #1) ---
  const chalkDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 2.3),
    new THREE.MeshStandardMaterial({
      map: createChalkAndBloodTexture(),
      transparent: true,
      roughness: 0.92,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    })
  );
  chalkDecal.rotation.x = -Math.PI / 2;
  chalkDecal.position.set(0, 0.008, 0.35);
  chalkDecal.receiveShadow = true;
  roomGroup.add(chalkDecal);

  // --- 3. UV FLUORESCENT FOOTPRINTS LAYER (Hidden until UV 365nm ON!) ---
  const uvFootprintMat = new THREE.MeshBasicMaterial({
    map: createUvFootprintsTexture(),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const uvFootprintsMesh = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 5.4), uvFootprintMat);
  uvFootprintsMesh.rotation.x = -Math.PI / 2;
  uvFootprintsMesh.position.set(0, 0.012, 0);
  roomGroup.add(uvFootprintsMesh);

  // --- 4. WALLS, BASEBOARDS & WAINSCOTING ---
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.1), wallMat);
  backWall.position.set(0, 1.55, -3);
  backWall.receiveShadow = true;
  roomGroup.add(backWall);

  // Left wall split around window cutout (x = -4)
  const leftWallLower = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.8), wallMat);
  leftWallLower.position.set(-4, 0.4, 0);
  leftWallLower.rotation.y = Math.PI / 2;
  leftWallLower.receiveShadow = true;
  roomGroup.add(leftWallLower);

  const leftWallUpper = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.6), wallMat);
  leftWallUpper.position.set(-4, 2.8, 0);
  leftWallUpper.rotation.y = Math.PI / 2;
  roomGroup.add(leftWallUpper);

  const leftWallFront = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.7), wallMat);
  leftWallFront.position.set(-4, 1.65, 1.7);
  leftWallFront.rotation.y = Math.PI / 2;
  leftWallFront.receiveShadow = true;
  roomGroup.add(leftWallFront);

  const leftWallBack = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.7), wallMat);
  leftWallBack.position.set(-4, 1.65, -2.3);
  leftWallBack.rotation.y = Math.PI / 2;
  roomGroup.add(leftWallBack);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.1), wallMat);
  rightWall.position.set(4, 1.55, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  roomGroup.add(rightWall);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.1), wallMat);
  frontWall.position.set(0, 1.55, 3);
  frontWall.rotation.y = Math.PI;
  frontWall.receiveShadow = true;
  roomGroup.add(frontWall);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 6),
    new THREE.MeshStandardMaterial({ color: 0x0c111d, roughness: 0.94 })
  );
  ceiling.position.set(0, 3.1, 0);
  ceiling.rotation.x = Math.PI / 2;
  roomGroup.add(ceiling);

  // Dark oak baseboards along room perimeter
  [
    { pos: [0, 0.08, -2.97], size: [8, 0.16, 0.06] },
    { pos: [0, 0.08, 2.97], size: [8, 0.16, 0.06] },
    { pos: [-3.97, 0.08, 0], size: [0.06, 0.16, 6] },
    { pos: [3.97, 0.08, 0], size: [0.06, 0.16, 6] }
  ].forEach(b => {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(...(b.size as [number, number, number])), darkWoodMat);
    trim.position.set(...(b.pos as [number, number, number]));
    roomGroup.add(trim);
  });

  // --- 5. VENETIAN BLINDS WINDOW + EXTERIOR RAINY NIGHT & NEON MOTEL SIGN ---
  // Window frame at x = -4, z = -0.6, width 2.0, height 1.7
  const sill = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 2.12), darkWoodMat);
  sill.position.set(-3.95, 0.8, -0.6);
  roomGroup.add(sill);

  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 2.12), darkWoodMat);
  topFrame.position.set(-3.95, 2.5, -0.6);
  roomGroup.add(topFrame);

  // Semi-reflective rainy window glass
  const windowGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 1.7),
    new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.3
    })
  );
  windowGlass.position.set(-4.01, 1.65, -0.6);
  windowGlass.rotation.y = Math.PI / 2;
  roomGroup.add(windowGlass);

  // Venetian blind slats casting shadows into the room
  const blindMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.55, metalness: 0.25 });
  for (let y = 0.88; y <= 2.42; y += 0.075) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.012, 1.94), blindMat);
    slat.position.set(-3.91, y, -0.6);
    slat.rotation.z = Math.PI / 7;
    slat.castShadow = true;
    roomGroup.add(slat);
  }

  // Exterior Neon "STARLIGHT MOTEL" Sign visible outside the window
  const neonSignMat = new THREE.MeshStandardMaterial({
    map: createNeonMotelTexture(),
    emissiveMap: createNeonMotelTexture(),
    emissive: 0xffffff,
    emissiveIntensity: 1.8,
    roughness: 0.2
  });
  const neonSign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), neonSignMat);
  neonSign.position.set(-6.8, 2.1, -0.6);
  neonSign.rotation.y = Math.PI / 2;
  roomGroup.add(neonSign);

  const neonLight = new THREE.PointLight(0xf43f5e, 1.4, 8);
  neonLight.position.set(-5.2, 2.0, -0.6);
  roomGroup.add(neonLight);

  // Rain streaks particle system outside the window
  const rainCount = 320;
  const rainPos = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3] = -4.3 - Math.random() * 2.4;
    rainPos[i * 3 + 1] = Math.random() * 4.0;
    rainPos[i * 3 + 2] = -2.6 + Math.random() * 4.5;
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.PointsMaterial({
    color: 0x93c5fd,
    size: 0.035,
    transparent: true,
    opacity: 0.65
  });
  const rainPoints = new THREE.Points(rainGeo, rainMat);
  roomGroup.add(rainPoints);

  // --- 6. SPINNING CEILING FAN & OVERHEAD BULB ---
  const ceilingFan = new THREE.Group();
  ceilingFan.position.set(0, 3.05, 0);

  const downrod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12),
    new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.25 })
  );
  downrod.position.y = -0.15;
  ceilingFan.add(downrod);

  const motorHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.1, 24),
    new THREE.MeshStandardMaterial({ color: 0x92400e, metalness: 0.85, roughness: 0.25 })
  );
  motorHousing.position.y = -0.3;
  ceilingFan.add(motorHousing);

  for (let i = 0; i < 4; i++) {
    const bladePivot = new THREE.Group();
    bladePivot.rotation.y = (i * Math.PI) / 2;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.015, 0.16), darkWoodMat);
    blade.position.set(0.46, -0.3, 0);
    blade.rotation.x = 0.15;
    blade.castShadow = true;
    bladePivot.add(blade);
    ceilingFan.add(bladePivot);
  }

  const bulbGlobe = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6
    })
  );
  bulbGlobe.position.y = -0.4;
  ceilingFan.add(bulbGlobe);
  roomGroup.add(ceilingFan);

  const ceilingLight = new THREE.PointLight(0xfde68a, 0.8, 10, 1.8);
  ceilingLight.position.set(0, 2.55, 0);
  roomGroup.add(ceilingLight);

  // --- 7. UNMADE MOTEL BED & FRAMED PAINTING (Left Back: x = -2.55, z = -1.45) ---
  const bedGroup = new THREE.Group();
  bedGroup.position.set(-2.6, 0, -1.5);

  const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.15, 0.1), darkWoodMat);
  headboard.position.set(0, 0.58, -1.35);
  headboard.castShadow = true;
  bedGroup.add(headboard);

  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.34, 2.55), darkWoodMat);
  bedFrame.position.set(0, 0.17, 0);
  bedFrame.castShadow = true;
  bedGroup.add(bedFrame);

  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(1.88, 0.24, 2.45),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.88 })
  );
  mattress.position.set(0, 0.42, 0);
  mattress.receiveShadow = true;
  bedGroup.add(mattress);

  const duvet = new THREE.Mesh(
    new THREE.BoxGeometry(1.92, 0.14, 1.65),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92 })
  );
  duvet.position.set(0, 0.52, 0.38);
  duvet.castShadow = true;
  duvet.receiveShadow = true;
  bedGroup.add(duvet);

  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.94 });
  const pillowL = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.13, 0.44), pillowMat);
  pillowL.position.set(-0.46, 0.6, -0.95);
  pillowL.rotation.set(0.18, 0.1, 0);
  bedGroup.add(pillowL);

  const pillowR = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.13, 0.44), pillowMat);
  pillowR.position.set(0.48, 0.6, -0.92);
  pillowR.rotation.set(0.14, -0.15, 0);
  bedGroup.add(pillowR);
  roomGroup.add(bedGroup);

  // Vintage framed motel painting above bed on back wall
  const paintingFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.95, 0.05), darkWoodMat);
  paintingFrame.position.set(-2.6, 1.85, -2.97);
  roomGroup.add(paintingFrame);

  const paintingCanvas = new THREE.Mesh(
    new THREE.PlaneGeometry(1.26, 0.81),
    new THREE.MeshStandardMaterial({ map: createPaintingTexture(), roughness: 0.65 })
  );
  paintingCanvas.position.set(-2.6, 1.85, -2.94);
  roomGroup.add(paintingCanvas);

  // --- 8. BEDSIDE NIGHTSTAND, SCOTCH BOTTLE & LAMP (x = -1.1, z = -2.45) ---
  const nightstand = new THREE.Group();
  nightstand.position.set(-1.1, 0, -2.45);

  const nsBody = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.64, 0.62), darkWoodMat);
  nsBody.position.y = 0.32;
  nsBody.castShadow = true;
  nsBody.receiveShadow = true;
  nightstand.add(nsBody);

  // Drawer fronts & brass pulls
  [0.2, 0.46].forEach(dy => {
    const pull = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.02, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 })
    );
    pull.position.set(0, dy, 0.32);
    nightstand.add(pull);
  });

  // Half-empty Scotch Whiskey Bottle beside Marker #3 glass
  const bottleBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.22, 16),
    new THREE.MeshPhysicalMaterial({ color: 0x78350f, transparent: true, opacity: 0.78, roughness: 0.1 })
  );
  bottleBody.position.set(-0.18, 0.75, -0.08);
  bottleBody.castShadow = true;
  nightstand.add(bottleBody);

  const bottleNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.035, 0.08, 16),
    new THREE.MeshPhysicalMaterial({ color: 0x78350f, transparent: true, opacity: 0.78, roughness: 0.1 })
  );
  bottleNeck.position.set(-0.18, 0.89, -0.08);
  nightstand.add(bottleNeck);

  // Vintage digital alarm clock glowing red 12:34
  const clockBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.07, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 })
  );
  clockBox.position.set(0.18, 0.675, -0.14);
  nightstand.add(clockBox);

  roomGroup.add(nightstand);

  // --- 9. EXECUTIVE OAK DESK, SWIVEL CHAIR, PHONE & EMERALD BANKER LAMP (x = 2.35, z = -1.6) ---
  const deskGroup = new THREE.Group();
  deskGroup.position.set(2.35, 0, -1.6);

  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.07, 1.1), oakMat);
  deskTop.position.y = 0.78;
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  deskGroup.add(deskTop);

  const pedL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.745, 0.98), oakMat);
  pedL.position.set(-0.72, 0.3725, 0);
  pedL.castShadow = true;
  deskGroup.add(pedL);

  const pedR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.745, 0.98), oakMat);
  pedR.position.set(0.72, 0.3725, 0);
  pedR.castShadow = true;
  deskGroup.add(pedR);

  // Emerald Green Banker's Lamp
  const lampGroup = new THREE.Group();
  lampGroup.position.set(0.62, 0.815, -0.22);

  const brassLampMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
  const lBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.03, 24), brassLampMat);
  lampGroup.add(lBase);

  const lStem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.34, 16), brassLampMat);
  lStem.position.y = 0.17;
  lampGroup.add(lStem);

  const emeraldShade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.125, 0.25, 16, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x10b981,
      emissiveIntensity: 0.85,
      roughness: 0.15
    })
  );
  emeraldShade.rotation.z = Math.PI / 2;
  emeraldShade.position.set(0, 0.35, 0);
  lampGroup.add(emeraldShade);
  deskGroup.add(lampGroup);

  // Rotary Motel Telephone on Desk
  const phoneBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.09, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35 })
  );
  phoneBase.position.set(-0.65, 0.86, -0.22);
  deskGroup.add(phoneBase);

  const handset = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.04, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35 })
  );
  handset.position.set(-0.65, 0.92, -0.22);
  handset.rotation.y = 0.2;
  deskGroup.add(handset);

  // Knocked-back leather office chair
  const chairGroup = new THREE.Group();
  chairGroup.position.set(0.05, 0, 0.72);
  chairGroup.rotation.y = 0.55;

  const leatherChairMat = new THREE.MeshStandardMaterial({ color: 0x291810, roughness: 0.6 });
  const cSeat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.52), leatherChairMat);
  cSeat.position.y = 0.46;
  cSeat.castShadow = true;
  chairGroup.add(cSeat);

  const cBack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.56, 0.08), leatherChairMat);
  cBack.position.set(0, 0.76, 0.23);
  cBack.rotation.x = -0.1;
  cBack.castShadow = true;
  chairGroup.add(cBack);

  const cPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.42, 12),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 })
  );
  cPost.position.y = 0.23;
  chairGroup.add(cPost);

  const cBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.03, 5),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.35 })
  );
  cBase.position.y = 0.025;
  chairGroup.add(cBase);
  deskGroup.add(chairGroup);

  roomGroup.add(deskGroup);

  // Banker lamp warm/emerald point light
  const bankerLight = new THREE.PointLight(0xa7f3d0, 2.4, 5.2, 1.5);
  bankerLight.position.set(2.35 + 0.62, 1.14, -1.6 - 0.22);
  bankerLight.castShadow = true;
  bankerLight.shadow.bias = -0.001;
  roomGroup.add(bankerLight);

  // --- 10. METAL WASTEBASKET NEAR DOOR (x = 3.2, z = 1.75) ---
  const binMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.38,
    metalness: 0.82,
    side: THREE.DoubleSide
  });
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.16, 0.42, 24, 1, true), binMat);
  bin.position.set(3.2, 0.21, 1.75);
  bin.castShadow = true;
  roomGroup.add(bin);

  const binBottom = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), binMat);
  binBottom.rotation.x = Math.PI / 2;
  binBottom.position.set(3.2, 0.01, 1.75);
  roomGroup.add(binBottom);

  // Crumpled paper tissues inside bin
  [
    [3.16, 0.12, 1.72],
    [3.25, 0.15, 1.79],
    [3.18, 0.19, 1.81]
  ].forEach(([tx, ty, tz]) => {
    const tissue = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.055, 0),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.95 })
    );
    tissue.position.set(tx, ty, tz);
    roomGroup.add(tissue);
  });

  // --- 11. ENTRY DOOR, PLAQUE "204" & POLICE CRIME SCENE TAPE (x = 2.6, z = 2.96) ---
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.06, 2.25, 0.08), darkWoodMat);
  door.position.set(2.6, 1.125, 2.96);
  roomGroup.add(door);

  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.11),
    new THREE.MeshStandardMaterial({ map: createDoorPlaqueTexture(), roughness: 0.25, metalness: 0.7 })
  );
  plaque.position.set(2.6, 1.68, 2.91);
  plaque.rotation.y = Math.PI;
  roomGroup.add(plaque);

  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.18 })
  );
  knob.position.set(2.18, 1.05, 2.91);
  roomGroup.add(knob);

  const tapeMat = new THREE.MeshStandardMaterial({
    map: createPoliceTapeTexture(),
    roughness: 0.45,
    side: THREE.DoubleSide
  });
  const tape1 = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.085), tapeMat);
  tape1.position.set(2.6, 1.32, 2.86);
  tape1.rotation.y = Math.PI;
  tape1.rotation.z = -0.18;
  roomGroup.add(tape1);

  const tape2 = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.085), tapeMat);
  tape2.position.set(2.6, 0.9, 2.86);
  tape2.rotation.y = Math.PI;
  tape2.rotation.z = 0.22;
  roomGroup.add(tape2);

  // --- 12. ATMOSPHERIC DUST MOTES IN ROOM ---
  const dustCount = 240;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 7.2;
    dustPos[i * 3 + 1] = 0.25 + Math.random() * 2.5;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 5.2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xfef3c7,
    size: 0.018,
    transparent: true,
    opacity: 0.35
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  roomGroup.add(dustPoints);

  return {
    roomGroup,
    bankerLight,
    ceilingLight,
    ceilingFan,
    neonSignMat,
    neonLight,
    uvFootprintsMesh,
    uvReactiveParts,
    rainPoints,
    dustPoints
  };
}
