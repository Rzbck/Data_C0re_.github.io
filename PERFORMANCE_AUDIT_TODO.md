# DATA C0RE — Performance audit / TODO

Baseline: `ca9916df5e58b90c5949d7340852d48d93eb0e63`

This roadmap keeps the current site direction and artistic behaviour while optimizing media, CPU/GPU work and runtime scheduling.

## Pass 1

- About: keep visible/near panel videos ready; pause and release distant panel media, then restore before entry. Preserve random segments and playback rates.
- LUMINA: keep the three simultaneous Experience views exactly as an artistic composition; detach heavy streams while far away, prewarm near the section, and release after leaving it.
- ASCII GLSL V17: preserve simulation, CSS palette, text/media collision precision and ×2 / ×4 / ×8 subdivisions; reduce expensive collision-mask rebuild scheduling and stop rebuilding only because the pointer moved.
- Localized routes: use a lightweight runtime on `/en/`, `/fr/`, `/es/` rather than re-running the complete translation dictionaries over already translated static HTML.
- SEO: prefer complete static metadata and only fill missing structured data, avoiding localized project metadata being replaced at runtime.
- Accessibility: consistent keyboard focus-visible styling and a skip link where missing.
- Video previews: pause hidden/offscreen previews and resume only when visible and active.

## Measurement pass

Profile desktop and mobile for homepage load, preview + GLSL interaction, About navigation, LUMINA Experience, language routing and long project pages.

Measure: LCP, INP, CLS, long tasks, dropped frames, video decode activity, media bytes, GPU/compositor load and `updateCollision()` duration/frequency.

Reference targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile.

## Phase 2 — media quality

Review project-detail media that is stretched, over-cropped, zoomed or visibly pixelated. Reframe with source-appropriate aspect ratios and stronger source assets without changing the site's visual direction.

For LUMINA, create silent display-sized derivatives for the large view and the two small views. If profiling still shows excessive decode pressure, test a synchronized one-decoder video atlas while preserving the same three visible windows.
