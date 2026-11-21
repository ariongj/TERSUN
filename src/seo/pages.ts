// Technical SEO, generated at build time (see vite.config.ts → seoFiles): every public address gets its own HTML
// file with a unique title, description, canonical URL, link-preview tags and structured data (JSON-LD), so that it
// answers 200 with the right head before any JavaScript runs. Also the sitemap and robots.txt.
//
// The data is the site's seed data (the demo has no server: CMS edits live in the editor's browser). Texts are in
// Albanian — the language a first-time visitor and a search engine get (one address serves all three languages).
import { createSeed } from '@/data/seed';
import { offerState } from '@/lib/offers';
import { collectionProducts } from '@/lib/collections';
import { isPublic } from '@/lib/crm';
import type { L10n, Product } from '@/lib/types';

export interface SeoPage {
  /** App path without the base: '/', '/shop', '/product/x' */
  path: string;
  title: string;
  description: string;
  /** Absolute image URL for link previews */
  image: string;
  type: 'website' | 'product' | 'article';
  /** Kept out of search results (and the sitemap), links still followed */
  noindex?: boolean;
  jsonld: Record<string, unknown>[];
  lastmod?: string;
  priority?: number;
}

const sq = (v: L10n | null | undefined) => (v?.sq || v?.en || v?.de || '').trim();
/** Plain text from the site's light markdown (*accent*, **bold**, [links](url), ## headings). */
const plain = (s: string) =>
  s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/[*_>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
/** A description of at most ~155 characters, cut at a word. */
function clip(s: string, max = 155) {
  const t = plain(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\-–—]+$/, '') + '…';
}
const day = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : undefined);

