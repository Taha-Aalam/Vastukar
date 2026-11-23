#!/usr/bin/env bash
# Pre-push gates: the fast, deterministic gates that CI runs and that a
# developer machine can run without a hosted runner. Each gate is invoked with
# the exact command its workflow uses; the workflow file:line is cited above
# the invocation. No gate here writes to the tree.
#
# CI runs its workflows in parallel, so there is no global execution order
# across them. Within each family the order below is the workflow's own step
# order, and the families follow the order in docs/pre-push-verification.md.
#
# Usage: scripts/pre-push-gates.sh          # run every gate
#        GATE_FILTER=brand scripts/pre-push-gates.sh   # one family (debugging)
#
# Exit status: 0 = every gate passed; 1 = at least one gate failed.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -x "$ROOT/.venv/bin/python" ]; then
  PY="$ROOT/.venv/bin/python"
else
  PY="python3"
fi
if [ -x "$ROOT/.venv/bin/ruff" ]; then
  RUFF="$ROOT/.venv/bin/ruff"
else
  RUFF="ruff"
fi

PASSED=0
FAILED=0
SKIPPED=0
declare -a FAILED_NAMES=()

gate() {
  local name="$1"; shift
  if [ -n "${GATE_FILTER:-}" ] && [[ "$name" != *"$GATE_FILTER"* ]]; then
    SKIPPED=$((SKIPPED+1))
    return
  fi
  printf '\n=== GATE: %s ===\n' "$name"
  local start rc
  start=$(date +%s)
  ( "$@" )
  rc=$?
  if [ "$rc" -eq 0 ]; then
    printf '%s\n' "--- PASS: $name ($(( $(date +%s) - start ))s)"
    PASSED=$((PASSED+1))
  else
    printf '%s\n' "--- FAIL: $name (exit $rc, $(( $(date +%s) - start ))s)"
    FAILED=$((FAILED+1))
    FAILED_NAMES+=("$name")
  fi
}

# ── 1. Ruff lint + format gate ───────────────────────────────────────────────
# .github/workflows/ci.yml:202  (backend job, working-directory: backend, line 137)
cd "$ROOT/backend"
gate "ruff/backend-check"   "$RUFF" check .
gate "ruff/backend-format"  "$RUFF" format --check .
cd "$ROOT"
# .github/workflows/repo-hygiene.yml:677,685  (scripts/tools, from repo root)
gate "ruff/scripts-check"   "$RUFF" check --config backend/pyproject.toml scripts tools
gate "ruff/scripts-format"  "$RUFF" format --check --config backend/pyproject.toml scripts tools

# ── 2. Repo hygiene: Whole-tree structural guards ────────────────────────────
# Each citation is the `run:` line in the `structural` job of
# .github/workflows/repo-hygiene.yml, in that job's own step order.
gate "hygiene/notice-mirror"          "$PY" scripts/check_notice_mirror.py                 # :112
gate "hygiene/tree"                   "$PY" scripts/check_repo_hygiene.py                   # :116
gate "hygiene/version-sync"           "$PY" scripts/check_version_sync.py                  # :126
gate "hygiene/changelog-mirror"       "$PY" scripts/check_changelog_mirror.py              # :139
gate "hygiene/untracked-selftest"     "$PY" scripts/check_untracked_imports.py --self-test  # :166
gate "hygiene/untracked-imports"      "$PY" scripts/check_untracked_imports.py             # :170
gate "hygiene/nsis-drift"             "$PY" scripts/check_nsis_template_drift.py           # :206
gate "hygiene/head-imports"           "$PY" scripts/check_head_imports.py                   # :215
gate "hygiene/case-routes"            "$PY" scripts/check_case_routes.py                    # :223
gate "hygiene/route-allowlist"        "$PY" scripts/check_app_route_allowlist.py           # :242
gate "hygiene/country-portraits"      "$PY" scripts/gen_case_country_portraits.py --check  # :260
gate "hygiene/architecture-manifest"  "$PY" scripts/check_architecture_manifest.py         # :320
gate "hygiene/security-baseline"      "$PY" scripts/check_permission_registration.py       # :329
gate "hygiene/secret-denylist"        "$PY" scripts/check_secret_denylist_single_source.py # :354
gate "hygiene/module-manifests"       "$PY" scripts/check_module_manifests.py              # :369
gate "hygiene/prompt-selftest"        "$PY" scripts/check_prompt_provenance.py --self-test  # :390
gate "hygiene/prompt-provenance"      "$PY" scripts/check_prompt_provenance.py             # :392
gate "hygiene/module-inference"       "$PY" scripts/check_module_inference_declarations.py # :428
gate "hygiene/page-envelope"          "$PY" scripts/check_page_envelope_consumers.py       # :439
gate "hygiene/bare-list-endpoints"    "$PY" scripts/check_no_new_bare_list_endpoints.py    # :451
gate "hygiene/migration-rewrites"     "$PY" scripts/check_migration_data_rewrites.py       # :463
gate "hygiene/data-rewrite-boot"      "$PY" scripts/check_data_rewrite_boot_repair.py      # :486
gate "hygiene/migration-heads"        "$PY" scripts/check_migration_heads.py               # :498
gate "hygiene/shared-clock"           "$PY" scripts/check_shared_test_clock.py             # :514
gate "hygiene/font-licences"          "$PY" scripts/check_bundled_font_licences.py         # :533
gate "hygiene/docker-include-selftest" "$PY" scripts/check_docker_force_include_context.py --selftest # :554
gate "hygiene/docker-include"         "$PY" scripts/check_docker_force_include_context.py  # :556
gate "hygiene/frontend-api-routes"    "$PY" scripts/check_frontend_api_routes.py           # :821
gate "hygiene/config-syntax"          "$PY" scripts/check_config_file_syntax.py            # :854
gate "hygiene/demo-firm-names"        "$PY" scripts/check_demo_firm_names.py               # :879
gate "hygiene/dependency-licences"    "$PY" scripts/check_dependency_licences.py           # :902
gate "hygiene/workflow-guard-count"   "$PY" scripts/check_workflow_guard_count.py          # :957

