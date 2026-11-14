// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
// OpenConstructionERP — DataDrivenConstruction (DDC)
// Tests for first-run language selection: resolveInitialLanguage asks for the
// full browser code before stripping the region, and detectCountry reads a
// country from the region subtag or, failing that, from the resolved language.
//
// Since the India rollout the codes a first run can land on are the
// ENABLED_LOCALES allowlist (en, hi, bn, ur), not every bundle on disk. The
// region-keeping behaviour this file was written to protect still exists for
// every language the allowlist offers — hi-IN opens in Hindi, not bare-hi
// confusion — while every English region resolves to plain en and a browser
// (or a stored preference) naming a now-hidden language falls back to English
// through the same validation, which is the graceful fallback the rollout
// promised. The bundles for pt-BR, de, fr and the rest stay on disk and stay
// covered by the locale parity tests; re-enabling one in the allowlist
// restores its first-run mapping with no further change.
import { afterEach, describe, expect, it } from 'vitest';

import { detectCountry, resolveInitialLanguage, SUPPORTED_LANGUAGES } from '../i18n';

const realLanguage = navigator.language;
const realLanguages = navigator.languages;

/**
 * Point navigator.language and localStorage at a clean first run.
 *
 * defineProperty rather than vi.spyOn: in jsdom `language` is an accessor on
 * Navigator.prototype, not an own property of the instance, and spyOn wants an
 * own descriptor.
 */
function firstRunWith(browserLanguage: string): void {
  Object.defineProperty(window.navigator, 'language', {
    value: browserLanguage,
    configurable: true,
  });
  // A real browser lists its language first in `languages`; jsdom's default
  // list is en-US whatever `language` says, and detectCountry reads the list.
  Object.defineProperty(window.navigator, 'languages', {
    value: [browserLanguage],
    configurable: true,
  });
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
}

