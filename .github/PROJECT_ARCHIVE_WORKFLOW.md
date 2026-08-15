# DATA C0RE — project archive workflow

This file is an editorial and production guard for future project additions.

## Public structure

- `Work` foregrounds only projects that were actually built, installed, delivered, performed or operated.
- `Archive` is the chronological master index for all documented project pages.
- `Lab` contains simulation, R&D and studies. It must never imply that a simulation was installed in situ.
- Every substantial project keeps its own case-study page under `projects/`.

## Project status vocabulary

Use one primary status:

- `realized` — built / installed / delivered / performed / operated.
- `simulation` — technical or spatial model; no physical deployment claim.
- `research` — R&D thread or experimental system.
- `study` — bounded visual / technical study.

The canonical metadata list is `data/project-registry.json`.

## New project checklist

1. Add the project to `data/project-registry.json`.
2. Create one project page from the existing project-page structure.
3. State year, status, actual role, tools and system in plain language.
4. Add it to `Archive` chronologically.
5. Add it to `Work` only if status is `realized`.
6. Add it to `Lab` only if it is simulation / research / study.
7. Add it to Home only when it is both realized and strong enough for the selected set.
8. Keep mobile/tablet layouts and reduced-motion behaviour working.

## Confidential client work

Before anything can move to production:

- remove client and partner names when disclosure is not approved;
- remove exact venue / address / identifying site details;
- remove internal IPs, credentials, network topology and operational secrets;
- avoid exact wiring / controller maps when they expose the deployment;
- distinguish current implementation from target architecture;
- do not invent unresolved hardware or implementation details;
- use a neutral project title when required.

SIGNAL is the current reference example: it is described as a simulation / R&D system and does not claim an installed deployment.

## Git branches

- all development work goes to `dev`;
- `main` remains production;
- production publication only happens after explicit approval to merge / publish.
