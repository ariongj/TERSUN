/*
 * TERSUN parametric product illustrations.
 *
 * Draws each product as a line illustration in a light oblique projection,
 * driven by real dimensions (cm), so the same code renders the product cards
 * at build time (Node) and the live preview in the configurator (browser).
 *
 *   TersunIllustrations.render('bioclimatic', { w: 400, d: 300, h: 260, color: '#383e42' })
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TersunIllustrations = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var KX = 0.55; // depth -> screen x
  var KY = 0.32; // depth -> screen y

  var GLASS = 'rgba(150, 190, 210, 0.28)';
  var GLASS_EDGE = 'rgba(90, 130, 150, 0.55)';
  var INK = '#1b1918';

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function shade(hex, amt) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var n = parseInt(h, 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function f(c) {
      c = amt < 0 ? c * (1 + amt) : c + (255 - c) * amt;
      return Math.round(clamp(c, 0, 255));
    }
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }

  function luminance(hex) {
    var n = parseInt(hex.replace('#', ''), 16);
    return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  }

  function Scene() {
    this.parts = [];
    this.minX = Infinity; this.minY = Infinity; this.maxX = -Infinity; this.maxY = -Infinity;
  }

  Scene.prototype.p = function (x, y, z) {
    var sx = x + z * KX, sy = -y - z * KY;
    return [sx, sy];
  };

  Scene.prototype.track = function (pt) {
    if (pt[0] < this.minX) this.minX = pt[0];
    if (pt[0] > this.maxX) this.maxX = pt[0];
    if (pt[1] < this.minY) this.minY = pt[1];
    if (pt[1] > this.maxY) this.maxY = pt[1];
  };

  Scene.prototype.poly = function (pts3, fill, stroke, extra) {
    var self = this;
    var d = pts3.map(function (q, i) {
      var pt = self.p(q[0], q[1], q[2]);
      self.track(pt);
      return (i ? 'L' : 'M') + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1);
    }).join('') + 'Z';
    this.parts.push('<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || 'none') +
      '" stroke-linejoin="round" vector-effect="non-scaling-stroke"' + (extra || '') + '/>');
  };

  Scene.prototype.line = function (a, b, stroke, extra) {
    var p1 = this.p(a[0], a[1], a[2]), p2 = this.p(b[0], b[1], b[2]);
    this.track(p1); this.track(p2);
    this.parts.push('<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) +
      '" y2="' + p2[1].toFixed(1) + '" stroke="' + stroke + '" vector-effect="non-scaling-stroke"' + (extra || '') + '/>');
  };

  // Axis-aligned box: draws the three faces visible from the front-left-above viewpoint.
  Scene.prototype.box = function (x0, y0, z0, x1, y1, z1, color, edge) {
    var e = edge || shade(color, -0.35);
    this.poly([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], shade(color, -0.22), e);
    this.poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], shade(color, 0.18), e);
    this.poly([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], color, e);
  };

  // Labels are laid out after the geometry, once the font size is known.
  Scene.prototype.text = function (x, y, z, str, anchor, dyEm) {
    (this.labels = this.labels || []).push({ pt: this.p(x, y, z), str: str, anchor: anchor || 'middle', dy: dyEm || 0.35 });
  };

  Scene.prototype.layoutLabels = function (fs) {
    var self = this;
    (this.labels || []).forEach(function (l) {
      l.pt = [l.pt[0], l.pt[1] + l.dy * fs];
      var tw = String(l.str).length * fs * 0.56;
      var x0 = l.anchor === 'end' ? l.pt[0] - tw : l.anchor === 'start' ? l.pt[0] : l.pt[0] - tw / 2;
      self.track([x0, l.pt[1] - fs]); self.track([x0 + tw, l.pt[1] + fs * 0.3]);
      self.parts.push('<text x="' + l.pt[0].toFixed(1) + '" y="' + l.pt[1].toFixed(1) + '" text-anchor="' + l.anchor +
        '" font-size="' + fs.toFixed(1) + '" class="dim-label">' + l.str + '</text>');
    });
  };

  Scene.prototype.raw = function (s) { this.parts.push(s); };

  // Ground shadow and wall helpers -------------------------------------------------
  function ground(s, w, d) {
    s.poly([[-30, 0, -20], [w + 30, 0, -20], [w + 30, 0, d + 20], [-30, 0, d + 20]], 'rgba(27,25,24,0.07)', null);
  }

  function wall(s, w, d, h) {
    var x0 = -50, x1 = w + 50, top = h + 80;
    s.poly([[x0, 0, d], [x1, 0, d], [x1, top, d], [x0, top, d]], 'url(#tsWall)', 'rgba(27,25,24,0.25)');
  }

  function dimLines(s, o) {
    // o: {w, d, h, wLabel, dLabel, hLabel}
    var c = 'rgba(27,25,24,0.55)';
    var off = 28;
    if (o.wLabel) {
      s.line([0, 0, -off], [o.w, 0, -off], c, ' stroke-dasharray="4 3"');
      s.line([0, 0, -off + 8], [0, 0, -off - 8], c);
      s.line([o.w, 0, -off + 8], [o.w, 0, -off - 8], c);
      s.text(o.w / 2, 0, -off, o.wLabel, 'middle', 1.25);
    }
    if (o.hLabel) {
      s.line([-off, 0, 0], [-off, o.h, 0], c, ' stroke-dasharray="4 3"');
      s.line([-off - 8, 0, 0], [-off + 8, 0, 0], c);
      s.line([-off - 8, o.h, 0], [-off + 8, o.h, 0], c);
      s.text(-off - 12, o.h / 2, 0, o.hLabel, 'end');
    }
    if (o.dLabel && o.d) {
      var x = o.w + off;
      s.line([x, 0, 0], [x, 0, o.d], c, ' stroke-dasharray="4 3"');
      s.text(x + 18, 4, o.d / 2, o.dLabel, 'start');
    }
  }

  function defs() {
    return '<defs><style>.dim-label{font-family:Jost,system-ui,sans-serif;font-weight:500;fill:#1b1918;opacity:.75}</style>' +
      '<pattern id="tsWall" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="14" height="14" fill="#ebe7e1"/><line x1="0" y1="0" x2="0" y2="14" stroke="#d9d3ca" stroke-width="3"/></pattern>' +
      '<pattern id="tsMesh" width="6" height="6" patternUnits="userSpaceOnUse">' +
      '<rect width="6" height="6" fill="currentColor" opacity="0.0"/><circle cx="3" cy="3" r="0.8" fill="#000" opacity="0.12"/></pattern>' +
      '<filter id="tsGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>' +
      '</defs>';
  }

  // Products -------------------------------------------------------------------------
  function bioclimatic(s, o) {
    var w = o.w, d = o.d, h = o.h, col = o.color;
    var post = 16, beam = 24, wallMounted = o.mount === 'wall';
    var angle = (o.angle == null ? 0 : o.angle) * Math.PI / 180;
    // 'double' splits the width into two modules, 'modular' also splits the depth
    var splitX = o.layout === 'double' || o.layout === 'modular' || w > 700;
    var splitZ = o.layout === 'modular';
    var xm = w / 2, zm = d / 2;

    if (wallMounted) wall(s, w, d, h);
    ground(s, w, d);

    function ledPost(x, z) {
      if (!o.led) return;
      s.line([x, 6, z], [x, h - beam - 4, z], '#ffcf7a', ' stroke-width="5" filter="url(#tsGlow)" opacity="0.85"');
      s.line([x, 6, z], [x, h - beam - 4, z], '#fff1cf', ' stroke-width="1.2"');
    }

    // back posts & beam
    if (!wallMounted) {
      s.box(0, 0, d - post, post, h - beam, d, col);
      if (splitX) s.box(xm - post / 2, 0, d - post, xm + post / 2, h - beam, d, col);
      s.box(w - post, 0, d - post, w, h - beam, d, col);
    }
    s.box(0, h - beam, d - post, w, h, d, col);
    // left side beam (and its middle post for modular systems)
    if (splitZ) s.box(0, 0, zm - post / 2, post, h - beam, zm + post / 2, col);
    s.box(0, h - beam, 0, post, h, d, col);

    // side closure on the right-hand side, drawn behind the right beam
    var x = w - post / 2, top = h - beam;
    if (o.side === 'zip') {
      var drop = top * 0.7;
      s.poly([[x, top, post], [x, top, d - post], [x, top - drop, d - post], [x, top - drop, post]],
        o.fabric || '#6f6a63', shade(o.fabric || '#6f6a63', -0.4), ' fill-opacity="0.82"');
    } else if (o.side === 'panel') {
      s.poly([[x, 0, post], [x, 0, d - post], [x, top, d - post], [x, top, post]], shade(col, -0.08), shade(col, -0.4));
      for (var sl = 18; sl < top; sl += 18) s.line([x, sl, post], [x, sl, d - post], shade(col, -0.35));
    } else if (o.side === 'glass' || o.side === 'slide' || o.side === 'guillotine') {
      if (o.side === 'guillotine') {
        for (var g = 0; g < 3; g++) {
          var gy = 6 + g * (top - 6) / 3;
          s.poly([[x, gy, post], [x, gy, d - post], [x, gy + (top - 6) / 3, d - post], [x, gy + (top - 6) / 3, post]], GLASS, GLASS_EDGE);
        }
      } else {
        var panels = Math.max(2, Math.round((d - 2 * post) / 110));
        var pw = (d - 2 * post) / panels;
        for (var i = 0; i < panels; i++) {
          var z0 = post + i * pw;
          s.poly([[x, 4, z0], [x, 4, z0 + pw], [x, top - 4, z0 + pw], [x, top - 4, z0]], GLASS, GLASS_EDGE);
        }
      }
    }

    // louvres
    var lw = 20, inner0 = post, inner1 = d - post;
    var n = Math.max(3, Math.floor((inner1 - inner0) / lw));
    var pitch = (inner1 - inner0) / n;
    var yc = h - 8;
    var cs = Math.cos(angle), sn = Math.sin(angle);
    var faceLight = shade(col, 0.28 - 0.25 * Math.abs(sn));
    for (var k = n - 1; k >= 0; k--) {
      var zc = inner0 + pitch * (k + 0.5);
      var dz = (lw / 2) * cs, dy = (lw / 2) * sn;
      var a = [post, yc - dy, zc - dz], b = [w - post, yc - dy, zc - dz];
      var c = [w - post, yc + dy, zc + dz], e = [post, yc + dy, zc + dz];
      s.poly([a, b, c, e], faceLight, shade(col, -0.3));
    }

    // LED perimeter
    if (o.led) {
      var ly = h - beam - 0.5;
      var ledPts = [[post, ly, post], [w - post, ly, post], [w - post, ly, d - post], [post, ly, d - post]];
      s.poly(ledPts, 'none', '#ffcf7a', ' stroke-width="6" filter="url(#tsGlow)" opacity="0.9"');
      s.poly(ledPts, 'none', '#fff1cf', ' stroke-width="1.5"');
    }

    // module beams over the louvres
    if (splitZ) s.box(post, h - beam, zm - post / 2, w - post, h, zm + post / 2, col);
    if (splitX) s.box(xm - post / 2, h - beam, post, xm + post / 2, h, d - post, col);

    // right beam, front posts and front beam
    s.box(w - post, h - beam, 0, w, h, d, col);
    if (splitZ && !wallMounted) s.box(w - post, 0, zm - post / 2, w, h - beam, zm + post / 2, col);
    s.box(0, 0, 0, post, h - beam, post, col);
    ledPost(post + 1, post / 2);
    s.box(w - post, 0, 0, w, h - beam, post, col);
    ledPost(w - post - 1, post / 2);
    if (splitX) { s.box(xm - post / 2, 0, 0, xm + post / 2, h - beam, post, col); ledPost(xm, -0.5); }
    s.box(0, h - beam, 0, w, h, post, col);
  }

  function glassRoofBase(s, o, withAwning) {
    var w = o.w, d = o.d, h = o.h, col = o.color;
    var post = 12, gutter = 20, rise = Math.max(30, d * 0.14);
    var hr = h + rise;
    function yAt(z) { return h + rise * (z / d); }

    var free = o.layout === 'free' || o.layout === 'double';
    if (!free) wall(s, w, d, hr);
    ground(s, w, d);

    if (free) {
      // rear posts carry the high beam instead of the wall
      s.box(0, 0, d - post, post, hr - 10, d, col);
      if (o.layout === 'double' || w > 700) s.box(w / 2 - post / 2, 0, d - post, w / 2 + post / 2, hr - 10, d, col);
      s.box(w - post, 0, d - post, w, hr - 10, d, col);
    }
    // wall profile / rear beam
    s.box(0, hr - 10, d - 10, w, hr + 4, d, col);

    function drawAwning() {
      var ext = o.extension == null ? 0.85 : o.extension;
      var lift = o.position === 'below' ? -22 : 28;
      var zFront = d - (d - gutter) * ext;
      if (lift > 0) {
        // support arms
        s.box(0, h, 4, 6, yAt(4) + lift, 10, col);
        s.box(w - 6, h, 4, w, yAt(4) + lift, 10, col);
      }
      // cassette at the wall
      s.box(0, hr + lift - 6, d - 26, w, hr + lift + 12, d - 4, col);
      // fabric
      s.poly([[6, yAt(zFront) + lift, zFront], [w - 6, yAt(zFront) + lift, zFront], [w - 6, yAt(d - 26) + lift, d - 26], [6, yAt(d - 26) + lift, d - 26]],
        o.fabric || '#d8d2c6', shade(o.fabric || '#d8d2c6', -0.35));
      // front bar
      s.box(0, yAt(zFront) + lift - 4, zFront - 6, w, yAt(zFront) + lift + 4, zFront, col);
    }
    var below = withAwning && o.position === 'below';
    if (below) drawAwning();

    // rafters & glass
    var bays = Math.max(2, Math.round(w / 110));
    var bw = w / bays;
    var glass = o.glass === 'tinted' ? 'rgba(80, 95, 105, 0.45)' : o.glass === 'opal' ? 'rgba(240, 240, 236, 0.75)' : GLASS;
    for (var i = 0; i < bays; i++) {
      var x0 = i * bw + 4, x1 = (i + 1) * bw - 4;
      s.poly([[x0, yAt(gutter) + 6, gutter], [x1, yAt(gutter) + 6, gutter], [x1, yAt(d - 10) + 6, d - 10], [x0, yAt(d - 10) + 6, d - 10]],
        glass, GLASS_EDGE);
      // reflection stroke
      s.line([x0 + bw * 0.2, yAt(d * 0.75) + 6, d * 0.75], [x0 + bw * 0.45, yAt(d * 0.3) + 6, d * 0.3], 'rgba(255,255,255,0.7)');
    }
    for (var r = 0; r <= bays; r++) {
      var x = clamp(r * bw - 4, 0, w - 8);
      s.poly([[x, h, 0], [x, hr, d], [x + 8, hr, d], [x + 8, h, 0]], shade(col, 0.15), shade(col, -0.35));
      s.poly([[x + 8, h - 10, 0], [x + 8, hr - 10, d], [x + 8, hr, d], [x + 8, h, 0]], shade(col, -0.2), shade(col, -0.35));
    }

    if (o.led) {
      for (var j = 0; j <= bays; j++) {
        for (var q = 1; q <= 3; q++) {
          var zz = d * q / 4, xx = clamp(j * bw, 4, w - 4);
          var pt = s.p(xx, yAt(zz) - 11, zz);
          s.raw('<circle cx="' + pt[0].toFixed(1) + '" cy="' + pt[1].toFixed(1) + '" r="6" fill="#ffcf7a" filter="url(#tsGlow)"/>' +
            '<circle cx="' + pt[0].toFixed(1) + '" cy="' + pt[1].toFixed(1) + '" r="2" fill="#fff6dc"/>');
        }
      }
    }

    if (withAwning && !below) drawAwning();

    // front posts & gutter
    var posts = w > 700 || o.layout === 'double' ? 3 : 2;
    for (var pi = 0; pi < posts; pi++) {
      var px = pi === 0 ? 0 : pi === posts - 1 ? w - post : w / 2 - post / 2;
      s.box(px, 0, 0, px + post, h - gutter, post, col);
    }
    s.box(0, h - gutter, 0, w, h, gutter, col);
  }

  function glassroof(s, o) { glassRoofBase(s, o, false); }
  function awning(s, o) { glassRoofBase(s, o, true); }

  function guillotine(s, o) {
    var w = o.w, h = o.h, col = o.color;
    var side = 10, top = 16, bot = 10, depth = 14;
    var open = clamp(o.open == null ? 0 : o.open, 0, 1);
    ground(s, w, 30);
    // parapet / floor line
    s.box(-20, -2, -6, w + 20, 0, 40, '#d9d4cc');
    var glass = o.glass === 'tinted' ? 'rgba(80, 95, 105, 0.42)' : GLASS;
    var clear = h - top - bot;
    var panels = 3;
    var ph = clear / panels;
    // back to front tracks so the stacked panels overlap correctly
    for (var i = 0; i < panels; i++) {
      var stackY = bot + i * 6;
      var closedY = bot + (panels - 1 - i) * ph;
      var y0 = closedY + (stackY - closedY) * open;
      var z = depth - 3 - i * 4;
      s.poly([[side, y0, z], [w - side, y0, z], [w - side, y0 + ph, z], [side, y0 + ph, z]], glass, GLASS_EDGE);
      s.box(side, y0 + ph - 3, z - 1, w - side, y0 + ph, z + 1, shade(col, 0.1));
      s.line([side + (w - 2 * side) * 0.15, y0 + ph * 0.25, z], [side + (w - 2 * side) * 0.3, y0 + ph * 0.8, z], 'rgba(255,255,255,0.7)');
    }
    s.box(0, 0, 0, side, h, depth, col);
    s.box(w - side, 0, 0, w, h, depth, col);
    s.box(0, h - top, 0, w, h, depth + 4, col);
    s.box(0, 0, 0, w, bot, depth, col);
  }

  function slide(s, o) {
    var w = o.w, h = o.h, col = o.color;
    var n = clamp(Math.round(o.tracks || 4), 2, 8);
    var open = clamp(o.open == null ? 0 : o.open, 0, 1);
    var frame = 8, depth = 6 + n * 3;
    ground(s, w, 30);
    s.box(-20, -2, -6, w + 20, 0, 40, '#d9d4cc');
    var pw = (w - 2 * frame) / n + 4;
    for (var i = n - 1; i >= 0; i--) {
      var closedX = frame + i * (pw - 4);
      var stackX = frame + i * 5;
      var x0 = closedX + (stackX - closedX) * open;
      var z = depth - 2 - i * 3;
      s.poly([[x0, frame, z], [x0 + pw, frame, z], [x0 + pw, h - frame, z], [x0, h - frame, z]], GLASS, GLASS_EDGE);
      s.box(x0, frame, z - 0.8, x0 + 2.5, h - frame, z + 0.8, shade(col, 0.05));
      s.line([x0 + pw * 0.2, h * 0.3, z], [x0 + pw * 0.45, h * 0.75, z], 'rgba(255,255,255,0.7)');
    }
    s.box(0, 0, 0, w, frame, depth, col);
    s.box(0, h - frame, 0, w, h, depth, col);
    s.box(0, 0, 0, 4, h, depth, col);
    s.box(w - 4, 0, 0, w, h, depth, col);
  }

  function zip(s, o) {
    var w = o.w, h = o.h, col = o.color;
    var guide = 6, box = 14;
    var open = clamp(o.open == null ? 0.15 : o.open, 0, 1);
    var fabric = o.fabric || '#5d5a55';
    ground(s, w, 30);
    s.box(-20, -2, -6, w + 20, 0, 40, '#d9d4cc');
    var drop = (h - box) * (1 - open);
    var yTop = h - box, yBot = yTop - drop;
    var opacity = o.fabricType === 'crystal' ? 0.25 : o.fabricType === 'blackout' ? 0.97 : 0.8;
    s.poly([[guide, yBot, 6], [w - guide, yBot, 6], [w - guide, yTop, 6], [guide, yTop, 6]], fabric, shade(fabric, -0.35),
      ' fill-opacity="' + opacity + '"');
    if (o.fabricType !== 'crystal' && o.fabricType !== 'blackout') {
      s.poly([[guide, yBot, 6], [w - guide, yBot, 6], [w - guide, yTop, 6], [guide, yTop, 6]], 'url(#tsMesh)', null);
    }
    s.box(guide, yBot - 5, 3, w - guide, yBot, 9, col);
    s.box(0, 0, 0, guide, h - box, 12, col);
    s.box(w - guide, 0, 0, w, h - box, 12, col);
    s.box(-2, h - box, -2, w + 2, h, box, col);
  }

  var DRAW = {
    bioclimatic: bioclimatic,
    glassroof: glassroof,
    awning: awning,
    guillotine: guillotine,
    slide: slide,
    zip: zip
  };

  var DEFAULTS = {
    bioclimatic: { w: 450, d: 350, h: 260, mount: 'free', layout: 'standard', angle: 35, led: true },
    glassroof: { w: 500, d: 350, h: 240, glass: 'clear', led: true },
    awning: { w: 500, d: 350, h: 240, glass: 'clear', extension: 0.8, fabric: '#d8d2c6' },
    guillotine: { w: 400, h: 240, open: 0.35 },
    slide: { w: 480, h: 240, tracks: 4, open: 0.3 },
    zip: { w: 300, h: 250, open: 0.25 }
  };

  /**
   * render(type, opts) -> SVG string
   * opts: dimensions (cm) and product options, plus:
   *   color   frame colour (hex)
   *   dims    {w,d,h} labels to print, e.g. { w: '450 cm' }
   *   frame   {w,d,h} reference size used for the viewBox, so the drawing
   *           visibly grows/shrinks when dimensions change
   *   title   accessible title
   */
  function render(type, opts) {
    var draw = DRAW[type];
    if (!draw) throw new Error('Unknown illustration: ' + type);
    var o = {};
    var k, base = DEFAULTS[type];
    for (k in base) o[k] = base[k];
    for (k in opts || {}) if (opts[k] != null) o[k] = opts[k];
    o.color = o.color || '#383e42';

    var s = new Scene();
    draw(s, o);
    var f = null;
    if (o.frame) {
      // reserve room for the largest configurable size
      f = new Scene();
      var fo = {};
      for (k in o) fo[k] = o[k];
      for (k in o.frame) fo[k] = o.frame[k];
      draw(f, fo);
    }
    var ref = f || s;
    var size = Math.max(ref.maxX - ref.minX, ref.maxY - ref.minY);
    var fs = size * 0.042;
    if (o.dims) {
      dimLines(s, { w: o.w, d: o.d, h: o.h, wLabel: o.dims.w, dLabel: o.dims.d, hLabel: o.dims.h });
      s.layoutLabels(fs);
      if (f) {
        dimLines(f, { w: o.frame.w || o.w, d: o.frame.d || o.d, h: o.frame.h || o.h,
          wLabel: o.dims.w, dLabel: o.dims.d, hLabel: o.dims.h });
        f.layoutLabels(fs);
      }
    }
    var minX = s.minX, minY = s.minY, maxX = s.maxX, maxY = s.maxY;
    if (f) {
      // keep the frame's size, centred on the drawing and standing on the same ground line
      var fw = Math.max(f.maxX, s.maxX) - Math.min(f.minX, s.minX);
      var fh = Math.max(f.maxY, s.maxY) - Math.min(f.minY, s.minY);
      var cx = (s.minX + s.maxX) / 2;
      minX = cx - fw / 2; maxX = cx + fw / 2;
      maxY = Math.max(f.maxY, s.maxY); minY = maxY - fh;
    }
    var pad = size * 0.03;
    var vb = [minX - pad, minY - pad, maxX - minX + 2 * pad, maxY - minY + 2 * pad].map(function (v) { return v.toFixed(1); }).join(' ');
    var ink = luminance(o.color) > 0.6 ? shade(o.color, -0.55) : INK;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" class="ts-illustration" role="img" stroke-width="1"' +
      ' style="--ink:' + ink + '"><title>' + (o.title || type) + '</title>' +
      defs() + s.parts.join('') + '</svg>';
  }

  return { render: render, defaults: DEFAULTS, shade: shade };
});
