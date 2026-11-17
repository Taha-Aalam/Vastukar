// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
//
// The languages the export menu offers are the ones the server can render, each
// under its own name, and the menu starts on the reader's own language.

import { describe, it, expect } from 'vitest';

import { SUPPORTED_LANGUAGES } from '@/app/i18n';
import {
  DIARY_DOCUMENT_LOCALES,
  PURCHASING_DOCUMENT_LOCALES,
  REGISTER_DOCUMENT_LOCALES,
  REGISTER_RENDERABLE,
  defaultDocumentLocale,
  documentLocaleEnglishName,
  documentLocaleName,
} from './documentExport';

// The interface also ships regional variants of a language (en-GB, pt-BR ...);
// a document language is the base language.
const BASE_INTERFACE_LANGUAGES = SUPPORTED_LANGUAGES.map((l) => l.code).filter((c) => !c.includes('-'));

describe('document languages', () => {
  it('offers the interface languages the server renders, once each, and nothing else', () => {
    // Two sets meet here and the menu is their intersection, not either one:
    // every language the backend can render a register in, narrowed to what
    // the interface offers. Asserting the interface set alone was right while
    // every offered language was also a backend one; the India rollout ended
    // that, because the seven new bundles have no backend catalogue yet by
    // design. The invariant that holds is both directions at once.
    const offered = new Set(BASE_INTERFACE_LANGUAGES);
    const expected = REGISTER_RENDERABLE.filter((code) => offered.has(code));

    expect([...REGISTER_DOCUMENT_LOCALES].sort()).toEqual([...expected].sort());
    expect(new Set(REGISTER_DOCUMENT_LOCALES).size).toBe(REGISTER_DOCUMENT_LOCALES.length);
    expect(REGISTER_DOCUMENT_LOCALES[0]).toBe('en');
    // Bengali is the one backend language no bundled PDF face can draw: the
    // interface offers it and it still cannot be a document language.
    expect(REGISTER_DOCUMENT_LOCALES).not.toContain('bn');
    // And the seven new interface languages have no backend catalogue yet.
    for (const code of ['ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa']) {
      expect(REGISTER_DOCUMENT_LOCALES, `${code} has no backend catalogue yet`).not.toContain(code);
    }
  });

  it('prints the diary in the same languages as the registers', () => {
    expect(DIARY_DOCUMENT_LOCALES).toEqual(REGISTER_DOCUMENT_LOCALES);
  });

  it('keeps the purchasing forms to the languages their catalogues hold', () => {
    expect([...PURCHASING_DOCUMENT_LOCALES].sort()).toEqual([...REGISTER_DOCUMENT_LOCALES].sort());
    expect(PURCHASING_DOCUMENT_LOCALES).not.toContain('bn');
  });

  it('names every language under its own name, never by its code', () => {
    for (const code of REGISTER_DOCUMENT_LOCALES) {
      const name = documentLocaleName(code);
      expect(name.length, code).toBeGreaterThan(1);
      expect(name, code).not.toBe(code.toUpperCase());
    }
    expect(documentLocaleName('en')).toBe('English');
    expect(documentLocaleName('de')).toBe('Deutsch');
    expect(documentLocaleName('tr')).toBe('Türkçe');
    // zh is hidden behind the allowlist, but its entry is still in the
    // registry, so its own name comes from there: 简体中文, which says which
    // Chinese it is, where the runtime's Intl.DisplayNames answers the vaguer
    // 中文. Before the allowlist this test asserted the runtime's answer
    // because the picker entry was out of reach; it is in reach now, and the
    // registry is the better source for a name.
    expect(documentLocaleName('zh')).toBe('简体中文');
    expect(documentLocaleName('he')).toBe('עברית');
  });

  it('falls back to the runtime language names, then to the code', () => {
    expect(documentLocaleName('sw').toLowerCase()).toContain('swahili');
    expect(documentLocaleName('zz-not-a-language-tag-at-all')).toBe('ZZ-NOT-A-LANGUAGE-TAG-AT-ALL');
    // The hakedis certificate's combined choice keeps the spelling it always had.
    expect(documentLocaleName('tr-en')).toBe('TR-EN');
  });

  it('also names a language in English so a reader can search for it', () => {
    expect(documentLocaleEnglishName('de')).toBe('German');
    expect(documentLocaleEnglishName('en')).toBe('English');
    expect(documentLocaleEnglishName('fil')).toBe('Filipino');
  });

  it('starts on the interface language when the document exists in it, else English', () => {
    // The menu follows the offer now: a German or Turkish reader on the India
    // build runs an English interface, and the menu answers with the English
    // document the server would have produced anyway. The offered languages
    // answer with themselves, region and case stripped.
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'de-AT')).toBe('en');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'TR')).toBe('en');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'ur-PK')).toBe('ur');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'hi-IN')).toBe('hi');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'bn')).toBe('en');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'sw')).toBe('en');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, null)).toBe('en');
    expect(defaultDocumentLocale(PURCHASING_DOCUMENT_LOCALES, 'ja')).toBe('en');
    expect(defaultDocumentLocale(PURCHASING_DOCUMENT_LOCALES, 'bn')).toBe('en');
    expect(defaultDocumentLocale(PURCHASING_DOCUMENT_LOCALES, 'ar-EG')).toBe('en');
    expect(defaultDocumentLocale(PURCHASING_DOCUMENT_LOCALES, 'ur-PK')).toBe('ur');
  });
});
