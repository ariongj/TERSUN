/* TERSUN — mounts the 3D builder into the configurator preview (falls back to the SVG drawing). */
import { createViewer, webglAvailable } from './builder3d.js';

const stage = document.querySelector('[data-cfg-preview]');
const toolbar = document.querySelector('[data-cfg-toolbar]');

function start() {
  const cfg = window.TersunConfigurator;
  if (!stage || !cfg || !webglAvailable()) return;
  let viewer;
  try {
    stage.innerHTML = '';
    stage.classList.add('is-3d');
    viewer = createViewer(stage, { keepView: true, labels: { w: true } });
  } catch (e) {
    stage.classList.remove('is-3d');
    cfg.redraw();
    return;
  }
  window.TersunViewer = viewer;
  viewer.setAutoRotate(true);
  if (toolbar) toolbar.hidden = false;
  cfg.redraw();

  const state = { night: false, dims: true, props: true, rotate: true };
  const press = (btn, on) => btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  toolbar && toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-3d]');
    if (!btn) return;
    const action = btn.getAttribute('data-3d');
    if (action === 'night') { state.night = !state.night; viewer.setNight(state.night); press(btn, state.night); }
    if (action === 'dims') { state.dims = !state.dims; viewer.setDims(state.dims); press(btn, state.dims); }
    if (action === 'props') { state.props = !state.props; viewer.setProps(state.props); press(btn, state.props); cfg.redraw(); }
    if (action === 'rotate') { state.rotate = !state.rotate; viewer.setAutoRotate(state.rotate); press(btn, state.rotate); }
    if (action === 'reset') { viewer.resetView(); cfg.redraw(); }
    if (action === 'full') {
      const el = stage.closest('.cfg-preview') || stage;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen();
    }
    if (action === 'save') {
      const a = document.createElement('a');
      a.href = viewer.snapshot();
      a.download = 'TERSUN-' + (cfg.reference() || 'configuration') + '.png';
      document.body.appendChild(a); a.click(); a.remove();
    }
  });
  // stop the rotation indicator once the visitor takes over
  stage.addEventListener('pointerdown', () => {
    state.rotate = false;
    const btn = toolbar && toolbar.querySelector('[data-3d="rotate"]');
    if (btn) press(btn, false);
  });
}

if (window.TersunConfigurator) start();
else window.addEventListener('tersun:configurator-ready', start, { once: true });
