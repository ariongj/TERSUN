/*
 * Scenery for the TERSUN 3D builder: sky, lawn, planting, pool water, night sky, rain and furniture.
 * Everything is procedural (no downloaded assets) and deterministic, so the garden looks the same on every visit.
 */
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// ------------------------------------------------------------------------------------------------
// helpers

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// smooth pseudo-noise of a position — the same point always gets the same value, so shared vertices stay welded
const noise3 = (x, y, z) =>
  Math.sin(x * 3.1 + y * 1.7) * 0.5 + Math.sin(y * 4.3 + z * 2.9 + 1.3) * 0.3 + Math.sin(z * 5.7 + x * 2.3 + 4.1) * 0.2;

function canvasTexture(w, h, paint, repeat, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

/** Give a (non-indexed) geometry smooth normals: drop uvs, weld, recompute. */
function smooth(geo) {
  geo.deleteAttribute('uv');
  geo.deleteAttribute('normal');
  const g = mergeVertices(geo, 1e-3);
  g.computeVertexNormals();
  return g;
}

/** Paint vertex colours from a function of the vertex position. */
function tint(geo, fn) {
  const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    fn(c, p.getX(i), p.getY(i), p.getZ(i));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

// ------------------------------------------------------------------------------------------------
// ground

export function grassTexture() {
  const r = rng(11);
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#6b8148'; g.fillRect(0, 0, w, h);
    const greens = ['#5f7a3f', '#7f9655', '#6a8446', '#8aa05e', '#56703a'];
    for (let i = 0; i < 9000; i++) {
      g.strokeStyle = greens[(r() * greens.length) | 0];
      g.globalAlpha = 0.25 + r() * 0.35;
      g.lineWidth = 1;
      const x = r() * w, y = r() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 2 - r() * 4); g.stroke();
    }
    g.globalAlpha = 1;
  }, [58, 58]);
}

// ------------------------------------------------------------------------------------------------
// planting

const LEAF_DARK = new THREE.Color('#33472b'), LEAF_LIGHT = new THREE.Color('#7c9258');
const OLIVE_DARK = new THREE.Color('#46553a'), OLIVE_LIGHT = new THREE.Color('#8d9c70');
const CYPRESS_DARK = new THREE.Color('#2f4030'), CYPRESS_LIGHT = new THREE.Color('#56704c');

/** A bushy crown: several displaced blobs welded into one smooth mesh, shaded dark below and light on top. */
function crownGeometry(r, radius, blobs, squash, dark, light) {
  const parts = [];
  for (let i = 0; i < blobs; i++) {
    const rr = radius * (i === 0 ? 0.72 : 0.36 + r() * 0.26);
    const g = new THREE.IcosahedronGeometry(rr, i === 0 ? 3 : 2);
    const a = r() * Math.PI * 2, e = (r() - 0.35) * 1.4, d = i === 0 ? 0 : radius * (0.42 + r() * 0.3);
    g.translate(Math.cos(a) * Math.cos(e) * d, Math.sin(e) * d * squash, Math.sin(a) * Math.cos(e) * d);
    parts.push(g);
  }
  let geo = smooth(mergeGeometries(parts));
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 1 + noise3(x * 5, y * 5, z * 5) * 0.07 + noise3(x * 17, y * 17, z * 17) * 0.035;
    p.setXYZ(i, x * n, y * n, z * n);
  }
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  const y0 = geo.boundingBox.min.y, y1 = geo.boundingBox.max.y;
  tint(geo, (c, x, y, z) => {
    const t = THREE.MathUtils.clamp((y - y0) / (y1 - y0), 0, 1);
    const n = noise3(x * 9, y * 9, z * 9) * 0.5 + 0.5;
    c.copy(dark).lerp(light, THREE.MathUtils.clamp(t * 0.8 + n * 0.3, 0, 1));
  });
  return geo;
}

/** Olive tree in a tall planter. */
export function olive(mats, seed = 1) {
  const r = rng(seed);
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.62, 40), mats.planter);
  pot.position.y = 0.31; pot.castShadow = true; pot.receiveShadow = true; g.add(pot);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.27, 32), mats.soil);
  soil.rotation.x = -Math.PI / 2; soil.position.y = 0.6; g.add(soil);
  // a slightly crooked trunk with two branches
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.6, 0), new THREE.Vector3(0.05, 0.95, 0.02), new THREE.Vector3(-0.03, 1.3, -0.02), new THREE.Vector3(0.04, 1.6, 0)]);
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.045, 8), mats.bark);
  trunk.castShadow = true; g.add(trunk);
  [[0.22, 0.1], [-0.2, -0.12]].forEach(([dx, dz]) => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.25, 0), new THREE.Vector3(dx * 0.6, 1.5, dz * 0.6), new THREE.Vector3(dx, 1.72, dz)]);
    const b = new THREE.Mesh(new THREE.TubeGeometry(c, 8, 0.025, 6), mats.bark);
    b.castShadow = true; g.add(b);
  });
  const crown = new THREE.Mesh(crownGeometry(r, 0.5, 16, 0.7, OLIVE_DARK, OLIVE_LIGHT), mats.foliage);
  crown.position.set(0.02, 1.85, 0); crown.castShadow = true; crown.receiveShadow = true;
  g.add(crown);
  return g;
}

