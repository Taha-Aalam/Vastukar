// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
// OpenConstructionERP — DataDrivenConstruction (DDC)
// Tests for normalizePackLocale: maps a partner pack's BCP-47 default_locale to
// a supported base UI language, so an active pack forces the right language
// and never an unsupported one.
//
// Since the India rollout the "supported" set is the ENABLED_LOCALES allowlist
// (en, hi, bn, ur), not every bundle on disk. A pack that names a language the
// product no longer offers is answered with English, exactly like a language
// the tree never shipped: the allowlist is the one place visibility is decided,
// and a pack must not resurrect a language the picker does not show. The
// bundles for de, fr, es, pt, hu, ar and the rest stay on disk, covered by the
// locale parity tests, so re-enabling any of them restores this mapping for it.
import { describe, expect, it } from 'vitest';

import { normalizePackLocale } from '../i18n';

describe('normalizePackLocale', () => {
  it('answers an offered language with itself', () => {
    expect(normalizePackLocale('en')).toBe('en'); // modular-prefab
    expect(normalizePackLocale('hi')).toBe('hi');
    expect(normalizePackLocale('bn')).toBe('bn');
    expect(normalizePackLocale('ur')).toBe('ur'); // RTL, as before
  });

  it('strips the region subtag of an offered language to the base language', () => {
    // An Indian language with a region still names that language: the region
    // narrows the market, never the strings.
    expect(normalizePackLocale('hi-IN')).toBe('hi');
    expect(normalizePackLocale('bn-BD')).toBe('bn');
    expect(normalizePackLocale('bn-IN')).toBe('bn');
    expect(normalizePackLocale('ur-PK')).toBe('ur');
  });

  it('maps every English region to the unqualified entry, which the allowlist offers', () => {
    // en-GB and en-US are no longer offered, so the day-first rule is
    // deliberately inert: matchSupportedLanguage requires en-GB to be IN the
    // offered set before it answers with it, and it is not. An Indian,
    // Australian or Irish pack now reads the same dates the unqualified entry
    // prints, which is the known cost of the rebrand decision — en-IN used to
    // reach en-GB here and read 14/03/2026. Restoring that needs either
    // en-GB back in ENABLED_LOCALES or the date order decoupled from the
    // picker; until then the unqualified entry is the honest answer, because
    // handing a pack a language the picker hides would resurrect it.
    expect(normalizePackLocale('en-IN')).toBe('en'); // india-cpwd
    expect(normalizePackLocale('en-AU')).toBe('en'); // aus
    expect(normalizePackLocale('en-NZ')).toBe('en'); // nzs
    expect(normalizePackLocale('en-IE')).toBe('en'); // ireland-ie
    expect(normalizePackLocale('en-CA')).toBe('en'); // canada-ca: not day-first either
    expect(normalizePackLocale('en-US')).toBe('en'); // commercial-denver, us-costdata
    expect(normalizePackLocale('en-GB')).toBe('en'); // uk-jct, commercial-london
  });

  it('falls back to English for a language the tree ships but the product does not offer', () => {
    // Each of these packs declared a language whose bundle is on disk and
    // tested, but which ENABLED_LOCALES does not offer. A pack that forced the
    // UI into one would decide visibility somewhere other than the allowlist,
    // and the picker would show a currentLang it cannot name.
    expect(normalizePackLocale('fr-CA')).toBe('en'); // batimatech-ca
    expect(normalizePackLocale('fr')).toBe('en');
    expect(normalizePackLocale('de')).toBe('en'); // bimhessen-de, doker-formwork
    expect(normalizePackLocale('pt')).toBe('en'); // portugal-pt
    expect(normalizePackLocale('pt-BR')).toBe('en'); // brazil-sinapi
    expect(normalizePackLocale('es-MX')).toBe('en');
    expect(normalizePackLocale('es-CL')).toBe('en');
    expect(normalizePackLocale('es-CO')).toBe('en');
    expect(normalizePackLocale('ar')).toBe('en'); // saudi-vision2030 (RTL)
    expect(normalizePackLocale('hu')).toBe('en'); // hungary-hu
  });

  it('is case-insensitive and trims', () => {
    expect(normalizePackLocale('FR-ca')).toBe('en');
    expect(normalizePackLocale(' de ')).toBe('en');
    // The offered set's own casing still normalises the way i18next spells a
    // two-part code, and the resource bundle is registered under that spelling.
    expect(normalizePackLocale('hi-in')).toBe('hi');
    expect(normalizePackLocale('HI-IN')).toBe('hi');
    expect(normalizePackLocale(' en-Us ')).toBe('en');
  });

  it('falls back to English for unsupported or empty locales', () => {
    expect(normalizePackLocale('xx-YY')).toBe('en');
    expect(normalizePackLocale('')).toBe('en');
    expect(normalizePackLocale(null)).toBe('en');
    expect(normalizePackLocale(undefined)).toBe('en');
  });
});
