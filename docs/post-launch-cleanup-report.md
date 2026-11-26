# Post-launch UI and market-defaults report

Branch: `cleanup/login-and-market-defaults` (base `main` @ `c334a7c0`).
One PR, not merged. The live deployment clone at `~/projects/Vastukar` was
never switched, edited or restarted; all work happened in a separate worktree
with an isolated backend (`:8081`) and frontend dev server (`:5174`).

All user-visible strings removed or changed were mirrored across the 50 base
locale bundles (`en` included) plus the `en-US` overlay where present; the two
diff-only overlays `en-GB`/`en-US` inherit base keys by design.

## Item 1 — Login "Open Source" chip

- `frontend/src/features/auth/LoginPage.tsx`: removed the desktop eyebrow pill
  (hardcoded `Open Source`, no locale key) and the mobile `lg:hidden` banner
  (key `login.open_source_badge`). Removed unused Lucide imports `Github`,
  `Users`, `ArrowUpRight`.
- Collapsed the split `#1` hero into one `login.hero_tagline` key (see Item 6).
- Locale: deleted 6 keys across 50 bundles (`login.open_source_badge` and
  `login.hero_h_a/_b/_c`; the two replacement steps are counted in Item 6).
  Kept `login.benefit.open_source*` (live on `/register`) and
  `dashboard.open_source_badge` (live on the dashboard).
- `/login-next` had neither surface; its route and preview remain.

## Item 2 — Login "Connect us" row

- `LoginPage.tsx`: removed the two-card GitHub/Community row below the demo
  signups (links `https://github.com/Taha-Aalam/Vastukar` and
  `https://t.me/vastukar`), its comment and the adjacent mobile GitHub/domain
  footer. `ClassicAuthFooter` and the AGPL source link were kept.
- Locale: deleted `login.github`, `login.github_sub`, `login.community`,
  `login.community_sub` from all 50 bundles; removed the stale `login.github`
  entry from `scripts/i18n_leak_allowlist.json`.

## Item 3 — Community, completely

Removed:

- `frontend/src/features/about/AboutPage.tsx`: "Join the community" card and
  its Telegram/LinkedIn/X/G2 channels, the dead `#community` hash handler, and
  the Telegram tile in the network strip. The attribution/contributor wall
  (`about.thanks_*`, `acknowledgments.ts`) was kept.
- `frontend/src/features/modules/ModulesPage.tsx`: "Build Your Own Module"
  community section and its email/GitHub/Telegram CTAs.
- `backend/app/cli.py`: `COMMUNITY_URL` and the help line.
- 24 Community feature keys × 50 bundles (1,200 entries), including seven
  already-orphaned `modules.community_type_*`/`community_how` keys; removed
  `locales/||community_type_integration_desc` from
  `scripts/brand_token_allowlist.txt`.

There is **no backend Community module, API router/endpoint, DB model,
migration, permission, store, hook or `/community` route** — verified by grep
across `backend/app`, `backend/alembic`, permission code and the route
allowlist. No test existed only for the removed feature;
`frontend/src/app/layout/Sidebar.footer.test.tsx` is a shared guard that pins
GitHub/Community links absent from the sidebar, and was kept.

Entanglement reported, not removed:

1. Module category `"community"` in `module_loader.py`, `plugin_manager.py`,
   `schemas.py`, `module_package.py`, `module_builder/spec.py` and `service.py`,
   plus frontend `ModuleCategory`/draft/templates and their fixtures/tests.
   Deleting it breaks third-party module classification.
2. "DDC Community" converter brand, release URLs and copy; the converter
   installer depends on them.
3. Community wheel / `_COMMUNITY_PACKS` distribution, pack manifests,
   `test_community_packs_ship.py` and the Docker force-include guard.
4. Licensing "Community Edition"/AGPL text (legal identity), and domain
   vocabulary: Spanish autonomous communities, stakeholder `community_hotline`
   catalogue entries, "community park" demo data, "intra-community supply",
   `ag-grid-community`.
5. Attribution: `about.thanks_*`, `docs/legal/ACKNOWLEDGMENTS.md`.

