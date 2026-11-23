# Pre-push verification protocol

The failure this protocol exists to prevent: work is verified locally against a
set of commands that does not match what CI runs, and the gap is discovered by
CI after the push. PR #15 and PR #16 both did this — every red gate on those
branches was a gate that runs on main's green push battery and would have gone
green locally had it been run. See `docs/ci-failure-audit.md` for the evidence.

## Gate list

Run `scripts/pre-push-gates.sh` from the repository root before the first push
of a branch. It runs these gates, in this order, with the exact command each
workflow uses. The citation after each command is the workflow line.

| Family | Command | Workflow |
|---|---|---|
| Ruff, backend | `ruff check .`; `ruff format --check .` (from `backend/`) | `.github/workflows/ci.yml:202`, `:206` |
| Ruff, scripts/tools | `ruff check --config backend/pyproject.toml scripts tools`; `ruff format --check --config backend/pyproject.toml scripts tools` | `.github/workflows/repo-hygiene.yml:677`, `:685` |
| Repo-hygiene structural guards | 32 stdlib-only guards, including `python scripts/check_architecture_manifest.py` (manifest-vs-tree), `python scripts/check_permission_registration.py` (security baseline), `python scripts/check_nsis_template_drift.py`, version sync, config syntax, module manifests | `.github/workflows/repo-hygiene.yml:112`–`:957` (each command cited in the script) |
| Brand tokens | `python scripts/check_no_brand_tokens.py`; `python scripts/check_no_proprietary_classification.py` | `.github/workflows/ci.yml:102`, `:117`; first also doubled at `repo-hygiene.yml:921` |
| Secret scan | pinned gitleaks 8.30.1 self-test, then range scan `gitleaks git . --config .gitleaks.toml --redact --no-banner --verbose --log-opts="<base>..<head>"`, falling back to `gitleaks dir . …` | `.github/workflows/secret-scan.yml:47`–`:54`, `:84`, `:129`–`:133` |

CI runs its workflows in parallel, so there is no single global order across
families. Within each family the script preserves the workflow's own step
order; the family order above is the order used here and in the script.

The script uses `.venv/bin/python` and `.venv/bin/ruff` when present, otherwise
`python3` and `ruff` from PATH. CI pins ruff 0.16.6 in `backend/pyproject.toml`
and Python 3.12; a different local formatter version can reformat code into a shape CI rejects, so use the venv. It downloads the pinned gitleaks binary and checks
its SHA-256 exactly as `secret-scan.yml:47`–`:54` does, into `.gitleaks-local/`.

`GATE_FILTER=<substring>` runs one family while debugging. A normal run prints
`PASS`/`FAIL` per gate, names every failed gate at the end, and exits 1 if any
gate failed. All gates run even after an early failure, so one run reports the
whole gap.

## What CANNOT run locally on an ~8 GB machine

These must be declared in the PR body under a `Not run locally` heading, with
the reason. Do not claim them as verified.

- **Frontend full suite** (`ci.yml:546`, `:590`; `npm ci` + `npm run test`).
  The whole-program `tsc`/`vite build` path needs `NODE_OPTIONS=--max-old-space-size=12288`
  (12 GB heap) on ubuntu/windows — more than this machine has. This box has
  Node 18; CI pins Node 24 (`ci.yml:478`–`:481`), and Node 18 fails the installed
  jsdom/vitest stack with `ERR_REQUIRE_ESM`. Even with Node 24, the 14k-test
  three-OS matrix is a runner workload, not a pre-push gate.
- **Backend CI unit shards** (`ci.yml:229`–`:232`): ~6300 tests across six
  shards, each with a PostgreSQL 16 service, 90 minutes per shard. Run a single
  targeted `pytest` file locally instead and say which file.
- **The full `tests/pg` lane** (`ci-postgres.yml:139`): measured at 2960 passed
  in 49 minutes on the runner. Locally, run only the affected test file (as was
  done for the `UpdateChecker.tsx` fix) and name the file.
- **Tenant isolation / IDOR, access-control, upgrade-from-previous-release,
  pack installs, cost bases, API smoke** (`ci-postgres.yml`): runner-scale
  Postgres clusters, multi-minute module tests, or a second virtualenv with a
  released wheel downloaded from PyPI.
- **E2E cross-OS with real browsers** (`e2e-cross-os.yml`): nine OS/browser
  legs, schedule-only, needs installed browsers and all three OS runners.
- **Nightly full suite** (`ci-full.yml`): 32 shards plus embedded-PG macOS and
  Windows legs, schedule-only.
- **Desktop packaging / code signing / release** (`desktop-release.yml`,
  `release*.yml`): tag/release-context workflows with signing material.
- **Windows and macOS legs** of every matrix: this is a Linux box; path and
  CRLF behaviour on those runners cannot be reproduced here.
- **CodeQL, dependency review, GitGuardian, Scorecard**: hosted-app or
  GitHub-context checks; no local equivalent that produces the same verdict.

## The rule

Before the first push of a branch, run the gates above locally and put their
results in the PR body:

```
Local verification (before first push):
- scripts/pre-push-gates.sh: PASS (40/40 gates; <date>)
- pytest backend/tests/pg/test_update_check_policy.py -q: 13 passed

Not run locally:
- Frontend full suite — needs Node 24 / 12 GB heap / three OS runners
- Backend six-shard unit matrix — 6 × ~10 min with Postgres services
- E2E cross-OS — schedule-only, real browsers on nine legs
```

The PR body lists what ran locally and the result **before** the first push,
not after CI reports a failure. Every pushed commit re-runs the script; a fix
commit is not an exception. If a gate is red locally, fix it before pushing —
CI will ask the same question, on the same tree, with the same command.
