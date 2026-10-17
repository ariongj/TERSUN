/*
 * TERSUN 3D builder.
 *
 * Builds the six products from the same parameters as the configurator (dimensions in cm,
 * colours, layout, closures, opening) and renders them in a small daylight / night scene.
 *
 *   const viewer = createViewer(element, { labels: { w, d, h } });
 *   viewer.update('bioclimatic', { w: 450, d: 350, h: 260, color: '#383e42', angle: 35, led: true });
 *   viewer.setNight(true);
 */
import * as THREE from '../vendor/three/three.module.min.js';
import { OrbitControls } from '../vendor/three/OrbitControls.js';
import { RoomEnvironment } from '../vendor/three/RoomEnvironment.js';

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

function deckTexture() {
  return canvasTexture(512, 512, (g, w, h) => {
    const planks = 8;
    for (let i = 0; i < planks; i++) {
      const tone = 150 + Math.round(Math.random() * 22);
      g.fillStyle = `rgb(${tone + 14}, ${tone - 8}, ${tone - 38})`;
      g.fillRect(0, (i * h) / planks, w, h / planks);
      for (let k = 0; k < 40; k++) {
        g.strokeStyle = `rgba(80, 50, 25, ${0.04 + Math.random() * 0.05})`;
        g.beginPath();
        const y = (i * h) / planks + Math.random() * (h / planks);
        g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 2, w * 0.6, y - 2, w, y + 1);
        g.stroke();
      }
      g.fillStyle = 'rgba(40, 25, 15, 0.55)';
      g.fillRect(0, ((i + 1) * h) / planks - 2, w, 2);
    }
  }, [3, 3]);
}

function groundTexture() {
  return canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#d9d3c8';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '90,80,70'}, ${Math.random() * 0.05})`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  }, [30, 30]);
}

function skyTexture(night) {
  return canvasTexture(16, 512, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    if (night) {
      grad.addColorStop(0, '#05070d'); grad.addColorStop(0.55, '#121827'); grad.addColorStop(1, '#2a2622');
    } else {
      grad.addColorStop(0, '#9fb9d1'); grad.addColorStop(0.55, '#dfe6ea'); grad.addColorStop(1, '#f3ece2');
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
    l.userData.intensity = (intensity || 6) * 1.6;
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

function lounge(mats) {
  const g = new THREE.Group();
  const add = (w, h, d, x, y, z, m) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh);
  };
  // L-shaped sofa
  add(2.4, 0.38, 0.85, 0, 0.19, -0.4, mats.cushion);
  add(2.4, 0.38, 0.18, 0, 0.5, -0.75, mats.cushion);
  add(0.85, 0.38, 1.4, 1.6, 0.19, 0.15, mats.cushion);
  add(0.18, 0.38, 1.4, 1.95, 0.5, 0.15, mats.cushion);
  // coffee table
  add(1.0, 0.05, 0.6, 0.2, 0.36, 0.55, mats.table);
  add(0.9, 0.34, 0.04, 0.2, 0.17, 0.55, mats.table);
  // planter
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.5, 24), mats.pot);
  pot.position.set(-1.6, 0.25, -0.6); pot.castShadow = true; g.add(pot);
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), mats.leaves);
  leaves.position.set(-1.6, 0.85, -0.6); leaves.scale.y = 1.3; leaves.castShadow = true; g.add(leaves);
  return g;
}

function person(mat) {
  // slender architectural scale figure, 1.75 m
  const g = new THREE.Group();
  const part = (geo, x, y, z, rz) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); if (rz) m.rotation.z = rz; m.castShadow = true; g.add(m);
  };
  const leg = new THREE.CapsuleGeometry(0.06, 0.78, 4, 12);
  part(leg, -0.08, 0.45, 0, 0.03); part(leg, 0.08, 0.45, 0, -0.03);
  part(new THREE.CapsuleGeometry(0.15, 0.42, 6, 16), 0, 1.15, 0);
  const arm = new THREE.CapsuleGeometry(0.045, 0.58, 4, 10);
  part(arm, -0.22, 1.12, 0, 0.08); part(arm, 0.22, 1.12, 0, -0.08);
  part(new THREE.SphereGeometry(0.105, 20, 16), 0, 1.63, 0);
  g.scale.set(1, 1, 0.75);
  return g;
}

// ------------------------------------------------------------------------------------------------
// Viewer