export function seoPages(site: { origin: string; base: string; now?: Date }): SeoPage[] {
  const now = site.now ?? new Date();
  const db = createSeed(now);
  const brand = db.settings.companyName || 'TERSUN';
  /** Absolute URL of an app path or an image path ('/images/…' already carries the base after the build's rewrite). */
  const abs = (p: string) => {
    if (/^https?:\/\//.test(p)) return p;
    const path = p.startsWith(site.base) ? p : site.base + p.replace(/^\/+/, '');
    return site.origin + path;
  };
  const url = (path: string) => abs(path === '/' ? '/' : path);
  const title = (t: string) => `${t} — ${brand}`;
  const ogDefault = abs('/images/og.jpg');

  const org = { '@type': 'Organization', '@id': url('/') + '#organization', name: brand, url: url('/'), logo: abs('/favicon.svg') };
  const crumbs = (items: [string, string][]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [['Ballina', '/'] as [string, string], ...items].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url(path) })),
  });

  const pages: SeoPage[] = [];
  const add = (p: SeoPage) => pages.push(p);

  /* ---------------- home ---------------- */
  add({
    path: '/',
    title: db.settings.seo.title || `${brand} — Beyond Outdoor Living`,
    description:
      'Pergola bioklimatike, mbulesa xhami, tenda mbi xham, xhama Guillotine e Slide dhe perde Zip. Projektoni tarracën tuaj në 3D — konsultë falas në vend.',
    image: ogDefault,
    type: 'website',
    priority: 1,
    jsonld: [
      { '@context': 'https://schema.org', ...org },
      { '@context': 'https://schema.org', '@type': 'WebSite', '@id': url('/') + '#website', name: brand, url: url('/'), inLanguage: 'sq', publisher: { '@id': org['@id'] } },
    ],
  });

  /* ---------------- fixed pages (titles as the pages set them) ---------------- */
  const fixed: [string, string, string, number][] = [
    ['/shop', 'Të gjitha produktet', 'Sistemet TERSUN dhe aksesorët: pergola bioklimatike, mbulesa xhami, perde Zip, Guillotine, Slide dhe ndriçim LED — me çmime orientuese.', 0.9],
    ['/3d', 'Sistemi Bioklimatik · 3D Builder', 'Projektoni pergolën, mbulesën e xhamit ose perden Zip në 3D: masat, ngjyrat dhe opsionet, me çmim orientues dhe kërkesë oferte me një klik.', 0.9],
    ['/services', 'Shërbimet', 'Konsultë falas në vend, matje, projektim 3D, montim dhe mirëmbajtje për pergola, mbulesa xhami dhe perde Zip — gjithçka nga një ekip.', 0.8],
    ['/projects', 'Realizimet', 'Tarraca që i kemi transformuar: pergola bioklimatike, mbulesa xhami dhe kopshte dimërore në Kosovë, Shqipëri dhe Evropë.', 0.7],
    ['/about', 'Rreth nesh', 'TERSUN projekton dhe monton sisteme premium për tarraca — pergola bioklimatike, xham dhe perde Zip — me materiale evropiane dhe garanci.', 0.6],
    ['/contact', 'Kontakt', 'Na kontaktoni për konsultë falas në vend, ofertë apo vizitë në showroom. Ju tregojmë zgjidhjen e duhur për tarracën tuaj.', 0.6],
    ['/journal', 'Këshilla', 'Këshilla për tarracën tuaj: si të zgjidhni pergolën, xhamin dhe perden e duhur, mirëmbajtja dhe përdorimi gjatë gjithë vitit.', 0.6],
  ];
  for (const [path, t, d, priority] of fixed) add({ path, title: title(t), description: d, image: ogDefault, type: 'website', priority, jsonld: [crumbs([[t, path]])] });

  /* pages that only make sense for one visitor: reachable, never in search results */
  for (const [path, t] of [['/cart', 'Shporta'], ['/checkout', 'Pagesa'], ['/wishlist', 'Të preferuarat'], ['/search', 'Kërkimi']] as const)
    add({ path, title: title(t), description: 'TERSUN — Beyond Outdoor Living.', image: ogDefault, type: 'website', noindex: true, jsonld: [] });

  /* ---------------- shop: categories and products ---------------- */
  const products = db.products.filter(isPublic);
  const catOf = (p: Product) => db.categories.find((c) => c.id === p.categoryId);
  for (const c of db.categories) {
    if (!products.some((p) => p.categoryId === c.id)) continue;
    const name = sq(c.name);
    add({
      path: `/shop/${c.slug}`,
      title: title(`${name} · të gjitha modelet`),
      description: clip(sq(c.description) || sq(c.tagline)),
      image: abs(c.image || '/images/og.jpg'),
      type: 'website',
      priority: 0.8,
      jsonld: [crumbs([['Të gjitha produktet', '/shop'], [name, `/shop/${c.slug}`]])],
    });
  }
  for (const p of products) {
    const name = sq(p.name);
    const cat = catOf(p);
    const price = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
    const tracked = p.stock < 999;
    const available = tracked ? p.stock - (p.unavailable ?? 0) : 0;
    add({
      path: `/product/${p.slug}`,
      title: title(name),
      // the one-line summary alone is too short for a search snippet: summary + description, cut at ~155 characters
      description: clip(p.seo?.description?.trim() || [sq(p.short), sq(p.description)].filter(Boolean).map((x) => x.replace(/[.\s]+$/, '')).join('. ')),
      image: abs(p.images[0] || '/images/og.jpg'),
      type: 'product',
      priority: p.quoteOnly ? 0.8 : 0.7,
      lastmod: day(p.updatedAt ?? p.createdAt),
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name,
          description: plain(sq(p.short) || sq(p.description)),
          image: p.images.slice(0, 4).map(abs),
          ...(p.sku ? { sku: p.sku } : {}),
          brand: { '@type': 'Brand', name: brand },
          ...(cat ? { category: sq(cat.name) } : {}),
          offers: p.quoteOnly
            ? // made to measure: the page shows a "from" price — an AggregateOffer with that lowest price
              { '@type': 'AggregateOffer', lowPrice: price, priceCurrency: 'EUR', offerCount: 1, url: url(`/product/${p.slug}`) }
            : {
                '@type': 'Offer',
                price,
                priceCurrency: 'EUR',
                url: url(`/product/${p.slug}`),
                availability: !tracked || available > 0 ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder',
                itemCondition: 'https://schema.org/NewCondition',
              },
        },
        crumbs([...(cat ? [[sq(cat.name), `/shop/${cat.slug}`] as [string, string]] : [['Të gjitha produktet', '/shop'] as [string, string]]), [name, `/product/${p.slug}`]]),
      ],
    });
  }

  /* ---------------- collections and live offers ---------------- */
  for (const c of db.collections) {
    if (!c.published || !collectionProducts(c, products, { publicOnly: true }).length) continue;
    const t = sq(c.title);
    add({
      path: `/collection/${c.slug}`,
      title: title(t),
      description: clip(c.seo?.description?.trim() || sq(c.description)),
      image: abs(c.image || '/images/og.jpg'),
      type: 'website',
      priority: 0.6,
      jsonld: [crumbs([['Të gjitha produktet', '/shop'], [t, `/collection/${c.slug}`]])],
    });
  }
  for (const o of db.offers) {
    if (offerState(o, now) !== 'active') continue;
    const t = sq(o.name);
    add({
      path: `/offer/${o.slug}`,
      title: title(t),
      description: clip(sq(o.landing.text) || sq(o.description)),
      image: abs(o.image || '/images/og.jpg'),
      type: 'website',
      priority: 0.5,
      jsonld: [crumbs([[t, `/offer/${o.slug}`]])],
    });
  }

  /* ---------------- journal and information pages ---------------- */
  for (const p of db.posts) {
    if (!p.published || new Date(p.publishedAt) > now || (p as { hidden?: boolean }).hidden) continue;
    const t = sq(p.title);
    add({
      path: `/journal/${p.slug}`,
      title: title(t),
      description: clip(sq(p.excerpt) || sq(p.body)),
      image: abs(p.cover || '/images/og.jpg'),
      type: 'article',
      priority: 0.6,
      lastmod: day(p.publishedAt),
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: plain(t),
          description: plain(sq(p.excerpt)),
          image: [abs(p.cover || '/images/og.jpg')],
          datePublished: p.publishedAt,
          author: { '@type': 'Person', name: p.author || brand },
          publisher: { '@id': org['@id'] },
          mainEntityOfPage: url(`/journal/${p.slug}`),
          inLanguage: 'sq',
        },
        crumbs([['Këshilla', '/journal'], [plain(t), `/journal/${p.slug}`]]),
      ],
    });
  }
  for (const p of db.pages) {
    if (!p.published || (p as { hidden?: boolean }).hidden) continue;
    const t = sq(p.title);
    add({
      path: `/page/${p.slug}`,
      title: title(t),
      description: clip(sq(p.body)),
      image: ogDefault,
      type: 'website',
      priority: 0.3,
      lastmod: day(p.updatedAt),
      jsonld: [crumbs([[t, `/page/${p.slug}`]])],
    });
  }
  return pages;
}

