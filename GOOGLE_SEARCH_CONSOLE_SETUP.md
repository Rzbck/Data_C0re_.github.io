# Google Search Console — DATA C0RE

Canonical production domain: **https://datac0re.is-a.dev/**

Status on 2026-08-26:
- **Ownership verified** via HTML file `googlea17a6d7e73755190.html`.
- **Sitemap submitted** in Search Console.
- **Homepage indexing requested** on 2026-08-14.
- **Automated Search Console monitoring staged on `dev`** via `.github/workflows/search-console-monitor.yml` and `scripts/search-console-report.py`.

Keep the verification file permanently at the repository root. It is deliberately excluded from localized routes and from `sitemap.xml`; it is a verification token, not an indexable portfolio page.

## 1. Property — COMPLETE

Verified URL-prefix property:

`https://datac0re.is-a.dev/`

The exact HTTPS host is the Search Console property used for the production portfolio.

## 2. Ownership verification — COMPLETE

Verification method: **HTML file upload**.

Verification file:

`googlea17a6d7e73755190.html`

Expected public URL:

`https://datac0re.is-a.dev/googlea17a6d7e73755190.html`

Do not delete, rename, translate or add this token to the sitemap. Google can periodically re-check ownership.

## 3. Sitemap — SUBMITTED

Submitted sitemap:

`https://datac0re.is-a.dev/sitemap.xml`

The sitemap is generated from `site.config.json` and the localized route generator. It contains the canonical production domain plus EN / FR / ES / x-default relationships for actual portfolio pages.

In Search Console → Sitemaps, monitor the submitted sitemap until its processing status is successful. Submit this sitemap once and keep the same URL over time. When pages are added, removed or reorganized, regenerate the same sitemap rather than creating a new Search Console property.

## 4. Homepage URL inspection — REQUESTED

Homepage:

`https://datac0re.is-a.dev/`

On 2026-08-14 Search Console accepted an indexing request and placed the URL in the indexing queue. Do not repeatedly submit the same homepage request; re-check its status later with URL Inspection.

Representative current URLs worth inspecting are:

- `https://datac0re.is-a.dev/`
- `https://datac0re.is-a.dev/archive.html`
- `https://datac0re.is-a.dev/projects/lumina.html`
- `https://datac0re.is-a.dev/projects/grand-theatre.html`
- `https://datac0re.is-a.dev/projects/comedie.html`
- `https://datac0re.is-a.dev/projects/hardwinner.html`
- `https://datac0re.is-a.dev/fr/`
- `https://datac0re.is-a.dev/es/`

Legacy routes such as `work.html`, `about.html`, `services.html` and `lab.html` are intentional `noindex` redirects and must not be manually submitted for indexing.

## 5. Automated monitoring — STAGED ON DEV

Files:

- `.github/workflows/search-console-monitor.yml`
- `scripts/search-console-report.py`

Planned cadence after release to the default production branch: **daily at 06:20 UTC**.

The workflow uses a standard `ubuntu-latest` runner and has a five-minute timeout. It normally performs only a handful of API requests and should finish well below that timeout.

Collected automatically:

- 28-day clicks / impressions / CTR / average position
- daily trend
- top pages
- country aggregates
- device aggregates
- URL Inspection status for representative portfolio pages
- Google-selected and user-declared canonical information when available

Because this repository is public, **search query terms are excluded by default from the uploaded artifact**. The workflow sets `GSC_INCLUDE_QUERIES=false`. This avoids publishing individual search terms in a public-repository Actions artifact.

Reports are uploaded as GitHub Actions artifacts for 14 days and are never committed to the website source.

### Required Google / GitHub setup

Before the workflow can authenticate:

1. Create or select a Google Cloud project.
2. Enable the **Google Search Console API** for that project.
3. Create a Google service account and download its JSON key.
4. In Search Console → Settings → Users and permissions, add the service-account email to the `https://datac0re.is-a.dev/` property with sufficient read/inspection permission.
5. In GitHub repository → Settings → Secrets and variables → Actions, create a repository secret named exactly:

   `GSC_SERVICE_ACCOUNT_JSON`

6. Paste the **entire JSON key contents** into that secret. Never commit the JSON key to the repository and never paste it into public issues, workflow files or site code.

The scheduled event becomes active only when this workflow is present on GitHub's default branch (`main`). While the implementation is staged only on `dev`, it does not change production and should not be considered active daily monitoring yet.

## 6. What to check in URL Inspection

For a representative page, verify:

- Page fetch succeeds.
- Indexing is allowed.
- User-declared canonical is on `https://datac0re.is-a.dev/...`.
- Google-selected canonical eventually matches the custom domain.
- No important CSS / JS / image resources are blocked.
- Multilingual pages remain self-canonical and expose the EN / FR / ES / x-default hreflang cluster.

For a very new property or a recent domain move, indexed status and Google-selected canonical can initially be unavailable. Re-check later rather than treating the first empty report as a defect.

## 7. Because the site will keep evolving

The important rule is: **keep the domain stable, let the structure evolve underneath it**.

When adding a new project/page:

1. Link it from the site's normal navigation / Archive / project graph where appropriate.
2. Push the source page through the approved development/release flow.
3. The localization workflow should generate EN / FR / ES routes and update the sitemap.
4. Check that its canonical uses `datac0re.is-a.dev`.
5. Use URL Inspection only for an important launch page when a faster crawl signal is useful.

When changing an existing page URL:

- Prefer keeping the old URL stable whenever possible.
- If the URL must change, update all internal links, canonical URLs, hreflang links and sitemap entries together.
- Do not leave two indexable copies of the same content with competing canonicals.
- Preserve old URLs or add an appropriate redirect strategy where the hosting setup permits it.

A visual redesign, media replacement, CSS rewrite or content update does **not** require creating a new Search Console property as long as the canonical domain remains the same.

## 8. Domain migration checks

The repository's SEO source of truth is `site.config.json`.

Expected production configuration:

`"origin": "https://datac0re.is-a.dev"`

The old GitHub Pages address is kept only as a previous origin for migration cleanup:

`https://rzbck.github.io/Data_C0re_.github.io`

The build workflow runs an origin synchronization pass so canonical URLs, `og:url`, structured-data URLs, hreflang references, `robots.txt` and `sitemap.xml` do not drift back to the old GitHub address when the site changes later.

## 9. First weeks of monitoring

Check Search Console periodically for:

- Sitemap read/processing status.
- Page indexing / excluded URLs.
- Duplicate or alternate canonical messages.
- Crawl errors / 404s after structural changes.
- Performance impressions, clicks and CTR.
- Which project and language routes Google starts surfacing.

Do not optimize around one or two days of Search Console data. New properties and domain migrations need time for crawling, canonical consolidation and reporting.

## Official references

- Search Console property types: https://support.google.com/webmasters/answer/34592
- Ownership verification: https://support.google.com/webmasters/answer/9008080
- URL Inspection / request indexing: https://support.google.com/webmasters/answer/9012289
- Search Console top tasks: https://support.google.com/webmasters/answer/10351509
- Search Console API: https://developers.google.com/webmaster-tools/v1/api_reference_index
- URL Inspection API: https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- GitHub Pages custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