/** Clipped boxwood ball. */
export function boxwood(mats, radius, seed) {
  const m = new THREE.Mesh(crownGeometry(rng(seed), radius * 1.15, 1, 0.9, LEAF_DARK, LEAF_LIGHT), mats.foliage);
  m.position.y = radius * 0.86; m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** A clipped hedge, `len` metres long, with a softly irregular surface. */
export function hedge(mats, len, height = 0.85, depth = 0.6) {
  let geo = new THREE.BoxGeometry(len, height, depth, Math.max(8, Math.round(len * 5)), 6, 5);
  geo = smooth(geo.toNonIndexed());
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = noise3(x * 5, y * 6, z * 6) * 0.035;
    // round the top edges a little
    const edge = Math.max(0, Math.abs(z) / (depth / 2) - 0.75) * Math.max(0, y / (height / 2) - 0.6);
    p.setXYZ(i, x + n * 0.4, y + n - edge * 0.25, z * (1 - edge * 0.5) + n);
  }
  geo.computeVertexNormals();
  tint(geo, (c, x, y, z) => {
    const t = THREE.MathUtils.clamp(y / height + 0.5, 0, 1);
    const n = noise3(x * 11, y * 11, z * 11) * 0.5 + 0.5;
    c.copy(LEAF_DARK).lerp(LEAF_LIGHT, THREE.MathUtils.clamp(t * 0.65 + n * 0.35, 0, 1));
  });
  const m = new THREE.Mesh(geo, mats.foliage);
  m.position.y = height / 2; m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** A far ring of woodland: overlapping round crowns in two rows with a few cypresses. One merged mesh. */
export function treeline(mats) {
  const r = rng(77);
  const parts = [];
  const add = (g, h, dark, light, a, dist, seed) => {
    g = smooth(g.index ? g.toNonIndexed() : g);
    const pp = g.attributes.position;
    for (let k = 0; k < pp.count; k++) {
      const x = pp.getX(k), y = pp.getY(k), z = pp.getZ(k);
      const n = 1 + noise3(x * 0.55 + seed, y * 0.6, z * 0.55) * 0.16;
      pp.setXYZ(k, x * n, y * (1 + noise3(x * 0.4, seed, z * 0.4) * 0.08), z * n);
    }
    tint(g, (c, x, y) => c.copy(dark).lerp(light, THREE.MathUtils.clamp(y / h, 0, 1) * 0.75));
    g.translate(Math.cos(a) * dist, 0, Math.sin(a) * dist);
    parts.push(g);
  };
  const N = 64;
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < N; i++) {
      const a = ((i + row * 0.5) / N) * Math.PI * 2 + (r() - 0.5) * 0.05;
      const dist = 125 + row * 14 + r() * 8;
      const h = (row ? 7.5 : 5) + r() * 3;
      const g = new THREE.IcosahedronGeometry(1, 2);
      g.scale(h * 0.62, h * 0.52, h * 0.62);
      g.translate(0, h * 0.5, 0);
      add(g, h, LEAF_DARK, LEAF_LIGHT, a, dist, i + row * 100);
    }
  }
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2, h = 9 + r() * 4;
    const pts = [0, 0.06, 0.16, 0.3, 0.5, 0.7, 0.86, 0.96, 1].map((t) => new THREE.Vector2(Math.max(0.02, Math.sin(Math.pow(t, 0.7) * Math.PI) * 1.9 * (1 - t * 0.35)), t * h));
    add(new THREE.LatheGeometry(pts, 10), h, CYPRESS_DARK, CYPRESS_LIGHT, a, 118 + r() * 8, i * 7);
  }
  const geo = mergeGeometries(parts);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mats.foliage);
}

// ------------------------------------------------------------------------------------------------
// pool