# ── 3. Brand token checks ────────────────────────────────────────────────────
# .github/workflows/ci.yml:102 brand-check; :117 the second, !cancelled() step.
# repo-hygiene.yml:921 doubles the first one as a whole-tree guard.
gate "brand/tokens"                   "$PY" scripts/check_no_brand_tokens.py
gate "brand/proprietary-classification" "$PY" scripts/check_no_proprietary_classification.py

# ── 4. Secret scan ───────────────────────────────────────────────────────────
# .github/workflows/secret-scan.yml installs a pinned gitleaks at :47-54 and
# runs the self-test at :84, the range scan at :129-130 and the tree fallback at
# :133. Install it the same way (same URL, same SHA-256) when it is not present.
GITLEAKS="${GITLEAKS:-$ROOT/.gitleaks-local/gitleaks}"
GL_VERSION='8.30.1'                                                   # secret-scan.yml:30
GL_SHA256='551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb' # :33
if [ ! -x "$GITLEAKS" ]; then
  printf '\n=== Installing pinned gitleaks %s (secret-scan.yml:47-54) ===\n' "$GL_VERSION"
  mkdir -p "$ROOT/.gitleaks-local"
  tarball="$ROOT/.gitleaks-local/gitleaks.tar.gz"
  url="https://github.com/gitleaks/gitleaks/releases/download/v${GL_VERSION}/gitleaks_${GL_VERSION}_linux_x64.tar.gz"
  if curl -sSfL --retry 3 -o "$tarball" "$url" \
     && echo "${GL_SHA256}  ${tarball}" | sha256sum -c - \
     && tar -xzf "$tarball" -C "$ROOT/.gitleaks-local" gitleaks; then
    chmod +x "$GITLEAKS"
  else
    printf '--- FAIL: secret/install (could not fetch pinned gitleaks)\n'
    FAILED=$((FAILED+1)); FAILED_NAMES+=("secret/install")
    GITLEAKS=""
  fi
fi
if [ -n "$GITLEAKS" ] && [ -x "$GITLEAKS" ]; then
  # secret-scan.yml:68-95 — prove the scanner can fail before trusting a green.
  probe="${TMPDIR:-/tmp}/pre-push-gitleaks-probe-$$"
  mkdir -p "$probe"
  printf 'token = "ghp_%s"\n' '0123456789abcdefghijklmnopqrstuvwx12' > "${probe}/planted.txt"
  gate "secret/selftest" bash -c '
    set +e; set -uo pipefail
    "$1" dir "$2" --config .gitleaks.toml --no-banner --redact --verbose > "$2/probe.log" 2>&1
    rc=$?
    if [ "$rc" -eq 0 ] || ! grep -q "github-pat" "$2/probe.log"; then exit 1; fi
    exit 0' _ "$GITLEAKS" "$probe"
  rm -rf "$probe"

  # secret-scan.yml:121-134 — the same base resolution and command as CI.
  base=""
  if [ -n "${PR_BASE:-}" ]; then
    base="$PR_BASE"
  elif [ -n "${PUSH_BEFORE:-}" ] && [ "$PUSH_BEFORE" != "0000000000000000000000000000000000000000" ]; then
    base="$PUSH_BEFORE"
  elif git rev-parse -q --verify '@{upstream}^{commit}' > /dev/null; then
    base="$(git rev-parse '@{upstream}^{commit}')"
  fi
  head_sha="$(git rev-parse HEAD)"
  if [ -n "$base" ] && git rev-parse -q --verify "${base}^{commit}" > /dev/null; then
    printf '\n(scanning %s..%s)\n' "$base" "$head_sha"
    gate "secret/range" "$GITLEAKS" git . --config .gitleaks.toml --redact --no-banner --verbose --log-opts="${base}..${head_sha}"
  else
    printf '\n(no usable commit range; scanning the working tree, as secret-scan.yml:133 does)\n'
    gate "secret/tree" "$GITLEAKS" dir . --config .gitleaks.toml --redact --no-banner --verbose
  fi
fi

# ── Summary ──────────────────────────────────────────────────────────────────
printf '\n========== PRE-PUSH GATES SUMMARY ==========\n'
printf 'passed=%s failed=%s skipped=%s\n' "$PASSED" "$FAILED" "$SKIPPED"
if [ "$FAILED" -gt 0 ]; then
  printf 'FAILED GATES:\n'
  for n in "${FAILED_NAMES[@]}"; do printf '  - %s\n' "$n"; done
  exit 1
fi
printf 'All gates that ran passed.\n'
exit 0
