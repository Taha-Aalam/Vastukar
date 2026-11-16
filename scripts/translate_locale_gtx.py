#!/usr/bin/env python3
"""Fill the i18n_new_locale.py extract batches with machine translations.

Tool and API
------------
Google Translate, via its public ``translate_a`` endpoints on
``translate.googleapis.com`` (the ``client=gtx`` family — the same engine the
translate website uses), called WITHOUT an API key:

* bulk: ``POST /translate_a/t?client=gtx&sl=en&tl=<lang>`` with one ``q=``
  form field per source string; the reply is a JSON array with one entry per
  ``q``, in order;
* single: ``GET /translate_a/single?client=gtx&sl=en&tl=<lang>&dt=t&q=...``
  for per-string retries; the reply's ``[0][i][0]`` segments are joined.

The bulk endpoint is an unofficial surface and is rate limited; the script
therefore sends ~24 strings per request (with a per-request character cap),
keeps a soft requests-per-second ceiling, backs off exponentially on
429/5xx, and dedupes identical source strings within a language (short UI
labels repeat a lot; the dedupe both saves requests and makes the same
English label translate the same way every time it appears).

What must never be translated
-----------------------------
i18next reads these strings back as templates, so the script sentinel-encodes
everything that is structure rather than prose before the request and
verifies it came back intact afterwards:

* interpolation placeholders (``{{name}}``, ``{{count}}``) — the braces and
  the exact name are the lookup key;
* i18next ``<Trans>`` tags (``<0>``, ``</1>``, ``<strong>``) — the markup the
  React side re-renders;
* URLs — printed, never translated;
* the brand name ``Vastukar``;
* keyboard shortcuts (``Ctrl+S``, ``Shift+Click``);
* the technical tokens BOQ, BIM and ERP, kept as-is by policy.

Each protected span becomes a private-use-area sentinel (``\\uE000`` + index +
``\\uE001``), which the engine treats as opaque characters. After the reply
the sentinels must all be back, each exactly once, with no leftover marker
characters; a string that fails that check, or whose reply still carries no
target-language text, is retried once through the single endpoint and, if it
still fails, is left as its English seed and counted in the run report
instead of shipping a corrupted template. The parity gates
(``check_locale_english_placeholder.py`` and the vitest placeholder tests)
then quantify whatever was left behind.

Batches, pivot values, resume
-----------------------------
The batches are what ``scripts/i18n_new_locale.py extract`` writes: one JSON
object per batch, ``{key: english_value}``, translated IN PLACE (keep the
keys, replace the values) so ``assemble`` can rebuild the locale file from
them unchanged. A finished batch is recorded in ``_mt_done.json`` beside the
batches and skipped on the next run unless ``--force`` — the exact-match
resume an English seed allows is not usable here, because a string the engine
legitimately declined to translate (an untranslatable token, a pure number)
keeps its English seed on purpose and must not be re-requested forever.

Keys with no English anywhere in the tree (``extract`` seeds them as ``""`` —
see ``_no_english.txt``) cannot be machine translated from English. They are
translated by pivot from a fully translated sibling locale by hand, written
to ``.i18n-work/<lang>/_pivot.json`` as ``{key: value}``, and ``--pivot``
injects them into the batches before anything else runs. Empty seeds are
never sent to the engine.

Usage::

    python -I scripts/translate_locale_gtx.py --lang ta --lang te [--pivot]
    python -I scripts/translate_locale_gtx.py --lang ta --limit 40   # smoke
"""

from __future__ import annotations

import argparse
import json
import random
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".i18n-work"

BULK_URL = "https://translate.googleapis.com/translate_a/t"
SINGLE_URL = "https://translate.googleapis.com/translate_a/single"

# Structure, never prose. Each pattern's matches are replaced by sentinels in
# one pass, in this order, so a URL is not half-swallowed by another rule.
PLACEHOLDER = re.compile(r"\{\{[^{}]+\}\}")
URL = re.compile(r"https?://[^\s\"'<>]+")
TAG = re.compile(r"</?[A-Za-z0-9_]+>")
BRAND = re.compile(r"Vastukar")
SHORTCUT = re.compile(r"\b(?:Ctrl|Shift|Alt|Cmd|Win|Meta)\s*\+[\w+]+")
TECH = re.compile(r"\b(?:BOQ|BIM|ERP)\b")
PROTECTED = [PLACEHOLDER, URL, TAG, BRAND, SHORTCUT, TECH]

