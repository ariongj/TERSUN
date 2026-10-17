# TERSUN — Beyond Outdoor Living

Website, shop and CMS for **TERSUN**: bioclimatic pergolas, glass roofs, over-glass awnings, Guillotine Premium,
Slide Premium and ZIP screens, plus accessories. For clients in Europe and the USA, in **German, Albanian and English**.

Live preview: https://ariongj.github.io/TERSUN/

- **Storefront**: an image-led homepage with a video hero and a collection of six systems. Systems are made to
  measure (request a quote); accessories can be bought online through the cart and checkout. Also: projects,
  services, journal, contact, search and wishlist.
- **3D Builder** (`/3d`): a live three.js configurator. Choose the system, size, RAL colour, fabric, layout, side
  closures and LED, and switch between studio, day and night scenes and camera views. It shows a guide price,
  saves a PNG and sends a quote request straight into the CMS.
- **CMS** (`/admin`): orders, quotes, enquiries and bookings, customers, products, collections, discounts, the
  homepage builder with live preview, pages, journal, projects, media and settings.

All data lives in the browser (`localStorage`), so no backend is needed for the preview.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173  ·  CMS: /admin
```

CMS demo login (pre-filled): `admin@tersun.com` / `tersun2026`

```bash
npm run build                        # static site in dist/
BASE_PATH=/TERSUN/ npm run build     # GitHub Pages build
```

Every push to `claude/tersun-company-setup-5a6sj8` or `main` builds the site and publishes it to the `gh-pages` branch
(`.github/workflows/pages.yml`).

## Where things are

| | |
|---|---|
| Catalogue (categories, products, specs) | `src/data/catalog.ts` |
| Homepage, settings, projects, pages, journal | `src/data/content.ts` |
| Demo orders, enquiries, CMS records | `src/data/cms.ts`, `src/data/demo.ts` |
| 3D builder (page, systems, three.js engine) | `src/site/builder3d/` |
| Translations | `defineDict({ de, sq, en })` next to each component; shared ones in `src/i18n/` |
| Brand colours / fonts | `src/index.css` (`--color-brand-*`), logo in `src/components/brand/Logo.tsx` |

`classic/` holds the first static version of the site (Node build script + the original three.js builder).
