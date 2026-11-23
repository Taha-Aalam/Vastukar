# CI failure audit: why PRs off a green main keep going red

Date: 2026-11-23. Read-only forensics; the only code changes made are the one
fix in Part 2 and the two Part 3 files. No PR was opened and nothing was pushed
to `main`.

## Method and coverage of the evidence

- Remote state read with authenticated `gh`/`gh api` (log downloads via
  `gh api --allow-escape-sequences …/actions/jobs/{id}/logs`). **CI logs were
  reachable**; every first error below is quoted from a downloaded job log,
  not inferred. Check-run and workflow-run metadata was cached per SHA.
- Heads examined: main `b04178d9` (the green push battery), PR #15
  `e3a04717`, PR #16 `daf5f3a`/`c340f63`/`2f83852`/`3a85b27`/`aa5e8aa`.
- Local toolchain: `.venv` has Python 3.12.3, pytest 9.2.0 and **ruff 0.16.6**,
  the version CI resolves from `backend/pyproject.toml`. Node on this box is
  18.19.1, CI pins 24 (`ci.yml:478`–`:481`).
- main's **push** battery at `b04178d9`: 7 workflow runs, all success —
  Secret scan `44453053166`, Scorecard `44453053192`, Desktop Compile Check
  `44453053334`, CodeQL `44453053185`, Repo hygiene `44453053275`,
  CI (PostgreSQL) `44453053201`, CI `44453053218`. The specific checks that
  later fail on the PRs are confirmed **success** inside those runs:
  `backend-postgres` in `44453053201`; `Brand Token Check`, all three
  `Frontend CI` legs and `Backend CI (shard 1/6)` in `44453053218`;
  `Whole-tree structural guards` in `44453053275`. So "main's green never
  covered it" is **not** the explanation for any PR failure in this audit.
- Runs attached to main's HEAD with `event=schedule` (nightly `ci-full.yml`,
  nightly `e2e-cross-os.yml`) are **not** push runs and are covered in class
  (v) at the end.

## Classification key

(i) diff-caused stale encoding — a test/manifest/baseline/drift expectation was
not updated with the change. (ii) diff-caused real regression. (iii) PR-only
check, never exercised by push CI. (iv) flake/environment (needs (b) evidence).
(v) pre-existing on main but outside push-CI coverage.

## Summary table

| Check | PR / head | Class | Cause (one line) | Evidence |
|---|---|---|---|---|
| Backend CI + 6 shards | #16 `c340f63`, `2f83852` | (i) | `ruff check .`/`ruff format --check .` reject the new install-hint code in `tests/unit/test_upgrade_path_has_no_pypi_reference.py:13,19,22` (I001 + two F401; 3 files would reformat) | CI runs `44759930979`, `44812377403`; log job `136369440802` lines 756–913; fixed by `3a85b279` |
| Brand Token Check | #15 `e3a0471`; #16 `3a85b27` | (i) | new `docs/upstream-pointer-audit.md:163` names a competitor brand (masked `q********s`, len 10); the denylist rejects it | CI job `136245864510` lines 201–205; same token in whole-tree jobs `136245865692`, `136589105946`; fixed by `aa5e8aa3` |
| Frontend CI (ubuntu-latest) | #15 `e3a0471`; #16 `3a85b27` | (i) | `SidebarFooterCard.test.tsx:49` reads `FooterPrefs.github`, removed by PR #15's `footerPrefs.ts` change → `TS2339` | CI job `136245864800` line 250; fixed by `aa5e8aa3` |
| Frontend CI (windows-latest) | #15 `e3a0471`; #16 `3a85b27` | (i) | same `TS2339` on the same file/line, on the Windows leg | CI job `136245864730` line 277 |
| Frontend CI (macos-latest) | #15 `e3a0471`; #16 `3a85b27` | (i) | macOS skips typecheck, so vitest ran the stale test: 3 failures, "length of 6 but got 4", GitHub switch missing | CI job `136245864824` lines 7218–7493; `1 failed / 1399 passed` |
| Whole-tree structural guards | #15 `e3a0471` (×2 firings) | (i) | architecture manifest says 4148 TS files, tree has 4146 after PR #15's deletions; plus the brand token above | CI jobs `136245823519` (push), `136245865692` (PR); log lines 371, 2499; fixed by `aa5e8aa3` |
| Whole-tree structural guards | #16 `3a85b27` (×2 firings) | (i) | same two as above **plus** NSIS drift expectation "OpenConstructionERP fork…" vs rebranded template "Vastukar fork…", and `outbound_url_safety` 34 sites vs baseline 33 (new site `backend/app/core/release_install.py`) | CI jobs `136589081116`, `136589105946`; log lines 287, 354, 441, 471, 2573; fixed by `aa5e8aa3` |
| backend-postgres | #15 `e3a0471` | (i) | `tests/pg/test_update_check_policy.py:68` reads `frontend/src/shared/ui/UpdateChecker.tsx`, deleted by PR #15 → `FileNotFoundError`; 1 failed / 2960 passed | CI job `136245866915` lines 725–758; local reproduction identical; **fixed at `45f913c4`** |
| E2E (cross-OS) OS/browser legs | main, nightly only | (v) | `demo-login failed: 401 {"detail":"Invalid email or password"}` after the PR #13 rebrand; all 9 legs red on 4 consecutive nights | schedule runs `44509546764`, `44721213423`, `44894152156`, `45012511568`; job `137177711776` line 1726 |