`frontend/src/features/architecture/architecture_manifest.json` was
**regenerated** with `python scripts/generate_architecture_manifest.py` and
never hand-edited. The guard passes (244 modules, 237 frontend features).

## Item 4 — GitHub-pointer inventory (report only)

"Report a Bug" (`Header.tsx` `GITHUB_REPO`/`issues/new` builder, plus its
mailto and contact-form destinations) was deliberately left untouched.

Login/register pointers were removed by Items 1–2 / 5 and are marked REMOVED
below. Every other pointer was inventoried only.

| # | file:line | exact destination | rendered text / mount | data pre-filled |
|---|---|---|---|---|
| A1 | `LoginPage.tsx:1049`, `:1099`, `:1243`, `RegisterPage.tsx:488` | `github.com/Taha-Aalam/Vastukar` | GitHub card, two footers, About dialog | none — REMOVED |
| A2 | `Header.tsx:1192` | `github.com/Taha-Aalam/Vastukar` | Help menu "GitHub repository" on all authed routes | none — report only |
| A3 | `DashboardPage.tsx:2892` | same | dashboard open-source pill | none |
| A4 | `main.py:3540` → `DataSecurityPanel.tsx:257` | same (API `repository`) | "Source code"/"Open on GitHub" | none |
| A5 | `main.py:3322,3332` | same | public `GET /api/source`, `/api/docs` | none |
| A6 | `main.py:3333` | `github.com/datadrivenconstruction/cad2data-...` | `GET /api/source` projects field | none — upstream org |
| A7 | `cli.py:191,193` | `.../Vastukar/issues`, `.../Vastukar` | CLI help/doctor | none |
| A8 | `main.py:3626,3693,3698` | `github.com/{repo}/releases[/latest]` | version-check JSON (dormant in app) | none |
| A9 | `FeedbackDialog.tsx:26` | `.../Vastukar/issues/new` | "Or report on GitHub" | user's subject + description |
| A10 | `BetaBanner.tsx:21` | `.../issues/new` | "Send feedback" on 10 beta pages | none |
| A11 | `converterReleaseNotice.ts:12` → `ConverterReleaseNotice.tsx:53` | `.../issues/new?title=Converter:` | "Report a problem" on BIM/FileManager/Settings/DWG | format, converter + app version |
| A12 | `MatchWizardFlow.tsx:1257` | `.../issues/new?labels=match-elements` | "Open an issue" | fixed labels |
| A13 | `ModulesPage.tsx:1249` | `.../issues/new?labels=module-proposal` | "Propose on GitHub" | fixed title/label — REMOVED with Item 3 |
| A14 | `ThirdPartyLicenses.tsx:54` | `.../blob/main/NOTICE` | NOTICE link | none — REMOVED with Item 5a |
| A15 | `AboutPage.tsx:25,517,533,876` | `github.com/Taha-Aalam/Vastukar` | repo/ecosystem/"Star on GitHub" | none |
| A16 | `AboutPage.tsx:525,647,680` | `github.com/Taha-Aalam` | org/profile links, social button | none |
| A17 | `AboutPage.tsx:615,645` | `github.com/Taha-Aalam/Vastukar` | converter/pipeline cards | none |
| A18 | `AboutPage.tsx:1144,1146,1147,1167` | `.../tree/main/docs` | popular-doc links | none |
| A19 | `AboutPage.tsx:1145,1148,1149` | `.../blob/main/docs/...` | docs deep-links | none |
| A20 | `AboutPage.tsx:29,894,1337,1384`, `InsidePage.tsx:36,160` | `github.com/sponsors/Taha-Aalam` | Sponsor CTAs | none until donation |
| A21 | `acknowledgments.ts:28` (rendered in `AboutPage.tsx`) | `github.com/<contributor>` | contributor credit links | none — attribution |
| A22 | `BIMViewer.tsx:3494` | `github.com/datadrivenconstruction/cad2data-Revit-IFC-DWG` | "Learn more" | none |
| A23 | `BIMConverterStatusBanner.tsx:81-82,1428`, `AutoInstallConverterNotice.tsx:30-31`, `DwgTakeoffPage.tsx:200-201`, `SettingsPage.tsx:2474-2538` | upstream releases URL | manual-install fallbacks | none |
| A24 | `DwgTakeoffPage.tsx:3455`, `BIMPage.tsx:1951`, `CadDataExplorerPage.tsx:4059` | upstream DGN-pipeline repo | "Powered by Vastukar Converters 2.0" | none |
| A25 | `ProjectDetailPage.tsx:1291`, `QuantitiesPage.tsx:125-126,1195` | `github.com/Taha-Aalam/ddc-community-toolkit/releases` | converter download/error copy | none |
| A26 | `CesiumViewer.tsx:2118` | `github.com/CesiumGS/cesium/blob/main/LICENSE.md` | Cesium attribution | none — third-party licence |
| A27 | cost-match messages (33 backend locales, 49 frontend bundles) | plain-text `github.com` mention | connection-error toast | no link |
| A28 | `desktop/src-tauri/src/update_check.rs:50` etc. | `api.github.com/repos/Taha-Aalam/Vastukar/releases/latest` | on-demand update check | one anonymous GET, no user data |
| A29 | `index.html:51` | `github.com/Taha-Aalam/Vastukar` | JSON-LD `downloadUrl` | metadata only |
| A30 | `privacy-policy.html:58,59,85`, `terms.html:61` | `github.com/Taha-Aalam/Vastukar` | served policy/terms links | none |
| A31 | `splash.html` (~38 language blocks) | plain-text `github.com` | update-check explanation | none |

