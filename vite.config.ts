import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

/**
 * Deployment base. Root deployments (Vercel, Netlify, dev server) use "/"; the GitHub Pages workflow builds
 * with BASE_PATH=/TERSUN/. Always normalised to "/x/".
 */
function basePath(): string {
  const raw = (process.env.BASE_PATH ?? '/').trim();
  if (!raw || raw === '/') return '/';
  return `/${raw.replace(/^\/+|\/+$/g, '')}/`;
}
const base = basePath();

/**
 * Seeded data and JSX reference bundled pictures as absolute "/images/…" strings. Under a sub-path those
 * would 404, so at build time every string literal in src/**\/*.ts(x) that starts with "/images/" is
 * prefixed with the base ('/images/a.webp' → '/TERSUN/images/a.webp'). Checks like
 * `src.startsWith('/images/')` are rewritten the same way, so they keep matching. No-op for base "/".
 */
function baseImages(prefix: string): Plugin {
  const SRC = /[\\/]src[\\/].*\.tsx?$/;
  const LITERAL = /(['"`])\/images\//g;
  return {
    name: 'tersun-base-images',
    enforce: 'pre',
    transform(code, id) {
      if (prefix === '/' || !SRC.test(id.split('?')[0]) || !code.includes('/images/')) return null;
      return { code: code.replace(LITERAL, `$1${prefix}images/`), map: null };
    },
  };
}

/**
 * Where the site is published, without a trailing slash: link previews need absolute URLs. Set SITE_ORIGIN
 * when the site moves to its own domain.
 */
const SITE_ORIGIN = (process.env.SITE_ORIGIN ?? 'https://ariongj.github.io').replace(/\/+$/, '');

function siteOrigin(): Plugin {
  return { name: 'tersun-site-origin', transformIndexHtml: (html) => html.replaceAll('%SITE_ORIGIN%', SITE_ORIGIN) };
}

/**
 * Technical SEO files (src/seo/pages.ts): every public page gets its own HTML file — the app shell with that page's
 * title, description, canonical URL, link-preview tags and JSON-LD — so it answers 200 before any JavaScript runs.
 * GitHub Pages serves /shop from shop.html even next to a shop/ folder (checked on the live site). 404.html stays the
 * app shell for every other address (CMS, orders) and carries noindex. Plus sitemap.xml and robots.txt.
 */
function seoFiles(): Plugin {
  let out = '';
  let root = '';
  return {
    name: 'tersun-seo-files',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      out = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const shellFile = resolve(out, 'index.html');
      if (!existsSync(shellFile)) return;
      const shell = readFileSync(shellFile, 'utf8');
      // load the site's data the way the app does (aliases, base-prefixed image paths), outside the browser
      const { createServer } = await import('vite');
      const server = await createServer({
        configFile: false,
        root,
        base,
        logLevel: 'error',
        appType: 'custom',
        server: { middlewareMode: true, hmr: false, ws: false },
        resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
        plugins: [baseImages(base)],
        optimizeDeps: { noDiscovery: true, include: [] },
      });
      try {
        const seo = (await server.ssrLoadModule('/src/seo/pages.ts')) as typeof import('./src/seo/pages');
        const pages = seo.seoPages({ origin: SITE_ORIGIN, base });
        const loc = (path: string) => SITE_ORIGIN + (path === '/' ? base : base + path.replace(/^\/+/, ''));
        for (const page of pages) {
          const file = resolve(out, seo.fileFor(page.path));
          mkdirSync(dirname(file), { recursive: true });
          writeFileSync(file, seo.pageHtml(shell, page, loc(page.path)));
        }
        // any other address: the app shell, never indexed
        writeFileSync(
          resolve(out, '404.html'),
          seo.pageHtml(shell, { path: '/404', title: 'Faqja nuk u gjet — TERSUN', description: 'TERSUN — Beyond Outdoor Living.', image: SITE_ORIGIN + base + 'images/og.jpg', type: 'website', noindex: true, jsonld: [] }, ''),
        );
        // The CMS demo is linked from every page: give its entry a real 200 answer, kept out of the index.
        writeFileSync(
          resolve(out, 'admin.html'),
          seo.pageHtml(shell, { path: '/admin', title: 'Admin — TERSUN', description: 'TERSUN CMS.', image: SITE_ORIGIN + base + 'images/og.jpg', type: 'website', noindex: true, jsonld: [] }, ''),
        );
        writeFileSync(resolve(out, 'sitemap.xml'), seo.sitemapXml(pages, (p) => loc(p.path)));
        writeFileSync(resolve(out, 'robots.txt'), seo.robotsTxt(SITE_ORIGIN + base + 'sitemap.xml'));
        console.log(`seo: ${pages.length} pages (${pages.filter((p) => !p.noindex).length} in the sitemap), 404.html, sitemap.xml, robots.txt`);
      } finally {
        await server.close();
      }
    },
  };
}

/**
 * Intrinsic size of every picture under public/images, so <img> elements can declare width/height (the browser
 * reserves their space before they load). `import sizes from 'virtual:image-sizes'` → { 'images/p/x.webp': [w, h] }.
 */
function imageSizes(): Plugin {
  const ID = 'virtual:image-sizes';
  return {
    name: 'tersun-image-sizes',
    resolveId: (id) => (id === ID ? '\0' + ID : null),
    load(id) {
      if (id !== '\0' + ID) return null;
      const dir = fileURLToPath(new URL('./public/images', import.meta.url));
      const map: Record<string, [number, number]> = {};
      const walk = (d: string) => {
        for (const name of readdirSync(d)) {
          const p = resolve(d, name);
          if (statSync(p).isDirectory()) walk(p);
          else {
            const size = imageSize(readFileSync(p));
            if (size) map['images/' + relative(dir, p).split(sep).join('/')] = size;
          }
        }
      };
      if (existsSync(dir)) walk(dir);
      return `export default ${JSON.stringify(map)};`;
    },
  };
}

/** Width and height from a WebP, JPEG or PNG header. */
function imageSize(b: Buffer): [number, number] | null {
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
    }
    if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  }
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + len;
    }
  }
  return null;
}

export default defineConfig({
  base,
  plugins: [baseImages(base), siteOrigin(), react(), tailwindcss(), imageSizes(), seoFiles()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  build: { chunkSizeWarningLimit: 1500 },
});
