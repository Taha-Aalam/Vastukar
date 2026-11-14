// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
import { describe, expect, it, vi } from 'vitest';

/**
 * A regional variant has to actually *download* the language it falls back to —
 * and, since the India rollout, no regional variant is offered at all.
 *
 * `i18n.ts` has named the chain for a long time - `fallbackLng` maps es-MX to
 * ['es', 'en'] - and that map was correct and inert until `loadLocaleResource`
 * learned to fetch the base alongside the variant. That fix was proven here
 * with es-MX fixtures: the loader was called for real, and the store was
 * probed for a base bundle that only the loader change could put there. Six
 * tests covered the mechanics: the base bundle lands in the store, the variant
 * still loads, a key only the base defines resolves through the chain, a key
 * both define keeps the variant's wording, and the bundled-English base asks
 * for no second chunk. The full set is one `git log` away; restore it the day
 * a regional variant re-enters ``ENABLED_LOCALES`` — the loader code is
 * untouched by the rollout, and the tests were deleted with their subject, not
 * with their correctness.
 *
 * What is pinned now is the other half, and it is the half the rollout made
 * load-bearing: a variant (or any code) outside the allowlist is refused at
 * runtime, even when someone asks for it directly and its bundle sits in the
 * tree. `loadLocaleChunk` answers ``SUPPORTED_LANGUAGES`` — the filtered list —
 * so a hidden language gets no chunk, no store entry, and no fallback-chain
 * half-load that could resurrect it behind the picker's back.
 * ``matchSupportedLanguage`` shows the resolution each code gets instead.
 *
 * Every locale chunk is mocked. `localeKeyResolution.test.ts` records why the
 * real ones cannot be used: they are megabytes of object literal and handing
 * one to the vitest transform pipeline times the worker out - measured at ~55s
 * for `en.ts` alone, which killed the pool worker outright before any
 * assertion ran. The stub is shaped exactly the way a locale file is shaped,
 * one `translation` member of flat dotted keys, so the same code path consumes
 * it. The es-MX / es / en-US stubs the previous version of this file mocked
 * are gone with the assertions they fed: nothing offers those codes now, so
 * nothing would load them for a stub to answer.
 *
 * The fixtures go through `vi.hoisted` because `vi.mock` factories are hoisted
 * above ordinary `const` declarations, and `../i18n` imports `./locales/en`
 * statically - a plain const would still be in its temporal dead zone when
 * that factory runs.
 */

const { PROBE_KEY, EN } = vi.hoisted(() => {
  const probeKey = 'cases.__probe_in_both';
  /** Final fallback. Only has to exist and be shaped right. */
  const en: Record<string, string> = {
    [probeKey]: 'Payment certificate',
  };
  return { PROBE_KEY: probeKey, EN: en };
});

vi.mock('../locales/en', () => ({ default: { translation: EN } }));

// Imported statically, not inside a hook: the module-level cost of `i18n.ts` is
// paid during collection, which is not charged against any test timeout.
import i18n, { isLocaleLoaded, loadLocaleResource, matchSupportedLanguage } from '../i18n';

describe('a regional variant outside the allowlist loads nothing', () => {
  it('leaves unsupported Mongolian unloaded, including a regional request', async () => {
    const englishBefore = { ...i18n.getResourceBundle('en', 'translation') };
    for (const code of ['mn', 'mn-MN']) {
      await expect(loadLocaleResource(code)).resolves.toBeUndefined();
      expect(matchSupportedLanguage(code)).toBeNull();
      expect(isLocaleLoaded(code)).toBe(false);
      expect(i18n.getResourceBundle(code, 'translation')).toBeUndefined();
    }
    expect(i18n.getResourceBundle('en', 'translation')).toEqual(englishBefore);
  });

  it('refuses a variant the allowlist hides, and fetches its base neither', async () => {
    // es-MX was offered and this file proved its base-chaining worked. The
    // language is hidden now, and hiding must hold at runtime, not only in the
    // picker: a direct request — the pack-locale hook, a stale saved
    // preference, a test — loads no es-MX chunk and no es base chunk either,
    // because the refusal fires before the base derivation runs. Probed with
    // `isLocaleLoaded`, not `getResourceBundle`: the module registry
    // legitimately adds small nav-key bundles for languages it ships module
    // strings for at boot, so a Spanish bucket exists here regardless — what
    // must never exist is the *locale chunk*, which is what isLocaleLoaded
    // tracks.
    await expect(loadLocaleResource('es-MX')).resolves.toBeUndefined();
    expect(matchSupportedLanguage('es-MX')).toBeNull();
    expect(isLocaleLoaded('es-MX')).toBe(false);
    expect(isLocaleLoaded('es')).toBe(false);
  });

  it('answers the regional English variants with the bundled English and loads no chunk', async () => {
    // en-US used to exercise the "base is the bundled English" branch: base
    // `en` is seeded into `loadedLocales` and ships in the main bundle, so
    // nothing extra was fetched. The variant is hidden now, so the refusal
    // branch answers first — and the store must look exactly as it did: the
    // bundled English untouched, no en-US chunk. matchSupportedLanguage
    // answers 'en-US' with 'en': the regional entry is gone from the offered
    // set, so the base-language match is what answers, which is precisely the
    // "en-GB and en-US map to en" behaviour the rollout promised. Named here
    // so the `'en'` seed cannot be dropped later without a test going red.
    await expect(loadLocaleResource('en-US')).resolves.toBeUndefined();
    expect(matchSupportedLanguage('en-US')).toBe('en');
    expect(isLocaleLoaded('en-US')).toBe(false);
    const bundle = i18n.getResourceBundle('en', 'translation') as Record<string, string>;
    expect(bundle?.[PROBE_KEY]).toBe(EN[PROBE_KEY]);
  });

  it('still resolves the region of an offered language to that language', () => {
    // The full-code-first lookup the file was written around is unchanged;
    // it just answers into the allowlist now. hi-IN is a Hindi reader, not a
    // failed lookup — and every English region falls to the unqualified entry
    // while en-GB is hidden, day-first rule deliberately inert.
    expect(matchSupportedLanguage('hi-IN')).toBe('hi');
    expect(matchSupportedLanguage('ur-PK')).toBe('ur');
    expect(matchSupportedLanguage('bn-BD')).toBe('bn');
    expect(matchSupportedLanguage('en-GB')).toBe('en');
    expect(matchSupportedLanguage('en-IN')).toBe('en');
  });
});
