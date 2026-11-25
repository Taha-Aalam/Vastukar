#!/usr/bin/env python3
"""Pivot-translate the extract keys that have no English text anywhere.

``scripts/i18n_new_locale.py extract`` computes the target key set as the
union of every locale on disk minus the plural categories the target language
does not have. A small tail of that union — ~122 keys, listed in
``.i18n-work/<lang>/_no_english.txt`` — has no English text anywhere in the
tree: English supplies those keys inline at call sites that no longer exist,
or the key exists only in a locale that translated a screen English never
carried. ``extract`` seeds them as ``""`` and the plan step says honestly
that they "need a human".

Machine translation still answers most of them, from a different source: a
fully translated sibling locale. This script walks a source priority order
(Hindi first — an Indian language whose register the Indian target languages
share — then German, Russian, Spanish, French), sends the sibling value
through the same Google ``translate_a`` bulk endpoint the main MT script uses
(``sl`` set to the sibling language instead of ``en``), validates the reply
with the same placeholder/sentinel rules, and writes the result to
``.i18n-work/<lang>/_pivot.json`` plus into the batches, where the main
script's ``--pivot`` and ``assemble`` pick it up like any other translation.

A key no sibling answers is reported and left empty — genuinely a human key,
and ``verify`` will name it.

Usage::

    python -I scripts/pivot_locale_gtx.py --lang ta --lang te
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import requests  # noqa: E402
from i18n_new_locale import locale_paths, shipped_values  # noqa: E402
from translate_locale_gtx import (  # noqa: E402
    WORK,
    Throttle,
    backoff_sleep,
    finish,
    inject_pivot,
    log,
)

# Source priority: the Indian siblings first (closest register to the
# targets), then the major languages. The ~122 keys turned out to live in no
# single sibling — some only in hu and uz, some in cs/ar/es — so the walk has
# to cover every file on disk to leave nothing unresolved.
SOURCE_ORDER = [
    "hi",
    "bn",
    "de",
    "fr",
    "es",
    "pt",
    "it",
    "ru",
    "ja",
    "ko",
    "zh",
    "ar",
    "tr",
    "pl",
    "nl",
    "cs",
    "sv",
    "no",
    "da",
    "fi",
    "bg",
    "hr",
    "hu",
    "id",
    "ro",
    "th",
    "vi",
    "ky",
    "et",
    "kk",
    "fil",
    "fa",
    "he",
    "el",
    "uk",
    "uz",
    "en-US",
    "en-GB",
]
MAX_QS = 24


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--lang", action="append", required=True)
    parser.add_argument("--rps", type=float, default=4.0)
    args = parser.parse_args()

    throttle = Throttle(args.rps)
    # Every sibling value that could ever be needed, loaded once.
    on_disk = [p.stem for p in locale_paths()]
    source_order = [c for c in SOURCE_ORDER if c in on_disk] + [c for c in on_disk if c not in SOURCE_ORDER]
    siblings = {code: shipped_values(code) for code in source_order}

    for lang in args.lang:
        directory = WORK / lang
        no_english = [
            line.strip()
            for line in (directory / "_no_english.txt").read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        # One request per distinct (source language, source text) pair.
        jobs: list[tuple[str, str, list[str]]] = []  # (sl, source, [keys])
        index: dict[tuple[str, str], list[str]] = {}
        unresolved: list[str] = []
        for key in no_english:
            for code in source_order:
                source = siblings[code].get(key)
                if source and source.strip():
                    index.setdefault((code, source), []).append(key)
                    break
            else:
                unresolved.append(key)
        for (sl, source), keys in index.items():
            jobs.append((sl, source, keys))

        results: dict[str, str] = {}
        failed = 0
        for start in range(0, len(jobs), MAX_QS):
            chunk = jobs[start : start + MAX_QS]
            # The bulk endpoint takes one source language per request; these
            # chunks are small, so group by source language inside the chunk.
            by_sl: dict[str, list[tuple[str, list[str]]]] = {}
            for sl, source, keys in chunk:
                by_sl.setdefault(sl, []).append((source, keys))
            for sl, pairs in by_sl.items():
                texts = [source for source, _ in pairs]
                reply = request_bulk_lang(texts, sl, lang, throttle)
                if reply is None:
                    failed += len(pairs)
                    continue
                for (source, keys), candidate in zip(pairs, reply, strict=False):
                    value = finish(source, candidate, lang)
                    if value is None:
                        failed += 1
                        continue
                    for key in keys:
                        results[key] = value
        resolved = sum(1 for key in no_english if key in results)
        pivot_path = directory / "_pivot.json"
        existing: dict[str, str] = {}
        if pivot_path.exists():
            existing = json.loads(pivot_path.read_text(encoding="utf-8"))
        existing.update(results)
        pivot_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8")
        inject_pivot(lang)
        log(
            f"{lang}: pivot resolved {resolved}/{len(no_english)} key(s), "
            f"{failed} failed request(s), {len(unresolved)} key(s) with no sibling text "
            f"-> _pivot.json"
        )
        if unresolved:
            (directory / "_pivot_unresolved.txt").write_text("\n".join(unresolved) + "\n", encoding="utf-8")
    return 0


def request_bulk_lang(texts: list[str], sl: str, lang: str, throttle: Throttle) -> list[str] | None:
    """Bulk request with a non-English source language, same retry discipline."""
    for attempt in range(7):
        try:
            throttle.wait()
            response = requests.post(
                "https://translate.googleapis.com/translate_a/t",
                params={"client": "gtx", "sl": sl, "tl": lang},
                data=[("q", text) for text in texts],
                timeout=30,
            )
            if response.status_code == 429 or response.status_code >= 500:
                raise requests.HTTPError(str(response.status_code))
            response.raise_for_status()
            payload = json.loads(response.text)
            if isinstance(payload, list) and all(isinstance(item, str) for item in payload):
                if len(payload) == len(texts):
                    return payload
            return None
        except (requests.RequestException, json.JSONDecodeError, ValueError):
            backoff_sleep(attempt)
    return None


if __name__ == "__main__":
    sys.exit(main())
