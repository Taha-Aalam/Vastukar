# Vastukar

Product name: Vastukar

Upstream: https://github.com/datadrivenconstruction/OpenConstructionERP

Baseline upstream commit: 3a4a12699d52b505f2060514f5aecd90963f3863
Last-synced upstream commit: 3a4a12699d52b505f2060514f5aecd90963f3863

Scope: upstream main only. Upstream branches, tags and pull requests are not
copied or tracked. A pull request counts only once it is merged into main.

Relationship: this repository is a direct file copy of upstream main with its
own fresh git history. The two repositories share no merge base. Syncs from
upstream are hand-ports, never merges, rebases or cherry-picks.

Licence: AGPL-3.0. The upstream licence and attribution files are unchanged.

## Divergences — branding rename

Commit 2 renames the displayed product name "OpenConstructionERP" to
"Vastukar" in user- and reader-facing display locations only: the README title
and header text, documentation titles and headings, frontend page titles, headers,
about/login page strings and the backend API title. Package names, import paths,
module and directory names, API routes, database names, environment variable names,
licence and attribution files, and source licence headers are unchanged.

Files changed in this step:

- CONTRIBUTING.md
- DEVELOPING.md
- README.md
- backend/README.md
- backend/app/config.py
- data/catalog/README.md
- deploy/docker/README.md
- deploy/terraform/stackit/README.md
- desktop/README.md
- docs/INSTALL_LINUX.md
- docs/README.md
- docs/api/README.md
- docs/desktop/INSTALL.md
- docs/install/autostart/README.md
- docs/install/azure.de.md
- docs/install/azure.md
- docs/install/azure.ru.md
- docs/platform/README.md
- docs/release/RELEASE_NOTES_v6.4.2.md
- docs/rfc/README.md
- docs/standards/GAEB.md
- frontend/README.md
- frontend/index.html
- frontend/src/app/layout/AppLayout.tsx
- frontend/src/app/layout/CustomBranding.tsx
- frontend/src/app/locales/ar.ts
- frontend/src/app/locales/bg.ts
- frontend/src/app/locales/bn.ts
- frontend/src/app/locales/cs.ts
- frontend/src/app/locales/da.ts
- frontend/src/app/locales/de.ts
- frontend/src/app/locales/el.ts
- frontend/src/app/locales/en-GB.ts
- frontend/src/app/locales/en-US.ts
- frontend/src/app/locales/en.ts
- frontend/src/app/locales/es-CL.ts
- frontend/src/app/locales/es-CO.ts
- frontend/src/app/locales/es-MX.ts
- frontend/src/app/locales/es.ts
- frontend/src/app/locales/et.ts
- frontend/src/app/locales/fa.ts
- frontend/src/app/locales/fi.ts
- frontend/src/app/locales/fil.ts
- frontend/src/app/locales/fr.ts
- frontend/src/app/locales/he.ts
- frontend/src/app/locales/hi.ts
- frontend/src/app/locales/hr.ts
- frontend/src/app/locales/hu.ts
- frontend/src/app/locales/id.ts
- frontend/src/app/locales/it.ts
- frontend/src/app/locales/ja.ts
- frontend/src/app/locales/kk.ts
- frontend/src/app/locales/ko.ts
- frontend/src/app/locales/ky.ts
- frontend/src/app/locales/mn.ts
- frontend/src/app/locales/nl.ts
- frontend/src/app/locales/no.ts
- frontend/src/app/locales/pl.ts
- frontend/src/app/locales/pt-BR.ts
- frontend/src/app/locales/pt.ts
- frontend/src/app/locales/ro.ts
- frontend/src/app/locales/ru.ts
- frontend/src/app/locales/sv.ts
- frontend/src/app/locales/th.ts
- frontend/src/app/locales/tr.ts
- frontend/src/app/locales/uk.ts
- frontend/src/app/locales/ur.ts
- frontend/src/app/locales/uz.ts
- frontend/src/app/locales/vi.ts
- frontend/src/app/locales/zh.ts
- frontend/src/features/about/AboutPage.tsx
- frontend/src/features/auth/LoginPage.tsx
- frontend/src/features/auth/LoginPageNext.tsx
- frontend/src/features/auth/RegisterPage.tsx
- frontend/src/features/onboarding/OnboardingWizard.tsx
- frontend/src/shared/ui/Logo.tsx
- llms.txt
- packs/aus/README.md
- packs/batimatech-ca/README.md
- packs/doker-formwork/README.md
- packs/nzs/README.md
- packs/saudi-vision2030/README.md
