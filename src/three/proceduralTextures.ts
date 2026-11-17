import * as THREE from 'three';

/**
 * High-resolution procedural PBR CanvasTexture library (Albedo, Bump, Roughness, Emissive).
 * Zero external file / 404 dependencies.
 */

export function createCarpetPBR(): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 1024;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Rich burgundy/charcoal motel carpet base
  ctx.fillStyle = '#240c14';
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#606060';
  bCtx.fillRect(0, 0, size, size);

  // Vintage diamond geometric carpet weave
  ctx.strokeStyle = '#3d1521';
  ctx.lineWidth = 6;
  bCtx.strokeStyle = '#9a9a9a';
  bCtx.lineWidth = 6;

  for (let x = -size; x <= size * 2; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + size, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size, 0);
    ctx.lineTo(x, size);
    ctx.stroke();

    bCtx.beginPath();
    bCtx.moveTo(x, 0);
    bCtx.lineTo(x + size, size);
    bCtx.stroke();
    bCtx.beginPath();
    bCtx.moveTo(x + size, 0);
    bCtx.lineTo(x, size);
    bCtx.stroke();
  }

  // Subtle gold/amber diamond medallions
  for (let x = 64; x < size; x += 128) {
    for (let y = 64; y < size; y += 128) {
      ctx.fillStyle = '#5c2c16';
      ctx.beginPath();
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x + 14, y);
      ctx.lineTo(x, y + 14);
      ctx.lineTo(x - 14, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Carpet pile micro-texture + wear stains
  const imgData = ctx.getImageData(0, 0, size, size);
  const bImgData = bCtx.getImageData(0, 0, size, size);
  const d = imgData.data;
  const bd = bImgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const grain = (Math.random() - 0.5) * 24;
    d[i] = Math.min(255, Math.max(0, d[i] + grain));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + grain * 0.6));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + grain * 0.7));

    const bg = 100 + (Math.random() - 0.5) * 90;
    bd[i] = bg;
    bd[i + 1] = bg;
    bd[i + 2] = bg;
  }
  ctx.putImageData(imgData, 0, 0);
  bCtx.putImageData(bImgData, 0, 0);

  // Subtle dark grime patches
  for (let i = 0; i < 18; i++) {
    const gx = Math.random() * size;
    const gy = Math.random() * size;
    const gr = Math.random() * 140 + 40;
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    grad.addColorStop(0, 'rgba(8, 4, 6, 0.35)');
    grad.addColorStop(1, 'rgba(8, 4, 6, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 3);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 3);

  return { map, bumpMap };
}

export function createWoodPBR(isDark = false): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;

  const b = document.createElement('canvas');
  b.width = size;
  b.height = size;
  const bCtx = b.getContext('2d')!;

  ctx.fillStyle = isDark ? '#21120b' : '#3d2013';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 180; i++) {
    const y = Math.random() * size;
    const h = Math.random() * 4 + 1;
    const dark = Math.random() > 0.45;
    ctx.fillStyle = dark
      ? isDark
        ? 'rgba(18, 8, 4, 0.55)'
        : 'rgba(35, 16, 8, 0.5)'
      : isDark
      ? 'rgba(54, 29, 16, 0.35)'
      : 'rgba(82, 44, 24, 0.35)';
    ctx.fillRect(0, y, size, h);

    bCtx.fillStyle = dark ? 'rgba(60, 60, 60, 0.5)' : 'rgba(180, 180, 180, 0.4)';
    bCtx.fillRect(0, y, size, h);
  }

  const map = new THREE.CanvasTexture(c);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(b);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  return { map, bumpMap };
}