function waterNormalTexture() {
  const size = 256;
  const r = rng(5);
  const waves = Array.from({ length: 14 }, () => ({ kx: Math.round((r() - 0.5) * 12), ky: Math.round((r() - 0.5) * 12), ph: r() * 6.28, a: 0.4 + r() * 0.6 }));
  const hgt = (x, y) => waves.reduce((s, w) => s + Math.sin((x * w.kx + y * w.ky) * Math.PI * 2 + w.ph) * w.a, 0);
  return canvasTexture(size, size, (g) => {
    const img = g.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const e = 1 / size, u = x / size, v = y / size;
      const dx = (hgt(u + e, v) - hgt(u - e, v)) * 0.6, dy = (hgt(u, v + e) - hgt(u, v - e)) * 0.6;
      const n = new THREE.Vector3(-dx, -dy, 1).normalize();
      const i = (y * size + x) * 4;
      img.data[i] = (n.x * 0.5 + 0.5) * 255; img.data[i + 1] = (n.y * 0.5 + 0.5) * 255; img.data[i + 2] = (n.z * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, [2.2, 4.4], false);
}

/** Pool surface colour: pale at the steps and edges, deep in the middle, with a faint mosaic grid. */
function poolTexture() {
  return canvasTexture(256, 512, (g, w, h) => {
    g.fillStyle = '#2f8ea6'; g.fillRect(0, 0, w, h);
    const grad = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, h * 0.62);
    grad.addColorStop(0, 'rgba(22, 104, 132, 0.95)'); grad.addColorStop(0.55, 'rgba(47, 142, 166, 0.5)'); grad.addColorStop(1, 'rgba(160, 222, 226, 0.95)');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 1;
    for (let x = 0; x <= w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  });
}

export function poolWaterMaterial() {
  const map = poolTexture();
  return new THREE.MeshPhysicalMaterial({
    map, emissiveMap: map, emissive: '#000000', color: '#ffffff', roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05,
    normalMap: waterNormalTexture(), normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.6,
  });
}

// ------------------------------------------------------------------------------------------------
// sky

export function makeSky() {
  const sky = new Sky();
  sky.scale.setScalar(1000);
  const u = sky.material.uniforms;
  u.turbidity.value = 2.2;
  u.rayleigh.value = 2.6;
  u.mieCoefficient.value = 0.003;
  u.mieDirectionalG.value = 0.84;
  return sky;
}

/** Sun direction for a time of day (hours, 6–20). The terrace faces south (+z); east is +x. */
export function sunDirection(hours, out = new THREE.Vector3()) {
  const t = THREE.MathUtils.clamp(hours, 6, 20);
  const elev = THREE.MathUtils.degToRad(Math.max(4, 62 * Math.sin((Math.PI * (t - 5.5)) / 15)));
  const az = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(105, -105, (t - 6) / 14));
  return out.set(Math.sin(az) * Math.cos(elev), Math.sin(elev), Math.cos(az) * Math.cos(elev));
}

/** Night sky dome: deep gradient, stars and a warm glow on the horizon. */
export function nightDome() {
  const r = rng(3);
  const tex = canvasTexture(2048, 1024, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h * 0.5);
    grad.addColorStop(0, '#03050b'); grad.addColorStop(0.55, '#0a1020'); grad.addColorStop(0.9, '#1a2136'); grad.addColorStop(1, '#2c2a33');
    g.fillStyle = grad; g.fillRect(0, 0, w, h * 0.5);
    g.fillStyle = '#12131a'; g.fillRect(0, h * 0.5, w, h * 0.5);
    for (let i = 0; i < 1500; i++) {
      const y = Math.pow(r(), 1.5) * h * 0.47, x = r() * w, s = r();
      g.fillStyle = `rgba(${225 + r() * 30}, ${228 + r() * 27}, 255, ${0.25 + s * 0.75})`;
      const size = s > 0.985 ? 2.6 : s > 0.9 ? 1.6 : 1;
      g.beginPath(); g.arc(x, y, size * 0.6, 0, Math.PI * 2); g.fill();
    }
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(300, 48, 24), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  dome.renderOrder = -2;
  // moon with a soft halo
  const moonTex = canvasTexture(256, 256, (g, w, h) => {
    const halo = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    halo.addColorStop(0, 'rgba(210,225,255,0.55)'); halo.addColorStop(0.25, 'rgba(160,185,235,0.16)'); halo.addColorStop(1, 'rgba(120,150,220,0)');
    g.fillStyle = halo; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f3f1e6'; g.beginPath(); g.arc(w / 2, h / 2, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(190,190,180,0.35)';
    [[-8, -6, 7], [9, 4, 5], [-2, 10, 4]].forEach(([x, y, s]) => { g.beginPath(); g.arc(w / 2 + x, h / 2 + y, s, 0, Math.PI * 2); g.fill(); });
  });
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, fog: false, depthWrite: false, transparent: true }));
  moon.scale.setScalar(46);
  moon.position.set(-150, 105, -230);
  moon.renderOrder = -1;
  const g = new THREE.Group();
  g.add(dome, moon);
  return g;
}

