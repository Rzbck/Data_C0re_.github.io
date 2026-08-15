# DATA C0RE — INTERACTION / RESPONSIVE RULES

Persistent implementation rules for the compact V2/V3 portfolio. Read together with `PROJECT_AI_CONTEXT.md` and `EDITORIAL_RULES.md` before changing navigation, archive interactions, responsive layouts or localized display copy.

## Branch / preview
- Active work is always written explicitly to `dev`.
- `main` remains production until the user explicitly asks to publish.
- Browser QA uses `https://datac0re-dev-preview.vercel.app/`.

## Primary header
The three surviving primary destinations must remain directly accessible in the fixed header on every real page:
- Archive
- CV
- Contact

Do not hide these three links on tablet or phone. The current destination is highlighted with the acid/yellow accent. The DATA C0RE brand returns Home.

The INDEX overlay is secondary. On very small phones it may be hidden if needed to preserve the three primary links and language switcher without overflow.

## Home fullpage / magnets
The compact Home must retain the site's fluid fullpage/magnetic navigation language instead of becoming a conventional long static landing page.

Desktop / fine pointer direction:
- Panel 1 = audiovisual Hero.
- Panel 2 = practice + geographic scope + compact references.
- Panel 3 = capabilities + reusable topic tags + primary Archive / Contact gates.
- Wheel, trackpad and keyboard navigation snap magnetically between these logical panels through the existing fullpage system.
- Compact reference links use subtle pointer magnets.
- The large Archive / Contact gates also use restrained magnetic displacement; interaction must not change page geometry.
- Fullpage composition must remain stable on short desktop viewports; reduce typography/spacing before allowing overflow.

Tablet / touch / phone direction:
- keep native readable scrolling when content is taller than the viewport;
- do not depend on magnetic pointer effects;
- touch snapping may only occur when a panel fits or when the user has actually reached the edge of a taller panel;
- never trap touch scrolling inside a fullpage animation.

## Link semantics: project vs tag
This distinction is mandatory everywhere on the site:
- a named project, venue or production reference such as `Comédie de Genève`, `Grand Théâtre de Genève` or `Geneva Lux` links to that project's canonical detail page;
- a reusable topic/technology/location label such as `theatre video`, `TouchDesigner`, `projection`, `DMX`, `Geneva` or `touring` links to Archive with `?tag=<slug>` and activates that tag filter;
- do not route a named project to a one-project Archive filter when a canonical project page already exists.

## Project taxonomy
`data/project-taxonomy.json` is the persistent source of reusable project metadata.

Tag categories currently include:
- location;
- context;
- discipline;
- tool;
- protocol;
- system.

Each Archive project receives `data-archive-tags` from this taxonomy. Future projects should extend the taxonomy rather than hard-code filter words into Home or Archive markup. Tags may be used for filters, Home navigation, future visualisations, statistics or other interfaces without needing to be visibly printed on every project row.

Only tag a fact that is actually supported by the project documentation. Do not infer a protocol, venue, technology or location merely to fill the taxonomy.

## Responsive requirement
Every visual/site change must be considered at three levels before completion:
1. desktop / fine pointer
2. tablet / touch
3. phone / touch, including narrow screens around 360–390px

Localized FR/ES strings must never collide with adjacent columns or controls. Long display headings must scale rather than overflow. Contact is especially sensitive because the left display headline must never enter the form column.

## Archive interaction
Archive is the only complete catalogue and should feel interactive without becoming visually noisy.

Required interaction direction:
- keep one status control layer only; do not duplicate the status legend immediately above the status filter buttons;
- filter by status;
- filter by project type;
- filter by year;
- filter by reusable taxonomy tag;
- accept `?tag=<slug>` deep links and immediately show the matching Archive results;
- update results immediately without navigation;
- desktop/fine pointer: project rows reveal their associated poster/video as a background layer on hover/focus;
- touch/tablet/phone: no hover-dependent video playback; use a restrained static poster/background when available;
- archive media must not change row geometry or make text unreadable;
- video assets should load only when needed on desktop, not all at page load;
- filters/buttons may use subtle magnetic response on fine-pointer desktop only.

## Motion / performance
- Never require hover to understand or access content.
- Respect `prefers-reduced-motion` and the site motion toggle.
- Do not autoplay archive hover videos on touch devices.
- Do not introduce layout shifts when media activates.
- Keep filter controls keyboard accessible and preserve visible focus states.

## Contact
- Maintain the secure contact form as the only public contact method.
- Do not expose a direct email address.
- Check EN/FR/ES independently for overflow.
- Spanish headings and labels are often longer and need explicit responsive protection.
