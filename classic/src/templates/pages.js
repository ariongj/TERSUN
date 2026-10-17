const config = require('../config');
const S = require('../i18n/strings');
const I = require('../assets/js/illustrations');
const icon = require('./icons');
const { esc } = require('./layout');

const CARD_COLOR = '#383e42';

function productVisual(ctx, p, opts) {
  const o = opts || {};
  if (p.photos && p.photos.length && !o.illustration) {
    return `<img src="${ctx.asset(p.photos[0])}" alt="${esc(ctx.tr(p.name))}" loading="${o.eager ? 'eager' : 'lazy'}" decoding="async">`;
  }
  return I.render(p.illustration, Object.assign({ color: CARD_COLOR, title: ctx.tr(p.name) }, o.params || {}));
}

function productVideo(ctx, p, cls) {
  if (!p.video) return '';
  return `<video class="${cls || 'product-video'}" autoplay muted loop playsinline preload="metadata" poster="${ctx.asset(p.video.poster)}" aria-label="${esc(ctx.tr(p.name))}">
      <source src="${ctx.asset(p.video.src)}" type="video/mp4">
    </video>`;
}

function productCard(ctx, p, i) {
  const { href, t, tr } = ctx;
  return `
<article class="product-card reveal" style="--d:${(i % 3) * 80}ms">
  <a href="${href('products/' + p.slug + '/')}" class="product-card-link">
    <div class="product-card-visual${p.photos && p.photos.length ? ' has-photo' : ''}">${productVisual(ctx, p)}</div>
    <div class="product-card-body">
      <span class="product-card-index">0${i + 1}</span>
      <h3>${esc(tr(p.name))}</h3>
      <p>${esc(tr(p.tagline))}</p>
      <span class="link-arrow">${t('ctaDiscover')} ${icon('arrow')}</span>
    </div>
  </a>
</article>`;
}

function sectionHead(eyebrow, title, text, cls) {
  return `<div class="section-head${cls ? ' ' + cls : ''} reveal">
    ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}
    <h2>${title}</h2>
    ${text ? `<p class="lead">${text}</p>` : ''}
  </div>`;
}