/** Flat overcast sky for the rain scene (used as a 2D background). */
export function overcastTexture() {
  return canvasTexture(16, 512, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#7f8a94'); grad.addColorStop(0.5, '#aab2b8'); grad.addColorStop(1, '#c3c8cb');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  });
}

// ------------------------------------------------------------------------------------------------
// rain

/**
 * Falling rain as short line streaks in a box around the origin. `blocker()` returns the dry volume under a
 * closed roof ({ x0, x1, z0, z1, y } or null); drops that would fall into it are recycled, so it stays dry there.
 */
export function makeRain(count, blocker) {
  const R = 13, H = 12, LEN = 0.32, SLANT = 0.06;
  const r = rng(9);
  const pos = new Float32Array(count * 6), speed = new Float32Array(count);
  const place = (i, y) => {
    const x = (r() * 2 - 1) * R, z = (r() * 2 - 1) * R;
    pos.set([x, y, z, x + SLANT, y + LEN, z], i * 6);
    speed[i] = 9 + r() * 5;
  };
  for (let i = 0; i < count; i++) place(i, r() * H);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#dfe7ee', transparent: true, opacity: 0.42, depthWrite: false }));
  lines.frustumCulled = false;
  lines.visible = false;
  lines.userData.step = (dt) => {
    const b = blocker();
    for (let i = 0; i < count; i++) {
      const k = i * 6, dy = speed[i] * dt;
      let y = pos[k + 1] - dy;
      const x = pos[k] - SLANT * dy * 3, z = pos[k + 2];
      if (y < 0 || (b && y < b.y && x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1)) { place(i, H * (0.85 + r() * 0.15)); continue; }
      pos[k] = x; pos[k + 1] = y; pos[k + 3] = x + SLANT; pos[k + 4] = y + LEN;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return lines;
}

// ------------------------------------------------------------------------------------------------
// furniture

function rbox(w, h, d, r, mat) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2)), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** Dining set: a long table with six chairs and a centrepiece. */
export function dining(mats) {
  const g = new THREE.Group();
  const put = (mesh, x, y, z, ry) => { mesh.position.set(x, y, z); if (ry) mesh.rotation.y = ry; g.add(mesh); return mesh; };
  put(rbox(3.2, 0.012, 2.3, 0.005, mats.rug), 0, 0.006, 0);
  // table: slab top on two blade legs
  put(rbox(2.3, 0.05, 0.98, 0.02, mats.tableTop), 0, 0.745, 0);
  put(rbox(0.06, 0.7, 0.78, 0.01, mats.sofaFrame), -0.85, 0.36, 0);
  put(rbox(0.06, 0.7, 0.78, 0.01, mats.sofaFrame), 0.85, 0.36, 0);
  put(rbox(1.7, 0.05, 0.08, 0.01, mats.sofaFrame), 0, 0.66, 0);
  const chair = (x, z, ry) => {
    const c = new THREE.Group();
    const add = (mesh, px, py, pz) => { mesh.position.set(px, py, pz); c.add(mesh); };
    add(rbox(0.5, 0.05, 0.5, 0.02, mats.sofaFrame), 0, 0.42, 0);
    add(rbox(0.46, 0.06, 0.46, 0.025, mats.cushion), 0, 0.475, 0);
    add(rbox(0.5, 0.42, 0.05, 0.02, mats.sofaFrame), 0, 0.68, -0.235);
    add(rbox(0.42, 0.3, 0.04, 0.02, mats.cushion), 0, 0.66, -0.2);
    [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([lx, lz]) => add(rbox(0.035, 0.42, 0.035, 0.008, mats.sofaFrame), lx, 0.21, lz));
    c.position.set(x, 0, z); c.rotation.y = ry;
    g.add(c);
  };
  [-0.72, 0, 0.72].forEach((x) => { chair(x, -0.78, 0); chair(x, 0.78, Math.PI); });
  // centrepiece: low bowl and two candles
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.08, 32), mats.ceramic);
  bowl.castShadow = true; put(bowl, 0, 0.81, 0);
  [-0.42, 0.42].forEach((x) => {
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 16), mats.ceramic);
    candle.castShadow = true; put(candle, x, 0.84, 0.05);
  });
  return g;
}