45 pointer sites were found in total (4 login/register, 41 elsewhere; 6 of
the latter are issue-filing channels adjacent to, but not the same as, the
protected Report a Bug menu; 8 point at the upstream `datadrivenconstruction`
org). Not user-visible and excluded: IATE allowlist prefixes, server-side
fetch hosts, CSP allowlist, tests, lockfiles, generated Tauri schemas, and
`docs/docs.html` (marketing-site source, not served by the app).

## Item 5 — Licensing surfaces and the company domain

### 5a Licensing UI removed

- About: "License & Open Source" card and the `ThirdPartyLicenses` panel
  (component file deleted; the `/api/v1/licenses/` endpoint is unchanged).
- Settings: whole "License & Plan" card (edition, AGPL link, commercial-license
  CTA); the member/self management cards remain.
- Buyer portal: AGPL link in the footer. Login/register AGPL source links and
  the `/api/source` endpoint remain as the AGPL source offer.
- Locale: removed 40 keys × 50 bundles (`about.license_*` 19,
  `about.third_party_*` 10, `settings.license_*` 11) and the stale
  `about.third_party_size` leak-allowlist entry.
- `LICENSE`, `NOTICE`, `AUTHORS.md`, `COPYRIGHT`, `CITATION.cff`, in-source
  licence headers and font-licence files were NOT touched.

### 5b Domain inventory

Before this PR: **715** literal occurrences (`vastukar[.]com`, case-insensitive)
across 150 files: 515 DISPLAY, 44 FUNCTIONAL, 4 LEGAL/ATTRIBUTION, 152
non-runtime (tests/docs/comments/docstrings). After: **220** occurrences across
70 files — zero in locale bundles and zero DISPLAY occurrences in app source,
HTML or exported metadata.

DISPLAY removed (495 literal occurrences total, including 393 locale
occurrences and 102 source/HTML/export/metadata occurrences):

- locale bundles: `header.news.source`, `header.news.cookie_note`,
  `about.book_cta`, `about.ddc_flagship_label`, `bug.channel_form_desc`,
  `header.subscribe.button_aria/title`, and the `<books>` domain fragment in
  `about.founder_bio_p2` across 43 bundles (all removed or rewritten).
- `frontend/index.html` canonical/OG/Twitter/JSON-LD URLs;
  `index.css --ddc-origin`; `App.tsx` console banner.
- About/register/auth/dashboard/help/modules/file-manager/settings links and
  footers, served `privacy-policy.html`/`terms.html` website links,
  `favicon.svg` `dc:source`, demo download banners, news/cookie links.
