/* TERSUN — product configurator */
(function () {
  'use strict';
  var root = document.querySelector('[data-configurator]');
  if (!root) return;
  var I = window.TersunIllustrations;
  var T = window.TERSUN || {};
  var L = T.strings || {};
  var products = JSON.parse(root.querySelector('[data-cfg-data]').textContent);

  var $ = function (sel) { return root.querySelector(sel); };
  var form = $('[data-cfg-form]');
  var stage = $('[data-cfg-preview]');
  var steps = root.querySelectorAll('.cfg-step');
  var stepBtns = root.querySelectorAll('[data-step-btn]');
  var btnBack = $('[data-cfg-back]'), btnNext = $('[data-cfg-next]'), btnSubmit = $('[data-cfg-submit]');
  var status = $('[data-cfg-status]');
  var previewCtl = $('[data-cfg-preview-control]'), previewRange = $('[data-cfg-preview-range]');
  var sideCtl = $('[data-cfg-side-control]'), sideRange = $('[data-cfg-side-range]');
  var DIM_KEYS = ['w', 'd', 'h'];
  var DIM_LABEL = { w: L.dimW, d: L.dimD, h: L.dimH };
  var STORE = 'tersun-config';

  var state = { step: 0, reached: 0, product: null, dims: {}, values: {}, preview: null, sideOpen: 30 };

  function product() { return products.filter(function (p) { return p.id === state.product; })[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function isDesignField(f) { return f.type === 'color' || (f.type === 'choice' && f.key !== 'control'); }
  function choice(f, value) { return (f.choices || []).filter(function (c) { return c.value === value; })[0]; }
  function field(key) { return (product().fields || []).filter(function (f) { return f.key === key; })[0]; }

  // Configuration encoded in the URL hash, so it can be shared and reopened
  function shareCode() {
    var json = JSON.stringify({ p: state.product, d: state.dims, v: state.values });
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function shareUrl() {
    return location.href.split('#')[0].split('?')[0] + '#c=' + shareCode();
  }

  function readShare() {
    var m = /[#&]c=([\w-]+)/.exec(location.hash);
    if (!m) return null;
    try {
      var b = m[1].replace(/-/g, '+').replace(/_/g, '/');
      var o = JSON.parse(decodeURIComponent(escape(atob(b))));
      return { product: o.p, dims: o.d, values: o.v };
    } catch (e) { return null; }
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ product: state.product, dims: state.dims, values: state.values })); } catch (e) { /* storage unavailable */ }
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return null; }
  }

  // ---------------------------------------------------------------- state
  function selectProduct(id, restore) {
    state.product = id;
    var p = product();
    state.dims = {};
    DIM_KEYS.forEach(function (k) { if (p.dims[k]) state.dims[k] = p.dims[k][2]; });
    state.values = {};
    p.fields.forEach(function (f) {
      if (f.type === 'multi') state.values[f.key] = [];
      else if (f.type === 'number') state.values[f.key] = f.value;
      else state.values[f.key] = f.choices[0].value;
    });
    if (restore && restore.product === id) {
      DIM_KEYS.forEach(function (k) { if (restore.dims && restore.dims[k] != null && p.dims[k]) state.dims[k] = restore.dims[k]; });
      Object.keys(restore.values || {}).forEach(function (k) { if (k in state.values || k.indexOf('ral-') === 0) state.values[k] = restore.values[k]; });
    }
    state.preview = p.preview ? p.preview.value : null;
    var radio = form.querySelector('input[name=product][value="' + id + '"]');
    if (radio) radio.checked = true;
    buildDims(); buildFields(); buildPreviewControl(); drawPreview(); save();
  }

  // ---------------------------------------------------------------- builders
  function buildDims() {
    var p = product();
    var html = DIM_KEYS.filter(function (k) { return p.dims[k]; }).map(function (k) {
      var r = p.dims[k];
      return '<div class="cfg-dim" data-dim="' + k + '">' +
        '<span id="dim-' + k + '">' + DIM_LABEL[k] + '</span>' +
        '<span class="num"><input type="number" inputmode="numeric" min="' + r[0] + '" max="' + r[1] + '" step="5" value="' + state.dims[k] + '" aria-labelledby="dim-' + k + '"><small>cm</small></span>' +
        '<input type="range" min="' + r[0] + '" max="' + r[1] + '" step="5" value="' + state.dims[k] + '" aria-labelledby="dim-' + k + '" tabindex="-1">' +
        '<span class="range-hint"><span>' + r[0] + ' cm</span><span>' + r[1] + ' cm</span></span>' +
        '<span class="err" hidden></span></div>';
    }).join('');
    var holder = $('[data-cfg-dims]');
    holder.innerHTML = html;
    holder.querySelectorAll('.cfg-dim').forEach(function (row) {
      var k = row.getAttribute('data-dim');
      var num = row.querySelector('input[type=number]'), range = row.querySelector('input[type=range]');
      var err = row.querySelector('.err');
      var r = product().dims[k];
      range.addEventListener('input', function () { num.value = range.value; set(+range.value); });
      num.addEventListener('input', function () {
        var v = +num.value;
        if (v >= r[0] && v <= r[1]) { range.value = v; set(v); }
      });
      num.addEventListener('change', function () {
        var v = Math.round(+num.value) || r[2];
        v = Math.max(r[0], Math.min(r[1], v));
        num.value = v; range.value = v; set(v);
      });
      function set(v) { state.dims[k] = v; err.hidden = true; num.removeAttribute('aria-invalid'); drawPreview(); save(); }
    });
  }

  function fieldHtml(f) {
    var v = state.values[f.key];
    var name = 'f-' + f.key;
    if (f.type === 'number') {
      return '<div class="cfg-group"><span class="cfg-group-title" id="' + name + '">' + esc(f.label) + '</span>' +
        '<div class="cfg-number" data-number="' + f.key + '"><button type="button" data-delta="-1" aria-label="−">−</button>' +
        '<input type="number" min="' + f.min + '" max="' + f.max + '" value="' + v + '" aria-labelledby="' + name + '">' +
        '<button type="button" data-delta="1" aria-label="+">+</button></div></div>';
    }
    var multi = f.type === 'multi';
    var items = f.choices.map(function (c) {
      var checked = multi ? v.indexOf(c.value) > -1 : v === c.value;
      var sw = f.type === 'color' ? '<i class="swatch" style="--c:' + c.hex + '"' + (c.value === 'custom' ? ' data-custom' : '') + '></i>' : '';
      return '<label class="cfg-choice"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + name + '" value="' + esc(c.value) + '"' +
        (checked ? ' checked' : '') + ' data-field="' + f.key + '"><span>' + sw + esc(c.label) + '</span></label>';
    }).join('');
    var ral = f.type === 'color' && f.choices.some(function (c) { return c.value === 'custom'; })
      ? '<label class="field cfg-ral" data-ral="' + f.key + '"' + (v === 'custom' ? '' : ' hidden') + '><span>' + esc(L.cfgCustomRal) + '</span>' +
        '<input name="ral-' + f.key + '" placeholder="RAL ____" value="' + esc(state.values['ral-' + f.key] || '') + '"></label>'
      : '';
    return '<fieldset class="cfg-group"><legend class="cfg-group-title">' + esc(f.label) + '</legend><div class="cfg-choices">' + items + '</div>' + ral + '</fieldset>';
  }

  function buildFields() {
    var p = product();
    $('[data-cfg-design]').innerHTML = p.fields.filter(isDesignField).map(fieldHtml).join('');
    $('[data-cfg-options]').innerHTML = p.fields.filter(function (f) { return !isDesignField(f); }).map(fieldHtml).join('');
  }

  function sideClosureActive() {
    var v = state.values.side;
    return state.product === 'bioclimatic' && (v === 'zip' || v === 'guillotine' || v === 'slide');
  }

  function buildSideControl() {
    if (!sideCtl) return;
    sideCtl.hidden = !(window.TersunViewer && sideClosureActive());
    sideRange.value = state.sideOpen;
    $('[data-cfg-side-output]').textContent = state.sideOpen + '%';
  }

  function buildPreviewControl() {
    buildSideControl();
    var pv = product().preview;
    previewCtl.hidden = !pv;
    if (!pv) return;
    $('[data-cfg-preview-label]').textContent = pv.label;
    previewRange.min = pv.min; previewRange.max = pv.max; previewRange.value = state.preview;
    $('[data-cfg-preview-output]').textContent = state.preview + pv.unit;
  }

  // ---------------------------------------------------------------- preview
  function hexOf(key) {
    var f = field(key);
    var c = f && choice(f, state.values[key]);
    return c ? c.hex : undefined;
  }

  function previewParams() {
    var p = product(), v = state.values;
    var extras = v.extras || [];
    var has = function (x) { return extras.indexOf(x) > -1; };
    var o = {
      w: state.dims.w, d: state.dims.d, h: state.dims.h,
      color: hexOf('color'),
      frame: { w: p.dims.w[1], d: p.dims.d ? p.dims.d[1] : undefined, h: p.dims.h[1] },
      dims: { w: state.dims.w + ' cm', h: state.dims.h + ' cm', d: state.dims.d ? state.dims.d + ' cm' : null },
      title: p.name
    };
    var type = p.illustration;
    var pv = state.preview;
    switch (p.id) {
      case 'bioclimatic':
        o.layout = v.layout; o.mount = v.mount; o.side = v.side; o.angle = pv; o.led = has('led'); break;
      case 'glassroof':
        o.layout = v.layout; o.led = has('led');
        if (has('awning')) { type = 'awning'; o.extension = 0.85; }
        break;
      case 'awning':
        o.position = v.position; o.fabric = hexOf('fabric'); o.extension = pv / 100; break;
      case 'guillotine':
        o.open = pv / 100; break;
      case 'slide':
        o.tracks = v.tracks; o.open = pv / 100; break;
      case 'zip':
        o.fabric = hexOf('fabric'); o.open = pv / 100; break;
    }
    return { type: type, opts: o };
  }

  var raf = 0;
  function drawPreview() {
    var viewer = window.TersunViewer;
    if (viewer) {
      buildSideControl();
      if (!state.product) viewer.update('bioclimatic', { w: 450, d: 350, h: 260, color: '#383e42', angle: 35, led: true, dims: {} });
      else {
        var vp = previewParams();
        vp.opts.sideOpen = state.sideOpen / 100;
        viewer.update(vp.type, vp.opts);
      }
      return;
    }
    if (!state.product) {
      stage.innerHTML = I.render('bioclimatic', { color: '#383e42', angle: 35, led: true, title: '' });
      return;
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      if (window.TersunViewer) return; // the 3D viewer took over meanwhile
      var pp = previewParams();
      stage.innerHTML = I.render(pp.type, pp.opts);
    });
  }

  // ---------------------------------------------------------------- summary
  function summaryRows() {
    var p = product(), rows = [];
    DIM_KEYS.forEach(function (k) { if (p.dims[k]) rows.push([DIM_LABEL[k], state.dims[k] + ' cm']); });
    p.fields.forEach(function (f) {
      var v = state.values[f.key], text;
      if (f.type === 'number') text = String(v);
      else if (f.type === 'multi') text = v.length ? v.map(function (x) { return choice(f, x).label; }).join(', ') : L.cfgNone;
      else {
        var c = choice(f, v);
        text = c.label + (f.type === 'color' && v.indexOf('RAL') === 0 ? ' (' + v + ')' : '');
        if (v === 'custom' && state.values['ral-' + f.key]) text += ': ' + state.values['ral-' + f.key];
      }
      rows.push([f.label, text]);
    });
    return rows;
  }

  var reference = '';
  function renderSummary(target) {
    var p = product();
    target.innerHTML = '<h3>' + esc(p.name) + '</h3><dl>' +
      '<dt>' + esc(L.cfgReference) + '</dt><dd>' + reference + '</dd>' +
      summaryRows().map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>';
  }

  // ---------------------------------------------------------------- steps
  function validateStep(i) {
    if (i === 0) return !!state.product;
    if (i === 1) {
      var ok = true, p = product();
      root.querySelectorAll('.cfg-dim').forEach(function (row) {
        var k = row.getAttribute('data-dim'), r = p.dims[k], num = row.querySelector('input[type=number]');
        var v = +num.value;
        var bad = !(v >= r[0] && v <= r[1]);
        var err = row.querySelector('.err');
        err.hidden = !bad;
        if (bad) {
          ok = false;
          err.textContent = L.cfgOutOfRange.replace('{min}', r[0]).replace('{max}', r[1]);
          num.setAttribute('aria-invalid', 'true');
        }
      });
      return ok;
    }
    return true;
  }

  function go(i) {
    state.step = i;
    state.reached = Math.max(state.reached, i);
    steps.forEach(function (s, k) { s.hidden = k !== i; });
    stepBtns.forEach(function (b, k) {
      b.disabled = k > state.reached || (!state.product && k > 0);
      b.classList.toggle('done', k < state.reached && k !== i);
      if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    btnBack.style.visibility = i === 0 ? 'hidden' : 'visible';
    btnNext.hidden = i === steps.length - 1;
    btnSubmit.hidden = i !== steps.length - 1;
    btnNext.disabled = i === 0 && !state.product;
    if (i === steps.length - 1) {
      reference = reference || 'TS-' + state.product.slice(0, 3).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      renderSummary($('[data-cfg-summary]'));
    }
    status.textContent = '';
  }

  function scrollToPanel() {
    var panel = $('.cfg-panel');
    var top = panel.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------------------------------------------------------------- events
  form.addEventListener('change', function (e) {
    var el = e.target;
    if (el.name === 'product') { reference = ''; selectProduct(el.value); btnNext.disabled = false; return; }
    var key = el.getAttribute('data-field');
    if (key) {
      var f = field(key);
      if (f.type === 'multi') {
        state.values[key] = Array.prototype.map.call(form.querySelectorAll('input[name="f-' + key + '"]:checked'), function (x) { return x.value; });
      } else {
        state.values[key] = el.value;
        var ral = root.querySelector('[data-ral="' + key + '"]');
        if (ral) ral.hidden = el.value !== 'custom';
        if (key === 'side') buildSideControl();
      }
      drawPreview(); save();
    }
  });

  form.addEventListener('input', function (e) {
    var el = e.target;
    if (el.name && el.name.indexOf('ral-') === 0) { state.values[el.name] = el.value; save(); }
  });

  root.addEventListener('click', function (e) {
    var d = e.target.closest('[data-delta]');
    if (d) {
      var wrap = d.closest('[data-number]'), key = wrap.getAttribute('data-number'), f = field(key);
      var input = wrap.querySelector('input');
      var v = Math.max(f.min, Math.min(f.max, (+input.value || f.value) + (+d.getAttribute('data-delta'))));
      input.value = v; state.values[key] = v; drawPreview(); save();
    }
  });

  root.addEventListener('change', function (e) {
    var wrap = e.target.closest && e.target.closest('[data-number]');
    if (wrap) {
      var key = wrap.getAttribute('data-number'), f = field(key);
      var v = Math.max(f.min, Math.min(f.max, Math.round(+e.target.value) || f.value));
      e.target.value = v; state.values[key] = v; drawPreview(); save();
    }
  });

  if (sideRange) sideRange.addEventListener('input', function () {
    state.sideOpen = +sideRange.value;
    $('[data-cfg-side-output]').textContent = state.sideOpen + '%';
    drawPreview();
  });

  previewRange.addEventListener('input', function () {
    state.preview = +previewRange.value;
    $('[data-cfg-preview-output]').textContent = state.preview + product().preview.unit;
    drawPreview();
  });

  btnNext.addEventListener('click', function () {
    if (!validateStep(state.step)) return;
    go(state.step + 1); scrollToPanel();
  });
  btnBack.addEventListener('click', function () { go(Math.max(0, state.step - 1)); scrollToPanel(); });
  stepBtns.forEach(function (b, k) {
    b.addEventListener('click', function () {
      if (k <= state.reached && (k <= state.step || validateStep(state.step))) go(k);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.elements.namedItem('_gotcha').value) return;
    if (!T.validate(form)) return;
    var p = product();
    var val = function (n) { return form.elements.namedItem(n).value; };
    var contact = {
      name: val('name'), email: val('email'), phone: val('phone'),
      country: val('country'), city: val('city'), customerType: val('customerType'),
      message: val('message')
    };
    var rows = summaryRows();
    var link = shareUrl();
    var text = [
      'TERSUN – ' + L.navConfigurator,
      L.cfgReference + ': ' + reference,
      link,
      '',
      p.name
    ].concat(rows.map(function (r) { return r[0] + ': ' + r[1]; })).concat([
      '',
      L.fName + ': ' + contact.name,
      L.fEmail + ': ' + contact.email,
      L.fPhone + ': ' + contact.phone,
      L.fCountry + ': ' + contact.country + (contact.city ? ', ' + contact.city : ''),
      L.fCustomerType + ': ' + contact.customerType,
      '',
      contact.message
    ]).join('\n');
    var payload = Object.assign({ reference: reference, link: link, product: p.id, productName: p.name, dimensions: state.dims, options: state.values }, contact);
    btnSubmit.disabled = true;
    T.send(payload, 'TERSUN ' + reference + ' – ' + p.name + ' – ' + contact.name, text)
      .then(function (how) {
        form.hidden = true;
        $('[data-cfg-steps]').hidden = true;
        var done = $('[data-cfg-done]');
        done.hidden = false;
        $('[data-cfg-done-text]').textContent = how === 'sent' ? L.cfgThanksText : L.cfgMailtoText;
        var sum = document.createElement('div');
        sum.className = 'cfg-summary';
        renderSummary(sum);
        if (window.TersunViewer) {
          var img = new Image();
          img.alt = p.name;
          img.className = 'cfg-snapshot';
          img.src = window.TersunViewer.snapshot();
          sum.insertBefore(img, sum.firstChild);
        }
        var old = done.querySelector('.cfg-summary');
        if (old) old.remove();
        done.insertBefore(sum, done.querySelector('.hero-actions'));
        scrollToPanel();
      })
      .catch(function () {
        status.className = 'form-status error';
        status.textContent = L.cfgError + ' ' + T.email;
      })
      .then(function () { btnSubmit.disabled = false; });
  });

  $('[data-cfg-print]').addEventListener('click', function () { window.print(); });

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cfg-share]');
    if (!btn || !state.product) return;
    var url = shareUrl();
    var done = function () {
      var label = btn.querySelector('span');
      var old = label.textContent;
      label.textContent = L.cfgCopied;
      setTimeout(function () { label.textContent = old; }, 2200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt('', url); });
    else window.prompt('', url);
  });
  $('[data-cfg-restart]').addEventListener('click', function () {
    form.reset();
    form.hidden = false;
    $('[data-cfg-steps]').hidden = false;
    $('[data-cfg-done]').hidden = true;
    reference = '';
    state.reached = 0;
    selectProduct(state.product);
    go(0);
  });

  // ---------------------------------------------------------------- init
  var params = new URLSearchParams(location.search);
  var shared = readShare();
  var saved = shared || load();
  var initial = (shared && shared.product) || params.get('product') || (saved && saved.product);
  if (initial && products.some(function (p) { return p.id === initial; })) {
    selectProduct(initial, saved);
    go(shared ? 4 : params.get('product') ? 1 : 0);
  } else {
    drawPreview();
    go(0);
  }

  window.TersunConfigurator = {
    redraw: function () { buildSideControl(); drawPreview(); },
    reference: function () { return reference; }
  };
  window.dispatchEvent(new Event('tersun:configurator-ready'));
})();
