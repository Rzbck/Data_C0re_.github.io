# DATA C0RE — INTERACTION / RESPONSIVE RULES

Persistent implementation rules for the compact V2 portfolio. Read together with `PROJECT_AI_CONTEXT.md` and `EDITORIAL_RULES.md` before changing navigation, archive interactions, responsive layouts or localized display copy.

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

## Responsive requirement
Every visual/site change must be considered at three levels before completion:
1. desktop / fine pointer
2. tablet / touch
3. phone / touch, including narrow screens around 360–390px

Localized FR/ES strings must never collide with adjacent columns or controls. Long display headings must scale rather than overflow. Contact is especially sensitive because the left display headline must never enter the form column.

## Archive interaction
Archive is the only complete catalogue and should feel interactive without becoming visually noisy.

Required interaction direction:
- filter by status;
- filter by project type;
- filter by year;
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