SENTINEL_OPEN = "\ue000"
SENTINEL_CLOSE = "\ue001"
SENTINEL_RE = re.compile(SENTINEL_OPEN + r"(\d+)" + SENTINEL_CLOSE)
PLACEHOLDER_NAME_RE = re.compile(r"\{\{([^{}]+)\}\}")
MAX_SENTINELS = 100
MAX_QS = 24
MAX_REQUEST_CHARS = 4500

session = requests.Session()
session.headers["User-Agent"] = "Mozilla/5.0 (locale-batch-translation)"
print_lock = threading.Lock()


def log(message: str) -> None:
    with print_lock:
        print(message, flush=True)


def protect(value: str) -> tuple[str, list[str]] | None:
    """Replace every protected span with a sentinel; None when too busy a string."""
    spans: list[str] = []

    def sub(match: re.Match[str]) -> str:
        if len(spans) >= MAX_SENTINELS:
            return match.group(0)
        spans.append(match.group(0))
        return f"{SENTINEL_OPEN}{len(spans) - 1}{SENTINEL_CLOSE}"

    text = value
    for pattern in PROTECTED:
        text = pattern.sub(sub, text)
    if len(spans) >= MAX_SENTINELS:
        return None
    return text, spans


def unprotect(text: str, spans: list[str]) -> str | None:
    """Restore the sentinels, or None when any of them did not come back."""
    if SENTINEL_OPEN in text:
        restored = SENTINEL_RE.sub(lambda m: spans[int(m.group(1))], text)
    else:
        restored = text
    if SENTINEL_OPEN in restored or SENTINEL_CLOSE in restored:
        return None
    if all(span in restored for span in spans):
        return restored
    # The engine sometimes strips the private-use markers but keeps the digits
    # between them (`0` comes back as ` 0 `). When the
    # reply holds exactly one standalone digit-run per sentinel and every run
    # is a valid index, restore by position; any digit that is part of the
    # translation itself (a year, a quantity) makes the run counts disagree
    # and this fallback refuses rather than guess.
    runs = re.findall(r"(?<!\d)\d+(?!\d)", restored)
    if len(runs) == len(spans) and all(int(r) < len(spans) for r in runs):
        for m in reversed(list(re.finditer(r"(?<!\d)\d+(?!\d)", restored))):
            restored = restored[: m.start()] + spans[int(m.group(0))] + restored[m.end() :]
        if SENTINEL_OPEN in restored or SENTINEL_CLOSE in restored:
            return None
        if all(span in restored for span in spans):
            return restored
    return None


def placeholder_names(value: str) -> list[str]:
    return sorted(PLACEHOLDER_NAME_RE.findall(value))


class Throttle:
    """A soft requests-per-second ceiling shared by every worker."""

    def __init__(self, per_second: float) -> None:
        self.interval = 1.0 / per_second if per_second > 0 else 0.0
        self.lock = threading.Lock()
        self.next_at = 0.0

    def wait(self) -> None:
        if self.interval <= 0:
            return
        with self.lock:
            start = max(time.monotonic(), self.next_at)
            self.next_at = start + self.interval
        time.sleep(max(0.0, start - time.monotonic()))


def backoff_sleep(attempt: int, cap: float = 60.0) -> None:
    time.sleep(min(2**attempt + random.random(), cap))


