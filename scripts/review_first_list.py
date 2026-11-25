#!/usr/bin/env python3
"""Emit the per-language "review-first" list for the Indian-language rollout.

Machine translation can be complete and still wrong in the places a reader
looks at first. This script ranks the shipped keys by how visible they are —
navigation, common actions, authentication, the first-run wizard, the login
screen, the dashboard — and writes the ~200 highest-ranked, with their English
source and the shipped value, to ``docs/india-rollout/review-first/<lang>.md``.
Those are the strings a native speaker reads before the language can be
promoted from "machine translated" to "translated"; the rest of the corpus is
noted as review-on-report rather than review-first.

Usage::

    python -I scripts/review_first_list.py ta te mr gu kn ml pa
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from i18n_new_locale import english_sources, shipped_values  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "india-rollout" / "review-first"

# Priority-ordered prefixes; `re` counts as an exact match, a prefix as a
# namespace. Namespaces not listed here are the long tail: reviewed on the
# corpus reports, not before promotion.
PRIORITY = [
    "nav",
    "common",
    "auth",
    "login",
    "register",
    "forgot",
    "reset",
    "onboarding",
    "setup",
    "dashboard",
    "header",
    "sidebar",
    "settings.general",
    "settings.regional",
    "settings.language",
    "projects",
    "topbar",
    "learn.page_subtitle",
    "support",
    "about.stat",
]

LANGUAGES = {
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "mr": "Marathi (मराठी)",
    "gu": "Gujarati (ગુજરાતી)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
}

LIMIT = 200


def rank(key: str) -> int:
    for index, prefix in enumerate(PRIORITY):
        if key == prefix or key.startswith(prefix + "."):
            return index
    return len(PRIORITY)


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    english = {k: v[0] for k, v in english_sources().items()}
    OUT.mkdir(parents=True, exist_ok=True)
    for code in sys.argv[1:]:
        values = shipped_values(code)
        if not values:
            print(f"{code}: no shipped bundle at frontend/src/app/locales/{code}.ts, assemble first")
            return 1
        keys = sorted(values, key=lambda k: (rank(k), k))
        picked = [k for k in keys if rank(k) < len(PRIORITY)][:LIMIT]
        lines = [
            f"# Review-first: {LANGUAGES.get(code, code)} (`{code}`)",
            "",
            f"The {len(picked)} highest-visibility keys of `{code}.ts` — navigation, common",
            "actions, authentication, the first-run wizard, the login screen, the dashboard —",
            "need a native-speaker read before the language is promoted from",
            "machine-translated to translated. The `|` column is what ships today.",
            "",
            "| Key | English (source) | Ships today |",
            "| --- | --- | --- |",
        ]
        for key in picked:
            english_text = english.get(key, "*(no English text in the tree)*")
            row = " | ".join(
                cell.replace("|", "\\|").replace(chr(10), " ") for cell in (key, english_text, values[key])
            )
            lines.append(f"| {row} |")
        out = OUT / f"{code}.md"
        out.write_text(chr(10).join(lines) + chr(10), encoding="utf-8")
        print(f"{code}: {len(picked)} keys -> {out.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
