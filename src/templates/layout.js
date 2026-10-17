const fs = require('fs');
const path = require('path');
const config = require('../config');
const S = require('../i18n/strings');
const icon = require('./icons');

const ROOT = path.join(__dirname, '..');
const logoSvg = fs.readFileSync(path.join(ROOT, 'assets/img/logo/tersun-logo.svg'), 'utf8')
  .replace('<svg ', '<svg class="logo-svg" ');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/*
 * Page context. `route` is the language-neutral page id ('', 'products/', 'products/glass-roof/', …).
 * All links are relative so the site works from any folder or host.
 */
function createContext(lang, route, opts) {
  const preview = !!(opts && opts.preview);
  const depth = (lang + '/' + route).split('/').filter(Boolean).length;
  // the 404 page is served from arbitrary URLs, so it uses root-absolute links
  const up = opts && opts.absolute ? '/' : '../'.repeat(depth);
  const ctx = {
    lang, route, preview,
    t: (key) => {
      const v = S[key];
      if (!v) throw new Error('Missing string: ' + key);
      return v[lang];
    },
    tr: (obj) => obj[lang],
    // link to a route in the given language (defaults to current)
    href: (r, l) => {
      const target = (l || lang) + '/' + (r || '');
      return up + target + (preview ? 'index.html' : '');
    },
    asset: (p) => up + 'assets/' + p,
    abs: (r, l) => config.siteUrl + '/' + (l || lang) + '/' + (r || ''),
    root: up
  };
  return ctx;
}

function header(ctx, products, opts) {
  const { t, href, route } = ctx;
  const nav = [
    ['products/', t('navProducts')],
    ['configurator/', t('navConfigurator')],
    ['about/', t('navAbout')],
    ['contact/', t('navContact')]
  ];
  const isActive = (r) => route === r || (r === 'products/' && route.startsWith('products/'));
  const productLinks = products.map((p) =>
    `<li><a href="${href('products/' + p.slug + '/')}">${esc(ctx.tr(p.name))}</a></li>`).join('');
  const langs = config.languages.map((l) =>
    `<a href="${href(route, l)}" hreflang="${l}" lang="${l}"${l === ctx.lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('');

  return `
<a class="skip-link" href="#main">${t('skip')}</a>
<header class="site-header${opts.overHero ? ' over-hero' : ''}" data-header>
  <div class="container header-inner">
    <a class="brand" href="${href('')}" aria-label="TERSUN – ${esc(t('navHome'))}">${logoSvg}</a>
    <nav class="main-nav" id="main-nav" aria-label="Main">
      <ul>
        ${nav.map(([r, label]) => r === 'products/'
          ? `<li class="has-sub"><a href="${href(r)}"${isActive(r) ? ' aria-current="page"' : ''}>${label}</a><ul class="sub">${productLinks}</ul></li>`
          : `<li><a href="${href(r)}"${isActive(r) ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}
      </ul>
      <div class="lang-switch" aria-label="${esc(t('footerLanguage'))}">${langs}</div>
    </nav>
    <a class="btn btn-small header-cta" href="${href('configurator/')}">${t('ctaQuote')}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" data-nav-toggle>
      <span class="sr-only">${t('navMenu')}</span><span class="bars" aria-hidden="true"></span>
    </button>
  </div>
</header>`;
}

function footer(ctx, products) {
  const { t, href } = ctx;
  const c = config.company;
  const year = new Date().getFullYear();
  const social = Object.entries(c.social).filter(([, v]) => v)
    .map(([k, v]) => `<a href="${esc(v)}" rel="noopener" target="_blank">${k[0].toUpperCase() + k.slice(1)}</a>`).join('');
  return `
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand" href="${href('')}" aria-label="TERSUN">${logoSvg}</a>
      <p>${t('footerTagline')}</p>
    </div>
    <div>
      <h2 class="footer-title">${t('navProducts')}</h2>
      <ul>${products.map((p) => `<li><a href="${href('products/' + p.slug + '/')}">${esc(ctx.tr(p.name))}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="footer-title">TERSUN</h2>
      <ul>
        <li><a href="${href('configurator/')}">${t('navConfigurator')}</a></li>
        <li><a href="${href('about/')}">${t('navAbout')}</a></li>
        <li><a href="${href('contact/')}">${t('navContact')}</a></li>
        <li><a href="${href('legal/')}">${t('legalTitle')}</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">${t('navContact')}</h2>
      <ul class="footer-contact">
        <li>${icon('mail')}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
        <li>${icon('phone')}<a href="tel:${esc(c.phone.replace(/\s+/g, ''))}">${esc(c.phone)}</a></li>
        <li>${icon('pin')}<span>${esc(c.address)}</span></li>
      </ul>
      ${social ? `<div class="footer-social">${social}</div>` : ''}
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© ${year} TERSUN. ${t('footerRights')}</span>
    <div class="lang-switch">${config.languages.map((l) =>
      `<a href="${href(ctx.route, l)}" hreflang="${l}" lang="${l}"${l === ctx.lang ? ' aria-current="true"' : ''}>${S.langName[l]}</a>`).join('')}</div>
  </div>
</footer>`;
}

function layout(ctx, products, page) {
  const { t, lang, route } = ctx;
  const alternates = config.languages.map((l) =>
    `<link rel="alternate" hreflang="${l}" href="${ctx.abs(route, l)}">`).join('\n  ') +
    `\n  <link rel="alternate" hreflang="x-default" href="${ctx.abs(route, config.defaultLanguage)}">`;
  const clientConfig = {
    lang,
    endpoint: config.formEndpoint,
    email: config.company.email,
    strings: page.clientStrings || {}
  };
  return `<!doctype html>
<html lang="${S.htmlLang[lang]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>document.documentElement.classList.add('js')</script>
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description || t('metaHomeDesc'))}">
  <link rel="canonical" href="${ctx.abs(route)}">
  ${alternates}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="TERSUN">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description || t('metaHomeDesc'))}">
  <meta property="og:url" content="${ctx.abs(route)}">
  <meta property="og:locale" content="${S.ogLocale[lang]}">
  <meta property="og:image" content="${config.siteUrl}/assets/img/og-image.jpg">
  <meta name="theme-color" content="#1b1918">
  <link rel="icon" href="${ctx.asset('img/logo/favicon.svg')}" type="image/svg+xml">
  <link rel="preload" href="${ctx.asset('fonts/jost-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${ctx.asset('css/style.css')}">
  ${page.head || ''}
</head>
<body class="${page.bodyClass || ''}">
${header(ctx, products, { overHero: page.overHero })}
<main id="main">
${page.body}
</main>
${footer(ctx, products)}
<script>window.TERSUN = ${JSON.stringify(clientConfig).replace(/</g, '\\u003c')};</script>
<script src="${ctx.asset('js/main.js')}" defer></script>
${(page.scripts || []).map((s) => typeof s === 'string'
    ? `<script src="${ctx.asset(s)}" defer></script>`
    : `<script type="module" src="${ctx.asset(s.src)}"></script>`).join('\n')}
</body>
</html>
`;
}

module.exports = { layout, createContext, esc, logoSvg };
