# DATA C0RE — AI / DEVELOPMENT CONTEXT

Updated: 2026-08-15 — V2 production release

**READ THIS FILE BEFORE ANY PORTFOLIO WRITE.**
**ALSO READ `EDITORIAL_RULES.md` AND `INTERACTION_RULES.md` BEFORE ANY PUBLIC COPY, INFORMATION-ARCHITECTURE OR INTERACTION CHANGE.**

This file is the persistent handoff for future ChatGPT / AI conversations working on this repository.

## Repository and branches

Repository: `Rzbck/Data_C0re_.github.io`

### `main` = PRODUCTION
- `main` is the public production branch.
- GitHub Pages source is `main` at `/`.
- Public production URL: `https://datac0re.is-a.dev/`
- V2 was approved and published from `dev` to `main` on 2026-08-15.
- Do **not** write, merge, rebase, force-push or regenerate `main` unless the user explicitly says to publish / merge an approved DEV version.
- A successful GitHub Action is not the same as a successful public deployment: verify the latest Pages build commit before saying production is live.
- Rollback point for the pre-V2 production state: branch `pre-dev-release-20260815`.

### `dev` = ACTIVE DEVELOPMENT / NEXT VERSION
- All new portfolio changes must target `branch: dev` explicitly.
- Before starting a new development cycle after a release, synchronize `dev` from the current approved `main` so DEV starts from the production state.
- Never rely on the repository default branch for a write.
- The user does not work locally: the assistant performs GitHub edits and must verify the target branch itself.
- It is acceptable that `dev` is visible to someone browsing the public GitHub repository. It must not replace or be served by the production URL until explicit publication approval.

## DEV browser preview

Stable preview URL:
`https://datac0re-dev-preview.vercel.app/`

Recommended FR preview:
`https://datac0re-dev-preview.vercel.app/fr/`

Preview architecture:
- Vercel project: `datac0re-dev-preview`
- Vercel team: `datacoredrive1-6167s-projects`
- The preview is a lightweight proxy that reads files directly from the GitHub `dev` branch.
- Normal content commits to `dev` appear through the stable preview without publishing `main`.
- Preview responses send `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` and no-store caching headers.
- The Vercel preview is NOT the production deployment.

Tools used for the current workflow:
- GitHub connector: repository reads/writes, branches, Actions verification and release branch updates.
- Vercel connector: browser preview project.

## DNS / domain facts

`datac0re.is-a.dev` is registered through `is-a-dev/register`.
Current record is a CNAME to `rzbck.github.io`.
Cloudflare is not required for the current production DNS chain.

A future `dev.datac0re.is-a.dev` would require a separate is-a.dev DNS registration / record. Until then use the stable Vercel preview URL above.

## GitHub Actions rules

- Production localization workflow `.github/workflows/localize.yml` must remain restricted to `main`.
- DEV build workflow `.github/workflows/dev-build.yml` must remain restricted to `dev`.
- No DEV workflow may push to `main`.
- IndexNow / production SEO submission must remain production-only.
- Production and DEV generators must both run `scripts/static-language-links.mjs` and `scripts/check-locale-parity.mjs` after the final Home/V2 generation layers.
- `scripts/portfolio-editorial-simplify.mjs` and `scripts/portfolio-v2-finalize.mjs` are final architecture layers and must run after localization/layout generation.
- Browser release QA is implemented by `.github/workflows/release-responsive-audit.yml` + `scripts/release-responsive-audit.mjs`.

## RESPONSIVE RELEASE GATE

Before an approved DEV version replaces `main`, the Chromium release audit must pass.
Current audit matrix:
- 360×800 — small mobile
- 390×844 — mobile
- 768×1024 — iPad portrait
- 1024×768 — iPad landscape
- 834×1194 — large tablet
- 1366×768 — laptop / short desktop
- 1920×1080 — large desktop

For each viewport it checks EN / FR / ES across Home / Archive / CV / Contact, including horizontal overflow, header geometry, header overlaps, language controls, Contact fields, Archive controls and relevant JS page errors.

V2 release audit on 2026-08-15 passed: **7 viewports × 3 locales × 4 routes = 84 route/viewport checks**.

## CURRENT PUBLIC ARCHITECTURE — V2

This structure is now implemented on **production `main`**. Do not reintroduce redundant top-level pages without an explicit user request.

### HOME
Home is the main portfolio presentation.
It must answer within seconds:
1. What does DATA C0RE do?
2. What has DATA C0RE actually delivered / operated?
3. With which institutions, collectives and venues?
4. In which places / production contexts?
5. What are the concrete technical capabilities?
6. How can the visitor open a project, Archive, CV or Contact?

Home foregrounds realized professional / collaborative contexts, not experiments.
Project/context names route to their canonical project page. Topic / technical / geographical tags route to Archive with the corresponding tag filter.

Priority proof / contexts:
- LUMINA / Geneva Lux / StripLab — Geneva — collaborative public installation; realtime systems and integration.
- Grand Théâtre de Genève — Geneva — SMODE programming, projection integration, cues, calibration.
- Comédie de Genève — Geneva + touring context — theatre video, creation, touring adaptation, operation.
- Hardwinner / La Belle Électrique — Grenoble — collaborative live AV systems; TouchDesigner, GLSL, Resolume, LED / DMX.
- Fun Radio Party — Chambéry — realtime video and lighting system; TouchDesigner / Resolume / video-light synchronization.

Core capabilities to communicate concisely:
- TouchDesigner / realtime audiovisual systems
- SMODE / projection / geometric adaptation / calibration
- Resolume / live AV / stage video
- LED / DMX / Art-Net / show control / video-light synchronization
- system design / networked media / onsite integration
- Fusion 360 / fabrication coordination where relevant

