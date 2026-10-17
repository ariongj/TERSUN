#!/usr/bin/env node
/*
 * Builds the static TERSUN site into ./dist
 *
 *   node build.js            production build (clean URLs: /en/products/)
 *   node build.js --preview  links point at index.html files, for opening from disk
 */
const fs = require('fs');
const path = require('path');
const config = require('./src/config');
const products = require('./src/data/products');
const pages = require('./src/templates/pages');
const { layout, createContext } = require('./src/templates/layout');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'dist');
const preview = process.argv.includes('--preview');
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

function write(file, content) {
  const target = path.join(OUT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const a = path.join(from, entry.name), b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

// Attach photos found in src/assets/img/products/<slug>/
for (const p of products) {
  const dir = path.join(SRC, 'assets/img/products', p.slug);
  p.photos = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f)).sort().map((f) => `img/products/${p.slug}/${f}`)
    : [];
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(path.join(SRC, 'assets'), path.join(OUT, 'assets'));

const routes = [
  ['', pages.home],
  ['products/', pages.productsIndex],
  ...products.map((p) => ['products/' + p.slug + '/', (ctx, all) => pages.productPage(ctx, all, p)]),
  ['configurator/', pages.configurator],
  ['about/', pages.about],
  ['contact/', pages.contact],
  ['legal/', pages.legal]
];

let count = 0;
for (const lang of config.languages) {
  for (const [route, render] of routes) {
    const ctx = createContext(lang, route, { preview });
    write(path.join(lang, route, 'index.html'), layout(ctx, products, render(ctx, products)));
    count++;
  }
}

// 404 in the default language with root-absolute links
{
  const ctx = createContext(config.defaultLanguage, '', { absolute: true });
  write('404.html', layout(ctx, products, pages.notFound(ctx)));
}

// Root: send visitors to their browser language
const langList = JSON.stringify(config.languages);
const def = config.defaultLanguage;
const suffix = preview ? 'index.html' : '';
write('index.html', `<!doctype html>
<html lang="${def}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TERSUN – Beyond Outdoor Living</title>
  <link rel="icon" href="assets/img/logo/favicon.svg" type="image/svg+xml">
  ${config.languages.map((l) => `<link rel="alternate" hreflang="${l}" href="${config.siteUrl}/${l}/">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${config.siteUrl}/">
  <script>
    (function () {
      var langs = ${langList}, pick = '${def}';
      var prefs = navigator.languages || [navigator.language || ''];
      for (var i = 0; i < prefs.length; i++) {
        var l = String(prefs[i]).slice(0, 2).toLowerCase();
        if (langs.indexOf(l) > -1) { pick = l; break; }
      }
      location.replace(pick + '/${suffix}' + location.search);
    })();
  </script>
  <noscript><meta http-equiv="refresh" content="0; url=${def}/${suffix}"></noscript>
  <style>body{font-family:system-ui,sans-serif;background:#f6f3ee;color:#1b1918;display:grid;place-items:center;min-height:100vh;margin:0}a{color:inherit;margin:0 .6em}</style>
</head>
<body>
  <p>${config.languages.map((l) => `<a href="${l}/${suffix}">${l.toUpperCase()}</a>`).join(' ')}</p>
</body>
</html>
`);

// sitemap & robots
const urls = [];
for (const [route] of routes) {
  if (route === 'legal/') continue;
  for (const lang of config.languages) {
    const alts = config.languages.map((l) =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${config.siteUrl}/${l}/${route}"/>`).join('\n');
    urls.push(`  <url>\n    <loc>${config.siteUrl}/${lang}/${route}</loc>\n${alts}\n  </url>`);
  }
}
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

console.log(`Built ${count} pages in ${config.languages.length} languages → ${path.relative(process.cwd(), OUT) || OUT}${preview ? ' (preview links)' : ''}`);
