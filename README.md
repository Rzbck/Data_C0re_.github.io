# DATA C0RE — GitHub Pages Portfolio

Static portfolio site prepared for GitHub Pages.

## Structure

- `index.html` — site entry point at repository root
- `assets/css/styles.css` — visual system / responsive layout
- `assets/js/main.js` — menu, reveal behaviour, motion controls, video visibility management
- `assets/media/` — curated stills and short optimized video loops
- `assets/img/` — favicon / social cover artwork
- `.nojekyll` — asks GitHub Pages to publish the static files as-is

All internal asset paths are **relative**, so the site works both as a user site and as a repository/project GitHub Pages site.

## Deploy

Push the contents of this folder to the publishing root of the GitHub Pages repository (for example the root of `main` if Pages is configured to deploy from that branch/root).

No build command, Node dependency, backend, database or server-side language is required.

## Local preview

From this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Domain

No `CNAME` file or custom-domain configuration is included yet. Add that later when `datac0re.is-a.dev` is ready.

## Content note

The Comédie de Genève entry is deliberately framed as creation-period / production-context documentation. The public production title `Entre chien et loup` is included, but no unverified individual credit is claimed.
