# TreeBites search and AI discoverability

## Implemented

The canonical origin is **https://tree-bites.com**, as confirmed by the owner. Change `site.config.json` and rebuild if the public domain changes.

- 29 canonical, indexable HTML pages; a separate `noindex` 404 page.
- Unique titles and concise descriptions, language metadata, text Open Graph/Twitter metadata and stable internal links.
- Complete product copy, pack sizes, retailer links and navigation in the initial HTML. Crawlers do not need JavaScript to read them. Mobile navigation also has a no-JavaScript fallback.
- JSON-LD: Organization (including the supplied logo), WebSite, WebPage/ItemPage/CollectionPage/AboutPage, 19 Product records, 28 breadcrumb trails, category/product lists and the four visible homepage FAQ answers.
- `/our-story/` has its own canonical URL, title, description and AboutPage entity linked to the brand's Organization. It is linked from the main navigation, homepage, footer, HTML/XML sitemaps and `llms.txt`; its readable page content is also included in `llms-full.txt`.
- `sitemap.xml` with all canonical pages and the 19 primary product images; a linked human-readable `/sitemap/`.
- `robots.txt` allows public crawling under `User-agent: *`. This includes search crawlers, AI search crawlers and training crawlers. Only source, development and build directories are excluded.
- `llms.txt`, `llms-full.txt` and `catalogue.json` provide an additional readable directory and product facts. They contain the same public information, without hidden promotional instructions.
- Responsive WebP files, explicit image dimensions, eager/high-priority hero images, lazy-loaded secondary images, local fonts and versioned stylesheet/script URLs.
- Category artwork uses proportional rendered heights and explicit responsive grid tracks. Scroll effects are limited to a few short heading fades, with no moving product cards, large image rotations, animated shadows or per-frame accordion height changes. No frame-rate or Core Web Vitals improvement is claimed without browser measurements.
- Clean URL redirects, real 404s, caching and correct JSON/XML/font MIME types in the included preview server. `_headers` and `_redirects` are also exported for compatible static hosts.

The 26 source images total 35,484,917 bytes. Their largest generated WebP versions total 3,609,772 bytes, approximately **90% smaller**. Smaller responsive variants can reduce individual mobile requests further. This is a measured image-byte reduction, not a measured Lighthouse or Core Web Vitals score.

## Before public launch

1. Serve the contents of `dist/` at `https://tree-bites.com` with HTTPS and public access. Search engines cannot index local files or a private preview.
2. Check that the domain serves this new site, and that any existing Wix/domain redirects have been updated by the domain owner. This task did not change hosting, DNS or the old site.
3. Choose the non-www host as canonical and redirect the www host to it. Apply the supplied redirects/headers where supported; configure equivalent behavior on other hosts.
4. Verify the domain in Google Search Console and Bing Webmaster Tools, then submit `https://tree-bites.com/sitemap.xml`.
5. Check live homepage, category and product URLs with URL Inspection, Rich Results Test and PageSpeed Insights. Browser visual testing, live search-console verification and live performance scores remain untested here.
6. Ensure the hosting/CDN does not challenge or block legitimate crawlers. Where a firewall requires allowlisting, use each provider's published bot verification guidance, not a user-agent string alone.

## What these changes do not promise

Indexability does not guarantee indexing, rankings or inclusion in AI answers. Google says its existing SEO fundamentals also apply to AI Overviews and AI Mode; it does not require special AI text files. The `llms.txt` files are supplementary and are not universally supported crawler standards.

Product structured data intentionally does **not** invent ratings, reviews, availability or current prices. The catalogue identifies products; it is not the checkout merchant. Google Product rich results require further eligible data, such as a valid offer or review. Keep this limitation until accurate, visibly displayed and maintained information is available.

FAQ data matches the visible questions, but it does not imply eligibility for a Google FAQ rich result. Brand-supplied image labels may contain marketing claims; the site's written content does not verify those claims.

The six unconfirmed Amazon destinations remain unavailable in both the interface and the machine-readable catalogue. Confirm their exact pack/listing before enabling them. The retired Nolen Gur two-pack is excluded from the catalogue, structured data, sitemaps and readable discovery files.

## Primary references

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: Product snippet structured data](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [OpenAI: crawler controls](https://developers.openai.com/api/docs/bots)
- [Anthropic: crawler controls](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: crawler controls](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Schema.org: AboutPage](https://schema.org/AboutPage)