afterEach(() => {
  Object.defineProperty(window.navigator, 'language', {
    value: realLanguage,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'languages', {
    value: realLanguages,
    configurable: true,
  });
  window.localStorage.clear();
});

describe('resolveInitialLanguage', () => {
  it('keeps the region of an offered language, so Indian Hindi does not open as bare hi confusion', () => {
    // The descendant of the regression this file exists for: the browser code
    // was once split on '-' and only the base kept, so pt-BR resolved to pt
    // and a Brazilian first run opened in European Portuguese with pt-BR.ts
    // sitting unused. The full-code-first lookup is unchanged; what it
    // resolves into is now the allowlist. Every offered language still answers
    // a regional browser with itself, region stripped to the base bundle.
    firstRunWith('hi-IN');
    expect(resolveInitialLanguage()).toBe('hi');
    firstRunWith('bn-BD');
    expect(resolveInitialLanguage()).toBe('bn');
    firstRunWith('bn-IN');
    expect(resolveInitialLanguage()).toBe('bn');
    firstRunWith('ur-PK');
    expect(resolveInitialLanguage()).toBe('ur');
  });

  it('maps every English region to the unqualified entry the allowlist offers', () => {
    // en-GB and en-US are no longer offered, so the day-first rule is
    // deliberately inert: matchSupportedLanguage requires en-GB to be in the
    // offered set before answering with it. An Indian, British or American
    // browser all read the same interface English — and, the known cost of
    // the decision, the same month-first dates the unqualified entry prints.
    // Restoring the British reading needs en-GB back in the allowlist or the
    // date order decoupled from the picker.
    firstRunWith('en-IN');
    expect(resolveInitialLanguage()).toBe('en');
    firstRunWith('en-GB');
    expect(resolveInitialLanguage()).toBe('en');
    firstRunWith('en-US');
    expect(resolveInitialLanguage()).toBe('en');
    firstRunWith('en-AU');
    expect(resolveInitialLanguage()).toBe('en');
    // Case and trimming: a browser is free to send 'EN-us'.
    firstRunWith('EN-us');
    expect(resolveInitialLanguage()).toBe('en');
  });

  it('falls back to English for a language the tree ships but the product does not offer', () => {
    // de-CH used to answer 'de' (the base), fr-CA 'fr', pt-BR 'pt-BR' itself.
    // All three languages are hidden behind the allowlist now, and a first
    // run must not open in a language the picker does not show: the allowlist
    // is the one place visibility is decided, so every one of them resolves to
    // English, exactly as if the language had never shipped.
    firstRunWith('de-CH');
    expect(resolveInitialLanguage()).toBe('en');
    firstRunWith('fr-CA');
    expect(resolveInitialLanguage()).toBe('en');
    firstRunWith('pt-BR');
    expect(resolveInitialLanguage()).toBe('en');
    firstRunWith('pt-br');
    expect(resolveInitialLanguage()).toBe('en');
  });

  it('falls back to English for a language we do not ship at all', () => {
    firstRunWith('is-IS');
    expect(resolveInitialLanguage()).toBe('en');
  });

  it('lets a stored choice beat the browser, region and all', () => {
    firstRunWith('pt-BR');
    window.localStorage.setItem('i18nextLng', 'hi');
    expect(resolveInitialLanguage()).toBe('hi');
  });

  it('falls back to English when a stored choice names a now-hidden language', () => {
    // The graceful-fallback promise of the rollout: a reader who chose German
    // before the allowlist landed, or whose account locale is de, comes back
    // to English — not to a language the picker cannot name and not to a
    // broken boot. The stored value stays in localStorage untouched; the
    // validation simply never accepts it.
    firstRunWith('en');
    window.localStorage.setItem('i18nextLng', 'de');
    expect(resolveInitialLanguage()).toBe('en');
  });
});

describe('detectCountry', () => {
  it('reads the region subtag when the browser sends one', () => {
    // Region detection reads the browser, not the registry, so it is
    // unaffected by which languages are offered: a Brazilian browser says
    // Brazil whatever the picker shows.
    firstRunWith('pt-BR');
    expect(detectCountry()).toBe('br');
    firstRunWith('en-AU');
    expect(detectCountry()).toBe('au');
    firstRunWith('en-ZA');
    expect(detectCountry()).toBe('za');
  });

  it('reaches past a script subtag to the region behind it', () => {
    firstRunWith('zh-Hans-CN');
    expect(detectCountry()).toBe('cn');
  });

  it('answers the country of the languages the allowlist offers', () => {
    // The fallback half is deterministic because the language is passed
    // explicitly. Every offered language names a country: plain English
    // answers 'xx', the code this codebase uses for "not tied to a market",
    // which resolveCountryOffer turns into no offer exactly as it does for
    // null. India is deliberately not an English variant country here: an
    // Indian English reader who stays on plain en gets no market steered from
    // their language alone, though their browser region still says 'in' when
    // it sends one.
    firstRunWith('en');
    expect(detectCountry('en')).toBe('xx');
    firstRunWith('hi');
    expect(detectCountry('hi')).toBe('in');
    firstRunWith('bn');
    expect(detectCountry('bn')).toBe('bd');
    firstRunWith('ur');
    expect(detectCountry('ur')).toBe('pk');
  });

  it('answers null for a language the tree ships but the allowlist hides', () => {
    // Unreachable in practice — the UI language can no longer resolve to de,
    // pl or ar, because resolveInitialLanguage falls back to English first —
    // but pinned so the null is read as a decision: the allowlist no longer
    // names these languages, and a hidden entry must not steer a market offer
    // from the shadows.
    firstRunWith('de');
    expect(detectCountry('de')).toBeNull();
    firstRunWith('pl');
    expect(detectCountry('pl')).toBeNull();
    firstRunWith('ar');
    expect(detectCountry('ar')).toBeNull();
  });

  it('does not mistake a UN M49 region for a country code', () => {
    // es-419 is Latin America, not a country. Answering '41' or '419' would
    // be worse than answering null, which is what es now resolves to.
    firstRunWith('es-419');
    expect(detectCountry('es')).toBeNull();
  });

  it('can name a country for every language we offer', () => {
    // The fallback half is only as good as the field it reads, and a new
    // language added without a country would make detectCountry answer null
    // for its readers without anything else going red.
    const missing = SUPPORTED_LANGUAGES.filter((l) => !l.country);
    expect(missing).toEqual([]);
  });
});
