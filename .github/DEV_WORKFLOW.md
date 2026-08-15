# DATA C0RE — Development workflow

## Branch rule

All ongoing portfolio development work must be committed to the `dev` branch.

- `dev` = development / experiments / redesign / archive / new projects / drafts.
- `main` = production only, published at `https://datac0re.is-a.dev/`.
- Do not write to `main` unless the user explicitly asks to publish / merge the validated `dev` version.
- GitHub Pages must remain sourced from `main` only.
- Production SEO workflows (localized build, sitemap, IndexNow) must remain tied to `main`.

## Assistant operating rule

For every GitHub write during development, explicitly target `branch: dev`.
Never rely on an implicit/default branch for writes.

Created to prevent accidental production changes while the next portfolio architecture is being developed.