export function createViewer(container, options) {
  const opts = options || {};
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  renderer.domElement.className = 'cfg-canvas';

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envDay = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envDay;
  scene.environmentIntensity = 0.26;
  const skyDay = skyTexture(false), skyNight = skyTexture(true);
  scene.background = skyDay;
  scene.fog = new THREE.Fog('#efe9e0', 18, 45);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;
  controls.minDistance = 2.5;
  controls.maxDistance = 30;
  controls.autoRotateSpeed = 0.6;

  // lights
  const DAY = { hemi: 0.06, sun: 4.2, env: 0.26 };
  const hemi = new THREE.HemisphereLight('#f3f6ff', '#b9a98f', DAY.hemi);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff4e2', DAY.sun);
  sun.position.set(-4.5, 13, 5.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  const sc = sun.shadow.camera;
  sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 40;
  scene.add(sun, sun.target);

  // materials
  const mats = {
    frame: new THREE.MeshStandardMaterial({ color: '#383e42', metalness: 0.45, roughness: 0.42 }),
    louvre: new THREE.MeshStandardMaterial({ color: '#40464a', metalness: 0.4, roughness: 0.38 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#cfe3ea', metalness: 0, roughness: 0.05, transparent: true, opacity: 0.22, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide }),
    led: new THREE.MeshBasicMaterial({ color: '#fff3dc' }),
    wall: new THREE.MeshStandardMaterial({ color: '#f1eee8', roughness: 0.95 }),
    window: new THREE.MeshStandardMaterial({ color: '#1f272c', metalness: 0.6, roughness: 0.15 }),
    windowFrame: new THREE.MeshStandardMaterial({ color: '#2b2f32', metalness: 0.4, roughness: 0.4 }),
    stone: new THREE.MeshStandardMaterial({ color: '#cfc8bc', roughness: 0.9 }),
    zipFabric: new THREE.MeshStandardMaterial({ color: '#5d5a55', roughness: 0.95, side: THREE.DoubleSide, transparent: true, opacity: 0.9, alphaMap: meshTexture() }),
    cushion: new THREE.MeshStandardMaterial({ color: '#e8e1d5', roughness: 1 }),
    table: new THREE.MeshStandardMaterial({ color: '#6b4a32', roughness: 0.6 }),
    pot: new THREE.MeshStandardMaterial({ color: '#8c8579', roughness: 0.9 }),
    leaves: new THREE.MeshStandardMaterial({ color: '#4f6b3c', roughness: 0.9, flatShading: true }),
    person: new THREE.MeshStandardMaterial({ color: '#8f877c', roughness: 0.85 })
  };

  // ground: deck under the product, stone around it
  const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1, 0.04, 1), new THREE.MeshStandardMaterial({ map: deckTexture(), roughness: 0.8 }));
  deck.position.y = 0.02; deck.receiveShadow = true;
  scene.add(deck);

  const props = new THREE.Group();
  const sofa = lounge(mats);
  const human = person(mats.person);
  props.add(sofa, human);
  scene.add(props);

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
  const dimMat = new THREE.LineDashedMaterial({ color: '#1b1918', dashSize: 0.08, gapSize: 0.06, transparent: true, opacity: 0.55 });

  let kit = null, current = null, night = false, showDims = true, showProps = true;
  const anim = { angle: 30, open: 0.3, extension: 0.8, sideOpen: 0.3 };
  const target = Object.assign({}, anim);
  let framed = null;

  function line(a, b) {
    const g = new THREE.BufferGeometry().setFromPoints([a, b]);
    const l = new THREE.Line(g, dimMat);
    l.computeLineDistances();
    dimGroup.add(l);
  }

  function disposeGroup(g) {
    g.traverse((m) => { if (m.geometry) m.geometry.dispose(); });
  }

  function build(type, o) {
    if (kit) { scene.remove(kit.group); disposeGroup(kit.group); }
    mats.frame.color.set(o.color || '#383e42');
    mats.louvre.color.set(o.color || '#383e42').offsetHSL(0, 0, 0.04);
    if (o.fabric) mats.zipFabric.color.set(o.fabric);
    mats.zipFabric.opacity = 0.92;
    mats.glass.color.set(o.glass === 'tinted' ? '#7d8b92' : '#cfe3ea');
    kit = new Kit(o, mats);
    BUILDERS[type](kit);
    scene.add(kit.group);
    kit.lights.forEach((l) => { l.intensity = night ? l.userData.intensity : 0; });
    kit.anim(anim);

    const w = o.w * CM, d = (o.d || 60) * CM, h = o.h * CM;
    const roofy = type === 'bioclimatic' || type === 'glassroof' || type === 'awning';
    deck.scale.set(w + 1.6, 1, (roofy ? d : 2.2) + 1.6);
    deck.position.z = roofy ? 0 : -0.6;
    deck.visible = roofy;

    // props: lounge under roofs (if it fits), person beside the product
    sofa.visible = showProps && roofy && w >= 3 && d >= 2.5;
    sofa.position.set(0, 0.04, type === 'bioclimatic' ? 0 : -0.1);
    sofa.scale.setScalar(Math.min(1, (w - 0.6) / 3.2, (d - 0.4) / 2.6));
    human.visible = showProps;
    human.position.set(w / 2 + 0.7, roofy ? 0.04 : 0.06, roofy ? d / 2 + 0.3 : 0.9);

    // dimension lines
    dimGroup.clear();
    const off = 0.35, y0 = 0.06;
    const front = roofy ? d / 2 : 0.15;
    line(new THREE.Vector3(-w / 2, y0, front + off), new THREE.Vector3(w / 2, y0, front + off));
    labels.w.pos.set(0, y0, front + off + 0.05); labels.w.on = !!(opts.labels && opts.labels.w);
    line(new THREE.Vector3(-w / 2 - off, 0, front), new THREE.Vector3(-w / 2 - off, h, front));
    labels.h.pos.set(-w / 2 - off, h / 2, front); labels.h.on = true;
    if (roofy) {
      line(new THREE.Vector3(w / 2 + off, y0, -d / 2), new THREE.Vector3(w / 2 + off, y0, d / 2));
      labels.d.pos.set(w / 2 + off, y0, 0); labels.d.on = true;
    } else labels.d.on = false;
    labels.w.el.textContent = o.dims && o.dims.w || '';
    labels.h.el.textContent = o.dims && o.dims.h || '';
    labels.d.el.textContent = o.dims && o.dims.d || '';
    labels.w.on = !!labels.w.el.textContent;

    // frame the camera on the first build or when the size changes a lot
    const size = Math.max(w, d, h * 1.4);
    const key = type + ':' + Math.round(size * 2);
    if (framed !== key) {
      const firstTime = framed === null;
      framed = key;
      const dist = (size * 1.9 + 3) * Math.max(1, 1.35 / camera.aspect);
      const dir = new THREE.Vector3(0.62, 0.42, 0.95).normalize();
      if (firstTime || !opts.keepView) {
        camera.position.copy(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, h * 0.35, 0));
      }
      controls.target.set(0, h * 0.42, roofy ? 0 : -0.3);
      controls.maxDistance = dist * 2.2;
    }
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
    } else if (o.dims) {
      labels.w.el.textContent = o.dims.w || '';
      labels.h.el.textContent = o.dims.h || '';
      labels.d.el.textContent = o.dims.d || '';
    }
  }

  function setNight(on) {
    night = !!on;
    scene.background = night ? skyNight : skyDay;
    scene.fog.color.set(night ? '#1a1d24' : '#efe9e0');
    hemi.intensity = night ? 0.08 : DAY.hemi;
    hemi.color.set(night ? '#6d7da8' : '#f3f6ff');
    sun.intensity = night ? 0.18 : DAY.sun;
    sun.color.set(night ? '#8aa0d6' : '#fff4e2');
    scene.environmentIntensity = night ? 0.06 : DAY.env;
    mats.led.color.set(night ? '#fff0d4' : '#f6efe2');
    if (kit) kit.lights.forEach((l) => { l.intensity = night ? l.userData.intensity : 0; });
    renderer.toneMappingExposure = night ? 1.35 : 1.0;
  }

  function setDims(on) { showDims = !!on; dimGroup.visible = showDims; labelLayer.hidden = !showDims; }
  function setProps(on) { showProps = !!on; current = null; }
  function setAutoRotate(on) { controls.autoRotate = !!on; }
  function resetView() { framed = null; current = null; }

  // render loop, paused when off screen
  let visible = true, raf = 0, disposed = false;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((e) => { visible = e[0].isIntersecting; }) : null;
  if (io) io.observe(container);

  const tmp = new THREE.Vector3();
  function resize() {
    const r = container.getBoundingClientRect();
    const wpx = Math.max(1, r.width), hpx = Math.max(1, r.height);
    renderer.setSize(wpx, hpx, false);
    camera.aspect = wpx / hpx;
    camera.updateProjectionMatrix();
  }
  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(container); else window.addEventListener('resize', resize);
  resize();

  function frame() {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    let moving = false;
    for (const k in target) {
      const diff = target[k] - anim[k];
      if (Math.abs(diff) > 1e-3) { anim[k] += diff * 0.12; moving = true; }
    }
    if (moving && kit) kit.anim(anim);
    controls.update();
    renderer.render(scene, camera);
    if (showDims) {
      const r = container.getBoundingClientRect();
      for (const k in labels) {
        const L = labels[k];
        if (!L.on) { L.el.style.display = 'none'; continue; }
        tmp.copy(L.pos).project(camera);
        const behind = tmp.z > 1;
        L.el.style.display = behind ? 'none' : '';
        L.el.style.transform = `translate(-50%, -50%) translate(${((tmp.x + 1) / 2) * r.width}px, ${((1 - tmp.y) / 2) * r.height}px)`;
      }
    }
  }
  frame();

  controls.addEventListener('start', () => { controls.autoRotate = false; if (opts.onInteract) opts.onInteract(); });

  return {
    debug: { scene, renderer, sun, hemi },
    update,
    setNight,
    setDims,
    setProps,
    setAutoRotate,
    resetView,
    snapshot() { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/png'); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf);
      if (io) io.disconnect(); if (ro) ro.disconnect();
      renderer.dispose(); container.removeChild(renderer.domElement); container.removeChild(labelLayer);
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