## Worked example 1 — the ruff gate on PR #16 (fix `3a85b279`)

The account in the brief is **correct**: `3a85b279` is a pure ruff fix, six
files, 13 insertions / 26 deletions, no behaviour change.

- **(a) Trigger scope.** `ci.yml:4` runs on `push: branches:[main]` and
  `ci.yml:6` on every `pull_request`, so main's green did cover it: all six
  `Backend CI (shard N/6)` checks are `success` in main's push run `44453053218`.
- **(b) Deterministic or flaky.** All six shards failed at the *same* step in
  two separate CI runs on two different heads carrying the offending code
  (`44759930979` at `c340f63`, `44812377403` at `2f83852`), and the same files
  went green at `3a85b27` and at main. The signature — every shard red with the
  pytest step never reached — is the shared pre-test gate described in the
  troubleshooting reference, not six flaky test slices. No same-head re-run
  exists, so "fails twice on one head" is **UNPROVEN**; identical failure on
  two heads with the same code is proven. Not a flake.
- **(c) Causal chain.** `ci.yml:202` runs `ruff check .` from `backend/`.
  Log job `136369440802` lines 767–854: `I001` unsorted import block at
  `tests/unit/test_upgrade_path_has_no_pypi_reference.py:13`, `F401` for
  `httpx` at `:19` and `app.core.release_install` at `:22` — imports added by
  `2f83852a`'s "Repoint printed install hints" edits. `ci.yml:206`,
  `ruff format --check .`, reports "3 files would be reformatted" (line 912).
  `3a85b279` deletes the two unused imports, collapses the import block and
  reflows the long f-strings/comprehensions in `embedded_pg.py`,
  `release_install.py`, `costs/router.py`, `pointcloud/service.py` and
  `reindex_cwicr_vectors.py`.
- **(d) Class (i)** — diff-caused stale encoding: the new source was not
  written in the shape the pinned formatter/linter enforces.

## Worked example 2 — `aa5e8aa3`'s five files

The brief's account is **substantially correct but needs one correction**.
`aa5e8aa3` changes exactly five files. Four are stale encodings that PR #15
introduced and that PR #16 inherited; the fifth pair (NSIS drift and the
security baseline) were **not** inherited from PR #15 — PR #15's own
`Whole-tree structural guards` log has only two failing guards (architecture
manifest, brand token). The NSIS and baseline failures appear first on PR #16,
because they are caused by PR #16's own rebrand and release-wheel changes.
The claim that aa5e8aa "fixed the inherited checks" is true for the footer
test, the architecture manifest and the brand token; the other two are
PR-#16-native stale encodings fixed in the same commit.

- **(a) Trigger scope.** `Brand Token Check` runs on push (`ci.yml:102`) and
  passed on main `44453053218`. `Frontend CI` runs on push (`ci.yml:458`,
  `ci.yml:469`) and passed on main. `Whole-tree structural guards` runs on
  push to *any* branch (`repo-hygiene.yml:77` has no `branches:` filter) and on
  pull requests — which is why PR #15 and each PR #16 head show **two** failing
  firings of that one check (push run and PR run), not two different defects.
- **(b) Deterministic or flaky.** Both firings fail on the same guards on the
  same head; the same brand token and the same 4148→4146 count recur on four
  distinct heads (`e3a0471`, `c340f63`, `2f83852`, `3a85b27`) and disappear at
  `aa5e8aa`. Same-head re-runs are **UNPROVEN** (none recorded). Not a flake.
