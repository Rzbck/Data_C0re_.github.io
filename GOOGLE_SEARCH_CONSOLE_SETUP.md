# Google Search Console — DATA C0RE

Canonical production domain: **https://datac0re.is-a.dev/**

This file is the operational checklist for Search Console. The site structure can keep evolving: as long as the canonical domain stays `https://datac0re.is-a.dev`, the Search Console property remains the same. The repository workflow regenerates multilingual SEO URLs and the sitemap after future pushes to `main`.

## 1. Create the property

Use a **URL-prefix property** and enter exactly:

`https://datac0re.is-a.dev/`

A URL-prefix property is appropriate here because it targets the exact HTTPS host and supports verification methods that do not require changing DNS.

## 2. Verify ownership

Recommended method for this GitHub Pages setup: **HTML file upload**.

1. In Search Console, choose the HTML file verification method.
2. Google gives you a file named approximately `googleXXXXXXXXXXXX.html`.
3. Add that exact file, unchanged, at the root of this repository.
4. Wait for GitHub Pages to deploy it.
5. Confirm that `https://datac0re.is-a.dev/googleXXXXXXXXXXXX.html` loads publicly.
6. Return to Search Console and click **Verify**.
7. Keep the verification file in the repository permanently. Google periodically checks that the token is still present.

Alternative: the HTML `<meta name="google-site-verification" ...>` method also works for a URL-prefix property, but the verification file is preferable here because future homepage redesigns cannot accidentally remove it.

When Google gives you the verification filename/content, commit it exactly as supplied. Do not rename or edit the token.

## 3. Submit the sitemap

Open **Search Console → Sitemaps** and submit:

`https://datac0re.is-a.dev/sitemap.xml`

The sitemap is generated from `site.config.json` and the localized route generator. It contains the canonical domain plus EN / FR / ES alternates.

You normally submit this sitemap **once**. Google will recrawl the same sitemap URL later. When pages are added or removed, keep the sitemap file current rather than repeatedly creating new Search Console properties.

## 4. Initial URL inspection

After verification, inspect these representative URLs:

- `https://datac0re.is-a.dev/`
- `https://datac0re.is-a.dev/work.html`
- `https://datac0re.is-a.dev/projects/lumina.html`
- `https://datac0re.is-a.dev/fr/`
- `https://datac0re.is-a.dev/es/`

For the homepage, use **Test live URL**, confirm that Google can fetch it, then use **Request indexing**. Do the same for a few important representative pages; the sitemap is the scalable method for the rest of the site.

## 5. What to check in URL Inspection

For a representative page, verify:

- Page fetch succeeds.
- Indexing is allowed.
- User-declared canonical is on `https://datac0re.is-a.dev/...`.
- Google-selected canonical eventually matches the custom domain.
- No important CSS / JS / image resources are blocked.
- Multilingual pages remain self-canonical and expose the EN / FR / ES / x-default hreflang cluster.

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
- Search Console top tasks / request indexing: https://support.google.com/webmasters/answer/10351509
- Sitemaps report: https://support.google.com/webmasters/answer/7451001
- GitHub Pages custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
