# TERSUN — Beyond Outdoor Living

Website for **TERSUN**, a premium outdoor-living brand for the EU and US markets.
It is available in three languages (English, German and Albanian), presents six products and includes a configurator for quote requests.

| Product | EN | DE | SQ |
|---|---|---|---|
| Bioclimatic System | Bioclimatic System | Bioklimatisches System | Sistemi Bioklimatik |
| Glass Roof | Glass Roof | Glasdach | Mbulojë Xhami |
| Over-Glass Awning | Over-Glass Awning | Aufdachmarkise | Tendë mbi Xham |
| Guillotine Premium | Guillotine Premium | Guillotine Premium | Guillotine Premium |
| Slide Premium | Slide Premium | Slide Premium | Slide Premium |
| ZIP Screen | ZIP Screen | ZIP-Screen | Sistemi i Perdes Zip |

## What's inside

- **Static site, no dependencies.** A small Node script (`build.js`) renders every page to plain HTML in `dist/`, so the site can be hosted anywhere (Netlify, Vercel, GitHub Pages, Cloudflare Pages, any web server).
- **Multilingual SEO.** Each language has its own URL (`/en/`, `/de/`, `/sq/`), with `hreflang` alternates, canonical URLs, a sitemap, Open Graph tags and JSON-LD. The root URL redirects visitors to their browser language.
- **Product pages** with photos and a gallery, a video for the bioclimatic system, highlights, technical details and colours/options. The content comes from the LONI tenda / TERSUN catalogue 2026.
- **Configurator** (similar to warema.com): product → dimensions → design → options → request. A live parametric drawing follows the chosen dimensions, colour, layout and options, and its slider opens the louvres or panels. The visitor gets a summary with a reference number and can print it or save it as a PDF. A draft is kept in the browser.
- **GDPR friendly.** Fonts (Jost, OFL) are hosted locally, there are no tracking cookies and no third-party requests.

## Commands

```bash
npm run build     # build into dist/ with clean URLs (/en/products/)
npm run preview   # build with links to index.html, so dist/ can be opened directly from disk
npm run serve     # build and serve on http://localhost:8080
```

Node 18 or newer is required. There is nothing to install.

## Before going live (checklist)

1. **Contact details:** set `src/config.js` → `company.email`, `phone`, `address`, social links and `siteUrl`.
2. **Form delivery:** set `src/config.js` → `formEndpoint` (e.g. a Formspree/Web3Forms URL). Without it, configurator and contact requests open the visitor's e-mail program instead.
3. **Imprint & privacy:** fill in the placeholders in `src/templates/pages.js` (`LEGAL`). This is legally required for Germany and the EU.
4. **Bioclimatic spec sheet:** the catalogue page with the bioclimatic technical data was not part of the material yet. Its specs and size limits in `src/data/products.js` are provisional and marked with a TODO.
5. Check the size limits in the configurator (`config.dims` per product). They follow the catalogue maximums.

## Editing content

| What | Where |
|---|---|
| Product texts, specs, configurator options | `src/data/products.js` |
| Interface texts (menus, home page, forms) | `src/i18n/strings.js` |
| Page layouts | `src/templates/pages.js`, `src/templates/layout.js` |
| Styles | `src/assets/css/style.css` |
| Product photos | `src/assets/img/products/<slug>/` — the first file alphabetically is the hero image, all files form the gallery |
| Bioclimatic video | `src/assets/video/` |
| Logo (SVG, converted from the original CorelDRAW file) | `src/assets/img/logo/`, source in `brand/` |

All texts are kept as `{ en, de, sq }` side by side. To add a language, add its code to `config.languages` and a value to every entry.

## Project structure

```
build.js                 static site generator
brand/                   original logo (CorelDRAW) + clean SVG
src/config.js            site settings (URL, contact, form endpoint)
src/data/products.js     the six products
src/i18n/strings.js      interface texts
src/templates/           layout, pages, icons
src/assets/              css, js, fonts, images, video
dist/                    build output (not committed)
```