def request_bulk(texts: list[str], lang: str) -> list[str] | None:
    """One bulk request; None means the network refused us after retries."""
    for attempt in range(7):
        try:
            response = session.post(
                BULK_URL,
                params={"client": "gtx", "sl": "en", "tl": lang},
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


def request_single(text: str, lang: str) -> str | None:
    # Two attempts with short backoff: the single endpoint exists here to
    # rescue individual mangled strings, not to absorb rate limiting — a
    # throttled run belongs to the bulk path, which retries as a chunk.
    for attempt in range(2):
        try:
            response = session.get(
                SINGLE_URL,
                params={"client": "gtx", "sl": "en", "tl": lang, "dt": "t", "q": text},
                timeout=30,
            )
            if response.status_code == 429 or response.status_code >= 500:
                raise requests.HTTPError(str(response.status_code))
            response.raise_for_status()
            payload = json.loads(response.text)
            segments = payload[0]
            return "".join(seg[0] for seg in segments if seg and seg[0])
        except (requests.RequestException, json.JSONDecodeError, IndexError, TypeError):
            backoff_sleep(attempt, cap=8.0)
    return None


def finish(source: str, candidate: str, lang: str) -> str | None:
    """Validate one raw reply; return the final value or None to keep English."""
    spans = protect(source)
    if spans is None:
        return None
    marked, spans = spans
    restored = unprotect(candidate, spans)
    if restored is None or not restored.strip():
        return None
    if restored == source:
        return None  # engine declined to translate; English under a locale key hides
    if placeholder_names(restored) != placeholder_names(source):
        return None
    return restored


def translate_sources(sources: list[str], lang: str, throttle: Throttle) -> dict[str, str]:
    """Translate distinct English sources; absent entries failed and stay English."""
    chunks: list[list[str]] = []
    chunk: list[str] = []
    chars = 0
    for source in sources:
        if chunk and (len(chunk) >= MAX_QS or chars + len(source) > MAX_REQUEST_CHARS):
            chunks.append(chunk)
            chunk, chars = [], 0
        chunk.append(source)
        chars += len(source)
    if chunk:
        chunks.append(chunk)

    results: dict[str, str] = {}
    failed: list[str] = []

    def worker(chunk_: list[str]) -> None:
        throttle.wait()
        reply = request_bulk(chunk_, lang)
        if reply is None:
            with print_lock:
                failed_chunks.append(list(chunk_))
            return
        for source, candidate in zip(chunk_, reply, strict=False):
            value = finish(source, candidate, lang)
            if value is None:
                with print_lock:
                    failed.append(source)
            else:
                results[source] = value

    failed_chunks: list[list[str]] = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(worker, chunks))

    # A chunk the network refused is retried AS a chunk first — a 429 costs
    # one backoff for 24 strings, not 24 separate single requests. What is
    # left after that is the genuinely hard tail (a mangled sentinel, an
    # untranslatable token, a declined engine) and goes through the single
    # endpoint, in parallel.
    retry_chunks = failed_chunks
    while retry_chunks:
        throttle.wait()
        reply = (
            request_bulk([x for c in retry_chunks for x in c], lang)
            if (sum(len(c) for c in retry_chunks) <= MAX_QS)
            else None
        )
        if reply is None:
            with ThreadPoolExecutor(max_workers=4) as pool:
                list(pool.map(lambda c: worker(c), retry_chunks))
            break
        offset = 0
        for chunk_ in retry_chunks:
            for source, candidate in zip(chunk_, reply[offset : offset + len(chunk_)], strict=False):
                value = finish(source, candidate, lang)
                if value is None:
                    failed.append(source)
                else:
                    results[source] = value
            offset += len(chunk_)
        break

    def retry_single(source: str) -> None:
        if source in results:
            return
        throttle.wait()
        marked = protect(source)
        if marked is None:
            return
        reply = request_single(marked[0], lang)
        if reply is not None:
            value = finish(source, reply, lang)
            if value is not None:
                results[source] = value

    tail = [s0 for s0 in failed if s0 not in results]
    if tail:
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(retry_single, tail))
    return results


