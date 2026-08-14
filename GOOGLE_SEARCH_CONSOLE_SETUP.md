# Google Search Console — DATA C0RE

Canonical production domain: **https://datac0re.is-a.dev/**

Status: **ownership verified on 2026-08-14 via HTML file** (`googlea17a6d7e73755190.html`). Keep this file permanently at the repository root.

This file is the operational checklist for Search Console. The site structure can keep evolving: as long as the canonical domain stays `https://datac0re.is-a.dev`, the Search Console property remains the same. The repository workflow regenerates multilingual SEO URLs and the sitemap after future pushes to `main`.

## 1. Property — COMPLETE

Verified URL-prefix property:

`https://datac0re.is-a.dev/`

The exact HTTPS host is now the Search Console property used for the production portfolio.

## 2. Ownership verification — COMPLETE

Verification method: **HTML file upload**.

Verification file:

`googlea17a6d7e73755190.html`

Expected public URL:

`https://datac0re.is-a.dev/googlea17a6d7e73755190.html`

Do not delete or rename this file. Google can periodically re-check ownership.

## 3. Submit the sitemap — NEXT

Open **Search Console → Sitemaps** and submit:

`https://datac0re.is-a.dev/sitemap.xml`

If Search Console already shows the property prefix and asks only for the sitemap path, enter:

`sitemap.xml`

The sitemap is generated from `site.config.json` and the localized route generator. It contains the canonical domain plus EN / FR / ES alternates.

Submit this sitemap once and keep the same URL over time. When pages are added, removed or reorganized, update/regenerate the same sitemap rather than creating a new Search Console property.

## 4. Initial URL inspection — NEXT

After the sitemap is accepted, inspect these representative URLs:

- `https://datac0re.is-a.dev/`
- `https://datac0re.is-a.dev/work.html`
- `https://datac0re.is-a.dev/projects/lumina.html`
- `https://datac0re.is-a.dev/fr/`
- `https://datac0re.is-a.dev/es/`

For the homepage:

1. Open URL Inspection.
2. Enter `https://datac0re.is-a.dev/`.
3. Run **Test live URL** if the indexed-data report is not yet available or is stale.
4. Confirm the page is fetchable/indexable.
5. Use **Request indexing**.

Repeat this manually only for a few important representative pages. The sitemap is the scalable discovery mechanism for the rest of the site.

## 5. What to check in URL Inspection

For a representative page, verify:

- Page fetch succeeds.
- Indexing is allowed.
- User-declared canonical is on `https://datac0re.is-a.dev/...`.
- Google-selected canonical eventually matches the custom domain.
- No important CSS / JS / image resources are blocked.
- Multilingual pages remain self-canonical and expose the EN / FR / ES / x-default hreflang cluster.

For a very new property, Google-selected canonical/indexed status can initially be unavailable. Re-check later rather than treating the first empty report as a defect.

## 6. Because the site will keep evolving

The important rule is: **keep the domain stable, let the structure evolve underneath it**.

When adding a new project/page:

1. Link it from the site's normal navigation / Work / project graph where appropriate.
2. Push the source page to `main`.
3. The localization workflow should generate EN / FR / ES routes and update the sitemap.
4. Check that its canonical uses `datac0re.is-a.dev`.
5. Use URL Inspection only for an important launch page when you want a faster crawl signal.

When changing an existing page URL:

- Prefer keeping the old URL stable whenever possible.
- If the URL must change, update all internal links, canonical URLs, hreflang links and sitemap entries together.
- Do not leave two indexable copies of the same content with competing canonicals.
- Preserve old URLs or add an appropriate redirect strategy where the hosting setup permits it.

A visual redesign, media replacement, CSS rewrite or content update does **not** require creating a new Search Console property as long as the canonical domain remains the same.

## 7. Domain migration checks

The repository's SEO source of truth is `site.config.json`.

Expected production configuration:

`"origin": "https://datac0re.is-a.dev"`

The old GitHub Pages address is kept only as a previous origin for migration cleanup:

`https://rzbck.github.io/Data_C0re_.github.io`

The build workflow runs an origin synchronization pass so canonical URLs, `og:url`, structured-data URLs, hreflang references, `robots.txt` and `sitemap.xml` do not drift back to the old GitHub address when the site changes later.

## 8. First weeks of monitoring

Check Search Console periodically for:

- Page indexing / excluded URLs.
- Duplicate or alternate canonical messages.
- Sitemap read status.
- Crawl errors / 404s after structural changes.
- Performance queries, impressions, clicks and CTR.
- Which project and language routes Google starts surfacing.

Do not optimize around one or two days of Search Console data. New properties and domain migrations need time for crawling, canonical consolidation and reporting.

## Official references

- Search Console property types: https://support.google.com/webmasters/answer/34592
- Ownership verification: https://support.google.com/webmasters/answer/9008080
- URL Inspection / request indexing: https://support.google.com/webmasters/answer/9012289
- Search Console top tasks: https://support.google.com/webmasters/answer/10351509
- Sitemaps report: https://support.google.com/webmasters/answer/7451001
- GitHub Pages custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
