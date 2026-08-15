# DATA C0RE — AI / DEVELOPMENT CONTEXT

Updated: 2026-08-15

**READ THIS FILE BEFORE ANY PORTFOLIO WRITE.**

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
- The preview is a lightweight proxy that reads files directly from:
  `https://raw.githubusercontent.com/Rzbck/Data_C0re_.github.io/dev/...`
- Therefore normal content commits to `dev` appear through the stable preview without publishing `main`.
- Preview responses send: `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` and `Cache-Control: no-store`.
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

## Current editorial architecture

Keep the public-facing structure simple.

### HOME
The landing page must answer quickly:
1. What does DATA C0RE do?
2. What has DATA C0RE actually delivered / operated?
3. With which institutions, collectives and venues?
4. In which places / production contexts?
5. What are the concrete technical capabilities?
6. Where can the visitor go next?

HOME should foreground realized professional / collaborative contexts, not experiments.

Priority proof / contexts:
- LUMINA / Geneva Lux / StripLab — Geneva — collaborative public installation; realtime systems and integration.
- Grand Théâtre de Genève — Geneva — SMODE programming, projection integration, cues, calibration.
- Comédie de Genève — Geneva + touring context — theatre video, creation, touring adaptation, operation.
- Hardwinner / La Belle Électrique — Grenoble — collaborative live AV systems; TouchDesigner, GLSL, Resolume, LED / DMX.
- Fun Radio Party — Chambéry — realtime video and lighting system; TouchDesigner / Resolume / video-light synchronization.

Core capabilities to communicate without repeating them everywhere:
- TouchDesigner / realtime audiovisual systems
- SMODE / projection / geometric adaptation / calibration
- Resolume / live AV / stage video
- LED / DMX / Art-Net / show control / video-light synchronization
- system design / networked media / onsite integration
- Fusion 360 / fabrication coordination where relevant

### WORK
`Work` contains the strongest realized / delivered / operated case studies.
Do not pad it with experiments just to increase project count.

### ARCHIVE
`Archive` is the single place for the broader catalogue. It includes both realized history and R&D / studies / simulations, clearly status-labelled.

### LAB
Do not maintain Lab as a separate top-level information architecture. It created unnecessary overlap with Archive. Research, prototypes, simulations and studies belong inside Archive.
Legacy `lab.html` can redirect / point to Archive and should not be a main navigation item.

### Research / archive-only material
Do NOT foreground these on the landing page:
- Snake / Networked Retro System — treat editorially as R&D / interactive software prototype for current public hierarchy.
- ASCII / Pixel Realtime Study — study / R&D.
- Realtime Studies — R&D.
- SIGNAL — simulation / R&D only; not installed.
- Cloud Processing / GLSL and other studies — archive material unless a specific application needs them.

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
3. verify `main` SHA did not move;
4. verify GitHub Pages still sources `main /`;
5. verify the Vercel DEV preview returns the updated branch with HTTP 200;
6. never claim production changed unless the user explicitly requested publication.
