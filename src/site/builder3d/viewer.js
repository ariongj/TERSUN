/*
 * TERSUN 3D builder.
 *
 * Builds the six products from the same parameters as the configurator (dimensions in cm,
 * colours, layout, closures, opening) and presents them in three settings: a spot-lit studio,
 * a daylight terrace and the same terrace at night with the LED lighting on.
 *
 *   const viewer = createViewer(element, { labels: { w: true } });
 *   viewer.update('bioclimatic', { w: 450, d: 350, h: 260, color: '#383e42', angle: 35, led: true });
 *   viewer.setMode('night');
 *   viewer.setView('front');
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const CM = 0.01;
const LED_WARM = new THREE.Color('#ffd9a0');

// ------------------------------------------------------------------------------------------------
// Textures

function canvasTexture(w, h, paint, repeat) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

// teak decking
function deckTexture() {
  return canvasTexture(1024, 1024, (g, w, h) => {
    const planks = 10;
    for (let i = 0; i < planks; i++) {
      const t = Math.random() * 18;
      g.fillStyle = `rgb(${138 + t}, ${108 + t * 0.8}, ${84 + t * 0.6})`;
      g.fillRect(0, (i * h) / planks, w, h / planks);
      for (let k = 0; k < 70; k++) {
        g.strokeStyle = `rgba(70, 40, 20, ${0.03 + Math.random() * 0.06})`;
        g.lineWidth = Math.random() * 2;
        g.beginPath();
        const y = (i * h) / planks + Math.random() * (h / planks);
        g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 3, w * 0.7, y - 3, w, y + 1);
        g.stroke();
      }
      g.fillStyle = 'rgba(30, 18, 10, 0.7)';
      g.fillRect(0, ((i + 1) * h) / planks - 3, w, 3);
      // staggered butt joints
      g.fillRect(((i * 0.37) % 1) * w, (i * h) / planks, 3, h / planks);
    }
  }, [2, 2]);
}

// large-format stone tiles around the terrace
function tileTexture() {
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#d8d1c5'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '110,95,80'}, ${Math.random() * 0.05})`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    g.strokeStyle = 'rgba(120, 108, 95, 0.35)'; g.lineWidth = 2;
    for (let x = 0; x <= w; x += w / 2) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += h / 2) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }, [40, 40]);
}

// studio floor: light pool in the centre that falls off into darkness
function studioFloorTexture() {
  return canvasTexture(1024, 1024, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, '#9e978c'); r.addColorStop(0.32, '#857e74'); r.addColorStop(0.62, '#3c3935'); r.addColorStop(1, '#141312');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
}

function skyTexture(mode) {
  return canvasTexture(16, 512, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    if (mode === 'night') {
      grad.addColorStop(0, '#04060b'); grad.addColorStop(0.6, '#0f1420'); grad.addColorStop(1, '#2a2420');
    } else if (mode === 'studio') {
      grad.addColorStop(0, '#121110'); grad.addColorStop(0.6, '#26231f'); grad.addColorStop(1, '#3a3631');
    } else {
      grad.addColorStop(0, '#8fb0cf'); grad.addColorStop(0.5, '#d6e1e8'); grad.addColorStop(0.75, '#f3e9da'); grad.addColorStop(1, '#efe4d3');
    }
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  });
}

function meshTexture() {
  return canvasTexture(64, 64, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.22)';
    for (let y = 0; y < h; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < w; x += 4) g.fillRect(x, y, 1.4, 1.4);
  }, [20, 20]);
}

// ------------------------------------------------------------------------------------------------
// Product builders. Units are metres; x = width, y = up, z = depth (front at +z).

class Kit {
  constructor(o, mats) { this.o = o; this.m = mats; this.group = new THREE.Group(); this.anim = () => {}; this.lights = []; }

  box(w, h, d, x, y, z, mat, opts) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat || this.m.frame);
    mesh.position.set(x, y, z);
    mesh.castShadow = !(opts && opts.noShadow);
    mesh.receiveShadow = true;
    (opts && opts.parent ? opts.parent : this.group).add(mesh);
    return mesh;
  }

  led(w, h, d, x, y, z, parent) {
    const m = this.box(w, h, d, x, y, z, this.m.led, { noShadow: true, parent });
    return m;
  }

  ledLight(x, y, z, intensity) {
    const l = new THREE.PointLight(LED_WARM, 0, 6, 1.6);
    l.position.set(x, y, z);
    l.userData.intensity = (intensity || 6) * 0.55;
    this.group.add(l);
    this.lights.push(l);
  }

  wall(w, h, zBack, plain) {
    const W = w + 3, H = h + 1.2;
    this.box(W, H, 0.25, 0, H / 2, zBack - 0.125, this.m.wall);
    if (plain) return;
    // a large window in the façade, behind the product
    const gw = Math.min(w * 0.6, 4.5), gh = Math.min(h * 0.85, 2.4);
    this.box(gw, gh, 0.03, 0, gh / 2 + 0.02, zBack + 0.005, this.m.window, { noShadow: true });
    this.box(gw + 0.08, 0.06, 0.06, 0, gh + 0.05, zBack + 0.02, this.m.windowFrame);
    for (let i = 1; i < 3; i++) this.box(0.05, gh, 0.05, -gw / 2 + (gw * i) / 3, gh / 2, zBack + 0.02, this.m.windowFrame);
  }
}

function bioclimatic(k) {
  const o = k.o;
  const w = o.w * CM, d = o.d * CM, h = o.h * CM;
  const post = 0.15, beam = 0.24, top = h - beam;
  const wallMounted = o.mount === 'wall';
  const splitX = o.layout === 'double' || o.layout === 'modular' || w > 7;
  const splitZ = o.layout === 'modular';
  const x0 = -w / 2, x1 = w / 2, z0 = -d / 2, z1 = d / 2;

  if (wallMounted) k.wall(w, h, z0);

  // posts
  const posts = [[x0 + post / 2, z1 - post / 2], [x1 - post / 2, z1 - post / 2]];
  if (!wallMounted) posts.push([x0 + post / 2, z0 + post / 2], [x1 - post / 2, z0 + post / 2]);
  if (splitX) { posts.push([0, z1 - post / 2]); if (!wallMounted) posts.push([0, z0 + post / 2]); }
  if (splitZ) posts.push([x0 + post / 2, 0], [x1 - post / 2, 0]);
  posts.forEach(([x, z]) => k.box(post, top, post, x, top / 2, z));

  // perimeter beams
  k.box(w, beam, post, 0, top + beam / 2, z1 - post / 2);
  k.box(w, beam, post, 0, top + beam / 2, z0 + post / 2);
  k.box(post, beam, d, x0 + post / 2, top + beam / 2, 0);
  k.box(post, beam, d, x1 - post / 2, top + beam / 2, 0);
  if (splitX) k.box(post, beam, d - 2 * post, 0, top + beam / 2, 0);
  if (splitZ) k.box(w - 2 * post, beam, post, 0, top + beam / 2, 0);

  // louvres, one row per module so the middle beams stay visible
  const louvres = [];
  const lw = 0.2, lt = 0.03;
  const xs = splitX ? [[x0 + post, -post / 2], [post / 2, x1 - post]] : [[x0 + post, x1 - post]];
  const zs = splitZ ? [[z0 + post, -post / 2], [post / 2, z1 - post]] : [[z0 + post, z1 - post]];
  const geoCache = {};
  xs.forEach(([xa, xb]) => zs.forEach(([za, zb]) => {
    const len = xb - xa, n = Math.max(2, Math.floor((zb - za) / lw)), pitch = (zb - za) / n;
    const geo = geoCache[len.toFixed(3)] || (geoCache[len.toFixed(3)] = new THREE.BoxGeometry(len - 0.01, lt, lw * 0.98));
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(geo, k.m.louvre);
      m.position.set((xa + xb) / 2, h - 0.07, za + pitch * (i + 0.5));
      m.castShadow = true; m.receiveShadow = true;
      k.group.add(m);
      louvres.push(m);
    }
  }));

  // LED: perimeter lines under the beams and vertical lines on the posts
  if (o.led) {
    const ly = top - 0.006;
    k.led(w - 2 * post, 0.016, 0.03, 0, ly, z1 - post - 0.02);
    k.led(w - 2 * post, 0.016, 0.03, 0, ly, z0 + post + 0.02);
    k.led(0.03, 0.016, d - 2 * post, x0 + post + 0.02, ly, 0);
    k.led(0.03, 0.016, d - 2 * post, x1 - post - 0.02, ly, 0);
    posts.forEach(([x, z]) => {
      const sx = x < 0 ? 1 : -1, sz = z < 0 ? 1 : -1;
      k.led(0.018, top - 0.2, 0.018, x + sx * (post / 2 + 0.006), (top - 0.2) / 2 + 0.1, z + sz * (post / 2 - 0.03));
    });
    const nx = Math.max(1, Math.round(w / 3)), nz = Math.max(1, Math.round(d / 3));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      k.ledLight(x0 + (w * (i + 0.5)) / nx, top - 0.3, z0 + (d * (j + 0.5)) / nz, 5);
    }
  }

  // side closures on the right side, and the back when freestanding
  const sides = [{ axis: 'x', pos: x1 - post / 2, from: z0 + post, to: z1 - post }];
  if (!wallMounted) sides.push({ axis: 'z', pos: z0 + post / 2, from: x0 + post, to: x1 - post });
  const closures = [];
  sides.forEach((s) => closures.push(sideClosure(k, o.side, s, top)));

  k.anim = (a) => {
    const ang = THREE.MathUtils.degToRad(a.angle == null ? 30 : a.angle);
    louvres.forEach((m) => { m.rotation.x = -ang; });
    closures.forEach((c) => c && c(a));
  };
}

// A closure filling one side of a structure. Returns an animator.
function sideClosure(k, type, s, top) {
  if (!type || type === 'none') return null;
  const len = s.to - s.from, mid = (s.from + s.to) / 2;
  const place = (mesh, along, y, off) => {
    if (s.axis === 'x') mesh.position.set(s.pos + (off || 0), y, along);
    else { mesh.position.set(along, y, s.pos + (off || 0)); mesh.rotation.y = Math.PI / 2; }
    return mesh;
  };
  const group = k.group;
  const mk = (geo, mat, shadow) => { const m = new THREE.Mesh(geo, mat); m.castShadow = !!shadow; m.receiveShadow = true; group.add(m); return m; };

  if (type === 'zip') {
    const cassette = mk(new THREE.BoxGeometry(0.12, 0.12, len), k.m.frame, true);
    place(cassette, mid, top - 0.06, 0);
    const fabric = mk(new THREE.PlaneGeometry(len, 1), k.m.zipFabric, true);
    fabric.rotation.y = s.axis === 'x' ? Math.PI / 2 : 0;
    const bar = mk(new THREE.BoxGeometry(0.05, 0.04, len), k.m.frame, true);
    return (a) => {
      const drop = Math.max(0.05, (top - 0.12) * (1 - (a.sideOpen == null ? 0.3 : a.sideOpen)));
      fabric.scale.set(1, drop, 1);
      if (s.axis === 'x') { fabric.position.set(s.pos, top - 0.12 - drop / 2, mid); bar.position.set(s.pos, top - 0.12 - drop, mid); }
      else { fabric.position.set(mid, top - 0.12 - drop / 2, s.pos); bar.position.set(mid, top - 0.12 - drop, s.pos); bar.rotation.y = Math.PI / 2; }
    };
  }
  if (type === 'panel') {
    const slat = 0.15;
    for (let y = slat / 2; y < top; y += slat) {
      place(mk(new THREE.BoxGeometry(0.03, slat * 0.92, len), k.m.frame, true), mid, y, 0);
    }
    return null;
  }
  if (type === 'guillotine') {
    const ph = (top - 0.12) / 3;
    const panes = [0, 1, 2].map((i) => {
      const g = new THREE.Group();
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.012, ph - 0.02, len - 0.04), k.m.glass);
      g.add(glass);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, len), k.m.frame);
      rail.position.y = ph / 2; rail.castShadow = true; g.add(rail);
      if (s.axis === 'z') g.rotation.y = Math.PI / 2;
      group.add(g);
      return g;
    });
    const sill = mk(new THREE.BoxGeometry(0.08, 0.06, len), k.m.frame, true);
    place(sill, mid, 0.03, 0);
    return (a) => {
      const open = a.sideOpen == null ? 0 : a.sideOpen;
      panes.forEach((g, i) => {
        const closedY = 0.08 + (2 - i) * ph + ph / 2;
        const stackY = 0.08 + ph / 2 + i * 0.02;
        const y = closedY + (stackY - closedY) * open;
        const off = (i - 1) * 0.035;
        if (s.axis === 'x') g.position.set(s.pos + off, y, mid); else g.position.set(mid, y, s.pos + off);
      });
    };
  }
  if (type === 'slide' || type === 'glass') {
    const n = Math.max(2, Math.round(len / 1.1));
    const pw = len / n + 0.04;
    const panes = [];
    for (let i = 0; i < n; i++) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.012, top - 0.12, pw - 0.03), k.m.glass));
      const stile = new THREE.Mesh(new THREE.BoxGeometry(0.03, top - 0.1, 0.03), k.m.frame);
      stile.position.z = pw / 2 - 0.015; stile.castShadow = true; g.add(stile);
      if (s.axis === 'z') g.rotation.y = Math.PI / 2;
      group.add(g);
      panes.push(g);
    }
    place(mk(new THREE.BoxGeometry(0.1, 0.04, len), k.m.frame, true), mid, 0.02, 0);
    place(mk(new THREE.BoxGeometry(0.1, 0.06, len), k.m.frame, true), mid, top - 0.03, 0);
    return (a) => {
      const open = a.sideOpen == null ? 0 : a.sideOpen;
      panes.forEach((g, i) => {
        const closed = s.from + (i + 0.5) * (len / n);
        const stacked = s.from + pw / 2 + i * 0.04;
        const along = closed + (stacked - closed) * open;
        const off = (i % 3 - 1) * 0.03;
        if (s.axis === 'x') g.position.set(s.pos + off, (top - 0.12) / 2 + 0.06, along);
        else g.position.set(along, (top - 0.12) / 2 + 0.06, s.pos + off);
      });
    };
  }
  return null;
}

function glassRoof(k, withAwning) {
  const o = k.o;
  const w = o.w * CM, d = o.d * CM, h = o.h * CM;
  const post = 0.12, gutter = 0.2, rise = Math.max(0.3, d * 0.14);
  const hr = h + rise;
  const x0 = -w / 2, x1 = w / 2, z0 = -d / 2, z1 = d / 2;
  const free = o.layout === 'free' || o.layout === 'double';
  const slope = Math.atan2(rise, d);
  const yAt = (z) => h + rise * ((z1 - z) / d);

  if (!free) k.wall(w, hr, z0);

  // front posts and gutter
  const nFront = w > 7 || o.layout === 'double' ? 3 : 2;
  const fx = nFront === 3 ? [x0 + post / 2, 0, x1 - post / 2] : [x0 + post / 2, x1 - post / 2];
  fx.forEach((x) => k.box(post, h - gutter, post, x, (h - gutter) / 2, z1 - post / 2));
  k.box(w, gutter, 0.16, 0, h - gutter / 2, z1 - 0.08);
  if (free) fx.forEach((x) => k.box(post, hr - 0.1, post, x, (hr - 0.1) / 2, z0 + post / 2));
  // wall profile / rear beam
  k.box(w, 0.14, 0.12, 0, hr - 0.03, z0 + 0.06);

  // rafters and glass
  const bays = Math.max(2, Math.round(w / 1.1));
  const bw = w / bays;
  const len = Math.hypot(d, rise);
  const roof = new THREE.Group();
  roof.position.set(0, (h + hr) / 2, 0);
  roof.rotation.x = slope;
  k.group.add(roof);
  for (let r = 0; r <= bays; r++) {
    const x = THREE.MathUtils.clamp(x0 + r * bw, x0 + 0.04, x1 - 0.04);
    const rafter = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, len), k.m.frame);
    rafter.position.set(x, 0, 0); rafter.castShadow = true; rafter.receiveShadow = true;
    roof.add(rafter);
    if (o.led && r > 0 && r < bays + 1) {
      for (let q = 1; q <= 3; q++) {
        const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 16), k.m.led);
        spot.position.set(x, -0.065, -len / 2 + (len * q) / 4);
        roof.add(spot);
      }
    }
  }
  for (let i = 0; i < bays; i++) {
    const pane = new THREE.Mesh(new THREE.BoxGeometry(bw - 0.08, 0.017, len - 0.1), k.m.glass);
    pane.position.set(x0 + bw * (i + 0.5), 0.07, 0);
    pane.receiveShadow = true;
    roof.add(pane);
  }
  if (o.led) {
    for (let i = 0; i < Math.max(1, Math.round(w / 3)); i++) {
      k.ledLight(x0 + (w * (i + 0.5)) / Math.max(1, Math.round(w / 3)), h - 0.15, 0, 4);
    }
  }

  let awningAnim = null;
  if (withAwning) {
    const below = o.position === 'below';
    const lift = below ? -0.2 : 0.3;
    const fabricColor = new THREE.Color(o.fabric || '#d8d2c6');
    const fabricMat = new THREE.MeshStandardMaterial({ color: fabricColor, roughness: 0.92, side: THREE.DoubleSide });
    const awn = new THREE.Group();
    awn.position.set(0, (h + hr) / 2 + lift, 0);
    awn.rotation.x = slope;
    k.group.add(awn);
    const cassette = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, 0.2), k.m.frame);
    cassette.position.set(0, 0, -len / 2 + 0.1); cassette.castShadow = true;
    awn.add(cassette);
    const fabric = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.1, 1), fabricMat);
    fabric.rotation.x = -Math.PI / 2; fabric.castShadow = true; fabric.receiveShadow = true;
    awn.add(fabric);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.08), k.m.frame);
    bar.castShadow = true;
    awn.add(bar);
    if (!below) {
      [x0 + 0.03, x1 - 0.03].forEach((x) => k.box(0.05, lift + 0.05, 0.05, x, h + lift / 2, z1 - 0.1));
      // guide rails along the sides
      [x0 + 0.03, x1 - 0.03].forEach((x) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, len - 0.2), k.m.frame);
        rail.position.set(x, 0, 0.1); rail.castShadow = true; awn.add(rail);
      });
    }
    awningAnim = (a) => {
      const ext = Math.max(0.02, a.extension == null ? 0.8 : a.extension);
      const run = (len - 0.25) * ext;
      fabric.scale.set(1, run, 1);
      fabric.position.set(0, 0, -len / 2 + 0.2 + run / 2);
      bar.position.set(0, 0, -len / 2 + 0.2 + run);
    };
  }
  k.anim = (a) => { if (awningAnim) awningAnim(a); };
}

function guillotine(k) {
  const o = k.o;
  const w = o.w * CM, h = o.h * CM;
  k.wall(w, h, -1.6, true);
  terraceSlab(k, w, 2.2);
  const side = 0.1, topH = 0.16, bot = 0.1, depth = 0.14;
  k.box(side, h, depth, -w / 2 + side / 2, h / 2, 0);
  k.box(side, h, depth, w / 2 - side / 2, h / 2, 0);
  k.box(w, topH, depth + 0.04, 0, h - topH / 2, 0);
  k.box(w, bot, depth, 0, bot / 2, 0);
  const clear = h - topH - bot, ph = clear / 3;
  const panes = [0, 1, 2].map((i) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w - 2 * side, ph - 0.02, 0.012), k.m.glass));
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * side, 0.04, 0.03), k.m.frame);
    rail.position.y = ph / 2 - 0.02; rail.castShadow = true; g.add(rail);
    g.position.z = (1 - i) * 0.035;
    k.group.add(g);
    return g;
  });
  k.anim = (a) => {
    const open = a.open == null ? 0.35 : a.open;
    panes.forEach((g, i) => {
      const closedY = bot + (2 - i) * ph + ph / 2;
      const stackY = bot + ph / 2 + i * 0.03;
      g.position.y = closedY + (stackY - closedY) * open;
    });
  };
}

function slide(k) {
  const o = k.o;
  const w = o.w * CM, h = o.h * CM;
  const n = THREE.MathUtils.clamp(Math.round(o.tracks || 4), 2, 8);
  k.wall(w, h, -1.6, true);
  terraceSlab(k, w, 2.2);
  const frame = 0.08, depth = 0.06 + n * 0.03;
  k.box(w, frame, depth, 0, frame / 2, 0);
  k.box(w, frame, depth, 0, h - frame / 2, 0);
  k.box(0.04, h, depth, -w / 2 + 0.02, h / 2, 0);
  k.box(0.04, h, depth, w / 2 - 0.02, h / 2, 0);
  const pw = (w - 0.08) / n + 0.04;
  const panes = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(pw - 0.03, h - 2 * frame, 0.012), k.m.glass));
    const stile = new THREE.Mesh(new THREE.BoxGeometry(0.03, h - 2 * frame, 0.025), k.m.frame);
    stile.position.x = pw / 2 - 0.015; stile.castShadow = true; g.add(stile);
    const stile2 = stile.clone(); stile2.position.x = -pw / 2 + 0.015; g.add(stile2);
    g.position.set(0, h / 2, depth / 2 - 0.02 - i * 0.03);
    k.group.add(g);
    panes.push(g);
  }
  k.anim = (a) => {
    const open = a.open == null ? 0.3 : a.open;
    panes.forEach((g, i) => {
      const closed = -w / 2 + 0.04 + pw / 2 + i * (pw - 0.04);
      const stacked = -w / 2 + 0.04 + pw / 2 + i * 0.05;
      g.position.x = closed + (stacked - closed) * open;
    });
  };
}

function zip(k) {
  const o = k.o;
  const w = o.w * CM, h = o.h * CM;
  k.wall(w, h, -1.6, true);
  terraceSlab(k, w, 2.2);
  const guide = 0.06, box = 0.14;
  k.box(guide, h - box, 0.12, -w / 2 + guide / 2, (h - box) / 2, 0);
  k.box(guide, h - box, 0.12, w / 2 - guide / 2, (h - box) / 2, 0);
  k.box(w + 0.04, box, box, 0, h - box / 2, 0);
  const fabric = new THREE.Mesh(new THREE.PlaneGeometry(w - 2 * guide, 1), k.m.zipFabric);
  fabric.castShadow = true;
  k.group.add(fabric);
  const bar = k.box(w - 2 * guide, 0.05, 0.06, 0, 0, 0);
  k.anim = (a) => {
    const drop = Math.max(0.05, (h - box) * (1 - (a.open == null ? 0.25 : a.open)));
    fabric.scale.set(1, drop, 1);
    fabric.position.set(0, h - box - drop / 2, 0);
    bar.position.y = h - box - drop;
  };
}

function terraceSlab(k, w, d) {
  const slab = new THREE.Mesh(new THREE.BoxGeometry(w + 2, 0.06, d), k.m.stone);
  slab.position.set(0, 0.03, -0.6); slab.receiveShadow = true;
  k.group.add(slab);
}

const BUILDERS = {
  bioclimatic, glassroof: (k) => glassRoof(k, false), awning: (k) => glassRoof(k, true), guillotine, slide, zip
};

// ------------------------------------------------------------------------------------------------
// Scene props

function rbox(w, h, d, r, mat) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2)), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

// Outdoor lounge: L-shaped sofa with loose cushions, travertine table, rug and an olive tree.
function lounge(mats) {
  const g = new THREE.Group();
  const put = (mesh, x, y, z, ry) => { mesh.position.set(x, y, z); if (ry) mesh.rotation.y = ry; g.add(mesh); return mesh; };

  put(rbox(3.0, 0.012, 2.2, 0.005, mats.rug), 0.35, 0.006, 0.1);
  // sofa frame (low aluminium base)
  put(rbox(2.5, 0.12, 0.9, 0.02, mats.sofaFrame), 0, 0.14, -0.45);
  put(rbox(0.9, 0.12, 1.5, 0.02, mats.sofaFrame), 1.7, 0.14, 0.2);
  // seat cushions
  for (let i = 0; i < 3; i++) put(rbox(0.8, 0.16, 0.82, 0.06, mats.cushion), -0.83 + i * 0.83, 0.28, -0.43);
  put(rbox(0.82, 0.16, 0.7, 0.06, mats.cushion), 1.7, 0.28, 0.1);
  put(rbox(0.82, 0.16, 0.7, 0.06, mats.cushion), 1.7, 0.28, 0.8);
  // back cushions
  for (let i = 0; i < 3; i++) put(rbox(0.8, 0.42, 0.2, 0.08, mats.cushion), -0.83 + i * 0.83, 0.52, -0.82);
  put(rbox(0.2, 0.42, 1.45, 0.08, mats.cushion), 2.08, 0.52, 0.2);
  // accent pillows
  put(rbox(0.42, 0.42, 0.12, 0.06, mats.pillowA), -0.95, 0.56, -0.66, 0.15);
  put(rbox(0.4, 0.4, 0.12, 0.06, mats.pillowB), 1.86, 0.55, -0.15, -1.2);
  // travertine coffee table on a dark plinth
  put(rbox(1.1, 0.07, 0.7, 0.03, mats.stoneTop), 0.25, 0.34, 0.45);
  put(rbox(0.8, 0.3, 0.42, 0.02, mats.sofaFrame), 0.25, 0.15, 0.45);
  // a vase on the table
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.22, 24), mats.ceramic);
  vase.castShadow = true; put(vase, 0.05, 0.48, 0.4);

  // olive tree in a tall planter
  const tree = olive(mats);
  tree.position.set(-1.75, 0, -0.75);
  g.add(tree);
  return g;
}

function olive(mats) {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.62, 32), mats.planter);
  pot.position.y = 0.31; pot.castShadow = true; pot.receiveShadow = true; g.add(pot);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.9, 10), mats.bark);
  trunk.position.y = 1.05; trunk.rotation.z = 0.08; trunk.castShadow = true; g.add(trunk);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.42, 48, 32), mats.leaves);
  crown.position.set(0.02, 1.68, 0); crown.scale.set(1, 1.18, 1); crown.castShadow = true; crown.receiveShadow = true;
  g.add(crown);
  return g;
}

// Terrace dressing for the daylight and night settings: plunge pool, hedges and trees.
function terrace(mats) {
  const g = new THREE.Group();
  const pool = new THREE.Group();
  const coping = new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.1, 6.4, 3, 0.02), mats.coping);
  coping.position.y = 0.05; coping.receiveShadow = true;
  const water = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.02, 6.0), mats.water);
  water.position.y = 0.095;
  pool.add(coping, water);
  pool.name = 'pool';
  g.add(pool);
  const hedges = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const hgt = 0.75;
    const hedge = rbox(1.48, hgt, 0.55, 0.04, mats.hedge);
    hedge.position.set(-6 + i * 1.5, hgt / 2, 0);
    hedges.add(hedge);
  }
  hedges.name = 'hedges';
  g.add(hedges);
  const trees = new THREE.Group();
  [[-1, 0], [1, 0.4]].forEach(([s, dz]) => { const t = olive(mats); t.scale.setScalar(1.6); t.userData.side = s; t.userData.dz = dz; trees.add(t); });
  trees.name = 'trees';
  g.add(trees);
  return g;
}

// ------------------------------------------------------------------------------------------------
// Viewer

const VIEWS = {
  corner: [0.62, 0.32, 0.95],
  front: [0, 0.22, 1],
  side: [1, 0.24, 0.12],
  top: [0.25, 1.6, 0.55],
  inside: null
};

export function createViewer(container, options) {
  const opts = options || {};
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  renderer.domElement.className = 'cfg-canvas';

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const skies = { studio: skyTexture('studio'), day: skyTexture('day'), night: skyTexture('night') };
  scene.fog = new THREE.Fog('#151413', 14, 34);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.minDistance = 1.5;
  controls.maxDistance = 30;
  controls.autoRotateSpeed = 0.45;

  // post-processing: bloom makes the LED lines glow
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.35, 0.5, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // lights
  const hemi = new THREE.HemisphereLight('#f3f6ff', '#b9a98f', 0.06);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff4e2', 4.2);
  sun.position.set(-4.5, 13, 5.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 4;
  const sc = sun.shadow.camera;
  sc.left = -10; sc.right = 10; sc.top = 10; sc.bottom = -10; sc.near = 1; sc.far = 45;
  scene.add(sun, sun.target);
  const key = new THREE.SpotLight('#fff1dc', 0, 0, 0.62, 0.85, 2);
  key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight('#c9d6ff', 0);
  rim.position.set(6, 6, -8);
  scene.add(rim);

  // materials
  const mats = {
    frame: new THREE.MeshPhysicalMaterial({ color: '#383e42', metalness: 0.5, roughness: 0.36, clearcoat: 0.35, clearcoatRoughness: 0.35 }),
    louvre: new THREE.MeshPhysicalMaterial({ color: '#40464a', metalness: 0.45, roughness: 0.34, clearcoat: 0.3, clearcoatRoughness: 0.4 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#d4e6ec', metalness: 0, roughness: 0.03, transparent: true, opacity: 0.2, envMapIntensity: 2, depthWrite: false, side: THREE.DoubleSide }),
    led: new THREE.MeshBasicMaterial({ color: '#fff3dc' }),
    wall: new THREE.MeshStandardMaterial({ color: '#efebe4', roughness: 0.92 }),
    window: new THREE.MeshPhysicalMaterial({ color: '#1c2328', metalness: 0.2, roughness: 0.06, clearcoat: 1 }),
    windowFrame: new THREE.MeshStandardMaterial({ color: '#25292c', metalness: 0.5, roughness: 0.35 }),
    stone: new THREE.MeshStandardMaterial({ color: '#d2cabd', roughness: 0.85 }),
    zipFabric: new THREE.MeshStandardMaterial({ color: '#5d5a55', roughness: 0.95, side: THREE.DoubleSide, transparent: true, opacity: 0.92, alphaMap: meshTexture() }),
    cushion: new THREE.MeshStandardMaterial({ color: '#e7e0d4', roughness: 1 }),
    pillowA: new THREE.MeshStandardMaterial({ color: '#b07a52', roughness: 1 }),
    pillowB: new THREE.MeshStandardMaterial({ color: '#8b977a', roughness: 1 }),
    sofaFrame: new THREE.MeshStandardMaterial({ color: '#2b2a28', metalness: 0.4, roughness: 0.45 }),
    stoneTop: new THREE.MeshStandardMaterial({ color: '#d9cdb8', roughness: 0.55 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: '#efe9df', roughness: 0.3, clearcoat: 0.6 }),
    rug: new THREE.MeshStandardMaterial({ color: '#cfc5b4', roughness: 1 }),
    planter: new THREE.MeshStandardMaterial({ color: '#3a3836', roughness: 0.7 }),
    bark: new THREE.MeshStandardMaterial({ color: '#6b5a48', roughness: 0.9 }),
    leaves: new THREE.MeshStandardMaterial({ color: '#9aa487', roughness: 1 }),
    hedge: new THREE.MeshStandardMaterial({ color: '#5d6b4f', roughness: 1 }),
    coping: new THREE.MeshStandardMaterial({ color: '#e2dbcf', roughness: 0.7 }),
    water: new THREE.MeshPhysicalMaterial({ color: '#5aa2b3', roughness: 0.03, metalness: 0.05, clearcoat: 1, envMapIntensity: 1.4 }),
    platform: new THREE.MeshPhysicalMaterial({ color: '#b3ab9f', roughness: 0.4, clearcoat: 0.4, clearcoatRoughness: 0.4 })
  };

  // studio set
  const studio = new THREE.Group();
  const studioFloor = new THREE.Mesh(new THREE.CircleGeometry(40, 96), new THREE.MeshStandardMaterial({ map: studioFloorTexture(), roughness: 0.55 }));
  studioFloor.rotation.x = -Math.PI / 2; studioFloor.receiveShadow = true;
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.05, 128), mats.platform);
  platform.position.y = 0.025; platform.receiveShadow = true;
  studio.add(studioFloor, platform);
  scene.add(studio);

  // terrace set (day / night)
  const outdoor = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({ map: tileTexture(), roughness: 0.8 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1, 0.04, 1), new THREE.MeshStandardMaterial({ map: deckTexture(), roughness: 0.7 }));
  deck.position.y = 0.02; deck.receiveShadow = true;
  const dressing = terrace(mats);
  outdoor.add(ground, deck, dressing);
  scene.add(outdoor);

  const sofa = lounge(mats);
  scene.add(sofa);

  // warm garden uplights for the night setting
  const garden = [0, 1].map(() => {
    const l = new THREE.PointLight('#ffc98a', 0, 4.5, 1.8);
    scene.add(l);
    return l;
  });

  // dimension labels (HTML overlay)
  const labelLayer = document.createElement('div');
  labelLayer.className = 'cfg-labels';
  container.appendChild(labelLayer);
  const labels = {};
  ['w', 'd', 'h'].forEach((k) => {
    const el = document.createElement('span');
    el.className = 'cfg-label';
    labelLayer.appendChild(el);
    labels[k] = { el, pos: new THREE.Vector3(), on: false };
  });
  const dimGroup = new THREE.Group();
  scene.add(dimGroup);
  const dimMat = new THREE.LineDashedMaterial({ color: '#d8bc8a', dashSize: 0.08, gapSize: 0.06, transparent: true, opacity: 0.8 });

  let kit = null, current = null, mode = 'studio', showDims = true, showProps = true;
  let roofy = true, dimsNow = { w: 4.5, d: 3.5, h: 2.6 }, view = 'corner', framed = null, firstFrame = true;
  const anim = { angle: 30, open: 0.3, extension: 0.8, sideOpen: 0.3 };
  const target = Object.assign({}, anim);
  const fly = { t: 1, from: new THREE.Vector3(), to: new THREE.Vector3(), tFrom: new THREE.Vector3(), tTo: new THREE.Vector3(), dur: 1.6 };

  function line(a, b) {
    const g = new THREE.BufferGeometry().setFromPoints([a, b]);
    const l = new THREE.Line(g, dimMat);
    l.computeLineDistances();
    dimGroup.add(l);
  }

  function disposeGroup(g) { g.traverse((m) => { if (m.geometry) m.geometry.dispose(); }); }

  // camera position for a named view
  function viewPose(name) {
    const { w, d, h } = dimsNow;
    const size = Math.max(w, d, h * 1.4);
    const dist = (size * 2.3 + 3.2) * Math.max(1, 1.35 / camera.aspect);
    const tgt = new THREE.Vector3(0, h * (name === 'top' ? 0.1 : 0.42), roofy ? 0 : -0.3);
    let pos;
    if (name === 'inside' && roofy) {
      // standing inside near the front corner, looking across and up into the roof
      pos = new THREE.Vector3(-w * 0.26, 1.45, d * 0.3);
      tgt.set(w * 0.22, 2.55, -d * 0.3);
    } else {
      const v = VIEWS[name] || VIEWS.corner;
      pos = new THREE.Vector3(v[0], v[1], v[2]).normalize().multiplyScalar(dist).add(new THREE.Vector3(0, h * 0.3, 0));
    }
    return { pos, tgt, dist };
  }

  function flyTo(name, instant) {
    const pose = viewPose(name);
    // only the inside view may look up into the roof; elsewhere the camera stays above the ground
    controls.maxPolarAngle = name === 'inside' && roofy ? Math.PI * 0.8 : Math.PI / 2 - 0.03;
    controls.maxDistance = pose.dist * 2.4;
    if (instant) { camera.position.copy(pose.pos); controls.target.copy(pose.tgt); fly.t = 1; return; }
    fly.from.copy(camera.position); fly.to.copy(pose.pos);
    fly.tFrom.copy(controls.target); fly.tTo.copy(pose.tgt);
    fly.t = 0;
  }

  function stage() {
    const { w, d } = dimsNow;
    const studioOn = mode === 'studio';
    studio.visible = studioOn;
    outdoor.visible = !studioOn;
    platform.scale.set(Math.max(w, d) * 0.72 + 1.4, 1, Math.max(w, d) * 0.72 + 1.4);
    deck.visible = roofy;
    deck.scale.set(w + 1.8, 1, d + 1.8);
    const pool = dressing.getObjectByName('pool');
    pool.visible = roofy;
    pool.position.set(-(w / 2 + 0.9 + 1.7), 0, 0.6);
    const hedges = dressing.getObjectByName('hedges');
    hedges.position.set(0, 0, -(roofy ? d / 2 : 1.6) - 1.6);
    const trees = dressing.getObjectByName('trees');
    trees.children.forEach((t) => { t.position.set(t.userData.side * (w / 2 + 1.6), 0, -(roofy ? d / 2 : 1.4) - 0.6 + t.userData.dz); });
    trees.visible = showProps;
    trees.children.forEach((t, i) => { garden[i].position.set(t.position.x * 0.92, 0.5, t.position.z + 0.6); });
    sofa.visible = showProps && roofy && w >= 3 && d >= 2.5;
    sofa.position.set(0, studioOn ? 0.05 : 0.04, -0.1);
    sofa.scale.setScalar(Math.min(1, (w - 0.6) / 3.4, (d - 0.4) / 2.6));
    // studio key light from above, aimed at the product
    const size = Math.max(w, d);
    key.position.set(-size * 0.7, 11 + size * 0.5, size * 0.8 + 4);
    key.target.position.set(0, 0, 0);
  }

  function build(type, o) {
    if (kit) { scene.remove(kit.group); disposeGroup(kit.group); }
    mats.frame.color.set(o.color || '#383e42');
    mats.louvre.color.set(o.color || '#383e42').offsetHSL(0, 0, 0.04);
    if (o.fabric) mats.zipFabric.color.set(o.fabric);
    kit = new Kit(o, mats);
    BUILDERS[type](kit);
    scene.add(kit.group);
    applyLights();
    kit.anim(anim);

    const w = o.w * CM, d = (o.d || 60) * CM, h = o.h * CM;
    roofy = type === 'bioclimatic' || type === 'glassroof' || type === 'awning';
    dimsNow = { w, d, h };
    stage();

    // dimension lines
    dimGroup.clear();
    const off = 0.4, y0 = 0.07;
    const front = roofy ? d / 2 : 0.15;
    line(new THREE.Vector3(-w / 2, y0, front + off), new THREE.Vector3(w / 2, y0, front + off));
    labels.w.pos.set(0, y0, front + off + 0.05);
    line(new THREE.Vector3(-w / 2 - off, 0, front), new THREE.Vector3(-w / 2 - off, h, front));
    labels.h.pos.set(-w / 2 - off, h / 2, front);
    if (roofy) {
      line(new THREE.Vector3(w / 2 + off, y0, -d / 2), new THREE.Vector3(w / 2 + off, y0, d / 2));
      labels.d.pos.set(w / 2 + off, y0, 0);
    }
    setLabelText(o.dims);
    labels.d.on = roofy && !!labels.d.el.textContent;

    // frame the camera when the product or its size changes noticeably
    const keyFrame = type + ':' + Math.round(Math.max(w, d, h * 1.4) * 2);
    if (framed !== keyFrame) {
      framed = keyFrame;
      if (firstFrame) {
        // opening shot: glide in from high above
        firstFrame = false;
        const pose = viewPose(view);
        camera.position.copy(pose.pos).multiplyScalar(1.9).add(new THREE.Vector3(0, pose.dist * 0.9, 0));
        controls.target.copy(pose.tgt);
        fly.dur = 2.6;
        flyTo(view);
      } else {
        fly.dur = 1.4;
        flyTo(view);
      }
    }
  }

  function setLabelText(dims) {
    labels.w.el.textContent = (dims && dims.w) || '';
    labels.h.el.textContent = (dims && dims.h) || '';
    labels.d.el.textContent = (dims && dims.d) || '';
    labels.w.on = !!labels.w.el.textContent;
    labels.h.on = !!labels.h.el.textContent;
  }

  function signature(type, o) {
    const s = Object.assign({}, o);
    delete s.angle; delete s.open; delete s.extension; delete s.sideOpen; delete s.dims; delete s.frame; delete s.title;
    return type + JSON.stringify(s);
  }

  function update(type, o) {
    const sig = signature(type, o);
    if (o.angle != null) target.angle = o.angle;
    if (o.open != null) target.open = o.open;
    if (o.extension != null) target.extension = o.extension;
    if (o.sideOpen != null) target.sideOpen = o.sideOpen;
    if (sig !== current) {
      current = sig;
      if (!kit) Object.assign(anim, target);
      build(type, o);
    } else if (o.dims) setLabelText(o.dims);
  }

  function applyLights() {
    const night = mode === 'night', studioOn = mode === 'studio';
    scene.background = skies[mode];
    scene.fog.color.set(studioOn ? '#151413' : night ? '#141820' : '#efe7da');
    scene.fog.near = studioOn ? 12 : 20; scene.fog.far = studioOn ? 30 : 55;
    hemi.intensity = night ? 0.08 : studioOn ? 0.14 : 0.06;
    hemi.color.set(night ? '#6d7da8' : '#f3f6ff');
    sun.intensity = studioOn ? 0 : night ? 0.16 : 4.2;
    sun.color.set(night ? '#8aa0d6' : '#fff1dc');
    key.intensity = studioOn ? 380 : 0;
    rim.intensity = studioOn ? 2.2 : 0;
    scene.environmentIntensity = studioOn ? 0.55 : night ? 0.05 : 0.26;
    mats.water.emissive.set(night ? '#1d7f99' : '#000000');
    mats.water.emissiveIntensity = night ? 0.9 : 0;
    garden.forEach((l) => { l.intensity = night && showProps ? 3.2 : 0; });
    mats.led.color.set(night ? '#ffe9c4' : '#f6efe2');
    if (kit) kit.lights.forEach((l) => { l.intensity = night ? l.userData.intensity : 0; });
    renderer.toneMappingExposure = night ? 1.2 : studioOn ? 0.95 : 1.0;
    bloom.strength = night ? 0.55 : studioOn ? 0.12 : 0.05;
    bloom.threshold = night ? 0.82 : 0.96;
    bloom.radius = night ? 0.45 : 0.35;
  }

  function setMode(m) { mode = m === 'night' || m === 'day' ? m : 'studio'; applyLights(); stage(); }
  function setDims(on) { showDims = !!on; dimGroup.visible = showDims; labelLayer.hidden = !showDims; }
  function setProps(on) { showProps = !!on; stage(); }
  function setAutoRotate(on) { controls.autoRotate = !!on; }
  function setView(name) { view = VIEWS.hasOwnProperty(name) ? name : 'corner'; fly.dur = 1.4; flyTo(view); controls.autoRotate = false; }
  function resetView() { setView('corner'); }

  // render loop, paused when off screen
  let visible = true, raf = 0, disposed = false, last = performance.now();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((e) => { visible = e[0].isIntersecting; }) : null;
  if (io) io.observe(container);

  function resize() {
    const r = container.getBoundingClientRect();
    const wpx = Math.max(1, r.width), hpx = Math.max(1, r.height);
    renderer.setSize(wpx, hpx, false);
    composer.setSize(wpx, hpx);
    bloom.resolution.set(wpx / 2, hpx / 2);
    camera.aspect = wpx / hpx;
    camera.updateProjectionMatrix();
  }
  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(container); else window.addEventListener('resize', resize);
  resize();

  const tmp = new THREE.Vector3();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function frame(now) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.25, ((now || performance.now()) - last) / 1000);
    last = now || performance.now();
    if (!visible) return;
    let moving = false;
    for (const k in target) {
      const diff = target[k] - anim[k];
      if (Math.abs(diff) > 1e-3) { anim[k] += diff * Math.min(1, dt * 7); moving = true; }
    }
    if (moving && kit) kit.anim(anim);
    if (fly.t < 1) {
      fly.t = Math.min(1, fly.t + dt / fly.dur);
      const e = ease(fly.t);
      camera.position.lerpVectors(fly.from, fly.to, e);
      controls.target.lerpVectors(fly.tFrom, fly.tTo, e);
    }
    controls.update();
    composer.render();
    if (showDims) {
      const r = container.getBoundingClientRect();
      for (const k in labels) {
        const L = labels[k];
        if (!L.on) { L.el.style.display = 'none'; continue; }
        tmp.copy(L.pos).project(camera);
        L.el.style.display = tmp.z > 1 ? 'none' : '';
        L.el.style.transform = `translate(-50%, -50%) translate(${((tmp.x + 1) / 2) * r.width}px, ${((1 - tmp.y) / 2) * r.height}px)`;
      }
    }
  }
  requestAnimationFrame(frame);

  controls.addEventListener('start', () => { controls.autoRotate = false; fly.t = 1; if (opts.onInteract) opts.onInteract(); });
  applyLights();

  return {
    debug: { scene, renderer, sun, hemi, key, camera, controls, fly },
    update,
    setMode,
    setNight: (on) => setMode(on ? 'night' : 'studio'),
    setView,
    setDims,
    setProps,
    setAutoRotate,
    resetView,
    snapshot() { composer.render(); return renderer.domElement.toDataURL('image/png'); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf);
      if (io) io.disconnect(); if (ro) ro.disconnect();
      composer.dispose(); renderer.dispose();
      container.removeChild(renderer.domElement); container.removeChild(labelLayer);
    }
  };
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}
