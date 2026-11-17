// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
//
// The languages the export menu offers are the ones the server can render, each
// under its own name, and the menu starts on the reader's own language.

import { describe, it, expect } from 'vitest';

import {
  DIARY_DOCUMENT_LOCALES,
  PURCHASING_DOCUMENT_LOCALES,
  REGISTER_DOCUMENT_LOCALES,
  REGISTER_RENDERABLE,
  defaultDocumentLocale,
  documentLocaleEnglishName,
  documentLocaleName,
} from './documentExport';

/** The one backend language no bundled PDF face can draw. */
const NOT_RENDERABLE = new Set(['bn']);

describe('document languages', () => {
  it('offers every language the server renders, once each, and nothing else', () => {
    // The document languages are the BACKEND's set, not the interface offer.
    // They were briefly narrowed to `SUPPORTED_LANGUAGES`, which cut the menu
    // from thirty-seven languages to three and made Turkish, German, French and
    // every other export unreachable — while the backend went on rendering them
    // and seven feature suites went on asserting their Turkish downloads. The
    // two questions are separate: the offer decides which languages the picker
    // shows, and a document's language is chosen for whoever receives it.
    expect([...REGISTER_DOCUMENT_LOCALES].sort()).toEqual([...REGISTER_RENDERABLE].sort());
    expect(new Set(REGISTER_DOCUMENT_LOCALES).size).toBe(REGISTER_DOCUMENT_LOCALES.length);
    expect(REGISTER_DOCUMENT_LOCALES[0]).toBe('en');
    // Bengali is the one backend language no bundled PDF face can draw: the
    // server answers it in English and the menu does not offer it.
    expect(REGISTER_DOCUMENT_LOCALES).not.toContain('bn');
    for (const code of NOT_RENDERABLE) {
      expect(REGISTER_DOCUMENT_LOCALES, `${code} cannot be rendered`).not.toContain(code);
    }
    // The recipient-facing languages stay reachable whatever the picker offers.
    for (const code of ['de', 'tr', 'fr', 'es', 'ru']) {
      expect(REGISTER_DOCUMENT_LOCALES, `${code} is still a document language`).toContain(code);
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
    // The menu starts on the reader's own language whenever the server can
    // render it, whatever the picker happens to offer: a German or Turkish
    // reader still exports a German or Turkish register. `bn` and `sw` fall
    // back to English because no document exists in them.
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'de-AT')).toBe('de');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'TR')).toBe('tr');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'ur-PK')).toBe('ur');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'hi-IN')).toBe('hi');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'bn')).toBe('en');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, 'sw')).toBe('en');
    expect(defaultDocumentLocale(REGISTER_DOCUMENT_LOCALES, null)).toBe('en');
    expect(defaultDocumentLocale(PURCHASING_DOCUMENT_LOCALES, 'ja')).toBe('ja');
    expect(defaultDocumentLocale(PURCHASING_DOCUMENT_LOCALES, 'bn')).toBe('en');
    expect(defaultDocumentLocale(PURCHASING_DOCUMENT_LOCALES, 'ar-EG')).toBe('ar');
    expect(defaultDocumentLocale(PURCHASING_DOCUMENT_LOCALES, 'ur-PK')).toBe('ur');
  });
});