function configBand(ctx) {
  const { t, href } = ctx;
  return `
<section class="config-band">
  <div class="container config-band-inner">
    <div class="reveal">
      <span class="eyebrow eyebrow-light">${t('navConfigurator')}</span>
      <h2>${t('configBandTitle')}</h2>
      <p>${t('configBandText')}</p>
      <ol class="config-band-steps">
        ${S.cfgSteps[ctx.lang].map((s, i) => `<li><b>${i + 1}</b>${s}</li>`).join('')}
      </ol>
      <a class="btn btn-light" href="${href('configurator/')}">${t('ctaConfigure')} ${icon('arrow')}</a>
    </div>
    <a class="config-band-visual reveal-img" href="${href('configurator/')}" aria-label="${esc(t('ctaConfigure'))}">
      <img src="${ctx.asset('img/builder-day.jpg')}" alt="" loading="lazy" decoding="async">
      <img class="night" src="${ctx.asset('img/builder-night.jpg')}" alt="" loading="lazy" decoding="async">
      <span class="config-band-badge">3D</span>
      <span class="config-band-daynight"><i></i>${t('cfg3dNight')}</span>
    </a>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------------------------
function home(ctx, products) {
  const { t, href, tr, lang } = ctx;
  const bio = products.find((p) => p.id === 'bioclimatic');
  const body = `
<section class="hero${bio.photos.length ? ' hero-photo' : ''}" data-hero>
  ${bio.photos.length
    ? `<img class="hero-bg" src="${ctx.asset(bio.photos[0])}" alt="" fetchpriority="high" decoding="async">`
    : '<div class="hero-glow" aria-hidden="true"></div>'}
  <div class="container hero-inner">
    <div class="hero-copy">
      <span class="eyebrow eyebrow-light">${t('heroEyebrow')}</span>
      <h1>${t('heroTitle')}</h1>
      <p class="hero-text">${t('heroText')}</p>
      <div class="hero-actions">
        <a class="btn btn-light" href="${href('configurator/')}">${t('ctaConfigure')} ${icon('arrow')}</a>
        <a class="btn btn-ghost-light" href="${href('products/')}">${t('ctaAllProducts')}</a>
      </div>
    </div>
    ${bio.photos.length ? '' : `<div class="hero-visual" data-hero-visual aria-hidden="true">
      ${I.render('bioclimatic', { w: 480, d: 380, h: 260, color: '#ece8e1', angle: 40, led: true, title: tr(bio.name) })}
    </div>`}
  </div>
  <div class="container hero-products">
    ${products.map((p) => `<a href="${href('products/' + p.slug + '/')}">${esc(tr(p.name))}</a>`).join('')}
  </div>
</section>

<section class="manifesto">
  <div class="container">
    <span class="eyebrow reveal">${t('manifestoEyebrow')}</span>
    <p class="manifesto-text reveal">${t('manifesto')}</p>
    <div class="partners reveal">
      <span class="partners-title">${t('partnersTitle')}</span>
      <ul>${S.partners[lang].map(([name, what]) => `<li><b>${name}</b><span>${what}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>

<section class="section section-collection">
  <div class="container">
    ${sectionHead(t('homeProductsEyebrow'), t('homeProductsTitle'), t('homeProductsText'))}
    <div class="product-grid">
      ${products.map((p, i) => productCard(ctx, p, i)).join('')}
    </div>
  </div>
</section>

<section class="section section-dark feature-split">
  <div class="container split">
    <div class="split-visual reveal-img">
      ${bio.video ? productVideo(ctx, bio, 'feature-video') : I.render('bioclimatic', { w: 420, d: 340, h: 250, color: '#ece8e1', angle: 60, led: true, side: 'zip', fabric: '#6f6a63', title: tr(bio.name) })}
    </div>
    <div class="split-copy reveal">
      <span class="eyebrow eyebrow-light">${t('homeFeatureEyebrow')}</span>
      <h2>${t('homeFeatureTitle')}</h2>
      <p>${t('homeFeatureText')}</p>
      <ul class="check-list">
        ${bio.features.slice(0, 5).map((f) => `<li>${icon('check')}<span>${esc(tr(f.title))}</span></li>`).join('')}
      </ul>
      <a class="btn btn-light" href="${href('products/' + bio.slug + '/')}">${esc(tr(bio.name))} ${icon('arrow')}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead(t('whyEyebrow'), t('whyTitle'))}
    <div class="pillars">
      ${S.why[lang].map(([h, p], i) => `
      <div class="pillar reveal" style="--d:${i * 80}ms">
        ${icon(['layers', 'ruler', 'app', 'globe'][i])}
        <h3>${h}</h3>
        <p>${p}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section section-sand">
  <div class="container">
    ${sectionHead(t('processEyebrow'), t('processTitle'))}
    <ol class="process">
      ${S.process[lang].map(([h, p], i) => `
      <li class="reveal" style="--d:${i * 80}ms">
        <span class="process-num">0${i + 1}</span>
        <h3>${h}</h3>
        <p>${p}</p>
      </li>`).join('')}
    </ol>
  </div>
</section>

${configBand(ctx)}

<section class="section">
  <div class="container markets">
    <div class="reveal">
      <span class="eyebrow">${t('marketsEyebrow')}</span>
      <h2>${t('marketsTitle')}</h2>
      <p class="lead">${t('marketsText')}</p>
      <a class="btn" href="${href('contact/')}">${t('ctaContact')} ${icon('arrow')}</a>
    </div>
    <ul class="audiences reveal">
      ${S.audiences[lang].map((a) => `<li>${icon('check')}${a}</li>`).join('')}
    </ul>
  </div>
</section>`;

  return {
    title: t('metaHomeTitle'),
    description: t('metaHomeDesc'),
    overHero: true,
    bodyClass: 'page-home',
    head: `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TERSUN',
      slogan: 'Beyond Outdoor Living',
      url: config.siteUrl,
      logo: config.siteUrl + '/assets/img/logo/tersun-logo.svg',
      email: config.company.email,
      telephone: config.company.phone,
      areaServed: ['EU', 'US']
    })}</script>`,
    scripts: bio.photos.length ? [] : ['js/illustrations.js', 'js/home.js'],
    body
  };
}

// ---------------------------------------------------------------------------------------------
function productsIndex(ctx, products) {
  const { t } = ctx;
  return {
    title: t('metaProductsTitle'),
    description: t('productsText'),
    body: `