- **(c) Causal chain.**
  - `docs/upstream-pointer-audit.md` is added by PR #15's second commit. Line
    163 of that file names `QuickBooks` among accounting-sync providers;
    `check_no_brand_tokens.py` (`ci.yml:102`, `repo-hygiene.yml:921`) hashes
    the denylist and reports `brand token q********s (len 10)` at that
    file:line. `aa5e8aa3` rewrites the parenthetical to "cloud ledger
    providers and DATEV".
  - PR #15 deletes `SupportUsButton.tsx`, `UpdateChecker.tsx`, `WhatsNewCard.tsx`
    and the GitHub/Community footer preferences in `footerPrefs.ts`, but leaves
    `SidebarFooterCard.test.tsx` asserting six switches and a `github` key.
    `TS2339` at `SidebarFooterCard.test.tsx:49` kills typecheck on ubuntu and
    windows; macOS skips typecheck (`ci.yml:504`) and fails three vitest
    assertions instead. `aa5e8aa3` rewrites the test for four switches and
    `{ editMenu: true }` only.
  - `check_architecture_manifest.py` (`repo-hygiene.yml:320`) compares the
    committed counters in `frontend/src/features/architecture/architecture_manifest.json`
    with the tree; PR #15 deleted TS/TSX files so `frontend_ts_files` reads
    4148 in the manifest against 4146 on disk. `aa5e8aa3` sets it to 4146 and
    corrects the `modules` feature counts (38→36 ts, 14→13 tests, 39→37 total).
  - `check_nsis_template_drift.py` (`repo-hygiene.yml:206`) reconstructs the
    vendored NSIS template by applying hardcoded "OpenConstructionERP fork …"
    snippets; the rebrand changed those comments to "Vastukar fork …", so
    reconstruction mismatches ("content differs"). `aa5e8aa3` updates six
    expected snippets in the checker itself. First seen on PR #16
    (`136589105946` lines 287, 354), not on PR #15.
  - `check_permission_registration.py` (`repo-hygiene.yml:329`) reads
    `scripts/security_class_baseline.json`; PR #16's `release_install.py`
    (release-wheel repoint, `2f83852a`) added a new outbound-URL site, so the
    run reports `outbound_url_safety: 34 site(s), baseline 33, new 1`.
    `aa5e8aa3` adds `backend/app/core/release_install.py` to that list.
    First seen on PR #16 (`136589105946` line 471), not on PR #15.
- **(d) Class (i)** for every one of these: an expectation encoded in a test,
  manifest, checker or baseline was not updated alongside the tree it
  describes. No behaviour regression was found in this family.

## Part 2 — the unexplained one: `backend-postgres`

**Verdict: class (i), diff-caused stale encoding. Fixed on
`cleanup/remove-upstream-surfaces` at `45f913c4`, pushed.**