### PERSISTENT HEADER
The public header exposes exactly four primary destinations in all locales:
- Home / Accueil / Inicio
- Archive / Archives / Archivo
- CV
- Contact / Contacto

The active route uses the acid accent. EN / FR / ES are present statically in the initial HTML to prevent header layout flashes. The obsolete public Motion on/off control must never return.

### INDEX OVERLAY
The optional INDEX overlay remains a secondary navigation surface and may stay more compact than the persistent header. It must not create a second information architecture.

### ARCHIVE
`Archive` is the single complete project catalogue. It is chronological and supports filtering by status, type, year and reusable project tags.

Project taxonomy is centralized in `data/project-taxonomy.json` and may contain location, context, discipline, tool, protocol and system tags. Tags do not all have to be visibly displayed, but the metadata should remain reusable for filtering and future visual/data features.

### PROJECT PAGES
There must be exactly one substantive detailed editorial page per project/case study.
Home and Archive may repeat only short titles, metadata and navigation teasers.
Do not create a second narrative version of the same project on another top-level page.

### CV
`CV` exists for professional chronology, roles, institutions, skills, tools, references and mobility.
Do not repeat the full Home biography or project case-study narratives.

### CONTACT
`Contact` remains the unique functional route for the secure form.
The header must reserve stable scrollbar geometry so navigation does not shift between scrolling pages and short Contact pages.

### LEGACY TOP-LEVEL ROUTES
These are no longer real portfolio sections:
- `work.html` → redirects to Home
- `about.html` → redirects to Home
- `services.html` → redirects to Home
- `lab.html` → redirects to Archive

They must remain `noindex`, canonicalized to the surviving destination, and excluded from the sitemap.

### Research / archive-only material
Do NOT foreground these on the landing page:
- Snake / Networked Retro System — R&D / interactive software prototype.
- ASCII / Pixel Realtime Study — study / R&D.
- Realtime Studies — R&D.
- SIGNAL — simulation / R&D only; not installed.
- Cloud Processing / GLSL and other studies — archive material unless a specific application needs them.

## Editorial hard rule

Never expose the site's internal strategy to visitors. Public copy must not explain why Home, Archive, CV or any section exists, how the portfolio has been curated, or where prototypes are placed as a strategy decision. The hierarchy must be understandable through the interface itself. See `EDITORIAL_RULES.md`.

## Interaction hard rules

See `INTERACTION_RULES.md`. Important current behavior:
- Desktop Home keeps the fullpage / magnetic navigation language.
- Touch/tablet/mobile must remain stable and usable without hover-dependent functionality.
- Project names on Home open project pages.
- Topic / skill / location / protocol tags open filtered Archive views.
- Archive hover media is desktop enhancement only; touch devices use stable poster/static behavior.
- Home Archive / Contact gates currently use an amplified directional typographic trail on fine-pointer desktop only.

## SIGNAL confidentiality / accuracy

SIGNAL is currently simulation / R&D only.
Never describe it as a built or deployed installation.
Do not expose client name, identifying location/context, private repository or confidential implementation details.
Public-safe description: anonymous movement -> spatial data -> network -> TouchDesigner-oriented realtime behaviour -> LED/output architecture, clearly presented as simulation / designed system.

## Credits / accuracy

Do not inflate authorship.
- LUMINA is collaborative; DATA C0RE had a central realtime systems / integration role.
- Hardwinner is collaborative.
- Grand Théâtre and Comédie are institutional production contexts, not solo artworks.
- Fun Radio is a professional stage-system case study.

Preserve the distinction between:
- solo project
- collaborative project
- independent technical contribution inside a larger production

Do not invent undocumented technology stacks, production names, collaborators or locations.

## Identity / privacy

Public identity: `DATA C0RE` only.
Do not publish civil identity or private email.
Contact remains through the secure website form.
Git author email: `10966796+Rzbck@users.noreply.github.com`.

## Localization / design rules

- EN / FR / ES must remain structural copies: same routes, same interaction architecture, same responsive behavior. Only localized editorial content should differ.
- Preserve accents and natural FR / ES editorial copy.
- Keep international technical terms where normal: TouchDesigner, creative technologist, live AV, GLSL, cues, mapping, show control, media server, etc.
- Dark / black Swiss-brutalist visual direction, acid-green accent, thin rules, strong grid.
- Avoid giant broken typography, text collisions, squeezed columns and mobile regressions.
- Do not introduce generic decorative grids, fake technical overlays or low-value visual noise.

## Required verification after DEV portfolio writes

Before reporting a normal DEV change complete:
1. verify the latest DEV GitHub Action succeeds;
2. verify EN / FR / ES structural parity succeeds;
3. fetch the generated localized page(s), not only source scripts;
4. verify legacy routes remain noindex redirects when relevant;
5. verify sitemap excludes work/about/services/lab;
6. verify `main` SHA did not move;
7. verify GitHub Pages still sources `main /`;
8. verify the Vercel DEV preview returns the updated branch with HTTP 200 and noindex headers;
9. never claim production changed unless the user explicitly requested publication.

## Required verification for an explicit release to MAIN

When the user explicitly approves publication:
1. run the responsive Chromium release audit on the approved DEV state;
2. create/confirm a rollback point for the previous production state;
3. verify the production localization workflow contains the same final V2/header/parity safeguards as DEV;
4. move/merge the approved DEV state to `main` without rewriting unrelated history;
5. wait for the production localization workflow to complete successfully;
6. verify the final `main` ref after generated production output;
7. verify GitHub Pages still sources `main /`, HTTPS is enforced, and the latest Pages build is `built` for the final `main` commit;
8. only then report the release as production.
