# DATA C0RE — AI / DEVELOPMENT CONTEXT

Updated: 2026-08-15

**READ THIS FILE BEFORE ANY PORTFOLIO WRITE.**
**ALSO READ `EDITORIAL_RULES.md` BEFORE ANY PUBLIC COPY OR INFORMATION-ARCHITECTURE CHANGE.**

This file is the persistent handoff for future ChatGPT / AI conversations working on this repository.

## Repository and branches

Repository: `Rzbck/Data_C0re_.github.io`

### `main` = PRODUCTION
- `main` is the public production branch.
- GitHub Pages source is `main` at `/`.
- Public production URL: `https://datac0re.is-a.dev/`
- Do **not** write, merge, rebase, force-push or regenerate `main` unless the user explicitly says to publish / merge the approved DEV version.
- A successful GitHub Action is not the same as a successful public deployment: verify Pages before saying production is live.

### `dev` = ACTIVE DEVELOPMENT
- All portfolio changes must target `branch: dev` explicitly.
- Never rely on the repository default branch for a write.
- The user does not work locally: the assistant performs GitHub edits and must verify the target branch itself.
- It is acceptable that `dev` is visible to someone browsing the public GitHub repository. It must not replace or be served by the production URL.

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
- GitHub connector: repository reads/writes, branches, Actions verification.
- Vercel connector: browser preview project.

## DNS / domain facts

`datac0re.is-a.dev` is registered through `is-a-dev/register`.
Current record is a CNAME to `rzbck.github.io`.
Cloudflare is not required for the current production DNS chain.

A future `dev.datac0re.is-a.dev` would require a separate is-a.dev DNS registration / record. Until then use the stable Vercel preview URL above.

## GitHub Actions rules

- Production localization workflow must remain restricted to `main`.
- DEV build workflow must remain restricted to `dev`.
- No DEV workflow may push to `main`.
- IndexNow / production SEO submission must remain production-only.
- `scripts/portfolio-editorial-simplify.mjs` and `scripts/portfolio-v2-finalize.mjs` are the final architecture layers and must run after localization/layout generation.

## CURRENT PUBLIC ARCHITECTURE — V2

This structure is implemented on `dev`. Do not reintroduce redundant top-level pages without an explicit user request.

### HOME
Home is the main portfolio presentation and is reached through the DATA C0RE brand/logo.
It must answer within seconds:
1. What does DATA C0RE do?
2. What has DATA C0RE actually delivered / operated?
3. With which institutions, collectives and venues?
4. In which places / production contexts?
5. What are the concrete technical capabilities?
6. How can the visitor open a project, Archive, CV or Contact?

Home foregrounds realized professional / collaborative contexts, not experiments.

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

### PRIMARY INDEX
The site index contains exactly three primary destinations:
- `Archive`
- `CV`
- `Contact`

Home is reached through the DATA C0RE logo/brand and is not a separate index card.

### ARCHIVE
`Archive` is the single complete project catalogue. It is chronological and uses status labels such as REALIZED / R&D / SIMULATION / STUDY. It links to the one canonical detailed page for each project.

### PROJECT PAGES
There must be exactly one substantive detailed editorial page per project/case study.
Home and Archive may repeat only short titles, metadata and navigation teasers.
Do not create a second narrative version of the same project on another top-level page.

### CV
`CV` exists for professional chronology, roles, institutions, skills, tools, references and mobility.
Do not repeat the full Home biography or project case-study narratives.

### CONTACT
`Contact` remains the unique functional route for the secure form.

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

- Maintain EN / FR / ES static routes.
- Preserve accents and natural FR / ES editorial copy.
- Keep international technical terms where normal: TouchDesigner, creative technologist, live AV, GLSL, cues, mapping, show control, media server, etc.
- Dark / black Swiss-brutalist visual direction, acid-green accent, thin rules, strong grid.
- Avoid giant broken typography, text collisions, squeezed columns and mobile regressions.
- Do not introduce generic decorative grids, fake technical overlays or low-value visual noise.

## Required verification after portfolio writes

Before reporting completion:
1. verify the latest DEV GitHub Action succeeds;
2. fetch the generated FR page(s), not only source scripts;
3. verify legacy routes remain noindex redirects;
4. verify sitemap excludes work/about/services/lab;
5. verify `main` SHA did not move;
6. verify GitHub Pages still sources `main /`;
7. verify the Vercel DEV preview returns the updated branch with HTTP 200 and noindex headers;
8. never claim production changed unless the user explicitly requested publication.
