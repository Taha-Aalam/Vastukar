# DDC-CWICR-OE: DataDrivenConstruction - OpenConstructionERP
# Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
"""​‌‍⁠​‌‍⁠​‌‍⁠​‌‍⁠A pack must not boot the generic parent of a locale it ships itself.

``default_locale`` is not documentation. The onboarding wizard hands it
straight to the language switcher (``onActivateLocale(pack.default_locale)`` in
frontend/src/features/onboarding/OnboardingWizard.tsx), so it is the language a
person sees the moment they finish picking their country.

The frontend resolver already does the right thing with a region subtag:
``matchSupportedLanguage`` in frontend/src/app/i18n.ts prefers ``pt-BR`` over
``pt`` whenever the platform offers it, and its docstring records the first
round of this defect - a Brazilian first run opening in European Portuguese
"with pt-BR.ts sitting unused a few lines away". The resolver can only prefer a
region it is given. The Mexico pack declared the bare ``es`` while shipping its
own ``locales/es-MX.json`` and while the platform offered a complete ``es-MX``
bundle, so the same failure survived one layer up, in the manifest: costo read
as coste, cimbra as encofrado, estimacion de obra as certificacion de obra.

This gate asks the question of every shipped pack rather than of Mexico, and it
asks it of the two lists that decide - the platform's language registry and the
pack's own ``additional_locales`` - so a pack added later cannot re-open it. The
population is asserted so a gate that stops finding any packs to check fails
instead of passing quietly.

Two lists, because the India rollout made the offer narrower than the registry.
``ENABLED_LOCALES`` names the eleven languages the picker offers and
``SUPPORTED_LANGUAGES`` is now a filter over it, so the resolver genuinely
answers nothing for the thirty-five packs that declare German, Spanish,
Portuguese and the rest; they boot in English until their language is re-enabled.
That is a recorded cost of the rollout, asserted on its own below. It is not
what this gate is about: the rule that a pack must declare the locale it ships
is a rule about manifests, and measuring it against the offer would empty the
population - not one of the nine regional locales a pack ships is still offered -
and pass because it had nothing left to check. Measured against the registry the
gate keeps its meaning and catches the defect the day the language comes back.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

from app.core.partner_pack.discovery import discover_packs

#: The file both lists are read from. Parsed rather than duplicated: a hand-kept
#: copy in this file would drift the first time a language is offered or
#: withdrawn, and it is exactly the drift between two mirrors of one registry
#: that this test is about.
_I18N_TS = Path(__file__).resolve().parents[3] / "frontend" / "src" / "app" / "i18n.ts"

#: The wheel ships ``app`` and ``packs`` without ``frontend``, so the file this
#: gate parses is a source-checkout fact. Skipping there is the honest answer:
#: the alternative is an error that reads as a broken gate, and a hand-kept copy
#: of the language list in this file is the exact drift the gate is about.
pytestmark = pytest.mark.skipif(
    not _I18N_TS.is_file(),
    reason=f"{_I18N_TS} is absent (installed layout, not a source checkout)",
)


def offered_codes() -> list[str]:
    """The language codes the picker offers, in declaration order.

    Read from ``ENABLED_LOCALES``, the allowlist. This used to scrape the
    ``code:`` fields inside the ``SUPPORTED_LANGUAGES`` literal; that literal is
    now a ``.filter()`` over this array, so scraping it finds no ``code:`` field
    at all and ``.index()`` raises rather than answering. Same parse as
    ``scripts/check_public_language_counts.py``, which made this move for the
    same reason: each entry carries a trailing ``// தமிழ் Tamil`` comment, so
    the comment is stripped before the codes are read, and the pattern takes
    only a two-or-three-letter tag so a word in a comment cannot be counted.
    """
    src = _I18N_TS.read_text(encoding="utf-8")
    start = src.index("export const ENABLED_LOCALES")
    end = src.index("\n];", start)
    active = "\n".join(line.split("//", 1)[0] for line in src[start:end].splitlines())
    return re.findall(r"'([a-z]{2,3}(?:-[A-Za-z0-9]+)?)'", active)


def registry_codes() -> list[str]:
    """Every language code the registry carries, offered or not.

    This is the set the manifest rule is judged against. ``es-MX`` and ``pt-BR``
    live here and in no offer, which is why the packs that ship them had to be
    answered separately.

    Not the same as "every bundle on disk": the registry is curated, and
    ``mn.ts`` sits on disk outside it (Mongolian was held back before this
    branch and the allowlist merely left it there). A pack declaring ``mn``
    would therefore be caught by the test below as naming a language the tree
    does not offer *through the registry*, which is the right answer - the
    loader refuses it too.
    """
    src = _I18N_TS.read_text(encoding="utf-8")
    start = src.index("const ALL_LANGUAGES")
    end = src.index("\n];", start)
    return re.findall(r"code:\s*'([A-Za-z0-9-]+)'", src[start:end])


def _match_supported(raw: str, available: set[str]) -> str | None:
    """The Python twin of ``matchSupportedLanguage`` in i18n.ts.

    Region first, then the base language. Kept deliberately short so it stays
    readable against the original; the original is the authority and this
    exists so the backend can answer the same question about pack manifests.
    """
    parts = raw.strip().split("-")
    if len(parts) >= 2 and parts[1]:
        regional = f"{parts[0].lower()}-{parts[1].upper()}"
        if regional in available:
            return regional
    base = parts[0].lower()
    return base if base in available else None


def test_the_offered_language_list_is_readable() -> None:
    """Guard the parser: a silent zero here would wave every pack through."""
    offered = offered_codes()
    assert len(offered) >= 8, f"parsed only {len(offered)} offered languages from {_I18N_TS}"
    assert "en" in offered, "English is always offered"
    assert len(set(offered)) == len(offered), f"duplicate codes in the allowlist: {offered}"


def test_the_registry_list_is_readable() -> None:
    """The list the manifest rule is judged against, guarded the same way.

    ``es-MX`` is asserted by name because it is the case this file was written
    for, and its absence would silently drop the Mexico pack from the population
    rather than fail.
    """
    registry = registry_codes()
    assert len(registry) >= 40, f"parsed only {len(registry)} registry languages from {_I18N_TS}"
    assert "es-MX" in registry, "the region the Mexico defect was about"
    assert "pt-BR" in registry, "the region the resolver's docstring cites"
    assert set(offered_codes()) <= set(registry), "an offered language is missing from the registry"


def test_no_pack_boots_the_parent_of_a_locale_it_ships() -> None:
    """A pack that carries a regional bundle has to boot into it.

    Judged against the registry, not the offer. Every regional locale the packs
    ship is outside the eleven-language offer, so the offer would leave this
    loop with nothing to check - and a gate with nothing to check passes.
    """
    available = set(registry_codes())
    packs = list(discover_packs())
    assert packs, "no packs discovered - the gate would pass on an empty population"

    checked: list[str] = []
    offenders: list[str] = []
    for m in packs:
        declared = (m.default_locale or "").strip()
        for shipped in m.additional_locales or {}:
            if shipped not in available:
                # The pack ships a bundle for a language the tree does not
                # carry at all. That is a pack defect of a different kind, and
                # it cannot be a boot default either way, so it is not this
                # gate's business.
                continue
            if "-" not in shipped:
                continue
            checked.append(f"{m.slug}:{shipped}")
            if shipped.split("-", 1)[0].lower() == declared.lower():
                offenders.append(
                    f"{m.slug} declares default_locale={declared!r} while shipping {shipped!r}, "
                    f"which the tree carries - the workspace boots into the generic parent"
                )

    assert checked, "no pack ships a regional bundle - population is empty, gate proves nothing"
    assert not offenders, "; ".join(offenders)


@pytest.mark.parametrize(
    ("slug", "expected"),
    [
        ("mexico-mx", "es-MX"),
        ("brazil-sinapi", "pt-BR"),
    ],
)
def test_the_declared_locale_survives_the_frontend_resolver(slug: str, expected: str) -> None:
    """Named individually: a population floor stays green while one pack slips.

    Brazil is here as the control. It was already right, and it is the pack the
    resolver's own docstring cites, so a change that broke the parsing above
    would take both rows down together rather than leave Mexico looking fine.
    """
    available = set(registry_codes())
    m = next((p for p in discover_packs() if p.slug == slug), None)
    assert m is not None, f"{slug} is not discoverable"
    assert _match_supported(m.default_locale, available) == expected


def test_no_pack_boots_in_english_unless_it_asks_for_english() -> None:
    """A declared language the resolver cannot place falls back to English, silently.

    Norway declared ``nb``, the BCP-47 tag for Bokmal, while the platform ships
    its Norwegian bundle as ``no``. The resolver found nothing for ``nb`` and
    answered ``en``, so the Norwegian pack opened in English with a complete
    Norwegian translation on disk. Asked of every pack, because the fallback
    is a plausible answer and nothing downstream can tell it from a choice.

    Judged against the registry for the same reason as the test above: a
    manifest that names a tag the tree does not carry is wrong whichever
    languages the picker currently shows, and it is the *only* reason this test
    should ever fire. The offer's own fallbacks are counted separately below.
    """
    available = set(registry_codes())
    packs = discover_packs()
    assert len(packs) > 30, f"only {len(packs)} packs discovered"
    english_by_accident = {
        m.slug: m.default_locale
        for m in packs
        if _match_supported(m.default_locale, available) in (None, "en")
        and not m.default_locale.lower().startswith("en")
    }
    assert not english_by_accident, f"packs whose declared locale resolves to English: {english_by_accident}"


def test_the_allowlists_cost_is_exactly_the_packs_it_hides() -> None:
    """Record what the eleven-language offer does to the pack catalogue.

    This branch narrows the picker to eleven languages. A pack whose declared
    language is outside them cannot load its own bundle either - ``loadLocaleChunk``
    refuses any code the offer does not name - so it boots in English. That is a
    deliberate trade, and this test is where its size is stated rather than
    discovered: the set must be non-empty (the trade was actually made) and every
    member must be a language the tree *does* carry, offered by a pack that ships
    it (the fallbacks are the allowlist's doing, not broken manifests).

    A pack declaring a language in neither list is excluded here and caught by
    the test above, so the two failure modes stay distinguishable.
    """
    offered = set(offered_codes())
    registry = set(registry_codes())
    hidden = {
        m.slug: m.default_locale
        for m in discover_packs()
        if (m.default_locale or "").strip().lower().split("-")[0] in registry - offered
        and not (m.default_locale or "").strip().lower().startswith("en")
    }
    assert hidden, "no pack falls back to English - the allowlist no longer hides anything, revise this test"
    unexplained = {slug: locale for slug, locale in hidden.items() if _match_supported(locale, registry) is None}
    assert not unexplained, f"packs declaring a language the tree does not carry at all: {unexplained}"
    # The two packs this file was written for are in the set, which is the
    # concrete confirmation that the cost reaches the case the defect was about.
    assert {"mexico-mx", "brazil-sinapi"} <= set(hidden)
