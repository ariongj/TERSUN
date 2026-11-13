# TERSUN website — audit

13 November 2026 · live site: https://ariongj.github.io/TERSUN/

## Summary

Four independent reviews tested the whole site in a browser (shop and checkout, the 3D builder, the public pages
in all three languages, and the CMS with its effect on the site). They found **86 problems**. **82 are fixed**,
2 are partly fixed, and 2 need a decision from TERSUN. Nothing found was a crash on its own, but two problems
blocked the CMS: the homepage could not be published, and nothing done under "Slideshow & banners" reached the site.

After the fixes, everything was re-tested on the production build:

| Check | Result |
| --- | --- |
| Every public page (86 addresses) in Albanian, English, German at desktop and phone sizes | 0 errors, broken images or sideways scrolling |
| Every CMS screen (74) at desktop, laptop and phone sizes, 3 languages | 0 errors |
| Client journeys on desktop and phone (order, quotes, consultation, 3D quote, search, wishlist, languages, CMS) | 59 of 59 pass |
| Fixes for shop, CMS → site, slides, publishing, stored-data upgrade | 53 of 53 pass |
| React warnings in the development build, every page | none |
| Discount engine checks | 46 of 46 pass |

## What was fixed

### Shop and checkout (15 found)

The money was always right: cart, checkout, confirmation page and the saved order agree to the cent.
The problems were in messages and edge cases.

| Severity | Problem | Fix |
| --- | --- | --- |
| Major | The cart said "€0.00 away from free delivery" on a €390 cart, and "Free delivery" on carts that would pay €35 | Correct messages; delivery shows "Depends on city" until a city is chosen |
| Major | Products taken offline or made "on request" in the CMS stayed buyable from the cart | They leave the cart with a notice |
| Major | Stock limits were not enforced (orders above stock went through) | Quantities capped at available stock everywhere |
| Major | Only one discount code could be entered | Several codes, each listed with its own message and remove button |
| Minor | Free-delivery codes gave wrong messages | Labelled "Free delivery", explained until a city is chosen |
| Minor | "Once per customer" and customer-group codes never worked | Recognised by e-mail or phone, at checkout and on the saved order |
| Minor | Pausing the free-delivery rule left "free from €250" across the shop | The promise shows only while the rule is live |
| Minor | A code with a space inside showed no error | Fixed |
| Minor | The "demo code" hint suggested codes that did not apply | Suggests only a code that applies to the cart |
| Minor | Swiss company tax IDs (CHE-123.456.789) were refused | Accepted |
| Minor | The cart badge in the header did not match the cart | Same count as the cart |
| Minor | City required even for showroom pickup; English demo details used a city not on the list | Pickup needs no city; demo details fixed |
| Minor | Albanian dates appeared in English in some browsers | Albanian month and day names built in |
| Cosmetic | Delivery card showed "from €0.00" | Shows "Free" or the price range |
| Cosmetic | Confirmation page kept product names in the order's language | Follows the visitor's language |

### CMS changes reaching the site (17 found)

| Severity | Problem | Fix |
| --- | --- | --- |
| Blocker | The homepage editor could never publish (an empty end date on the 3D band counted as an error) | An empty end date is valid and can be cleared |
| Blocker | Nothing done in "Slideshow & banners" reached the homepage | The hero shows the live slides; edits, order, on/off, schedules and deletions apply, and the homepage editor stays in step |
| Major | Theme settings and maintenance mode did nothing on the site | Maintenance page for visitors (the signed-in team still sees the site), heading font, spacing, logo style and size, slideshow autoplay, arrows and interval |
| Major | Hidden and future-dated pages and posts were listed on the site | Hidden ones open only by direct link; future-dated ones wait for their date |
| Major | Switching a language off stranded visitors; the CMS showed German as the default | Visitors move to an active language; Albanian is the default everywhere |
| Major | A product or settings screen open in a second tab silently undid changes | Editors follow the stored record and save only what they changed |
| Major | Turning off the "Online Store" channel did not hide the product | Hidden from shop, product page, search and collections |
| Major | An announcement written only in Albanian never showed | Shown; text written in any language now falls back properly |
| Major | Stock blocked in the CMS was ignored on the product page | Uses available stock |
| Major | Leaving several editors with unsaved changes lost them silently | Every editor with unsaved changes now asks first |
| Minor | Old product address gave "not found" after a rename | Redirects to the new address |
| Minor | Invoices printed today's VAT setting, today's date, "to pay" after refunds and on cancelled orders | Order's own VAT rate and date, refunds shown, cancelled orders marked |
| Minor | "About the company" never reached the footer | Used in the footer |
| Minor | The "Featured" hint promised something the switch does not do | Hint says what it does |
| Minor | A German title was mandatory although the CMS opens in Albanian | A title in any language is enough |
| Cosmetic | English/German labels in the Albanian CMS | Translated (demo data names are still German — see below) |
| Cosmetic | Empty "Code:" label on products without a code | Hidden |

### Public pages, language and forms (30 found)

