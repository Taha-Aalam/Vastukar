import { describe, expect, it } from 'vitest';
import { SUPPORTED_LANGUAGES } from '@/app/i18n';
import { sortLanguagesByName } from './languageOrder';

describe('sortLanguagesByName', () => {
  it('orders the picker alphabetically by displayed name', () => {
    const names = sortLanguagesByName(SUPPORTED_LANGUAGES).map((l) => l.name);
    for (let i = 1; i < names.length; i++) {
      expect(names[i - 1]!.localeCompare(names[i]!, 'en', { sensitivity: 'base' })).toBeLessThanOrEqual(0);
    }
    expect(names).toHaveLength(SUPPORTED_LANGUAGES.length);
    // The offered set is the India allowlist; the unqualified English entry
    // leads, and every other name is the name a reader of that language
    // writes for it. The old cross-name pins (Deutsch, Svenska, Русский)
    // belonged to languages the allowlist hides; the ordering behaviour they
    // checked is the loop above, which is what any re-enabled language joins.
    expect(names[0]).toBe('English (International)');
    for (const name of ['हिन्दी', 'বাংলা', 'اردو']) {
      expect(names, name).toContain(name);
    }
  });

  it('leaves the registry order (and its fallback at index 0) untouched', () => {
    sortLanguagesByName(SUPPORTED_LANGUAGES);
    expect(SUPPORTED_LANGUAGES[0]!.code).toBe('en');
  });
});