- Desktop failure-dialog "Installation help" URL fragments.
- Exported XLSX/IDS/COBie/PDF/SARIF producer and information-URI metadata.
- OpenAPI contact URL, startup docs log, demo read-only download text,
  CLI docs/troubleshooting URLs.

FUNCTIONAL — held for owner approval (nothing changed). What breaks if any
of these values is edited without a matching infrastructure change:

| Where | Value | Breaks if changed |
|---|---|---|
| `backend/app/core/demo_accounts.py:29,30,31,39,44`; `main.py:1516-1518,1567,1573,1579,1597,1624,1650,1653,5365`; `demo_admin.py:7`; `demo_cast.py:51,52`; `export_showcase_snapshot.py:162`; `LoginPage.tsx:318,319`; `LoginPageNext.tsx:185,186`; `cli.py:360,1957,2877` | demo login emails (27) | Seeded accounts no longer found; demo login, admin bootstrap, showcase ownership, redirects and printed credentials fail. |
| `backend/app/main.py:2410` | CORS origin | Browser calls from that origin are blocked. |
| `backend/app/config.py:725` | SMTP From address | Outgoing mail becomes undeliverable / fails SPF-DKIM. |
| `frontend/src/app/layout/SubscribeButton.tsx:27,49` | newsletter URL + `postMessage` origin | Subscription listener rejects every message; button opens the wrong target. |
| `frontend/src/features/translation/api.ts:41,42`; `backend/app/core/translation/downloader.py:64` | IATE dump allowlist prefixes | Operators can no longer import dictionary dumps hosted on that host. |
| `backend/app/modules/ai/ai_client.py:499` | OpenRouter `HTTP-Referer` | Requests lose the required referer or get mis-attributed. |
| `backend/app/modules/geo_hub/router.py:165` | basemap UA contact | Tile provider sees a contact-less UA; traffic can be throttled. |
| `backend/app/core/embedded_pg.py:78`; `frontend/src/shared/lib/converterReleaseNotice.ts:13` | diagnostics / converter-report contact | Reports and support diagnostics reach an unmonitored mailbox. |
| `backend/app/modules/takeoff/manifest_verifier.py:169,170` | signed manifest URLs (`pkg.` subdomain + fallback) | Converter installs cannot fetch manifest/signature; verification fails without `OE_MANIFEST_URL` or `OE_DISABLE_MANIFEST_VERIFY`. |
| `backend/app/core/email/templates.py:19` | remote email logo | Every outgoing HTML email loses its logo (also a de-facto open pixel). |
| `frontend/src/app/layout/Header.tsx:828,842,1134` | Report a Bug mailto / web-form hand-offs | Feedback and bug reports stop reaching the operator. Explicit owner carve-out: untouched here. |
| `BuyerPortalPage.tsx:1911,1914`; `privacy-policy.html:34,83`; `terms.html:29,59`; `desktop/src-tauri/src/main.rs` dialogs | support `info@` address | Support/diagnostic contact links stop working. |

LEGAL/ATTRIBUTION — held, untouched: `middleware/fingerprint.py:59`,
`main.py:2278` (`X-DDC-Author`), `main.py:3329` (AGPL source notice),
`desktop/src-tauri/Cargo.toml:5` (authors).

Non-runtime residue (tests, historical docs, comments, and XML-namespace
identifiers) is listed in the audit doc `docs/upstream-pointer-audit.md`;
no display string among them is rendered by the app.

## Item 6 — Tagline

The brief's plain-language "first-ranked" wording does not exist in this
tree; the shipped variants used the `#1` glyph. Replaced all of them with exactly:

> The first construction ERP designed from the ground up for the agentic era: a construction ERP for human teams and their AI agents.

Changed `about.tagline`, `dashboard.open_source_badge`, the new
`login.hero_tagline` (replacing three `login.hero_h_*` keys), the inline
`defaultValue`s in `AboutPage.tsx`, `LoginPage.tsx` and `DashboardPage.tsx`,
and `index.html` meta/twitter descriptions. No `#1` branding string remains
in frontend source or locale bundles; four incidental "number one" phrases
in backend comments/tests are not taglines.