- **(a) Trigger scope.** `ci-postgres.yml:49`–`:52` declares
  `push: branches:[main]` and `pull_request: branches:[main]`. It ran on main's
  push as run `44453053201` with `backend-postgres` **success**, and on PR #15
  (base `main`) as run `44723756729` with `backend-postgres` **failure**. It is
  *not* PR-only. It does **not** fire on PR #16 at all: `gh pr view 16` reports
  `baseRefName = cleanup/remove-upstream-surfaces`, so the
  `pull_request.branches:[main]` filter excludes it (confirmed: none of PR
  #16's seven workflow runs is `CI (PostgreSQL)`). The stale test therefore
  would have followed PR #15 into main and only then been red on the push
  battery.
- **(b) Deterministic or flaky.** Only one CI firing exists on `e3a0471`, so
  same-head repetition is **UNPROVEN** and no flake claim can be made. The
  mechanism is deterministic — a `read_text()` on a path that no longer
  exists — and I reproduced it locally on the exact head with the identical
  traceback and line number before changing anything (`1 failed in 8.05s`,
  `FileNotFoundError: .../frontend/src/shared/ui/UpdateChecker.tsx`). Failure
  count in CI: `1 failed, 2960 passed, 98 skipped in 2969.46s`.
- **(c) Causal chain.** CI job `136245866915`, step
  `pytest tests/pg -q -rs -p no:cacheprovider --timeout=300 --timeout-method=thread`
  (`ci-postgres.yml:139`). First error, log lines 725–758:
  `tests/pg/test_update_check_policy.py::test_the_automatic_check_asks_once_a_day`,
  `assert policy.VERSION_CHECK_TTL_S == 24 * 60 * 60` passes, then
  `source = _WEB_UI.read_text(encoding="utf-8")` at
  `tests/pg/test_update_check_policy.py:68` raises `FileNotFoundError` for
  `frontend/src/shared/ui/UpdateChecker.tsx`. PR #15's diff deletes that file
  (1450 lines) but leaves the test — added when the UI held a matching
  `VERSION_CHECK_TTL_MS` — reading it. The server policy and its endpoint are
  still live (`backend/app/main.py:3608`), so the fix drops the UI cross-check
  and keeps the server-side TTL assertion.
- **(d) Class (i)**, not (ii): behaviour did not regress; an expectation was
  left behind by a deliberate deletion.

**Fix made (prominent):** on `cleanup/remove-upstream-surfaces`, commit
`45f913c4` "fix: drop the deleted UpdateChecker cross-check from the PG policy
test" removes the `_WEB_UI` path constant and the four UI assertions from
`test_the_automatic_check_asks_once_a_day`, keeps the day-long server TTL
assertion, and corrects the stale `UpdateChecker.tsx` reference in the
`VERSION_CHECK_TTL_S` comment (`backend/app/core/update_check_policy.py:36`).
Verified locally with the CI gate commands: `pytest tests/pg/test_update_check_policy.py -q -p no:cacheprovider` → **13 passed**;
`ruff check` and `ruff format --check` on both files → clean. Pushed to the
cleanup branch only (`e3a04717..45f913c4`). PR #15's CI will need to settle on
the new head; this audit's forensics are for `e3a0471` as briefed.

## Part 3 — systemic prevention

- `scripts/pre-push-gates.sh` — 40 fast deterministic gates, each with its
  workflow `file:line` citation, run with the exact CI command. No gate writes
  to the tree. Fails with a named list of failing gates.
- `docs/pre-push-verification.md` — the gate list, the "Not run locally"
  declaration list (frontend suite, six-shard backend suite, full `tests/pg`,
  E2E, nightly, packaging, non-Linux legs, hosted-app checks), and the rule
  that the PR body records local results **before** the first push.

### Negative control

Run from two worktrees with the same script, the same venv (Python 3.12.3,
ruff 0.16.6) and the same pinned gitleaks 8.30.1:

| Tree | Result | Failed gates |
|---|---|---|
| main `b04178d9` | `passed=40 failed=0 skipped=0`, exit 0 | none |
| PR #15 head `e3a0471` | `passed=38 failed=2 skipped=0`, exit 1 | `hygiene/architecture-manifest`, `brand/tokens` |

The negative control fails on exactly the gates CI named that this script can
express locally: `hygiene/architecture-manifest` is the manifest-vs-tree guard
inside `Whole-tree structural guards` (CI log job `136245865692` line 371:
`frontend_ts_files 4148 -> 4146`), and `brand/tokens` is `Brand Token Check`
(CI job `136245864510` lines 201–205, the same `docs/upstream-pointer-audit.md:163`
token). The third CI failure family on PR #15, `Frontend CI`, cannot run on
this ~8 GB machine (Node 18 vs CI's 24, 12 GB heap) and is declared under
"Not run locally" in the protocol. The two PR #16-only guards that
`aa5e8aa3` fixed — NSIS drift and the security baseline — pass on `e3a0471`
because their offending changes are in PR #16, not PR #15; this matches the
CI logs. Output: `gate-main-clean.out` and `gate-pr15.out` in the audit
scratch workspace.

## Class (v) — pre-existing failures on main, outside push CI

The nightly `E2E (cross-OS, real browser)` workflow (`e2e-cross-os.yml:27`,
schedule + `workflow_dispatch` only, no `push`/`pull_request`) fails on main's
own HEAD `b04178d9` on four consecutive nights (`44509546764`,
`44721213423`, `44894152156`, `45012511568`), all nine OS/browser legs. First
error in job `137177711776` line 1726: `demo-login failed: 401
{"detail":"Invalid email or password"}`. This began with the PR #13 rebrand
merge and is unrelated to PR #15/#16. It is **class (v)**: main's push
battery never exercised it. Not fixed here — owner's decision. The nightly
`ci-full.yml` also fails on main's HEAD on the same nights (shards 1/2/4/5/7
plus the macOS/Windows embedded-PG legs); also class (v), also not fixed.

## Where the evidence ran out

- **No same-head re-runs.** For `Brand Token Check`, `Frontend CI`, the backend
  lane and `backend-postgres` there is one CI firing per head. Repetition on
  different heads with the same code is shown; strict "failed twice on the
  same head" is **UNPROVEN** for each. None is labelled flaky.
- **PR #16's first head `daf5f3a` has zero check runs and zero workflow runs**
  (superseded before any run attached). No CI evidence exists for that head;
  the brief's three heads `c340f63`/`2f83852`/`3a85b27` are fully covered.
- **Nightly reds were not root-caused beyond the first error.** The E2E
  `demo-login` 401 is quoted from the log; no local E2E reproduction was
  attempted (nine real-browser legs, schedule-only).
- **Frontend full suite not run locally** (Node 18 here vs CI's Node 24;
  12 GB heap requirement); declared under "Not run locally" in the protocol.
- **CI logs were reachable**, so no log-access gap is claimed. Branch
  protection settings were not read; required-check status is out of scope.