| Severity | Problem | Fix |
| --- | --- | --- |
| Major | Footer newsletter said "subscribed" but saved nothing | Saved to the CMS contacts inbox; invalid e-mails get a message |
| Major | Searching "pergolë" (suggested by the site itself) found nothing in Albanian | Search covers all three languages, with and without ë/ç |
| Major | Dates in English on Albanian pages | Fixed (see shop above) |
| Major | The wishlist could not be opened on phones | In the phone menu, with its count |
| Major | The menu promised "−20%" while the sale was up to 13% | Shows the real maximum |
| Minor | Consultation form accepted past dates, letters in the phone number and invalid e-mails | Checked, with messages |
| Minor | Form errors and the chosen service stayed in the old language after switching | Follow the language |
| Minor | Contact message required but not marked; focus not moved to the error | Marked; focus moves to the first problem |
| Minor | "New request" erased the product details in the quote form | Kept |
| Minor | Shop filters were lost after opening a product and going back | Kept in the address |
| Minor | Menu said "Journal" / "Projektet" while the pages are "Këshilla" / "Realizimet" | Aligned |
| Minor | "1 produkte"; very long searches ran off the screen; page behind search scrolled | Fixed |
| Minor | Dialogs and menus not usable by keyboard / screen reader (focus, names, Escape) | Fixed |
| Minor | Notification labels in English on Albanian pages; scheduled offer tab said "ended" | Fixed |
| Cosmetic | "Shkurt" (reads as "February") as a heading; English option name in Albanian | "Pyetje të shpejta"; translated |
| Cosmetic | Low-contrast label over a light photo; menu labels wrapping at 1024 px | Fixed |

### 3D builder (24 found — all fixed)

| Severity | Problem | Fix |
| --- | --- | --- |
| Major | Browser Back to an earlier configuration lost it | Every history step restores its configuration |
| Major | In full screen, "Request a quote" opened invisibly | The quote form and messages show in full screen |
| Major | The homepage 3D band caught the page scroll (mouse wheel and phone swipe) | The page scrolls; a sideways drag turns the model |
| Major | Large sizes faded to black in Studio | The scene scales with the size |
| Major | On phones held sideways the 3D view was 131 px tall and buttons were cut off | A side-by-side layout; everything reachable, no scrolling |
| Minor | "Design in 3D" from a variant (Modular, L-shape, Façade…) opened the base model; quotes filed against it | Opens the variant; quotes filed against the right product |
| Minor | Low roofs: furniture and tree stuck through the roof | Hidden or scaled to fit |
| Minor | Rain sensor, Studio LED/rain, ZIP colour leaking, camera jumps, L-shape area/price, Albanian decimals, tab title, laptop heights, phone view buttons | Fixed |
| Cosmetic | Title under the mode switch, band hand-over jump, price rounding, share-code edge cases, snapshot file name and missing labels, LED spot on one edge | Fixed |

### Also fixed earlier today

- Hero slides kept moving when the mouse was over them (they used to pause).
- The 3D picture lost sharpness over time; it now stays sharp at rest.
- Homepage opening photo appears in 1.6 s on fast 4G (was 2.7 s) and in about 4 s on slow 4G (was not appearing in 12 s).
- Sideways scrolling on narrow phones (product gallery, favourites tabs, German product cards) and on three CMS phone screens.
- A page that fails to load shows a message with "Reload" instead of a blank screen; a tab left open across an update reloads itself once.
- Link previews in chat apps (WhatsApp, Viber) show the TERSUN image; Albanian is the default language.

## Needs a decision or data from TERSUN

1. **Delivery to the USA.** The site says "Kosovo, Europe & USA", but checkout has no US cities or fee. Which cities and fee?
2. **3D guide prices per variant.** The builder's estimate uses each system's base price (e.g. ZIP Façade is estimated from ZIP). Should variants have their own formula?
3. **Product model names.** "Bioclimatic Freestanding" appears untranslated in German and Albanian — is "Bioclimatic" a model name, or should it be translated?
4. **Response times.** The site promises "within 24 hours", "within 48 hours" and "same day" in different places. Which is right?
5. **Double glass roof** has no catalogue product of its own (quotes are filed as the freestanding glass roof); the **balcony guillotine** is archived.
6. **Real company data** (still placeholders): phone, address, e-mail, legal name, prices, technical specs, original photos.

## Partly fixed

- **Demo data:** some demo records in the CMS (discount and slide names, the activity log) are German, and a few demo orders go to cities outside the delivery zones. They are sample data and are replaced when real data goes in.
- **Stored demo data:** returning visitors keep their own demo data; corrected labels are applied to it automatically, other new demo texts appear after "Reset demo" in the CMS.

## Not checked here

- **A real iPhone (Safari).** The code was checked for features older iPhones lack (nothing found from iOS 16.4 on), but not on a device.
- **Real phone and graphics performance.** Tests ran with a slowed-down processor and software graphics.
- **Requests reaching TERSUN.** This is a demo without a server: orders, quotes and sign-ups stay in the browser that sent them and appear in the CMS on that same device. Receiving them for real needs an e-mail or form service.
