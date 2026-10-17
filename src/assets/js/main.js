/* TERSUN — shared site behaviour */
(function () {
  'use strict';
  var T = window.TERSUN || {};

  // Header: solid background once the page scrolls
  var header = document.querySelector('[data-header]');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile navigation
  var toggle = document.querySelector('[data-nav-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /*
   * Send a request. With a configured endpoint the payload is POSTed as JSON;
   * otherwise the visitor's e-mail program opens with the text prefilled.
   * Resolves to 'sent' or 'mailto'.
   */
  T.send = function (payload, subject, text) {
    if (T.endpoint) {
      return fetch(T.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ _subject: subject, summary: text, language: T.lang }, payload))
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return 'sent';
      });
    }
    var href = 'mailto:' + T.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
    window.location.href = href;
    return Promise.resolve('mailto');
  };

  // Simple required-field validation shared by the forms
  T.validate = function (form) {
    var first = null;
    form.querySelectorAll('[required]').forEach(function (el) {
      var bad = el.type === 'checkbox' ? !el.checked : !String(el.value).trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
      if (el.type === 'checkbox') el.closest('.check').classList.toggle('invalid', bad);
      else el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  };

  // Contact form
  var contact = document.querySelector('[data-contact-form]');
  if (contact) {
    var params = new URLSearchParams(location.search);
    if (params.get('product') && contact.product) contact.product.value = params.get('product');
    var status = contact.querySelector('.form-status');
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      if (contact._gotcha.value) return;
      if (!T.validate(contact)) return;
      var data = {};
      new FormData(contact).forEach(function (v, k) { if (k !== '_gotcha') data[k] = v; });
      var productLabel = contact.product && contact.product.selectedIndex > 0 ? contact.product.options[contact.product.selectedIndex].text : '';
      var lines = [
        data.name, data.email, data.phone, data.country, data.customerType,
        productLabel ? '— ' + productLabel : '', '', data.message
      ].filter(function (l) { return l !== undefined; });
      var btn = contact.querySelector('[type=submit]');
      btn.disabled = true;
      T.send(data, 'TERSUN – ' + (productLabel || 'Contact') + ' – ' + data.name, lines.join('\n'))
        .then(function (how) {
          status.className = 'form-status ok';
          status.textContent = how === 'sent' ? T.strings.fThanks : T.strings.cfgMailtoText;
          if (how === 'sent') contact.reset();
        })
        .catch(function () {
          status.className = 'form-status error';
          status.textContent = T.strings.cfgError + ' ' + T.email;
        })
        .then(function () { btn.disabled = false; });
    });
  }
})();
