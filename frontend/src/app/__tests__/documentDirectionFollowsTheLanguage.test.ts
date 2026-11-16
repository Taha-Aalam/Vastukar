// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
//
// Writing direction has to follow the active language, and it has to do it at
// three separate moments that fail independently: on <html> at all, from the
// language the reader actually picked, and again when they pick another one at
// runtime. Four of the languages we offer are written right to left, and for
// them a page left in `dir="ltr"` puts the sidebar on the wrong edge and every
// label against the wrong margin while the strings themselves are perfectly
// translated - so the product reads as broken rather than as untranslated, and
// nothing in the string-level i18n gates can see it.
//
// The population is derived from `SUPPORTED_LANGUAGES` rather than written out
// as ['ar','fa','he','ur']. A hardcoded list would keep passing on the day a
// fifth right-to-left language is added without direction support, which is the
// exact regression this file exists to catch; deriving it means the new entry
// joins the assertion by existing.
//
// Run:  npx vitest run src/app/__tests__/documentDirectionFollowsTheLanguage.test.ts

import { describe, expect, it, afterAll } from 'vitest';

import i18n, {
  SUPPORTED_LANGUAGES,
  applyDocumentDirection,
  resolveDirection,
} from '../i18n';

/** Languages we offer that declare right-to-left, read off the shipped list. */
const RTL = SUPPORTED_LANGUAGES.filter((l) => 'dir' in l && l.dir === 'rtl').map((l) => l.code);
const LTR = SUPPORTED_LANGUAGES.filter((l) => !('dir' in l && l.dir === 'rtl')).map((l) => l.code);

describe('document direction follows the active language', () => {
  afterAll(async () => {
    // Leave the shared jsdom document and the shared i18next instance the way
    // this file found them, so a test that runs after this one in the same
    // worker does not inherit an Arabic document.
    await i18n.changeLanguage('en');
  });

  it('offers exactly one right-to-left language, and names it', () => {
    // The population, printed beside the verdict: 11 languages offered, of
    // which Urdu is RTL. A suite that asserted only the language would not
    // notice the denominator moving underneath it. The denominator moved here
    // when English (UK) joined the picker, again when Hungarian was offered,
    // and once more when the India rollout narrowed the picker to the
    // ENABLED_LOCALES allowlist — ar, fa and he keep their `dir` fields on the
    // (hidden) registry entries, and re-enabling any of them brings it back
    // into this assertion by existing.
    expect(
      `${RTL.length} of ${SUPPORTED_LANGUAGES.length} offered languages are RTL: ${RTL.join(', ')}`,
    ).toBe('1 of 11 offered languages are RTL: ur');
  });

  it('resolves rtl for every right-to-left language', () => {
    expect(RTL.map(resolveDirection)).toEqual(RTL.map(() => 'rtl'));
  });

  it('resolves ltr for every other language, so the flip is not indiscriminate', () => {
    // The other half of the both-directions requirement. Were `resolveDirection`
    // to answer 'rtl' for everything - or for one language by accident - the
    // assertion above would still pass and this one would fail.
    const wrong = LTR.filter((code) => resolveDirection(code) !== 'ltr');
    expect({ checked: LTR.length, wrong }).toEqual({ checked: 10, wrong: [] });
  });

  it('writes dir and lang onto <html> for each right-to-left language', () => {
    for (const code of RTL) {
      applyDocumentDirection(code);
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe(code);
    }
  });

  it('returns the document to ltr for a control language', () => {
    applyDocumentDirection('ur');
    expect(document.documentElement.dir).toBe('rtl');
    applyDocumentDirection('hi');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('hi');
  });

  it('never flips the document for a language the allowlist hides', () => {
    // Arabic declares dir: 'rtl' on its registry entry, but it is not offered:
    // getLanguageByCode answers the first offered entry for a code outside the
    // allowlist, so the direction a hidden language would carry is
    // unreachable and the document stays ltr. The `lang` attribute still
    // records the code it was handed — it is informational, and writing it is
    // what applyDocumentDirection has always done with it.
    applyDocumentDirection('ar');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('updates the document when the language changes at runtime', async () => {
    // The moment usually missed. This drives the real i18next instance so the
    // production `languageChanged` handler in i18n.ts is what does the work; a
    // test that called `applyDocumentDirection` itself would pass even if
    // nothing were subscribed to the event.
    await i18n.changeLanguage('en');
    expect(document.documentElement.dir).toBe('ltr');

    for (const code of RTL) {
      await i18n.changeLanguage(code);
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe(code);

      // ...and back, so a handler that only ever sets 'rtl' fails here.
      await i18n.changeLanguage('en');
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    }
  });
});