All ten Indian languages were translated in the bundles' existing style (Latin
`AI`/`ERP`, natural local phrasing, no `#1`) and the other 39 languages were
translated through the repository's Google `translate_a/t` pipeline with
validation. The `about.tagline` leak-baseline entry was removed because no
locale is now byte-identical to English.

## Item 7 — India defaults

### Market

The code fallback was **already India** (`DashboardMarketCasesCard.tsx`
`resolution.market ?? (markets.includes('IN') ? 'IN' : ...)`). The dashboard
card does not read the persisted `oe_cases_region` filter; that is used only by
the `/cases` hub. The United States the owner saw was **browser-region /
language detection** (`marketCases.ts` pack → browser region → language →
nearest, with `en-US` resolving to US before the fallback was reached), not a
persisted preference. Chip picks are transient `useState`, not storage.

The card now leads with India unconditionally, orders the market shelf with
India first, and describes the default/pick in neutral terms. Explicit chip
picks and the hub's persisted filter are untouched.

### Currency

Currency was an **account preference**, not a market or hardcoded default:
`usePreferencesStore.ts` `currency`/`defaultCurrency` defaulted to **EUR**,
stored in `oe_preferences`, with server `currency_code` hydration ignoring
empty values. New projects seed from that preference; BOQ/estimation and
punch-list had USD fallbacks when project currency was blank. Money display
uses `formatCurrency`/`MoneyDisplay` with `Intl.NumberFormat`; `en-IN` already
produces `₹12,34,567.89`.

Changed:

- default `currency`/`defaultCurrency` → `INR` for new/unset users; saved
  values (INR, USD or custom) still win on read, and empty server values are
  ignored, so a saved USD preference is preserved.
- visible INR/USD quick switch in `RegionalSettings.tsx`, writing through the
  existing `currency_code` patch path used by the full currency picker.
- blank project-currency fallbacks in BOQ (`cellRenderers.tsx`,
  `BOQModals.tsx`) and punch-list now follow the account preference.
- no stored amount is converted or re-denominated; the legacy backend DDL
  `server_default` was deliberately left alone (no migration).

## Verification

- Full `scripts/pre-push-gates.sh` (from `audit/pr-ci-failures`) run against
  this staged tree: **40 passed, 0 failed**. Named gates explicitly:
  **brand/tokens PASS**, **hygiene/architecture-manifest PASS** (regenerated,
  244 modules / 237 frontend features). An independent diff review found
  seven stale assertions in three touched test files; they were fixed and the
  affected suites re-run.
- All 19 i18n/locale guards pass (`check_i18n_orphan_keys.py`,
  `check_i18n_leak_baseline.py`, placeholder, plural, computed-key, script,
  mojibake, escape/diacritic, parse and render guards).
- Focused frontend tests: 127 passing across 9 touched test files (Node 24,
  vitest 4.1.12), including the India market card, INR preference, regional
  settings, cases navigation and all updated component tests.
- Grep evidence: zero DISPLAY `vastukar[.]com` occurrences; zero Community
  feature references outside the entanglement notes; zero `#1` tagline
  variants in frontend source or locale bundles.
- **Not run locally:** the full frontend suite (vitest worker OOM on this
  host) and the CI typecheck/build. The PR's CI is the evidence for those.

## Screenshots

Before (live deployment, `c334a7c0`) / after (worktree `cleanup/
login-and-market-defaults`), 1440×900:

| View | Before | After |
|---|---|---|
| Login page | [before-login.png](screenshots/before-login.png) | [after-login.png](screenshots/after-login.png) |
| Dashboard | [before-dashboard.png](screenshots/before-dashboard.png) | [after-dashboard.png](screenshots/after-dashboard.png) |
| Dashboard market card | [before-dashboard-market.png](screenshots/before-dashboard-market.png) | [after-dashboard-market.png](screenshots/after-dashboard-market.png) |

`after-dashboard-market.png` shows `data-market="IN"`, `data-source="default"`
("Cases by market / India"). The "before" dashboard shows "All cases for
United States (10)" matched to the browser region.


## Follow-up Part A — humanized tagline (owner decision)

Supersedes the Item 6 line. Replaced it verbatim with:

