# CI Audit — Vastukar (`Taha-Aalam/Vastukar`)

**Report only.** No workflow, job, or setting was edited, deleted, or disabled. This is the categorization step; removal is a separate, later decision.

- **Audited tree:** branch `main`, commit `b04178d9` (Merge PR #13). The repo's default branch is `main`; there is no `master` branch. The brief's "push to master" is read as **push to `main`** throughout, and confirmed against run history.

- **Method:** all 26 files in `.github/workflows/` parsed; job/leg durations from the GitHub REST API (public repo, unauthenticated) via per-commit `check-runs` for the last 10 PR head commits and all 6 recorded `main` push commits, plus per-workflow run history for path-filtered lanes. Median = median of the last ≤10 *completed* (success/failure) runs of each job/leg, any event; `n` = sample count. Skipped/cancelled runs excluded from medians.

- **Baseline (owner-confirmed, verified here):** the latest `main` push (`b04178d9`, 2026-11-19) ran **53 push-event jobs, 0 non-success** — fully green. Older failures on earlier commits, and the red nightly `CI Full Suite` lane (see §3), are history, not investigation targets.

- **Concurrency context:** the account ceiling is ~20 concurrent jobs (measured in `ci-full.yml` comments). `ci.yml` alone fans to ~20 jobs per push; this is why the full suite is nightly, not per-push.


## Reconciliation with "~50 jobs"

A real PR shows **50 check entries**, which decompose exactly as:

- **44 unique GitHub Actions jobs** fire on every PR (7 workflows: CI, CI (PostgreSQL), Repo hygiene, CodeQL, Authors Guard, Dependency Review, Secret scan).

- **+4 duplicate entries**: `Repo hygiene` (3 jobs) and `Secret scan` (1) trigger on **both** `pull_request` and `push` (any branch), so a same-repo PR branch push runs them twice — the PR checks UI lists both.

- **+2 non-Actions app checks**: `CodeQL` (github-advanced-security summary) and `GitGuardian Security Checks` (GitGuardian app).

- **44 + 4 + 2 = 50.** Path-filtered workflows (Converter pins, Eval quick, Terraform) add up to 3 more only when a PR touches their paths; none of the last 10 PRs did.

A push to `main` fires **43 unconditional jobs**, rising to **53** when `desktop/**` paths are touched (Desktop Compile Check adds 10), and up to ~59 with all path-filtered lanes. So "~50 on every PR and every push" reconciles: **PR 44–50, push 43–53+**.


**Total distinct job/legs inventoried (union of PR-capable and push-capable): 61.** Categories: A=31, B=6, C=22, D=2.


## Section 1 — Job inventory

One row per job/leg. "PR path" = does it run on the PR critical path (every PR), only on matching paths (conditional), or not on PRs at all. **No job literally blocks a merge today**: `ci-postgres.yml:830-835` records that `main` carries *no required status checks* (see §4.4) — "PR path" means it contributes to the PR's green, not that it is an enforced merge gate. Matrix legs are listed separately with their own durations.


| # | Job / leg | Workflow · job | Fires on | Runner (OS) | Median (n) | PR path | Cat | Serves |
|--:|---|---|---|---|--:|---|:--:|---|
| 1 | Backend CI | `ci.yml` · `backend-gate` | PR + push | ubuntu-latest (Linux) | 3s (10) | every PR | A | both |
| 2 | Backend CI (macos-latest, embedded PG, shard 1/3) | `ci.yml` · `backend-cross-os` | PR + push | macos-latest (macOS) | 20m54s (10) | every PR | C | upstream |
| 3 | Backend CI (macos-latest, embedded PG, shard 2/3) | `ci.yml` · `backend-cross-os` | PR + push | macos-latest (macOS) | 19m42s (10) | every PR | C | upstream |
| 4 | Backend CI (macos-latest, embedded PG, shard 3/3) | `ci.yml` · `backend-cross-os` | PR + push | macos-latest (macOS) | 18m32s (10) | every PR | C | upstream |
| 5 | Backend CI (shard 1/6) | `ci.yml` · `backend` | PR + push | ubuntu-latest (Linux) | 9m20s (10) | every PR | A | both |
| 6 | Backend CI (shard 2/6) | `ci.yml` · `backend` | PR + push | ubuntu-latest (Linux) | 13m48s (10) | every PR | A | both |
| 7 | Backend CI (shard 3/6) | `ci.yml` · `backend` | PR + push | ubuntu-latest (Linux) | 7m46s (10) | every PR | A | both |
| 8 | Backend CI (shard 4/6) | `ci.yml` · `backend` | PR + push | ubuntu-latest (Linux) | 11m00s (10) | every PR | A | both |
| 9 | Backend CI (shard 5/6) | `ci.yml` · `backend` | PR + push | ubuntu-latest (Linux) | 8m53s (10) | every PR | A | both |
| 10 | Backend CI (shard 6/6) | `ci.yml` · `backend` | PR + push | ubuntu-latest (Linux) | 12m52s (10) | every PR | A | both |
| 11 | Backend CI (windows-latest, embedded PG, shard 1/3) | `ci.yml` · `backend-cross-os` | PR + push | windows-latest (Windows) | 23m38s (10) | every PR | C | upstream |
| 12 | Backend CI (windows-latest, embedded PG, shard 2/3) | `ci.yml` · `backend-cross-os` | PR + push | windows-latest (Windows) | 20m43s (10) | every PR | C | upstream |
| 13 | Backend CI (windows-latest, embedded PG, shard 3/3) | `ci.yml` · `backend-cross-os` | PR + push | windows-latest (Windows) | 22m40s (10) | every PR | C | upstream |
| 14 | Block zero-width Unicode characters | `ci.yml` · `zero-width-guard` | PR + push | ubuntu-latest (Linux) | 28s (10) | every PR | A | both |
| 15 | Brand Token Check | `ci.yml` · `brand-check` | PR + push | ubuntu-latest (Linux) | 1m52s (10) | every PR | A | downstream |
| 16 | Frontend CI (macos-latest) | `ci.yml` · `frontend` | PR + push | macos-latest (macOS) | 61m26s (10) | every PR | C | upstream |
| 17 | Frontend CI (ubuntu-latest) | `ci.yml` · `frontend` | PR + push | ubuntu-latest (Linux) | 31m06s (10) | every PR | A | downstream |
| 18 | Frontend CI (windows-latest) | `ci.yml` · `frontend` | PR + push | windows-latest (Windows) | 45m00s (10) | every PR | C | upstream |
| 19 | Tenant Isolation / IDOR | `ci.yml` · `tenant-isolation` | PR + push | ubuntu-latest (Linux) | 60m56s (10) | every PR | A | both |
| 20 | Version Sync Check | `ci.yml` · `version-sync` | PR + push | ubuntu-latest (Linux) | 39s (10) | every PR | D | both |
| 21 | API smoke on a fresh install | `ci-postgres.yml` · `api-smoke` | PR + push | ubuntu-latest (Linux) | 6m24s (10) | every PR | A | both |
| 22 | Eleven areas pack API stability | `ci-postgres.yml` · `elf-qa-api` | PR + push | ubuntu-latest (Linux) | 8m58s (10) | every PR | A | both |
| 23 | Frontend tests that block a merge | `ci-postgres.yml` · `frontend-tests` | PR + push | ubuntu-latest (Linux) | 4m46s (10) | every PR | D | both |
| 24 | Object ownership and cross-tenant access | `ci-postgres.yml` · `access-control` | PR + push | ubuntu-latest (Linux) | 28m49s (10) | every PR | A | both |
| 25 | Pack cost bases (shard 1/3) | `ci-postgres.yml` · `cost-bases` | PR + push | ubuntu-latest (Linux) | 12m40s (10) | every PR | B | both |
| 26 | Pack cost bases (shard 2/3) | `ci-postgres.yml` · `cost-bases` | PR + push | ubuntu-latest (Linux) | 12m30s (10) | every PR | B | both |
| 27 | Pack cost bases (shard 3/3) | `ci-postgres.yml` · `cost-bases` | PR + push | ubuntu-latest (Linux) | 12m24s (10) | every PR | B | both |
| 28 | Pack installs (shard 1/6) | `ci-postgres.yml` · `pack-installs` | PR + push | ubuntu-latest (Linux) | 7m28s (10) | every PR | A | both |
| 29 | Pack installs (shard 2/6) | `ci-postgres.yml` · `pack-installs` | PR + push | ubuntu-latest (Linux) | 6m20s (10) | every PR | A | both |
| 30 | Pack installs (shard 3/6) | `ci-postgres.yml` · `pack-installs` | PR + push | ubuntu-latest (Linux) | 5m38s (10) | every PR | A | both |
| 31 | Pack installs (shard 4/6) | `ci-postgres.yml` · `pack-installs` | PR + push | ubuntu-latest (Linux) | 6m06s (10) | every PR | A | both |
| 32 | Pack installs (shard 5/6) | `ci-postgres.yml` · `pack-installs` | PR + push | ubuntu-latest (Linux) | 4m28s (10) | every PR | A | both |
| 33 | Pack installs (shard 6/6) | `ci-postgres.yml` · `pack-installs` | PR + push | ubuntu-latest (Linux) | 4m44s (10) | every PR | A | both |
| 34 | Packs in the installed wheel | `ci-postgres.yml` · `pack-wheel` | PR + push | ubuntu-latest (Linux) | 1m10s (10) | every PR | B | both |
| 35 | Upgrade from the previous release | `ci-postgres.yml` · `upgrade-from-previous-release` | PR + push | ubuntu-latest (Linux) | 5m00s (10) | every PR | B | both |
| 36 | backend-postgres | `ci-postgres.yml` · `backend-postgres` | PR + push | ubuntu-latest (Linux) | 69m17s (10) | every PR | A | both |
| 37 | Commit history guards | `repo-hygiene.yml` · `commit-history` | PR + push | ubuntu-latest (Linux) | 26s (10) | every PR | A | both |
| 38 | Locale and i18n guards | `repo-hygiene.yml` · `i18n` | PR + push | ubuntu-latest (Linux) | 4m41s (10) | every PR | A | both |
| 39 | Whole-tree structural guards | `repo-hygiene.yml` · `structural` | PR + push | ubuntu-latest (Linux) | 6m25s (10) | every PR | A | both |
| 40 | Analyze (javascript-typescript) | `codeql.yml` · `analyze` | PR + push | ubuntu-latest (Linux) | 29m54s (10) | every PR | A | both |
| 41 | Analyze (python) | `codeql.yml` · `analyze` | PR + push | ubuntu-latest (Linux) | 6m46s (10) | every PR | A | both |
| 42 | authors-guard | `authors-guard.yml` · `authors-guard` | PR only | ubuntu-latest (Linux) | 5s (10) | every PR | A | both |
| 43 | Review dependency changes for known vulnerabilities | `dependency-review.yml` · `dependency-review` | PR only | ubuntu-latest (Linux) | 34s (10) | every PR | A | both |
| 44 | Secret scan | `secret-scan.yml` · `secret-scan` | PR + push | ubuntu-latest (Linux) | 22s (10) | every PR | A | both |
| 45 | Converter pins match the releases | `converter-pins.yml` · `converter-pins` | PR+push · paths | ubuntu-latest (Linux) | 32s (9) | conditional | A | both |
| 46 | Eval (rule-based judge, no LLM cost) | `eval-match.yml` · `eval-quick` | PR+push · paths | ubuntu-latest (Linux) | — (0) | conditional | A | both |
| 47 | Terraform fmt, validate, test | `terraform-stackit.yml` · `terraform` | PR+push · paths | ubuntu-latest (Linux) | 1m13s (1) | conditional | C | upstream |
| 48 | Compile (macos-latest) | `desktop-check.yml` · `compile` | push only · paths | macos-latest (macOS) | 2m04s (1) | no (push/schedule) | C | upstream |
| 49 | Compile (ubuntu-22.04) | `desktop-check.yml` · `compile` | push only · paths | ubuntu-22.04 (Linux) | 3m53s (2) | no (push/schedule) | C | upstream |
| 50 | Compile (windows-latest) | `desktop-check.yml` · `compile` | push only · paths | windows-latest (Windows) | 9m21s (2) | no (push/schedule) | C | upstream |
| 51 | Embedded PG bring-up (macos-latest, non-ASCII install path mixed) | `desktop-check.yml` · `embedded-pg-non-ascii-install` | push only · paths | macos-latest (macOS) | 1m30s (2) | no (push/schedule) | C | upstream |
| 52 | Embedded PG bring-up (ubuntu-22.04, non-ASCII install path mixed) | `desktop-check.yml` · `embedded-pg-non-ascii-install` | push only · paths | ubuntu-22.04 (Linux) | 1m30s (2) | no (push/schedule) | C | upstream |
| 53 | Embedded PG bring-up (windows, non-ASCII user folder) | `desktop-check.yml` · `embedded-pg-non-ascii-user` | push only · paths | windows-latest (Windows) | 2m28s (2) | no (push/schedule) | C | upstream |
| 54 | Embedded PG bring-up (windows-latest, non-ASCII install path accented-latin) | `desktop-check.yml` · `embedded-pg-non-ascii-install` | push only · paths | windows-latest (Windows) | 1m41s (2) | no (push/schedule) | C | upstream |
| 55 | Embedded PG bring-up (windows-latest, non-ASCII install path arabic) | `desktop-check.yml` · `embedded-pg-non-ascii-install` | push only · paths | windows-latest (Windows) | 1m29s (2) | no (push/schedule) | C | upstream |
| 56 | Embedded PG bring-up (windows-latest, non-ASCII install path cjk) | `desktop-check.yml` · `embedded-pg-non-ascii-install` | push only · paths | windows-latest (Windows) | 1m59s (2) | no (push/schedule) | C | upstream |
| 57 | Embedded PG bring-up (windows-latest, non-ASCII install path cyrillic) | `desktop-check.yml` · `embedded-pg-non-ascii-install` | push only · paths | windows-latest (Windows) | 1m59s (2) | no (push/schedule) | C | upstream |
| 58 | Health poll (macos-15) | `installer-scripts.yml` · `shell-installer` | push only · paths | macos-15 (macOS) | — (0) | no (push/schedule) | C | upstream |
| 59 | Health poll (ubuntu-24.04) | `installer-scripts.yml` · `shell-installer` | push only · paths | ubuntu-24.04 (Linux) | — (0) | no (push/schedule) | C | upstream |
| 60 | Python detection (windows-latest) | `installer-scripts.yml` · `detection` | push only · paths | windows-latest (Windows) | — (0) | no (push/schedule) | C | upstream |
| 61 | Scorecard analysis | `scorecard.yml` · `analysis` | push only | ubuntu-latest (Linux) | 1m43s (7) | no (push/schedule) | B | upstream |

### What each job checks, and WHY it exists (by job family; legs of the same category share a description)


**ci.yml · `backend-gate`** — Backend CI  
*Checks/produces:* Aggregation gate: needs=[backend]; fails unless all 6 shards succeeded.  
*Why it exists / what breaks if removed:* Single stable "Backend CI" status name for branch protection / at-a-glance green; load-bearing if required checks are ever enabled.  
*Note:* GATES PR (roll-up of the 6 shards).  
*Serves:* both · *Category:* A

**ci.yml · `backend-cross-os`** — 6 legs: Backend CI (macos-latest, embedded PG, shard 1/3), Backend CI (macos-latest, embedded PG, shard 2/3), Backend CI (macos-latest, embedded PG, shard 3/3), Backend CI (windows-latest, embedded PG, shard 1/3), Backend CI (windows-latest, embedded PG, shard 2/3), Backend CI (windows-latest, embedded PG, shard 3/3)  
*Checks/produces:* pytest tests/unit --splits 3 on embedded PostgreSQL, Windows/macOS.  
*Why it exists / what breaks if removed:* Backend unit correctness on the public Windows/macOS desktop platforms. Owner hosts Linux only.  
*Serves:* upstream · *Category:* C

**ci.yml · `backend`** — 6 legs: Backend CI (shard 1/6), Backend CI (shard 2/6), Backend CI (shard 3/6), Backend CI (shard 4/6), Backend CI (shard 5/6), Backend CI (shard 6/6)  
*Checks/produces:* ruff check + ruff format --check + pytest tests/unit --splits 6 --group N (embedded SQLite/default).  
*Why it exists / what breaks if removed:* Primary Linux backend unit-test coverage + lint/format. Catches backend logic regressions and style breaks before merge.  
*Serves:* both · *Category:* A

**ci.yml · `zero-width-guard`** — Block zero-width Unicode characters  
*Checks/produces:* scripts/check_zero_width.py over frontend/src.  
*Why it exists / what breaks if removed:* Security: zero-width / trojan-source hidden characters in source (smuggled logic, watermarking, spoofed identifiers).  
*Serves:* both · *Category:* A

**ci.yml · `brand-check`** — Brand Token Check  
*Checks/produces:* Runs check_no_brand_tokens.py + check_no_proprietary_classification.py over the tree.  
*Why it exists / what breaks if removed:* Stops competitor/vendor brand tokens and proprietary classification content leaking into the rebranded fork tree; protects the Vastukar rebrand and avoids shipping proprietary upstream content.  
*Serves:* downstream · *Category:* A

**ci.yml · `frontend` · category C** — 2 legs: Frontend CI (macos-latest), Frontend CI (windows-latest)  
*Checks/produces:* lint + vitest (excluding tests/pwa, maxWorkers=1); SKIPS typecheck/build (7GB runner cannot fit 12GB heap). Same as ubuntu minus the artifact upload; full lint/typecheck/build/tests on Windows.  
*Why it exists / what breaks if removed:* macOS OS-specific runtime/path signal for the public macOS desktop. Owner hosts Linux only; no build/typecheck even runs here. Catches Windows path-separator/case/CRLF breakage for the public Windows desktop/download. Owner hosts Linux only.  
*Serves:* upstream · *Category:* C

**ci.yml · `frontend` · category A** — Frontend CI (ubuntu-latest)  
*Checks/produces:* npm ci, lint, typecheck (12GB heap), build, UPLOAD frontend-dist artifact (7d), full vitest suite, Playwright project/config/spec-coverage guards, case-coverage ratchet.  
*Why it exists / what breaks if removed:* Produces the deployable SPA bundle the owner hosts (frontend-dist) and proves Linux frontend correctness. LOAD-BEARING artifact source.  
*Note:* GATES PR; uploads frontend-dist (ubuntu leg only).  
*Serves:* downstream · *Category:* A

**ci.yml · `tenant-isolation`** — Tenant Isolation / IDOR  
*Checks/produces:* pytest -m tenant_isolation plus a frozen keyword chain (idor/isolation/leak/...) over tests/integration + tests/modules.  
*Why it exists / what breaks if removed:* Security: cross-tenant / IDOR / row-level-scoping regressions. Removing it lets one tenant read or mutate another tenant's data unnoticed.  
*Serves:* both · *Category:* A

**ci.yml · `version-sync`** — Version Sync Check  
*Checks/produces:* Runs scripts/check_version_sync.py: backend and frontend version literals must agree.  
*Why it exists / what breaks if removed:* Catches a release where backend/frontend version strings drift (wrong __APP_VERSION__ / update-check mismatch).  
*Note:* DUPLICATE: Whole-tree structural guards runs the identical scripts/check_version_sync.py.  
*Serves:* both · *Category:* D

**ci-postgres.yml · `api-smoke`** — API smoke on a fresh install  
*Checks/produces:* pytest tests/pg/test_every_get_route_answers_on_a_fresh_install.py — calls every GET route as demo admin; uploads api-smoke-report.  
*Why it exists / what breaks if removed:* Catches routes that 500 / fail to answer on a fresh install — app behaviour on Linux before deploy.  
*Serves:* both · *Category:* A

**ci-postgres.yml · `elf-qa-api`** — Eleven areas pack API stability  
*Checks/produces:* Drives the eleven-areas pack over HTTP (smoke + flows a-d + demo story reads); uploads elf-qa-api-report.  
*Why it exists / what breaks if removed:* Catches API/flow regressions in the eleven-areas module pack on PostgreSQL.  
*Serves:* both · *Category:* A

**ci-postgres.yml · `frontend-tests`** — Frontend tests that block a merge  
*Checks/produces:* vite build, check_tailwind_conflicts.cjs on built CSS, vitest run of 53 named test files (with ran==named guard).  
*Why it exists / what breaks if removed:* Named merge-blocking frontend subset + Tailwind class-conflict gate on the built stylesheet.  
*Note:* DUPLICATE: the 53 named files are a subset of Frontend CI (ubuntu-latest)'s full vitest suite, which also builds. UNIQUE bit to preserve before removal: check_tailwind_conflicts.cjs (not run by Frontend CI).  
*Serves:* both · *Category:* D

**ci-postgres.yml · `access-control`** — Object ownership and cross-tenant access  
*Checks/produces:* Router-level + module + integration IDOR/ownership guards across ~30 modules, tenant isolation, paged-register permissions, demo read-only guards.  
*Why it exists / what breaks if removed:* Security: object-ownership / cross-tenant access control on PostgreSQL. Removing it lets ownership/IDOR regressions ship unnoticed.  
*Serves:* both · *Category:* A

**ci-postgres.yml · `cost-bases`** — 3 legs: Pack cost bases (shard 1/3), Pack cost bases (shard 2/3), Pack cost bases (shard 3/3)  
*Checks/produces:* Restores cached CWICR parquet, pytest tests/pg/test_every_pack_cost_base_loads.py — loads every pack cost base and measures import.  
*Why it exists / what breaks if removed:* Catches cost-base import/data-pipeline regressions. Heavy data-load test (cached downloads); better nightly/release than every-PR.  
*Serves:* both · *Category:* B

**ci-postgres.yml · `pack-installs`** — 6 legs: Pack installs (shard 1/6), Pack installs (shard 2/6), Pack installs (shard 3/6), Pack installs (shard 4/6), Pack installs (shard 5/6), Pack installs (shard 6/6)  
*Checks/produces:* pytest tests/pg/test_every_pack_installs.py — every country/compliance pack installs on a fresh PostgreSQL DB.  
*Why it exists / what breaks if removed:* Catches a pack that fails to install (silent breakage of a whole country pack) on the production DB engine.  
*Serves:* both · *Category:* A

**ci-postgres.yml · `pack-wheel`** — Packs in the installed wheel  
*Checks/produces:* Build backend wheel, install into clean venv, check_wheel_ships_every_pack.py.  
*Why it exists / what breaks if removed:* Verifies the pip wheel ships every pack. Packaging integrity is a release concern; owner deploys the SPA bundle + source/docker, not a per-PR wheel.  
*Serves:* both · *Category:* B

**ci-postgres.yml · `upgrade-from-previous-release`** — Upgrade from the previous release  
*Checks/produces:* pip install openconstructionerp==15.3.0 (UPSTREAM PyPI) into a venv, age a PostgreSQL DB with it, run current code against the aged DB (verify_upgrade_from_previous_release.py).  
*Why it exists / what breaks if removed:* Catches migration/upgrade breakage that would corrupt a real database on upgrade. Pins the UPSTREAM PyPI release; release-frequency concern, not every-PR.  
*Serves:* both · *Category:* B

**ci-postgres.yml · `backend-postgres`** — backend-postgres  
*Checks/produces:* ~40 pytest steps on embedded PostgreSQL: tests/pg dialect suite, demo-seed consistency, cost import, compliance/e-invoice/tax/payment-clock, document locale & references (no-skip guards), DWG/CAD parser, BIM, funding/leasing/service-charges/measurement-book modules, money/permission/AI-security guards, migration identifier length, CI-lane coverage.  
*Why it exists / what breaks if removed:* The main PostgreSQL backend correctness suite — PG is the production database. Catches dialect, migration, module and money/permission regressions on the exact DB engine the owner hosts.  
*Note:* Longest PR job (~69m).  
*Serves:* both · *Category:* A

**repo-hygiene.yml · `commit-history`** — Commit history guards  
*Checks/produces:* check_commit_trailers.py (AI attribution trailers), check_commit_subject.py (shell-quoting artefacts, with self-test), check_locale_value_lost_diacritics.py.  
*Why it exists / what breaks if removed:* Commit-message hygiene / attribution policy and locale-value diacritic integrity. Cheap (~26s).  
*Serves:* both · *Category:* A

**repo-hygiene.yml · `i18n`** — Locale and i18n guards  
*Checks/produces:* ~40 locale guards: parse/double-key, render, escapes, umlaut folding, stripped diacritics, leak baseline, English-placeholder, orphan keys, computed keys, plural forms, placeholder parity, role mirrors, key nesting, case playbook/coverage/drift, script mixing, a11y ratchet, mojibake, migration DDL guarded, Tailwind alpha-drop.  
*Why it exists / what breaks if removed:* Protects the 45-locale translation system the app ships. Catches untranslated leaks, broken plurals/placeholders, orphan keys, mojibake — silent UI corruption across languages.  
*Serves:* both · *Category:* A

**repo-hygiene.yml · `structural`** — Whole-tree structural guards  
*Checks/produces:* ~45 guards: NOTICE mirror, internal-only files, version sync, changelog mirror, untracked/head imports, NSIS template drift, case routes & allowlist, architecture manifest, permission registration, security-class ratchets, secret-denylist single-source, module manifests, prompt provenance, migration data-rewrites/heads, bundled-font licences, Docker force-include context, ruff (scripts/tools + backend), country coverage, frontend-API-route parity, config syntax, demo firm names, dependency licences, brand tokens, desktop link ACL.  
*Why it exists / what breaks if removed:* Structural/security/legal integrity of the whole tree: single migration head, registered permissions, attribution (NOTICE/fonts), copyleft licence acceptance, security-advisory ratchets. LOAD-BEARING licence/attribution guards.  
*Note:* Overlaps: version-sync (Version Sync Check), brand tokens (Brand Token Check), ruff backend (Backend CI shards), dependency licences (dependency-review).  
*Serves:* both · *Category:* A

**codeql.yml · `analyze`** — 2 legs: Analyze (javascript-typescript), Analyze (python)  
*Checks/produces:* CodeQL security-extended SAST on JS/TS. CodeQL security-extended SAST on Python (build-mode none; tuned config excludes documented false-positive classes).  
*Why it exists / what breaks if removed:* Security: XSS / injection / DOM vulnerabilities in frontend code. Heavy (~30m) — frequency-reduction candidate but a security gate. Security: injection / auth / data-flow vulnerabilities in backend code. Removing it lets SAST-detectable security regressions ship.  
*Serves:* both · *Category:* A

**authors-guard.yml · `authors-guard`** — authors-guard  
*Checks/produces:* github-script: every PR commit author/committer must be a first-party identity (allowLogins/allowEmails incl. upstream authors + taha-aalam + bots).  
*Why it exists / what breaks if removed:* Supply-chain policy: no external code lands (project writes all fixes in-house). Blocks unauthorized contributors. PR-only, ~5s.  
*Serves:* both · *Category:* A

**dependency-review.yml · `dependency-review`** — Review dependency changes for known vulnerabilities  
*Checks/produces:* actions/dependency-review-action: fail-on-severity high; deny-licenses AGPL/GPL/LGPL/SSPL; comments summary on failure.  
*Why it exists / what breaks if removed:* Security + legality: blocks new high-severity vulnerable deps and unaccepted copyleft licences. Per-PR licence guard for an AGPL downstream.  
*Note:* Licence portion overlaps structural check_dependency_licences.py; vuln-on-changed-deps is unique.  
*Serves:* both · *Category:* A

**secret-scan.yml · `secret-scan`** — Secret scan  
*Checks/produces:* gitleaks (SHA256-pinned install) with a planted-credential self-test; scans the PR/push commit range (whole history on dispatch).  
*Why it exists / what breaks if removed:* Stops committed secrets/credentials. Self-test proves the scanner can fail. Essential for a public AGPL repo.  
*Serves:* both · *Category:* A

**converter-pins.yml · `converter-pins`** — Converter pins match the releases  
*Checks/produces:* scripts/check_converter_pins.py: pinned DDC converter binary digests/sizes match published checksum files.  
*Why it exists / what breaks if removed:* Supply-chain integrity of the upstream DDC converter binaries the app downloads/uses. Path-filtered; ~33s.  
*Serves:* both · *Category:* A

**eval-match.yml · `eval-quick`** — Eval (rule-based judge, no LLM cost)  
*Checks/produces:* pytest eval harness meta-tests + tests.eval.runner --judge=false --threshold 0.05 vs baseline; uploads eval-report.  
*Why it exists / what breaks if removed:* Catches element-to-CWICR match-quality regression (>5% drop) in the cost-matching service. Path-filtered; never fired on PR/push in recorded history.  
*Serves:* both · *Category:* A

**terraform-stackit.yml · `terraform`** — Terraform fmt, validate, test  
*Checks/produces:* terraform fmt -check, init+validate modules/platform, modules/company, examples/two-companies; terraform test on company & platform modules.  
*Why it exists / what breaks if removed:* Validates the STACKIT cloud deployment templates. Upstream multi-cloud offering; owner deploys via Apollo/docker, not STACKIT. Path-filtered; 1 run in history.  
*Serves:* upstream · *Category:* C

**desktop-check.yml · `compile`** — 3 legs: Compile (macos-latest), Compile (ubuntu-22.04), Compile (windows-latest)  
*Checks/produces:* test_notarization_policy.py, cargo check --locked --all-targets, cargo test (push) of the Tauri desktop shell.  
*Why it exists / what breaks if removed:* Desktop installer compile correctness for the public desktop download (incl. macOS notarization policy). Owner hosts the web app on Linux, ships no desktop.  
*Serves:* upstream · *Category:* C

**desktop-check.yml · `embedded-pg-non-ascii-install`** — 6 legs: Embedded PG bring-up (macos-latest, non-ASCII install path mixed), Embedded PG bring-up (ubuntu-22.04, non-ASCII install path mixed), Embedded PG bring-up (windows-latest, non-ASCII install path accented-latin), Embedded PG bring-up (windows-latest, non-ASCII install path arabic), Embedded PG bring-up (windows-latest, non-ASCII install path cjk), Embedded PG bring-up (windows-latest, non-ASCII install path cyrillic)  
*Checks/produces:* Install backend under a non-ASCII path and boot embedded PostgreSQL there.  
*Why it exists / what breaks if removed:* Desktop/public install under arbitrary Unicode install paths. Public-download model; marginal Linux relevance (ubuntu mixed leg) but operator controls server path.  
*Serves:* upstream · *Category:* C

**desktop-check.yml · `embedded-pg-non-ascii-user`** — Embedded PG bring-up (windows, non-ASCII user folder)  
*Checks/produces:* Boot embedded PostgreSQL under a CJK-named Windows user data directory.  
*Why it exists / what breaks if removed:* Windows desktop install under Unicode user profiles. Public-download model; owner's Linux server path is operator-controlled.  
*Serves:* upstream · *Category:* C

**installer-scripts.yml · `shell-installer`** — 2 legs: Health poll (macos-15), Health poll (ubuntu-24.04)  
*Checks/produces:* bash -n install.sh + health-poll + version-pin test cases.  
*Why it exists / what breaks if removed:* Public install.sh installer script correctness. Upstream download model; owner deploys via Apollo/docker. Never triggered in recorded history.  
*Serves:* upstream · *Category:* C

**installer-scripts.yml · `detection`** — Python detection (windows-latest)  
*Checks/produces:* install.ps1 Python-detection + health-verdict test cases on PowerShell 5.1 and 7.  
*Why it exists / what breaks if removed:* Windows public curl/iwr installer script correctness. Owner ships no Windows installer. Never triggered in recorded history.  
*Serves:* upstream · *Category:* C

**scorecard.yml · `analysis`** — Scorecard analysis  
*Checks/produces:* ossf/scorecard-action, publish_results=true, uploads SARIF (5d) + code-scanning.  
*Why it exists / what breaks if removed:* OpenSSF security-posture score for the PUBLIC repo (branch protection, pinning, etc.). Weekly schedule already covers it; per-push is redundant and publishes posture publicly.  
*Serves:* upstream · *Category:* B


## Section 2 — Categorization

Every inventoried job/leg is assigned to exactly one category. Reasons are attached to the job. The owner may re-categorize; each placement is defensible from the job's steps (Section 1).


### A — ESSENTIAL (31 job/legs)

Protects the correctness, security, or legality of what the owner actually ships and hosts on Linux.

- **Backend CI** (`ci.yml`): Single stable "Backend CI" status name for branch protection / at-a-glance green; load-bearing if required checks are ever enabled.
- **backend ×6 (shard 1/6, shard 2/6, shard 3/6, shard 4/6, shard 5/6, shard 6/6)** (`ci.yml`): Primary Linux backend unit-test coverage + lint/format. Catches backend logic regressions and style breaks before merge.
- **Block zero-width Unicode characters** (`ci.yml`): Security: zero-width / trojan-source hidden characters in source (smuggled logic, watermarking, spoofed identifiers).
- **Brand Token Check** (`ci.yml`): Stops competitor/vendor brand tokens and proprietary classification content leaking into the rebranded fork tree; protects the Vastukar rebrand and avoids shipping proprietary upstream content.
- **Frontend CI (ubuntu-latest)** (`ci.yml`): Produces the deployable SPA bundle the owner hosts (frontend-dist) and proves Linux frontend correctness. LOAD-BEARING artifact source.
- **Tenant Isolation / IDOR** (`ci.yml`): Security: cross-tenant / IDOR / row-level-scoping regressions. Removing it lets one tenant read or mutate another tenant's data unnoticed.
- **API smoke on a fresh install** (`ci-postgres.yml`): Catches routes that 500 / fail to answer on a fresh install — app behaviour on Linux before deploy.
- **Eleven areas pack API stability** (`ci-postgres.yml`): Catches API/flow regressions in the eleven-areas module pack on PostgreSQL.
- **Object ownership and cross-tenant access** (`ci-postgres.yml`): Security: object-ownership / cross-tenant access control on PostgreSQL. Removing it lets ownership/IDOR regressions ship unnoticed.
- **pack-installs ×6 (shard 1/6, shard 2/6, shard 3/6, shard 4/6, shard 5/6, shard 6/6)** (`ci-postgres.yml`): Catches a pack that fails to install (silent breakage of a whole country pack) on the production DB engine.
- **backend-postgres** (`ci-postgres.yml`): The main PostgreSQL backend correctness suite — PG is the production database. Catches dialect, migration, module and money/permission regressions on the exact DB engine the owner hosts.
- **Commit history guards** (`repo-hygiene.yml`): Commit-message hygiene / attribution policy and locale-value diacritic integrity. Cheap (~26s).
- **Locale and i18n guards** (`repo-hygiene.yml`): Protects the 45-locale translation system the app ships. Catches untranslated leaks, broken plurals/placeholders, orphan keys, mojibake — silent UI corruption across languages.
- **Whole-tree structural guards** (`repo-hygiene.yml`): Structural/security/legal integrity of the whole tree: single migration head, registered permissions, attribution (NOTICE/fonts), copyleft licence acceptance, security-advisory ratchets. LOAD-BEARING licence/attribution guards.
- **analyze ×2 (javascript-typescript, python)** (`codeql.yml`): Security: XSS / injection / DOM vulnerabilities in frontend code. Heavy (~30m) — frequency-reduction candidate but a security gate. Security: injection / auth / data-flow vulnerabilities in backend code. Removing it lets SAST-detectable security regressions ship.
- **authors-guard** (`authors-guard.yml`): Supply-chain policy: no external code lands (project writes all fixes in-house). Blocks unauthorized contributors. PR-only, ~5s.
- **Review dependency changes for known vulnerabilities** (`dependency-review.yml`): Security + legality: blocks new high-severity vulnerable deps and unaccepted copyleft licences. Per-PR licence guard for an AGPL downstream.
- **Secret scan** (`secret-scan.yml`): Stops committed secrets/credentials. Self-test proves the scanner can fail. Essential for a public AGPL repo.
- **Converter pins match the releases** (`converter-pins.yml`): Supply-chain integrity of the upstream DDC converter binaries the app downloads/uses. Path-filtered; ~33s.
- **Eval (rule-based judge, no LLM cost)** (`eval-match.yml`): Catches element-to-CWICR match-quality regression (>5% drop) in the cost-matching service. Path-filtered; never fired on PR/push in recorded history.

### B — USEFUL, WRONG FREQUENCY (6 job/legs)

Worth having, but not on every PR and every push — candidate for schedule-only, release-only, or manual.

- **cost-bases ×3 (shard 1/3, shard 2/3, shard 3/3)** (`ci-postgres.yml`): Catches cost-base import/data-pipeline regressions. Heavy data-load test (cached downloads); better nightly/release than every-PR. **Frequency fix:** move to schedule/release/manual.
- **Packs in the installed wheel** (`ci-postgres.yml`): Verifies the pip wheel ships every pack. Packaging integrity is a release concern; owner deploys the SPA bundle + source/docker, not a per-PR wheel. **Frequency fix:** move to schedule/release/manual.
- **Upgrade from the previous release** (`ci-postgres.yml`): Catches migration/upgrade breakage that would corrupt a real database on upgrade. Pins the UPSTREAM PyPI release; release-frequency concern, not every-PR. **Frequency fix:** move to schedule/release/manual.
- **Scorecard analysis** (`scorecard.yml`): OpenSSF security-posture score for the PUBLIC repo (branch protection, pinning, etc.). Weekly schedule already covers it; per-push is redundant and publishes posture publicly. **Frequency fix:** move to schedule/release/manual.

### C — UPSTREAM-ONLY (22 job/legs)

Exists for the multi-platform public-download model (macOS/Windows legs, desktop packaging, signing/notarization, publish/store). Protects nothing the owner ships.

- **backend-cross-os ×6 (macos-latest, embedded PG, shard 1/3, macos-latest, embedded PG, shard 2/3, macos-latest, embedded PG, shard 3/3, windows-latest, embedded PG, shard 1/3, windows-latest, embedded PG, shard 2/3, windows-latest, embedded PG, shard 3/3)** (`ci.yml`): Backend unit correctness on the public Windows/macOS desktop platforms. Owner hosts Linux only.
- **frontend ×2 (macos-latest, windows-latest)** (`ci.yml`): macOS OS-specific runtime/path signal for the public macOS desktop. Owner hosts Linux only; no build/typecheck even runs here. Catches Windows path-separator/case/CRLF breakage for the public Windows desktop/download. Owner hosts Linux only.
- **Terraform fmt, validate, test** (`terraform-stackit.yml`): Validates the STACKIT cloud deployment templates. Upstream multi-cloud offering; owner deploys via Apollo/docker, not STACKIT. Path-filtered; 1 run in history.
- **compile ×3 (macos-latest, ubuntu-22.04, windows-latest)** (`desktop-check.yml`): Desktop installer compile correctness for the public desktop download (incl. macOS notarization policy). Owner hosts the web app on Linux, ships no desktop.
- **embedded-pg-non-ascii-install ×6 (macos-latest, non-ASCII install path mixed, ubuntu-22.04, non-ASCII install path mixed, windows-latest, non-ASCII install path accented-latin, windows-latest, non-ASCII install path arabic, windows-latest, non-ASCII install path cjk, windows-latest, non-ASCII install path cyrillic)** (`desktop-check.yml`): Desktop/public install under arbitrary Unicode install paths. Public-download model; marginal Linux relevance (ubuntu mixed leg) but operator controls server path.
- **Embedded PG bring-up (windows, non-ASCII user folder)** (`desktop-check.yml`): Windows desktop install under Unicode user profiles. Public-download model; owner's Linux server path is operator-controlled.
- **shell-installer ×2 (macos-15, ubuntu-24.04)** (`installer-scripts.yml`): Public install.sh installer script correctness. Upstream download model; owner deploys via Apollo/docker. Never triggered in recorded history.
- **Python detection (windows-latest)** (`installer-scripts.yml`): Windows public curl/iwr installer script correctness. Owner ships no Windows installer. Never triggered in recorded history.

### D — DUPLICATE/OVERLAP (2 job/legs)

Substantially re-checks what another job already checks; the other job and exact overlap are named.

- **Version Sync Check** (`ci.yml`): DUPLICATE: Whole-tree structural guards runs the identical scripts/check_version_sync.py.
- **Frontend tests that block a merge** (`ci-postgres.yml`): DUPLICATE: the 53 named files are a subset of Frontend CI (ubuntu-latest)'s full vitest suite, which also builds. UNIQUE bit to preserve before removal: check_tailwind_conflicts.cjs (not run by Frontend CI).


## Section 3 — The rest of the estate (not per-PR/per-push)

These fire on schedule, tag/release, `workflow_run`, or manual dispatch only. They are **not** part of the ~50 per-PR/per-push count. Brief entry each, with the same A–D lens.


### ci-full.yml — CI Full Suite
- **Trigger:** Nightly `30 2 * * *` + manual.
- **Jobs:** `backend-full` (32 ubuntu shards, full `pytest --splits 32`, timeout 900s), `backend-full-cross-os` (Windows/macOS, full suite on embedded PG), `backend-full-gate` (roll-up, `needs` both, `always()`). Runs the **entire** backend suite, not just `tests/unit`.
- **What/why:** The per-PR sharded lane runs `tests/unit` only; this catches everything else (integration/module defects). Comments record it has been red for real heterogeneous defects and is deliberately nightly to avoid spending the trusted lane's signal and the 20-slot concurrency pool.
- **Category / Linux-downstream need:** **A** for the 32 Linux shards (essential full-suite coverage, already correctly nightly); the Windows/macOS cross-OS pair is **C**. Keep nightly; do not move to per-push.
- **Durations:** most shards ~5m; shard 1 ~85m; macOS ~166m; Windows ~277m.

### e2e-cross-os.yml — E2E (cross-OS, real browser)
- **Trigger:** Nightly `0 3 * * *` + manual.
- **Jobs:** `e2e` matrix 3 OS × 3 browsers (chromium/firefox/webkit) = 9 legs. Builds SPA, boots backend (embedded PG + demo seed), runs `playwright.smoke-all.config.ts` per browser; uploads screenshots/report.
- **What/why:** Real-browser end-to-end smoke of every module against a running server — catches runtime/integration breakage unit tests miss.
- **Category / Linux-downstream need:** **B** for the Linux/chromium leg (valuable real-browser e2e for the hosted app, already nightly); Windows/macOS and firefox/webkit legs are **C** (public multi-platform/browser matrix). ~18m (ubuntu/chromium) to ~66m (macos/webkit).

### stability.yml — Stability (load, fresh install, long session)
- **Trigger:** Manual dispatch only.
- **Jobs:** `load-3gb` (k6 load against the unified Docker image under a 3 GB cap, cold-start limit, memory/OOM sampling), `compose-fresh` (`docker-compose.quickstart.yml` on a clean runner), `pip-clean-venv` (wheel in clean venv, 3 OS), `e2e-stability` (soak/token-expiry/restart, optional), `cold-start-probe` (boot/first-login/memory).
- **What/why:** Performance/stability of the hosted Linux service: memory ceiling, cold start, load behaviour, clean-install boot.
- **Category / Linux-downstream need:** **B** for the Linux jobs (load-3gb, compose-fresh, cold-start-probe, e2e-stability, pip-clean-venv ubuntu) — useful for a Linux host, already manual; the Windows/macOS `pip-clean-venv` legs are **C**.

### smoke-every-route.yml — Smoke every route
- **Trigger:** Manual dispatch only.
- **Jobs:** `smoke` (ubuntu, chromium): builds SPA, boots backend, opens **every** route via `playwright.smoke-routes.config.ts`, builds a report table.
- **What/why:** Catches routes that crash/blank on a fresh install — broader than the per-PR `api-smoke` GET-only check (this drives the UI).
- **Category / Linux-downstream need:** **B** — useful manual pre-deploy smoke for the hosted app; already off the per-PR path.

### homepage-loops.yml — Homepage loops (marketing GIFs)
- **Trigger:** Manual dispatch only.
- **Jobs:** `loops` (ubuntu): boots app, records homepage webm loops via Playwright, ffmpeg two-pass → optimized GIFs; uploads webm+gif.
- **What/why:** Produces marketing showcase GIFs for the public homepage.
- **Category / Linux-downstream need:** **C** — promotional assets for the public platform; protects nothing shipped. (Owner could repurpose for own marketing, but not a correctness gate.)

### module-captures.yml — Module captures (showcase video/GIF)
- **Trigger:** Manual dispatch only.
- **Jobs:** `captures` (ubuntu): records per-module webm clips → GIFs; uploads.
- **What/why:** Showcase video/GIF of modules for marketing/docs.
- **Category / Linux-downstream need:** **C** — promotional showcase content; protects nothing shipped.

### video-catalog-weekly.yml — Video catalog weekly
- **Trigger:** Weekly `17 5 * * 1` + manual.
- **Jobs:** `check` (ubuntu): `fetch_video_channel.py --check` (channel uploads vs catalogue) + `fetch_academy_items.py --check` (academy site vs snapshot).
- **What/why:** Monitors freshness of the upstream video/academy catalogue.
- **Category / Linux-downstream need:** **C** — tracks upstream academy/video content; the fork's academy catalogue is unmounted inert residue, so this guards content the owner does not surface.

### eval-match.yml · eval-nightly-llm — Eval nightly (LLM judge)
- **Trigger:** Nightly `17 3 * * *` + manual (`use_llm_judge`).
- **Jobs:** `eval-nightly-llm` (ubuntu): `tests.eval.runner --judge=true --threshold 0.05` vs baseline; uploads report. (The `eval-quick` rule-based job is the PR/push path-filtered lane in §1.)
- **What/why:** LLM-judged element-to-CWICR match-quality eval, cost-capped.
- **Category / Linux-downstream need:** **B** — quality benchmark with LLM cost; correctly nightly. ~1m53s.

### release.yml — Release
- **Trigger:** Push tags `v*`.
- **Jobs:** `converter-pins` (calls converter-pins.yml) → `docker` (build + push image to GHCR `ghcr.io/<repo>`, repo-hygiene check) → `release` (creates GitHub Release named **"OpenConstructionERP <tag>"**, changelog extract; `always()`).
- **What/why:** Public release pipeline: container image + GitHub Release.
- **Category / Linux-downstream need:** **B** with a **C** part: the GHCR image is fork-owned and useful for Linux docker hosting (release-time, already off per-PR); the GitHub Release is still **upstream-branded** ("OpenConstructionERP") — a rebrand gap. Tag-triggered, not per-PR.

### release-gate.yml — Release gate
- **Trigger:** Push `wip/release-gate-*` + manual.
- **Jobs:** `build` (ubuntu: frontend build + wheel, uploads `wheel` artifact 7d) → `fresh-install` (3 OS × py3.12/3.13 = 6 legs, clean-venv install + fresh check), `upgrade-embedded` (3 OS: install previous PyPI `18.6.4`, seed, upgrade, verify data survived), `upgrade-postgres` (ubuntu, external PG16).
- **What/why:** Pre-release verification: fresh install + upgrade-path data survival across platforms/Pythons.
- **Category / Linux-downstream need:** **B** for Linux legs (fresh-install ubuntu, upgrade-postgres, upgrade-embedded ubuntu — valuable release verification for the host); Windows/macOS legs are **C**. Already off per-PR (wip branch/manual).

### pypi-publish.yml — PyPI Publish
- **Trigger:** Push tags `v*` + manual.
- **Jobs:** `publish` (ubuntu): frontend build + xz-pack, wheel build, PyPI 100 MiB size check, sanity + repo-hygiene, publish to **PyPI package `openconstructionerp`** via Trusted Publishing or `PYPI_API_TOKEN`.
- **What/why:** Publishes the backend wheel to the **upstream PyPI package name**.
- **Category / Linux-downstream need:** **C** — publishing to `openconstructionerp` on PyPI is the upstream distribution channel; the owner does not publish to PyPI. Protects nothing the owner hosts.

### sbom-and-licenses.yml — SBOM and License Inventory
- **Trigger:** `workflow_call` (from release-signing) + manual.
- **Jobs:** `generate` (ubuntu): pip-licenses + cyclonedx-bom (backend SBOM), license-checker + cyclonedx-npm (frontend SBOM), LGPL corresponding-source offer, aggregate `THIRD_PARTY_LICENSES.md`, uploads `licenses-and-sbom` (365d) + attaches to release.
- **What/why:** Licence/attribution inventory + SBOM + LGPL source offer for a release.
- **Category / Linux-downstream need:** **A** — legality/attribution for an AGPL downstream (licence inventory, LGPL source obligation). Already correctly release-frequency; keep.

### release-signing.yml — Release Signing (Sigstore/cosign)
- **Trigger:** Release `published` + `workflow_run` (Desktop Release completed) + manual.
- **Jobs:** `resolve` → `inventory` (release carries every platform's installers) + `sbom` (calls sbom-and-licenses.yml) → `sign` (cosign **keyless OIDC** sign-blob of SHA256SUMS, uploads SHA256SUMS+.sig+.pem) → `confirm` (reads signature back). Verification snippet pins certificate identity to `github.com/datadrivenconstruction/OpenConstructionERP/.*`.
- **What/why:** Sigstore signing of public release artefacts.
- **Category / Linux-downstream need:** **C** — signing for public release distribution; the cosign identity regexp is the **upstream** repo's. A fork release would need its own identity ceremony. Owner publishes no signed public releases.

### desktop-release.yml — Desktop Release
- **Trigger:** Push tags `v*` + manual.
- **Jobs:** `build-sidecar` (3 OS: PyInstaller backend sidecar, **Windows Azure Artifact Signing** of collected binaries, macOS ad-hoc codesign, sidecar doctor/cold-start checks) → `build-tauri` (3 OS: Tauri installers — NSIS/Windows, .app/dmg macOS with **notarization policy**, AppImage Linux; bundles+signs Windows IFC converters; publishes to release.yml's GitHub Release) + `build-linux-rpm` (ubuntu, RPM, continue-on-error) → `sign-windows` (signtool verify via Azure signing secrets) → `request-signing` (triggers release-signing) → `report`.
- **What/why:** Builds, signs, notarizes and publishes the public desktop installers for all three OSes.
- **Category / Linux-downstream need:** **C** — desktop packaging + Windows code-signing + macOS notarization + publish/store for the public download model. The owner ships no desktop app (hosts the web SPA on Linux). Linux AppImage/RPM legs are desktop, not the hosted service.


## Section 4 — Load-bearing flags (read before any removal)


### 4.1 The frontend-dist artifact (the deployable bundle)

- **Where:** `ci.yml` · job `frontend` · step **"Upload the built bundle"** (lines 518–534), guarded `if: matrix.os == 'ubuntu-latest'`.

- **Artifact name:** `frontend-dist` · **path:** `frontend/dist` · **retention:** 7 days · `if-no-files-found: error`.

- **Only the ubuntu leg uploads it** (the output is OS-independent; ubuntu is the wheel/build runner). It is placed **before** the test steps so a red test run still leaves the bundle behind.

- **Consumers:** no automated in-repo `download-artifact` consumes `frontend-dist`. The workflow comment documents manual retrieval (`gh run download <run id> -n frontend-dist -D frontend/dist`) for smoke runs / wheel-size checks; the owner's **Apollo deployment consumes it externally** (no `apollo` reference exists in the repo — it is operator-side).

- **Load-bearing consequence:** removing `Frontend CI (ubuntu-latest)`, its `Build` step, or this upload step removes the source of the deployable bundle. The Windows/macOS frontend legs do **not** produce it (macOS skips Build entirely). Keep the ubuntu leg and this step.


### 4.2 Licence/attribution guards and the secret scan (why an AGPL downstream needs them)

The fork is **AGPL-3.0** with upstream licence/attribution files unchanged (DOWNSTREAM.md). These guards keep it legal and clean:

- **`dependency-review.yml`** (per-PR): `fail-on-severity: high` + `deny-licenses: AGPL-1.0/3.0, GPL-2.0/3.0, LGPL-2.1/3.0, SSPL-1.0`. Blocks new high-severity vulnerable dependencies and unaccepted copyleft licences that could impose extra obligations on the shipped product.

- **`repo-hygiene.yml · structural`**: `check_notice_mirror.py` (NOTICE / backend/NOTICE attribution must not drift), `check_bundled_font_licences.py` (every bundled font carries its licence into the artefact), `check_dependency_licences.py` (no dependency carries copyleft not accepted). AGPL requires preserving attribution and licence notices; these enforce it.

- **`sbom-and-licenses.yml`** (release-time, §3): full licence inventory + CycloneDX SBOM + **LGPL corresponding-source offer** — the AGPL/LGPL compliance paperwork attached to each release.

- **`secret-scan.yml`** (per-PR/push): gitleaks (SHA256-pinned) with a **planted-credential self-test** proving the scanner can fail, scanning the change's commit range. A public AGPL repo must never leak credentials; the self-test guards against a silently-passing scanner.

- **Load-bearing consequence:** these are the legality/attribution backbone. Removing them risks shipping unattributed/copyleft-violating content or leaked secrets — legal exposure, not just a red check.


### 4.3 Dependency chains (outputs consumed elsewhere)

- **`frontend-dist`** (ci.yml frontend/ubuntu) → owner's Apollo deployment + manual smoke/wheel-size checks (§4.1). No in-repo automated downloader.

- **`Backend CI` gate** (`ci.yml · backend-gate`) `needs: [backend]` — roll-up of the 6 shards; the single stable check name intended for branch protection.

- **`CI Full Suite` gate** (`ci-full.yml · backend-full-gate`) `needs: [backend-full, backend-full-cross-os]` — nightly roll-up.

- **Release chain (tag `v*`):** `release.yml` (converter-pins → docker GHCR → GitHub Release) ; `desktop-release.yml` (build-sidecar → build-tauri/build-linux-rpm **consume the sidecar artifact** and **find release.yml's GitHub Release by tag** to publish installers into it ; sign-windows → request-signing **triggers release-signing**) ; `release-signing.yml` (release-published / workflow_run → resolve → inventory + **sbom calls sbom-and-licenses.yml** → cosign sign → confirm) ; `pypi-publish.yml` (independent PyPI publish).

- **`release-gate.yml`:** `build` uploads `wheel` artifact → `fresh-install` / `upgrade-embedded` / `upgrade-postgres` download and install it.

- **Diagnostic artifacts** (no downstream job consumes; human/report use): `api-smoke-report`, `elf-qa-api-report`, `eval-report-*`, `licenses-and-sbom` (365d), Scorecard `SARIF file` (5d), k6/memory samples, sidecar/wheel/diagnostic-installer artifacts.

- **Load-bearing consequence:** removing `release.yml`'s GitHub Release job breaks `desktop-release.yml` (it searches for that release to attach installers) and `release-signing.yml`. Removing `build-sidecar` breaks `build-tauri`/`build-linux-rpm`. These are release-estate chains (all §3), not per-PR — but they are interdependent.


### 4.4 Required status checks / branch protection

- **Settings are NOT readable from here:** `GET /repos/Taha-Aalam/Vastukar/branches/main/protection` returns **HTTP 401** unauthenticated. Branch protection configuration requires admin/authenticated access.

- **What the repo itself records:** `ci-postgres.yml:830-835` states verbatim that *"main is protected by three rules, deletion, non-fast-forward and linear history, and carries **no required status checks at all**, so no job in this workflow stops a push today."* `ci.yml:236-238` says the `Backend CI` gate exists to keep *"a single 'Backend CI' check for branch protection"* ready for when required checks are turned on. `ci-full.yml:30-39` documents that **check names are job names** (e.g. `Backend Full Suite` is the roll-up; the workflow name `CI Full Suite` is NOT a check name).

- **Therefore:** on the recorded configuration, removing jobs blocks no merge today. **But the owner MUST verify Settings → Branches → branch protection rule for `main` before removing anything**, because the live settings could not be read here and may differ from the comment.

- **Exact job names to check under Settings → Branches (required status checks), if any are enabled:**

  - `Backend CI` (the roll-up gate — the most likely required check; removing the gate or its shards breaks it)

  - `Frontend CI (ubuntu-latest)` (produces frontend-dist)

  - `Frontend tests that block a merge`

  - `backend-postgres`

  - `Tenant Isolation / IDOR`

  - `Object ownership and cross-tenant access`

  - `Whole-tree structural guards`, `Locale and i18n guards`, `Commit history guards`

  - `Secret scan`, `Analyze (python)`, `Analyze (javascript-typescript)`, `authors-guard`, `Review dependency changes for known vulnerabilities`

  - `Version Sync Check`, `Brand Token Check`, `Block zero-width Unicode characters`

  - any `Pack installs (shard N/6)`, `Pack cost bases (shard N/3)`, `API smoke on a fresh install`, `Eleven areas pack API stability`, `Upgrade from the previous release`, `Packs in the installed wheel`

- **Rule of thumb:** removing a job that is a required status check blocks **every** merge until the rule is updated. Update the branch-protection rule first (or confirm none exists), then remove. Note matrix legs appear as `Job (shard N/M)` / `Job (os)` — a required check on a matrix job needs every leg, or the roll-up gate name.



## Section 5 — The after-cut shape

Scenario per the brief: **remove every C job; move every B job off the per-PR/per-push path** (to schedule/release/manual). A and D remain (D consolidation noted separately). Path-filtered A lanes (Converter pins, Eval quick) still fire only on their paths.


| Metric | Per PR (before) | Per PR (after) | Per push main (before) | Per push main (after) |
|---|--:|--:|--:|--:|
| Unconditional jobs fired | 44 | 31 | 43 | 29 |
| + path-filtered A lanes (max) | +3 (incl. 1 C) | +2 | +16 (desktop/installer/converter/eval/terraform) | +2 |
| Sum of job medians (runner-minutes) | 637 | 361 | 638 | 360 |
| Critical-path longest job | 69m17s | 69m17s | 69m17s | 69m17s |

- **Jobs per PR:** 44 → **31** (≈33 max with path-filtered A). UI entries ≈ 37 (incl. 4 push-duplicates + 2 app checks), down from 50.

- **Jobs per push to main:** 43 unconditional (53 on the latest, desktop-touching push) → **29**.

- **Runner-minutes per PR:** ~637 → ~361 (**~43% reduction**). Per push: ~638 → ~360.

- **Time to a fully green PR — honest critical-path answer:** the longest PR job is **`backend-postgres` (~69m17s)**, with `Tenant Isolation / IDOR` (~61m) and `Frontend CI (macos)` (~61m) close behind. `backend-postgres` and `Tenant Isolation` are **A (essential Linux jobs) and stay**, so the **critical-path wall clock is ~69 min before AND after** — the cut does *not* meaningfully shorten the longest pole. What it cuts is **runner-minutes (~43%) and concurrency-slot pressure**: 44 jobs against a ~20-slot ceiling means ~2–3 queue waves before; 31 jobs means fewer waves and less queuing of the long Linux jobs, so realized wall clock improves modestly (less queue overhead) even though the theoretical critical path is unchanged. Removing the macOS/Windows frontend legs (each ~45–61m) frees slots that currently compete with `backend-postgres`.

- **If D is also consolidated** (Version Sync Check into structural; Frontend-tests into Frontend CI ubuntu, preserving the Tailwind gate): PR → 29, push → 27.


### Coverage given up, one line per removed/moved group

- **C — Frontend CI (windows + macos):** Windows/macOS frontend path-separator, case-sensitivity, CRLF and runtime signal (owner hosts Linux only; macOS leg never even type-checks/builds).

- **C — Backend CI cross-OS (windows/macos × 3 shards each):** backend unit-test correctness on Windows/macOS embedded PostgreSQL.

- **C — Desktop Compile Check (compile ×3 + embedded-PG non-ASCII ×7):** desktop Tauri shell compile + macOS notarization policy + embedded-PG bring-up under Unicode install/user paths (no desktop shipped).

- **C — Installer scripts (detection + shell-installer ×2):** public `install.ps1`/`install.sh` installer-script tests (owner deploys via Apollo/docker).

- **C — Terraform (STACKIT):** validation of the STACKIT cloud deployment templates (owner does not deploy on STACKIT).

- **B moved — Upgrade from the previous release:** upgrade-path migration/data-survival check moves to release-only (still runs at release; pins upstream PyPI 15.3.0).

- **B moved — Pack cost bases ×3:** every-pack CWICR cost-base load/import test moves to nightly/release (heavy cached data load).

- **B moved — Packs in the installed wheel:** wheel ships-every-pack packaging check moves to release-only.

- **B moved — Scorecard analysis:** OpenSSF posture score moves to weekly-only (schedule already exists); stops per-push public posture publishing.

- **D (if consolidated) — Version Sync Check:** identical check still runs in Whole-tree structural guards.

- **D (if consolidated) — Frontend tests that block a merge:** named tests already covered by Frontend CI (ubuntu) full suite — **but migrate `check_tailwind_conflicts.cjs` into Frontend CI (ubuntu) first**, or the built-stylesheet Tailwind-conflict gate is lost.



---
*Generated from GitHub REST API run history (unauthenticated) and a full parse of `.github/workflows/`. Durations are medians of the last ≤10 completed runs per job/leg; path-filtered lanes with no recent runs are marked `—`. Report only — nothing was changed.*
