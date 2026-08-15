# DATA C0RE — Responsive release checks

Production responsive verification must cover all public core routes and every project route in EN / FR / ES.

Automated Chromium matrix:
- 360 × 800 — small mobile
- 390 × 844 — mobile
- 768 × 1024 — iPad portrait
- 834 × 1194 — large tablet / iPad class
- 1024 × 768 — iPad landscape
- 1366 × 768 — laptop / short desktop
- 1920 × 1080 — desktop

Current route matrix: Home, Archive, CV, Contact, plus all project pages discovered from `en/projects/`, with exact route parity required in EN / FR / ES.

Checks include horizontal overflow, primary header and locale navigation, project block bounds, known clipping containers, and explicit SIGNAL pipeline visibility on touch/tablet layouts.

Do not consider a responsive release complete until this audit passes.
