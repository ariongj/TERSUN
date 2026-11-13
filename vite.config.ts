import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
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
 * Static hosts know nothing of the app's routes. GitHub Pages answers an unknown address with 404.html, so
 * that file is the app shell and every deep link opens. The main pages also get their own copy
 * (`/3d` is served from `3d.html`), so they answer with a proper 200 and shared links get a preview.
 * Only pages without sub-pages: a copy must never sit next to a folder of the same name.
 */
function appShell(pages: string[]): Plugin {
  let out = '';
  return {
    name: 'tersun-app-shell',
    apply: 'build',
    configResolved(config) {
      out = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const shell = resolve(out, 'index.html');
      if (!existsSync(shell)) return;
      for (const name of ['404', ...pages]) copyFileSync(shell, resolve(out, `${name}.html`));
    },
  };
}

export default defineConfig({
  base,
  plugins: [baseImages(base), siteOrigin(), react(), tailwindcss(), appShell(['3d', 'services', 'projects', 'about', 'contact', 'cart', 'checkout', 'search', 'wishlist'])],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  build: { chunkSizeWarningLimit: 1500 },
});
