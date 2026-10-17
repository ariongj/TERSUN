/* TERSUN — minimal gallery lightbox */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-lightbox]');
    if (!a) return;
    e.preventDefault();
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<img alt="">';
    box.firstChild.src = a.href;
    box.firstChild.alt = (a.querySelector('img') || {}).alt || '';
    function close() { box.remove(); document.removeEventListener('keydown', onKey); a.focus(); }
    function onKey(ev) { if (ev.key === 'Escape') close(); }
    box.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(box);
  });
})();
