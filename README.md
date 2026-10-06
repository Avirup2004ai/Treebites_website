# TreeBites website

The complete website is directly inside **C:\website\Treebites**. Open the root `index.html` with your IDE's Live Server extension, or use the preview command below.

## Preview

```text
npm start
```

Open http://127.0.0.1:5173/. If another preview already uses that port:

```text
node serve.mjs --port 5174
```

Use an HTTP server instead of opening HTML through `file://`, because the site uses root-relative URLs. The preview serves this folder, returns real 404 responses, redirects duplicate page URLs and exposes the public crawler files. Source files and configuration are not served by this preview.

## What is included

- A modern FMCG visual system with Sora headings, Manrope body text, forest green, citrus accents and actual TreeBites product photography.
- Homepage, a dedicated `/our-story/` brand page, category index, five category collections, 19 product pages, an HTML sitemap and a 404 page.
- The supplied `assets/Treebites_logo.png` appears in the header and footer; `assets/Treebites_favicon.png` is the browser icon. Both have content-versioned URLs. Original artwork files are preserved.
- Mobile navigation, catalogue search, image selection and direct retailer buttons. No cart or checkout.
- Small button movements, short heading fades, animated mobile navigation, native accordions with content fades, and decoded image transitions that respect reduced-motion preferences. Large cards and packshots remain still during scrolling; there are no animated shadows or per-frame accordion height changes.
- Instagram and Facebook icons with visible names in every footer. Instagram is connected; Facebook awaits its official profile URL.
- Canonical URLs, page-specific titles/descriptions, text social metadata, Organization/WebSite/Product/Breadcrumb/Collection/FAQ structured data, an XML sitemap and open crawler rules.
- Locally hosted fonts, responsive WebP images, priority loading for the main product image, lazy loading below the fold and versioned CSS/JavaScript URLs.

## Edit the website

| File or folder | Purpose |
|---|---|
| `index.html` | Generated homepage in the opened folder |
| `products/`, `categories/`, `our-story/`, `sitemap/` | Generated public pages |
| `build.mjs` | Shared page templates, product content, categories and retailer eligibility |
| `src/home.mjs` | Homepage structure and copy |
| `src/story.mjs` | Dedicated brand page, using confirmed brand/product information |
| `src/seo.mjs` | Metadata, structured data, responsive image markup and discovery files |
| `site.config.json` | Canonical domain and brand contact details; currently `https://tree-bites.com` |
| `assets/brand.css` | Current FMCG visual direction and responsive refinements |
| `assets/motion.css` | Shared motion timings, interaction states and social icon styling |
| `src/navigation.js` | Early loading-bar behavior; inlined into every generated page |
| `assets/story.css`, `assets/collections.css` | Page-specific editorial layout and category-card alignment |
| `assets/style.css`, `assets/pages.css` | Base layout and existing page components |
| `assets/site.js` | Navigation, search, image selection, accordions and entrance motion |
| `src/socials.mjs` | Accessible social icons and profile links |
| `assets/images/` | Generated responsive WebP product photos |
| `assets/fonts/` | Locally hosted fonts and their licenses |
| `src/research.json`, `src/TB-*.json` | Retained product and retailer evidence |
| `dist/` | Generated hosting export, with public files only |

After editing templates, content, JavaScript, CSS or configuration:

```text
npm run build
npm run check
```

The build updates root HTML and `dist/`. It also refreshes the CSS/JavaScript version hashes. Direct HTML edits are visible immediately but will be replaced by regeneration; keep lasting content changes in the templates.

Page navigation has a slim forest-green and gold loading bar, a brief completion fade, and native cross-document content transitions in supporting browsers. Links retain browser history and normal new-tab behavior; external retailer links do not trigger the local loading indicator. Reduced-motion mode uses a stationary loading indicator and disables page transitions. The bar is indeterminate, not a claimed download percentage. Navigation tests also cover history restoration and cancellation cleanup.

Set `facebook` in `site.config.json` to the confirmed TreeBites Facebook profile URL, then rebuild to activate its footer link and include it in Organization structured data. Until then, its icon and name are shown as unavailable without a guessed destination. Instagram already uses the supplied official profile.

The Our Story page covers the brand, Bengali-inspired flavours, all five product ranges, product information, retailer ordering and contact information. Founder names, founding year, legal company details, sourcing/manufacturing details, certifications and the full business address still need owner confirmation before inclusion. Edit `src/story.mjs` with the confirmed information; the build also updates the readable brand text in `llms-full.txt`.

There is no browser runtime framework or npm dependency. The optional asset preparation tool uses `sharp` as a development dependency. Install dependencies with `npm install` when preparing new images:

```text
npm run images
npm run build
```

Keep the original product PNGs in `assets/`; `npm run images` creates 360/640/up-to-1000-pixel WebP versions without changing the original images. Run `npm run fonts` only when intentionally refreshing the two locally hosted Google Fonts; their SIL licenses are bundled.

## Checks

- `npm run check`: checks every public page, local file reference, social icon/link, retailer mapping, hosting copy, canonical URL, structured-data graph, sitemap, crawler files, responsive images and fonts. Browser-API unit checks cover rapid menu/accordion clicks, image-loading races/failures, search, keyboard focus, reduced motion and animation fallbacks.
- `npm run check:http`: starts a temporary preview, checks page and discovery-file responses, redirects, HEAD/304 handling, real 404s and blocked source paths, then stops its own server.

Automated checks pass. This session had no connected browser, so desktop/mobile screenshot review and live Lighthouse or Google Rich Results testing were not performed. See `SEO.md` for the public launch steps and technical limits.

## Retailer links

All 19 **Buy now** buttons point to their Fashinoworld product/variant URLs. **Order on Amazon** is always the first button. Thirteen Amazon links are enabled. Six remain disabled until the exact listing or pack is confirmed:

| Product | Confirmation needed |
|---|---|
| Sattu Protein Mix 150 g | Exact Amazon listing |
| Shilajit Capsules | Exact Amazon listing |
| Healthy Mix | Amazon title says 200 g; structured quantity says 250 g |
| Mosambi & Lemon Juice | Amazon title says 100 ml; structured quantity says 200 ml |
| Pineapple Fruit Beer Juice | Amazon title says 250 ml; website title says 200 ml |
| Nolen Gur single jar | Website says 250 g; Amazon title says 250 ml |

Prices, stock, shipping and returns are shown on the retailer. There is no live inventory integration. Amazon evidence was reviewed on 25 September 2026; Fashinoworld data and images were fetched on 5 October 2026. Brand packaging may contain printed claims; the website's own copy does not add unverified certifications, therapeutic claims, testimonials or founder history.

The Nolen Gur two-pack was removed from the public catalogue at the owner's request. Its generated page is removed from both the project and `dist/` on build, and its URL returns 404. Historical research and original product assets remain available in the source project.

The `.openai/hosting.json` file retains the existing Site identity. Preserve it for future hosted updates. The website has not been published or connected to the custom domain by this local editing task.