<section class="page-hero">
  <div class="container">
    <span class="eyebrow">TERSUN</span>
    <h1>${t('productsTitle')}</h1>
    <p class="lead">${t('productsText')}</p>
  </div>
</section>
<section class="section section-tight">
  <div class="container">
    <div class="product-grid">${products.map((p, i) => productCard(ctx, p, i)).join('')}</div>
  </div>
</section>
${configBand(ctx)}`
  };
}

// ---------------------------------------------------------------------------------------------
function optionBlock(ctx, f) {
  const { tr } = ctx;
  if (f.type === 'color') {
    return `<div class="option-block">
      <h3>${esc(tr(f.label))}</h3>
      <ul class="swatches">${f.choices.map((c) => `<li><span class="swatch" style="--c:${c.hex}"${c.value === 'custom' ? ' data-custom' : ''}></span>${esc(tr(c.label))}${c.value.startsWith('RAL') ? ` <small>${c.value}</small>` : ''}</li>`).join('')}</ul>
    </div>`;
  }
  if (f.type === 'choice' || f.type === 'multi') {
    return `<div class="option-block">
      <h3>${esc(tr(f.label))}</h3>
      <ul class="tags">${f.choices.map((c) => `<li>${esc(tr(c.label))}</li>`).join('')}</ul>
    </div>`;
  }
  return '';
}

function productPage(ctx, products, p) {
  const { t, href, tr } = ctx;
  const others = products.filter((o) => o.id !== p.id);
  const hasPhotos = p.photos && p.photos.length;
  const body = `
<section class="product-hero">
  <div class="container product-hero-inner">
    <div class="product-hero-copy">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="${href('products/')}">${t('navProducts')}</a><span>/</span><span>${esc(tr(p.name))}</span></nav>
      <h1>${esc(tr(p.name))}</h1>
      <p class="lead">${esc(tr(p.tagline))}</p>
      <div class="hero-actions">
        <a class="btn" href="${href('configurator/')}?product=${p.id}">${t('configureThis')} ${icon('arrow')}</a>
        <a class="btn btn-ghost" href="${href('contact/')}?product=${p.id}">${t('ctaContact')}</a>
      </div>
    </div>
    <div class="product-hero-visual reveal-img${hasPhotos ? ' has-photo' : ''}">${productVisual(ctx, p, { eager: true })}</div>
  </div>
</section>

<section class="section section-tight">
  <div class="container product-intro">
    ${tr(p.intro).map((para) => `<p class="reveal">${esc(para)}</p>`).join('')}
  </div>
</section>