/* ------------------------------------------------------------------ */
/* Files                                                               */
/* ------------------------------------------------------------------ */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The app shell with this page's head: title, description, canonical, robots, link previews, JSON-LD. */
export function pageHtml(shell: string, page: SeoPage, canonical: string) {
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    page.noindex ? `<meta name="robots" content="noindex, follow" />` : `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:type" content="${page.type === 'article' ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="TERSUN" />`,
    `<meta property="og:locale" content="sq_AL" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:image" content="${esc(page.image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${esc(page.image)}" />`,
    ...page.jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ');
  // replace the shell's generic head block (between the SEO markers in index.html)
  const out = shell.replace(/<!-- seo:start[\s\S]*?<!-- seo:end -->/, `<!-- seo -->\n    ${head}`);
  if (out === shell) throw new Error('seo: the head markers are missing from index.html');
  return out;
}

/** The file that GitHub Pages (and any static host) serves for an app path: /shop → shop.html. */
export const fileFor = (path: string) => (path === '/' ? 'index.html' : `${path.replace(/^\/+/, '')}.html`);

export function sitemapXml(pages: SeoPage[], loc: (p: SeoPage) => string) {
  const rows = pages
    .filter((p) => !p.noindex)
    .map((p) => `  <url>\n    <loc>${esc(loc(p))}</loc>${p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : ''}${p.priority != null ? `\n    <priority>${p.priority.toFixed(1)}</priority>` : ''}\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
}

export function robotsTxt(sitemapUrl: string) {
  // Everything public may be crawled (CSS/JS included). The CMS answers 404 and carries noindex; robots.txt is not
  // used to hide pages.
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
}