def inject_pivot(lang: str) -> int:
    """Write the hand-made pivot translations into the batches, in place."""
    pivot_path = WORK / lang / "_pivot.json"
    if not pivot_path.exists():
        return 0
    pivot = json.loads(pivot_path.read_text(encoding="utf-8"))
    injected = 0
    for path in sorted(WORK.joinpath(lang).glob("batch_*.json")):
        values = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for key, value in pivot.items():
            if key in values and values[key] != value:
                values[key] = value
                changed = True
                injected += 1
        if changed:
            path.write_text(json.dumps(values, ensure_ascii=False, indent=2), encoding="utf-8")
    return injected


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--lang", action="append", required=True, help="target language code (repeatable)")
    parser.add_argument("--limit", type=int, default=0, help="translate only the first N keys per batch")
    parser.add_argument("--force", action="store_true", help="redo batches already recorded in _mt_done.json")
    parser.add_argument("--pivot", action="store_true", help="inject .i18n-work/<lang>/_pivot.json first")
    parser.add_argument(
        "--retry-english",
        action="store_true",
        help="second pass: retranslate only values still identical to their resolved English source",
    )
    parser.add_argument("--rps", type=float, default=6.0, help="soft requests-per-second ceiling")
    args = parser.parse_args()

    for lang in args.lang:
        directory = WORK / lang
        if not directory.is_dir():
            log(f"{lang}: no extract found under {directory}, run i18n_new_locale.py extract first")
            return 1
        throttle = Throttle(args.rps)
        if args.pivot:
            log(f"{lang}: injected {inject_pivot(lang)} pivot value(s)")
        if args.retry_english:
            from i18n_new_locale import english_sources

            sources_map = {k: v[0] for k, v in english_sources().items()}
            cache2: dict[str, str] = {}
            report2 = {"translated": 0, "kept_english": 0}
            batches = sorted(directory.glob("batch_*.json"))
            for index, path in enumerate(batches):
                values: dict[str, str] = json.loads(path.read_text(encoding="utf-8"))
                keys = [k for k, v in values.items() if v and sources_map.get(k) == v]
                if not keys:
                    continue
                uniq: list[str] = []
                for k in keys:
                    if values[k] not in cache2 and values[k] not in uniq:
                        uniq.append(values[k])
                if uniq:
                    for src, val in translate_sources(uniq, lang, throttle).items():
                        cache2[src] = val
                changed = 0
                for k in keys:
                    val = cache2.get(values[k])
                    if val and val != values[k]:
                        values[k] = val
                        changed += 1
                    elif val is None:
                        report2["kept_english"] += 1
                report2["translated"] += changed
                if changed:
                    tmp = path.with_suffix(".json.tmp")
                    tmp.write_text(json.dumps(values, ensure_ascii=False, indent=2), encoding="utf-8")
                    tmp.replace(path)
                log(f"{lang}: retry-english batch {index + 1}/{len(batches)}: {changed} fixed, {len(keys)} targeted")
            (directory / "_mt_retry_report.json").write_text(json.dumps(report2, indent=2), encoding="utf-8")
            log(f"{lang}: retry-english translated={report2['translated']} kept_english={report2['kept_english']}")
            continue
        done_path = directory / "_mt_done.json"
        done: set[str] = set()
        if done_path.exists():
            done = set(json.loads(done_path.read_text(encoding="utf-8")))
        cache: dict[str, str] = {}
        report = {"translated": 0, "kept_english": 0}
        batches = sorted(directory.glob("batch_*.json"))
        for index, path in enumerate(batches):
            if path.name in done and not args.force:
                continue
            values: dict[str, str] = json.loads(path.read_text(encoding="utf-8"))
            keys = [key for key, value in values.items() if value != ""]
            if args.limit:
                keys = keys[: args.limit]
            sources: list[str] = []
            for key in keys:
                source = values[key]
                if source not in cache and source not in sources:
                    sources.append(source)
            if sources:
                for source, value in translate_sources(sources, lang, throttle).items():
                    cache[source] = value
            translated = kept = 0
            for key in keys:
                value = cache.get(values[key])
                if value:
                    values[key] = value
                    translated += 1
                else:
                    kept += 1
            report["translated"] += translated
            report["kept_english"] += kept
            tmp = path.with_suffix(".json.tmp")
            tmp.write_text(json.dumps(values, ensure_ascii=False, indent=2), encoding="utf-8")
            tmp.replace(path)
            log(f"{lang}: batch {index + 1}/{len(batches)} {path.name}: {translated} translated, {kept} kept English")
            if not args.limit:
                done.add(path.name)
                done_path.write_text(json.dumps(sorted(done)), encoding="utf-8")
        (directory / "_mt_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        log(f"{lang}: translated={report['translated']} kept_english={report['kept_english']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