${p.video ? `
<section class="section section-dark">
  <div class="container split">
    <div class="reveal">${productVideo(ctx, p, 'feature-video')}</div>
    <div class="reveal">
      <span class="eyebrow eyebrow-light">TERSUN</span>
      <h2>${esc(tr(p.name))}</h2>
      <p>${esc(tr(p.tagline))}</p>
      <ul class="check-list">${p.features.map((f) => `<li>${icon('check')}<span>${esc(tr(f.title))}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>` : ''}

<section class="section section-sand">
  <div class="container">
    ${sectionHead('', t('featuresTitle'))}
    <div class="features">
      ${p.features.map((f, i) => `
      <div class="feature reveal" style="--d:${(i % 3) * 80}ms">
        ${icon(f.icon)}
        <h3>${esc(tr(f.title))}</h3>
        <p>${esc(tr(f.text))}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

${hasPhotos && p.photos.length > 1 ? `
<section class="section">
  <div class="container">
    ${sectionHead('', t('galleryTitle'))}
    <div class="gallery">
      ${p.photos.map((ph) => `<a href="${ctx.asset(ph)}" class="gallery-item reveal" data-lightbox><img src="${ctx.asset(ph)}" alt="${esc(tr(p.name))}" loading="lazy" decoding="async"></a>`).join('')}
    </div>
  </div>
</section>` : ''}

<section class="section">
  <div class="container split split-top">
    <div class="reveal">
      <h2>${t('specsTitle')}</h2>
      <dl class="specs">
        ${p.specs.map((s) => `<div><dt>${esc(tr(s.label))}</dt><dd>${esc(tr(s.value))}</dd></div>`).join('')}
      </dl>
      <p class="small muted">${t('specsNote')}</p>
    </div>
    <div class="reveal">
      <h2>${t('optionsTitle')}</h2>
      ${p.config.fields.map((f) => optionBlock(ctx, f)).join('')}
      <a class="btn" href="${href('configurator/')}?product=${p.id}">${t('configureThis')} ${icon('arrow')}</a>
    </div>
  </div>
</section>

<section class="section section-sand">
  <div class="container">
    ${sectionHead('', t('moreProducts'))}
    <div class="product-grid product-grid-small">
      ${others.map((o) => productCard(ctx, o, products.indexOf(o))).join('')}
    </div>
  </div>
</section>`;

  return {
    title: `${tr(p.name)} – TERSUN`,
    description: tr(p.tagline),
    bodyClass: 'page-product',
    scripts: hasPhotos ? ['js/lightbox.js'] : [],
    body
  };
}

// ---------------------------------------------------------------------------------------------
function configurator(ctx, products) {
  const { t, tr, lang } = ctx;
  const data = products.map((p) => ({
    id: p.id, slug: p.slug, illustration: p.illustration, name: tr(p.name), tagline: tr(p.tagline),
    dims: p.config.dims,
    preview: p.config.preview ? Object.assign({}, p.config.preview, { label: tr(p.config.preview.label) }) : null,
    fields: p.config.fields.map((f) => Object.assign({}, f, {
      label: tr(f.label),
      choices: f.choices ? f.choices.map((c) => Object.assign({}, c, { label: tr(c.label) })) : undefined
    }))
  }));
  const strings = {};
  ['cfgSteps', 'cfgNext', 'cfgBack', 'cfgSend', 'dimW', 'dimD', 'dimH', 'cfgCustomRal', 'cfgNone', 'cfgReference',
    'cfgThanksTitle', 'cfgThanksText', 'cfgMailtoText', 'cfgError', 'cfgOutOfRange', 'fName', 'fEmail', 'fPhone',
    'fCountry', 'fCity', 'fCustomerType', 'fMessage', 'navConfigurator', 'cfgSummary', 'cfgCopied', 'cfgChooseProduct', 'cfgIntro']
    .forEach((k) => { strings[k] = S[k][lang]; });
  const consent = S.fConsent[lang].replace('{privacy}', ctx.href('legal/') + '#privacy');

  const body = `
<h1 class="sr-only">${t('cfgTitle')}</h1>
<section class="configurator studio" data-configurator>
  <div class="cfg-layout">
    <div class="cfg-preview">
      <div class="cfg-stage-wrap">
        <div class="cfg-preview-stage" data-cfg-preview></div>
        <div class="studio-title" aria-live="polite">
          <span class="eyebrow eyebrow-light">${t('studioEyebrow')}</span>
          <p class="studio-name" data-cfg-title>${t('cfgChooseProduct')}</p>
          <p class="studio-tagline" data-cfg-tagline>${t('cfgIntro')}</p>
        </div>
        <div class="cfg-toolbar" data-cfg-toolbar role="toolbar" aria-label="3D" hidden>
          ${[['dims', 'ruler', 'cfg3dDims', true], ['props', 'sofa', 'cfg3dProps', true],
            ['rotate', 'rotate', 'cfg3dRotate', true], ['full', 'expand', 'cfg3dFull'], ['save', 'download', 'cfg3dSave']]
            .map(([a, ic, label, pressed]) => `<button type="button" data-3d="${a}" title="${esc(t(label))}" aria-label="${esc(t(label))}"${pressed === undefined ? '' : ` aria-pressed="${pressed}"`}>${icon(ic)}</button>`).join('')}
        </div>
        <div class="studio-bottom" data-cfg-studio-controls hidden>
          <div class="studio-modes" role="radiogroup" aria-label="${esc(t('cfg3dNight'))}">
            ${['studio', 'day', 'night'].map((m, i) => `<button type="button" role="radio" data-3d-mode="${m}" aria-checked="${i === 0}">${S.studioModes[lang][i]}</button>`).join('')}
          </div>
          <div class="studio-views" role="group" aria-label="${esc(t('cfg3dReset'))}">
            ${['corner', 'front', 'side', 'top', 'inside'].map((v, i) => `<button type="button" data-3d-view="${v}"${i === 0 ? ' aria-pressed="true"' : ''}>${S.studioViews[lang][i]}</button>`).join('')}
          </div>
        </div>
        <div class="cfg-preview-controls">
          <div class="cfg-preview-control" data-cfg-preview-control hidden>
            <label><span data-cfg-preview-label></span> <output data-cfg-preview-output></output>
              <input type="range" data-cfg-preview-range></label>
          </div>
          <div class="cfg-preview-control" data-cfg-side-control hidden>
            <label><span>${t('cfgSideOpen')}</span> <output data-cfg-side-output></output>
              <input type="range" min="0" max="100" value="30" data-cfg-side-range></label>
          </div>
        </div>
        <p class="cfg-hint">${icon('rotate')}<span>${t('cfg3dHint')}</span></p>
      </div>
    </div>

    <div class="cfg-panel">
      <ol class="cfg-steps" data-cfg-steps>
        ${S.cfgSteps[lang].map((s, i) => `<li><button type="button" data-step-btn="${i}"><b>${i + 1}</b><span>${s}</span></button></li>`).join('')}
      </ol>

      <form class="cfg-form" data-cfg-form novalidate>
        <fieldset class="cfg-step" data-step="0">
          <legend>${t('cfgChooseProduct')}</legend>
          <div class="cfg-products">
            ${products.map((p) => `
            <label class="cfg-product">
              <input type="radio" name="product" value="${p.id}">
              <span class="cfg-product-visual${p.photos.length ? ' has-photo' : ''}">${p.photos.length
                ? `<img src="${ctx.asset(p.photos[0])}" alt="" loading="lazy" decoding="async">`
                : I.render(p.illustration, { color: CARD_COLOR, title: tr(p.name) })}</span>
              <span class="cfg-product-name">${esc(tr(p.name))}</span>
            </label>`).join('')}
          </div>
        </fieldset>

        <fieldset class="cfg-step" data-step="1" hidden>
          <legend>${t('cfgDimsTitle')}</legend>
          <p class="small muted">${t('cfgDimsHint')}</p>
          <div class="cfg-dims" data-cfg-dims></div>
        </fieldset>

        <fieldset class="cfg-step" data-step="2" hidden>
          <legend>${t('cfgDesignTitle')}</legend>
          <div data-cfg-design></div>
        </fieldset>

        <fieldset class="cfg-step" data-step="3" hidden>
          <legend>${t('cfgOptionsTitle')}</legend>
          <div data-cfg-options></div>
        </fieldset>

        <fieldset class="cfg-step" data-step="4" hidden>
          <legend>${t('cfgRequestTitle')}</legend>
          <div class="cfg-summary" data-cfg-summary></div>
          <button type="button" class="link-arrow cfg-share" data-cfg-share>${icon('link')}<span>${t('cfgShare')}</span></button>
          <div class="form-grid">
            <label class="field"><span>${t('fName')} *</span><input name="name" autocomplete="name" required></label>
            <label class="field"><span>${t('fEmail')} *</span><input name="email" type="email" autocomplete="email" required></label>
            <label class="field"><span>${t('fPhone')}</span><input name="phone" type="tel" autocomplete="tel"></label>
            <label class="field"><span>${t('fCountry')} *</span><input name="country" autocomplete="country-name" required></label>
            <label class="field"><span>${t('fCity')}</span><input name="city" autocomplete="address-level2"></label>
            <label class="field"><span>${t('fCustomerType')}</span><select name="customerType">${S.customerTypes[lang].map((c) => `<option>${c}</option>`).join('')}</select></label>
            <label class="field field-wide"><span>${t('fMessage')}</span><textarea name="message" rows="4" placeholder="${esc(t('fMessagePh'))}"></textarea></label>
            <label class="check field-wide"><input type="checkbox" name="consent" required><span>${consent}</span></label>
            <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          </div>
        </fieldset>

        <div class="cfg-nav">
          <button type="button" class="btn btn-ghost" data-cfg-back>${t('cfgBack')}</button>
          <button type="button" class="btn" data-cfg-next>${t('cfgNext')} ${icon('arrow')}</button>
          <button type="submit" class="btn" data-cfg-submit hidden>${t('cfgSend')} ${icon('arrow')}</button>
        </div>
        <p class="form-status" data-cfg-status role="status" aria-live="polite"></p>
      </form>

      <div class="cfg-done" data-cfg-done hidden>
        ${icon('check', 'icon-xl')}
        <h2>${t('cfgThanksTitle')}</h2>
        <p data-cfg-done-text></p>
        <div class="hero-actions">
          <button type="button" class="btn btn-ghost" data-cfg-share>${icon('link')}<span>${t('cfgShare')}</span></button>
          <button type="button" class="btn btn-ghost" data-cfg-print>${t('cfgPrint')}</button>
          <button type="button" class="btn" data-cfg-restart>${t('cfgRestart')}</button>
        </div>
      </div>
    </div>
  </div>
  <script type="application/json" data-cfg-data>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</section>`;

  return {
    title: t('metaConfigTitle'),
    description: t('metaConfigDesc'),
    bodyClass: 'page-configurator theme-dark',
    darkHeader: true,
    clientStrings: strings,
    scripts: ['js/illustrations.js', 'js/configurator.js', { src: 'js/builder-mount.js', module: true }],
    body
  };
}

// ---------------------------------------------------------------------------------------------
function about(ctx, products) {
  const { t, lang } = ctx;
  return {
    title: t('metaAboutTitle'),
    description: t('aboutLead'),
    body: `
<section class="page-hero">
  <div class="container">
    <span class="eyebrow">Beyond Outdoor Living</span>
    <h1>${t('aboutTitle')}</h1>
    <p class="lead">${t('aboutLead')}</p>
  </div>
</section>
<section class="section section-tight">
  <div class="container split split-top">
    <div class="about-text reveal">${S.aboutText[lang].map((p) => `<p>${p}</p>`).join('')}</div>
    <div class="about-visual reveal">${I.render('glassroof', { color: CARD_COLOR, led: true, title: 'TERSUN' })}</div>
  </div>
</section>
<section class="section section-sand">
  <div class="container">
    ${sectionHead('', t('valuesTitle'))}
    <div class="pillars pillars-3">
      ${S.values[lang].map(([h, p], i) => `<div class="pillar reveal" style="--d:${i * 80}ms"><span class="process-num">0${i + 1}</span><h3>${h}</h3><p>${p}</p></div>`).join('')}
    </div>
  </div>
</section>
${configBand(ctx)}`
  };
}

// ---------------------------------------------------------------------------------------------
function contact(ctx, products) {
  const { t, tr, lang } = ctx;
  const c = config.company;
  const consent = S.fConsent[lang].replace('{privacy}', ctx.href('legal/') + '#privacy');
  return {
    title: t('metaContactTitle'),
    description: t('contactText'),
    clientStrings: { fThanks: S.fThanks[lang], cfgError: S.cfgError[lang], cfgMailtoText: S.cfgMailtoText[lang] },
    body: `
<section class="page-hero">
  <div class="container">
    <span class="eyebrow">${t('navContact')}</span>
    <h1>${t('contactTitle')}</h1>
    <p class="lead">${t('contactText')}</p>
  </div>
</section>
<section class="section section-tight">
  <div class="container split split-top">
    <form class="contact-form reveal" data-contact-form novalidate>
      <div class="form-grid">
        <label class="field"><span>${t('fName')} *</span><input name="name" autocomplete="name" required></label>
        <label class="field"><span>${t('fEmail')} *</span><input name="email" type="email" autocomplete="email" required></label>
        <label class="field"><span>${t('fPhone')}</span><input name="phone" type="tel" autocomplete="tel"></label>
        <label class="field"><span>${t('fCountry')}</span><input name="country" autocomplete="country-name"></label>
        <label class="field"><span>${t('navProducts')}</span><select name="product"><option value="">–</option>${products.map((p) => `<option value="${p.id}">${esc(tr(p.name))}</option>`).join('')}</select></label>
        <label class="field"><span>${t('fCustomerType')}</span><select name="customerType">${S.customerTypes[lang].map((x) => `<option>${x}</option>`).join('')}</select></label>
        <label class="field field-wide"><span>${t('fMessage')} *</span><textarea name="message" rows="6" required placeholder="${esc(t('fMessagePh'))}"></textarea></label>
        <label class="check field-wide"><input type="checkbox" name="consent" required><span>${consent}</span></label>
        <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      </div>
      <button class="btn" type="submit">${t('fSend')} ${icon('arrow')}</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
    <aside class="contact-aside reveal">
      <h2>${t('contactDirect')}</h2>
      <ul class="contact-list">
        <li>${icon('mail')}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
        <li>${icon('phone')}<a href="tel:${esc(c.phone.replace(/\s+/g, ''))}">${esc(c.phone)}</a></li>
        <li>${icon('pin')}<span>${esc(c.address)}</span></li>
      </ul>
      <div class="partner-box">
        <h3>${t('contactPartner')}</h3>
        <p>${t('contactPartnerText')}</p>
      </div>
    </aside>
  </div>
</section>`
  };
}

// ---------------------------------------------------------------------------------------------
const LEGAL = {
  en: {
    imprint: `<p><strong>TERSUN</strong><br>[Legal company name and legal form]<br>[Street, number]<br>[ZIP, city, country]</p>
<p>E-mail: ${config.company.email}<br>Phone: ${config.company.phone}</p>
<p>Represented by: [Managing director]<br>Business registration no.: [Number]<br>VAT ID: [Number]</p>`,
    privacy: `<p>We process personal data that you submit through the contact form or the configurator (name, contact details, project information) solely to handle your request and to prepare a quote (Art. 6(1)(b) GDPR). Data is not passed on to third parties except to service providers that help us process your request (e.g. form or e-mail providers) and, where relevant, to an authorised TERSUN partner in your region.</p>
<p>This website does not use tracking cookies. Fonts are hosted locally; no data is sent to external font services.</p>
<p>You have the right to access, rectification, erasure, restriction of processing, data portability and objection, and the right to lodge a complaint with a supervisory authority. Contact: ${config.company.email}.</p>
<p><em>[To be completed and reviewed by a legal adviser before publication.]</em></p>`
  },
  de: {
    imprint: `<p><strong>TERSUN</strong><br>[Firmenname und Rechtsform]<br>[Straße, Hausnummer]<br>[PLZ, Ort, Land]</p>
<p>E-Mail: ${config.company.email}<br>Telefon: ${config.company.phone}</p>
<p>Vertreten durch: [Geschäftsführer/in]<br>Registernummer: [Nummer]<br>USt-IdNr.: [Nummer]</p>`,
    privacy: `<p>Wir verarbeiten personenbezogene Daten, die Sie über das Kontaktformular oder den Konfigurator übermitteln (Name, Kontaktdaten, Projektangaben), ausschließlich zur Bearbeitung Ihrer Anfrage und zur Erstellung eines Angebots (Art. 6 Abs. 1 lit. b DSGVO). Eine Weitergabe an Dritte erfolgt nur an Dienstleister, die uns bei der Bearbeitung unterstützen (z. B. Formular- oder E-Mail-Anbieter), sowie gegebenenfalls an einen autorisierten TERSUN-Partner in Ihrer Region.</p>
<p>Diese Website verwendet keine Tracking-Cookies. Schriften werden lokal bereitgestellt; es werden keine Daten an externe Schriftdienste übertragen.</p>
<p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht auf Beschwerde bei einer Aufsichtsbehörde. Kontakt: ${config.company.email}.</p>
<p><em>[Vor Veröffentlichung zu vervollständigen und rechtlich zu prüfen.]</em></p>`
  },
  sq: {
    imprint: `<p><strong>TERSUN</strong><br>[Emri ligjor i kompanisë dhe forma ligjore]<br>[Rruga, numri]<br>[Kodi postar, qyteti, shteti]</p>
<p>E-mail: ${config.company.email}<br>Telefoni: ${config.company.phone}</p>
<p>Përfaqësuar nga: [Drejtori]<br>Numri i regjistrimit të biznesit: [Numri]<br>Numri fiskal / TVSH: [Numri]</p>`,
    privacy: `<p>Të dhënat personale që na dërgoni përmes formularit të kontaktit ose konfiguruesit (emri, të dhënat e kontaktit, informacioni për projektin) i përpunojmë vetëm për trajtimin e kërkesës suaj dhe përgatitjen e ofertës (neni 6(1)(b) GDPR). Të dhënat nuk u jepen palëve të treta, përveç ofruesve të shërbimeve që na ndihmojnë në trajtimin e kërkesës (p.sh. ofruesit e formularëve ose e-mailit) dhe, kur është e nevojshme, një partneri të autorizuar TERSUN në rajonin tuaj.</p>
<p>Kjo faqe nuk përdor cookies për ndjekje. Fontet ruhen lokalisht; asnjë e dhënë nuk dërgohet te shërbime të jashtme fontesh.</p>
<p>Keni të drejtë për qasje, korrigjim, fshirje, kufizim të përpunimit, bartje të të dhënave dhe kundërshtim, si dhe të drejtën të paraqisni ankesë te autoriteti mbikëqyrës. Kontakti: ${config.company.email}.</p>
<p><em>[Të plotësohet dhe të rishikohet nga një këshilltar ligjor para publikimit.]</em></p>`
  }
};

function legal(ctx) {
  const { t, lang } = ctx;
  return {
    title: t('metaLegalTitle'),
    description: t('legalTitle'),
    head: '<meta name="robots" content="noindex">',
    body: `
<section class="page-hero page-hero-compact">
  <div class="container"><h1>${t('legalTitle')}</h1></div>
</section>
<section class="section section-tight">
  <div class="container prose">
    <h2 id="imprint">${t('legalImprint')}</h2>
    ${LEGAL[lang].imprint}
    <h2 id="privacy">${t('legalPrivacy')}</h2>
    ${LEGAL[lang].privacy}
  </div>
</section>`
  };
}

function notFound(ctx) {
  const { t, href } = ctx;
  return {
    title: t('notFoundTitle') + ' – TERSUN',
    head: '<meta name="robots" content="noindex">',
    body: `
<section class="page-hero">
  <div class="container">
    <span class="eyebrow">404</span>
    <h1>${t('notFoundTitle')}</h1>
    <p class="lead">${t('notFoundText')}</p>
    <a class="btn" href="${href('')}">${t('navHome')} ${icon('arrow')}</a>
  </div>
</section>`
  };
}

module.exports = { home, productsIndex, productPage, configurator, about, contact, legal, notFound };