> The first construction ERP designed from the ground up for the agentic era: a construction ERP for human teams and their AI agents.

Applied in exactly the Item 6 surfaces: `about.tagline`,
`dashboard.open_source_badge` and `login.hero_tagline` in all 50 base bundles
(with the `en-US` overlay inheriting), the inline `defaultValue`s in
`AboutPage.tsx`, `LoginPage.tsx` and `DashboardPage.tsx`, the `description`
and `twitter:description` metadata in `index.html`, and the DashboardPage
loading-state snapshot. The ten Indian languages were re-translated by hand
in the bundles' existing style (Latin AI/ERP, natural local phrasing); the
colon is rendered with local punctuation where appropriate. All other bundles
were re-translated through the repository's `translate_a/t` pipeline and
checked for ASCII apostrophes, invisible characters and script mixing. Key
sets are unchanged — only values changed — so key parity holds.

Files changed in Part A:

Locale bundles (50 base bundles plus the `en-US` overlay):
- frontend/src/app/locales/ar.ts
- frontend/src/app/locales/bg.ts
- frontend/src/app/locales/bn.ts
- frontend/src/app/locales/cs.ts
- frontend/src/app/locales/da.ts
- frontend/src/app/locales/de.ts
- frontend/src/app/locales/el.ts
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
- frontend/src/app/locales/gu.ts
- frontend/src/app/locales/he.ts
- frontend/src/app/locales/hi.ts
- frontend/src/app/locales/hr.ts
- frontend/src/app/locales/hu.ts
- frontend/src/app/locales/id.ts
- frontend/src/app/locales/it.ts
- frontend/src/app/locales/ja.ts
- frontend/src/app/locales/kk.ts
- frontend/src/app/locales/kn.ts
- frontend/src/app/locales/ko.ts
- frontend/src/app/locales/ky.ts
- frontend/src/app/locales/ml.ts
- frontend/src/app/locales/mn.ts
- frontend/src/app/locales/mr.ts
- frontend/src/app/locales/nl.ts
- frontend/src/app/locales/no.ts
- frontend/src/app/locales/pa.ts
- frontend/src/app/locales/pl.ts
- frontend/src/app/locales/pt-BR.ts
- frontend/src/app/locales/pt.ts
- frontend/src/app/locales/ro.ts
- frontend/src/app/locales/ru.ts
- frontend/src/app/locales/sv.ts
- frontend/src/app/locales/ta.ts
- frontend/src/app/locales/te.ts
- frontend/src/app/locales/th.ts
- frontend/src/app/locales/tr.ts
- frontend/src/app/locales/uk.ts
- frontend/src/app/locales/ur.ts
- frontend/src/app/locales/uz.ts
- frontend/src/app/locales/vi.ts
- frontend/src/app/locales/zh.ts

Other files:
- DOWNSTREAM.md
- docs/post-launch-cleanup-report.md
- frontend/index.html
- frontend/src/features/about/AboutPage.tsx
- frontend/src/features/auth/LoginPage.tsx
- frontend/src/features/dashboard/DashboardPage.tsx
- frontend/src/tests/__snapshots__/visual-regression.test.tsx.snap

Grep evidence: zero occurrences of the superseded India line; zero
occurrences of the un-humanized draft variant using an em dash after
"agentic era"; 12 occurrences of the approved line across 8 files (the three
English bundle keys, the three inline defaults, two meta descriptions, this
report and DOWNSTREAM.md — the translated bundles carry in-language values).
All 19 i18n/locale guards pass on this tree.


## Follow-up Part B — backend-postgres timeout diagnosis

Verified facts: on head `58a341b3` the `backend-postgres` job in run
45620318104 (job `139260087028`) failed after 56m19s (14:03:38Z → 14:59:57Z);
a same-head job re-run also hit the timeout. The same lane on main is green on
the last three CI (PostgreSQL) runs, including `45592439680`
(2026-11-25, success); PR #17 is based on that main (`c334a7c0`). The two
cancelled ci-postgres runs on this branch were superseded-head cancellations
and carry no verdict.

### Named test and first error lines

