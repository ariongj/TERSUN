/* TERSUN — home page hero without photo: animated bioclimatic louvres */
(function () {
  'use strict';
  var I = window.TersunIllustrations;
  if (!I) return;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero: louvres open and close slowly, and follow the pointer while it moves over the hero
  var hero = document.querySelector('[data-hero]');
  var stage = document.querySelector('[data-hero-visual]');
  if (hero && stage) {
    var title = stage.querySelector('title');
    var opts = { w: 480, d: 380, h: 260, color: '#ece8e1', led: true, title: title ? title.textContent : '' };
    var current = 40, target = 40, pointerUntil = 0, t0 = performance.now(), visible = true;
    var draw = function (angle) { opts.angle = angle; stage.innerHTML = I.render('bioclimatic', opts); };

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      target = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 120;
      pointerUntil = performance.now() + 2500;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
    }

    if (!reduced) {
      var tick = function (now) {
        if (visible) {
          if (now > pointerUntil) target = 55 + 50 * Math.sin((now - t0) / 2600);
          var next = current + (target - current) * 0.06;
          if (Math.abs(next - current) > 0.15) { current = next; draw(current); }
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }
})();