export function createWallpaperPBR(): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;

  const b = document.createElement('canvas');
  b.width = size;
  b.height = size;
  const bCtx = b.getContext('2d')!;

  // Gritty 1990s motel slate-olive wallpaper
  ctx.fillStyle = '#18202b';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Subtle vertical striped damask motel pattern
  for (let x = 0; x < size; x += 32) {
    ctx.fillStyle = x % 64 === 0 ? 'rgba(12, 16, 22, 0.4)' : 'rgba(36, 46, 62, 0.25)';
    ctx.fillRect(x, 0, 16, size);
    bCtx.fillStyle = x % 64 === 0 ? '#707070' : '#969696';
    bCtx.fillRect(x, 0, 16, size);
  }

  // Moisture & tobacco patina stains near ceiling/corners
  for (let i = 0; i < 32; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 90 + 25;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(9, 12, 18, 0.5)');
    grad.addColorStop(1, 'rgba(9, 12, 18, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const map = new THREE.CanvasTexture(c);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3, 1);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(b);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 1);

  return { map, bumpMap };
}

export function createChalkAndBloodTexture(): THREE.CanvasTexture {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  // Textured dusty chalk outline of fallen male figure
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.88)';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([22, 10]);

  // Shadow glow under chalk for crisp visibility
  ctx.shadowColor = 'rgba(255,255,255,0.35)';
  ctx.shadowBlur = 8;

  // Head
  ctx.beginPath();
  ctx.arc(512, 230, 74, 0, Math.PI * 2);
  ctx.stroke();

  // Shoulders & Torso
  ctx.beginPath();
  ctx.moveTo(410, 325);
  ctx.lineTo(614, 325);
  ctx.lineTo(590, 610);
  ctx.lineTo(434, 610);
  ctx.closePath();
  ctx.stroke();

  // Left arm flung out toward watch
  ctx.beginPath();
  ctx.moveTo(410, 345);
  ctx.lineTo(270, 440);
  ctx.lineTo(220, 560);
  ctx.stroke();

  // Right arm bent toward chest
  ctx.beginPath();
  ctx.moveTo(614, 345);
  ctx.lineTo(745, 390);
  ctx.lineTo(790, 290);
  ctx.stroke();

  // Left & Right Legs
  ctx.beginPath();
  ctx.moveTo(465, 610);
  ctx.lineTo(415, 860);
  ctx.lineTo(375, 920);
  ctx.moveTo(558, 610);
  ctx.lineTo(640, 835);
  ctx.lineTo(690, 895);
  ctx.stroke();

  // Notably small coagulated blood pool near temple (crucial forensic clue!)
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  const bloodGrad = ctx.createRadialGradient(575, 215, 5, 575, 215, 54);
  bloodGrad.addColorStop(0, 'rgba(95, 8, 12, 0.94)');
  bloodGrad.addColorStop(0.65, 'rgba(70, 5, 8, 0.78)');
  bloodGrad.addColorStop(1, 'rgba(40, 2, 4, 0)');
  ctx.fillStyle = bloodGrad;
  ctx.beginPath();
  ctx.arc(575, 215, 54, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createUvFootprintsTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, 1024, 1024);

  // Subtle glowing stiletto heel prints from Door -> Nightstand -> Trash -> Door
  const drawShoePrint = (x: number, y: number, angle: number, isHeel: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = isHeel ? 'rgba(34, 211, 238, 0.85)' : 'rgba(245, 158, 11, 0.78)';
    // Sole
    ctx.beginPath();
    ctx.ellipse(0, -14, isHeel ? 10 : 15, isHeel ? 18 : 26, 0, 0, Math.PI * 2);
    ctx.fill();
    // Heel
    ctx.beginPath();
    ctx.ellipse(0, 18, isHeel ? 5 : 13, isHeel ? 5 : 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Elena's heel path (cyan under UV)
  const heelSteps = [
    [820, 860, -0.7],
    [720, 740, -0.75],
    [600, 620, -0.8],
    [470, 500, -0.9],
    [350, 370, -0.85],
    [290, 240, -0.5],
    [520, 480, 0.8],
    [760, 700, 0.65]
  ];
  heelSteps.forEach(([x, y, a]) => drawShoePrint(x, y, a, true));

  // Robert King's heavy dress shoes near desk & body (amber under UV)
  const mensSteps = [
    [800, 900, -0.4],
    [710, 790, -0.35],
    [620, 640, -0.3],
    [680, 440, 0.4],
    [740, 330, 0.2]
  ];
  mensSteps.forEach(([x, y, a]) => drawShoePrint(x, y, a, false));

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createMarkerNumberTexture(markerNum: number, unlocked: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = unlocked ? '#10b981' : '#f59e0b';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 242, 242);

  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 148px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(markerNum), 128, 114);

  // Forensic scale metric bar
  ctx.fillRect(20, 204, 216, 26);
  ctx.fillStyle = '#ffffff';
  for (let i = 26; i < 230; i += 18) {
    ctx.fillRect(i, 207, 9, 20);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWatchDialTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;

  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 245);
  grad.addColorStop(0, '#fef3c7');
  grad.addColorStop(0.75, '#d97706');
  grad.addColorStop(1, '#78350f');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(256, 256, 245, 0, Math.PI * 2);
  ctx.fill();

  // Minute track
  ctx.strokeStyle = '#1e293b';
  for (let i = 0; i < 60; i++) {
    const a = (i * Math.PI) / 30;
    const inner = i % 5 === 0 ? 196 : 216;
    ctx.lineWidth = i % 5 === 0 ? 6 : 2;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(a) * inner, 256 + Math.sin(a) * inner);
    ctx.lineTo(256 + Math.cos(a) * 232, 256 + Math.sin(a) * 232);
    ctx.stroke();
  }

  // Hands frozen at 11:42 PM
  ctx.strokeStyle = '#0f172a';
  ctx.lineCap = 'round';
  ctx.lineWidth = 12;
  const hourAngle = -Math.PI / 2 + (11.7 * Math.PI) / 6;
  ctx.beginPath();
  ctx.moveTo(256, 256);
  ctx.lineTo(256 + Math.cos(hourAngle) * 120, 256 + Math.sin(hourAngle) * 120);
  ctx.stroke();

  ctx.lineWidth = 7;
  const minAngle = -Math.PI / 2 + (42 * 2 * Math.PI) / 60;
  ctx.beginPath();
  ctx.moveTo(256, 256);
  ctx.lineTo(256 + Math.cos(minAngle) * 182, 256 + Math.sin(minAngle) * 182);
  ctx.stroke();

  ctx.fillStyle = '#451a03';
  ctx.font = 'bold 20px serif';
  ctx.textAlign = 'center';
  ctx.fillText('VANCE HOLDINGS', 256, 165);
  ctx.font = 'bold 22px monospace';
  ctx.fillText('R.K. · 1992', 256, 358);

  // Shattered crystal fracture lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 256);
  ctx.lineTo(95, 115);
  ctx.moveTo(256, 256);
  ctx.lineTo(410, 150);
  ctx.moveTo(256, 256);
  ctx.lineTo(185, 445);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createLedgerTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  for (let y = 70; y < 480; y += 34) {
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.lineTo(488, y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(150, 70);
  ctx.lineTo(150, 460);
  ctx.moveTo(320, 70);
  ctx.lineTo(320, 460);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 21px monospace';
  ctx.fillText('VANCE CHEMICAL LABS — AUDIT', 26, 44);

  ctx.fillStyle = '#475569';
  ctx.font = '15px monospace';
  ctx.fillText('SHELL ACCT #904-C', 30, 165);
  ctx.fillText('OFFSHORE WIRE (R.K.)', 30, 200);
  ctx.fillText('UNRECONCILED DEFICIT', 30, 235);

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 5;
  ctx.strokeRect(325, 174, 165, 46);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('-$400,000', 336, 206);

  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('ROBERT: RETURN $400K TONIGHT', 28, 435);
  ctx.fillText('OR FEDS GET THIS AT 9 AM!', 28, 468);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createVialLabelTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 10;
  ctx.strokeRect(6, 6, 500, 244);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 34px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DANGER · POISON', 256, 48);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText('POTASSIUM CYANIDE', 256, 110);

  ctx.font = 'bold 28px monospace';
  ctx.fillText('BATCH #88 // KCN 99.8%', 256, 162);

  ctx.fillStyle = '#475569';
  ctx.font = '20px monospace';
  ctx.fillText('VANCE CHEMICAL LABS — VAULT 4', 256, 212);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createNeonMotelTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, 488, 232);

  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 74px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STARLIGHT', 256, 118);

  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 54px monospace';
  ctx.fillText('MOTEL · VACANCY', 256, 198);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createDoorPlaqueTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 244, 116);

  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 76px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('204', 128, 66);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPoliceTapeTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 64;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 512, 64);

  ctx.fillStyle = '#090a0f';
  ctx.font = 'bold 28px monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText('CRIME SCENE DO NOT CROSS  //  ', 10, 34);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createUvPrintTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.92)';
  ctx.lineWidth = 4;
  for (let r = 18; r < 105; r += 13) {
    ctx.beginPath();
    ctx.ellipse(128, 128, r * 0.85, r * 1.2, Math.PI / 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPaintingTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext('2d')!;

  const sky = ctx.createLinearGradient(0, 0, 0, 240);
  sky.addColorStop(0, '#1e293b');
  sky.addColorStop(1, '#78350f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 512, 384);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(0, 260);
  ctx.lineTo(140, 170);
  ctx.lineTo(290, 230);
  ctx.lineTo(420, 150);
  ctx.lineTo(512, 240);
  ctx.lineTo(512, 384);
  ctx.lineTo(0, 384);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(380, 100, 32, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