The lane command in `.github/workflows/ci-postgres.yml` is:

    pytest tests/pg -q -rs -p no:cacheprovider --timeout=300 --timeout-method=thread

The `-q` dots hide the node id, but the captured log names the test via its
pytest temp directory:

    log:673  ##[group]Run pytest tests/pg -q -rs -p no:cacheprovider --timeout=300 --timeout-method=thread
    log:698  ............................................+++++++++++++++++++++++++++++++++++ Timeout ++++++++++++++++++++++++++++++++++++
    log:711  /tmp/pytest-of-runner/pytest-1/test_every_demo_project_gets_p0/bim/...

The truncated temp-dir name expands to
`tests/pg/test_demo_projects_get_permits_and_design_data.py::test_every_demo_project_gets_permits_and_design_rows`.
That test carries `@pytest.mark.timeout(1500)`, which overrides the lane's
300-second default — the job timed out at the 1500-second marker, not at 300.

The MainThread stack at the timeout is in demo-seed code, not in any file
this PR touched:

    File ".../backend/app/modules/plant_register/seed.py", line 726, in _order_before_the_gate
      await svc.update_item(project_id, item_id, ...)
    File ".../backend/app/modules/plant_register/service.py", line 308, in catalogue
      return await resolve_catalogue(...)
    File ".../backend/app/modules/plant_register/repository.py", line 51, in settings
      return (await self.session.execute(stmt)).scalar_one_or_none()
    .../asyncpg/connresource.py, line 20, in _check
    .../asyncpg/prepared_stmt.py, line 275, in _check_open

i.e. an asyncpg prepared-statement / connection wait during plant-register
demo enrichment.

### Local reproduction on this head and on main

Exact command (worktree backend on `PYTHONPATH`, embedded PostgreSQL via
`OE_TEST_DB=pg`), named test file first:

    OE_TEST_DB=pg PYTHONPATH=<worktree>/backend python -m pytest \
      tests/pg/test_demo_projects_get_permits_and_design_data.py \
      -q -rs -p no:cacheprovider --timeout=300 --timeout-method=thread

| Tree | Run | Result | pytest time | wall time |
|---|---|---|---:|---:|
| PR head `58a341b3` | first | 1 passed | 1345.73s (22:25) | 1355.41s |
| PR head `58a341b3` | same-head re-run | 1 passed | 1199.43s (19:59) | 1208.75s |
| main `c334a7c0` (detached worktree) | baseline | 1 passed | 1197.34s (19:57) | 1206.68s |

All three completed below the test's 1500s marker; the second same-head run
is within two seconds of main. The full `tests/pg` lane was not re-run
locally: it takes well over an hour in CI, and the named test plus its file
is the timeout site.

### Causal chain and classification

`git diff c334a7c0..58a341b3 --name-only -- backend` lists 13 files: CLI help
text, `demo_read_only.py` display copy, `main.py` OpenAPI contact URL and
startup log, and ten exporter/PDF/SARIF metadata strings. **Zero** files in
`backend/app/modules/plant_register/`, `backend/app/core/demo_enrichment.py`,
`backend/app/core/demo_projects.py` or `backend/tests/pg/` were changed by
this PR. The candidate areas are ruled out as follows:

- currency/market defaults: frontend stores/components only;
- removed locale keys: frontend bundles only (backend has its own 38 JSON
  catalogues, untouched);
- removed licensing/community surfaces: frontend components, CLI text and
  OpenAPI display metadata — no demo seed path;
- demo-domain display removals: contact/log/metadata strings only — no
  seeded value or identity changed.

Classification: **(iv) flake/environment**, evidence-gated — not (i) stale
encoding, not (ii) real regression, not (v) pre-existing on main. The evidence
is the passing same-head test twice with timings (including a re-run within
2s of main), the stack in an unchanged asyncpg lock-wait path, and green main
runs of the same lane. The CI timeout is a runner-specific slowdown/hang near
the test's 1500s ceiling; "timeout" alone is not a classification. Per the
instruction for class (iv), no code was changed for Part B: raising the
timeout or deleting the test would mask rather than fix a cause, and this PR
has no causal change to fix.
