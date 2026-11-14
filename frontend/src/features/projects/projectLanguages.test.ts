// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
//
// A language a person can pick for the interface must also be one they can pick
// for a project. Ukrainian was the case that was reported: offered in the
// header, missing from the project form, so the project went out as "other".

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SUPPORTED_LANGUAGES } from '@/app/i18n';
import { PROJECT_LANGUAGES } from './projectLanguages';

const BACKEND_LOCALES = join(dirname(fileURLToPath(import.meta.url)), '../../../../backend/locales');

describe('project languages', () => {
  it('offers exactly the interface allowlist, and hides the rest', () => {
    // Ukrainian was the case that was reported: offered in the header,
    // missing from the project form, so the project went out as "other". The
    // form now derives from SUPPORTED_LANGUAGES like every other picker, so
    // a language cannot be offered in one and missing in the other — and the
    // India rollout narrowed both to the ENABLED_LOCALES allowlist. Ukrainian
    // keeps its locale file and its backend locale; the day it re-enters the
    // allowlist it is back here under Українська with no further change.
    expect(PROJECT_LANGUAGES.map((l) => l.value)).toEqual(['en', 'hi', 'bn', 'ur']);
    expect(SUPPORTED_LANGUAGES.find((l) => l.code === 'uk')).toBeUndefined();
  });

  it('offers every base language of the interface picker', () => {
    const base = SUPPORTED_LANGUAGES.map((l) => l.code).filter((c) => !c.includes('-'));
    expect(PROJECT_LANGUAGES.map((l) => l.value)).toEqual(base);
  });

  it('leaves the regional variants out', () => {
    expect(PROJECT_LANGUAGES.some((l) => l.value.includes('-'))).toBe(false);
  });

  it('offers only languages the backend has a locale file for', () => {
    const files = new Set(readdirSync(BACKEND_LOCALES).map((f) => f.replace(/\.json$/, '')));
    const missing = PROJECT_LANGUAGES.map((l) => l.value).filter((c) => !files.has(c));
    expect(missing).toEqual([]);
  });

  it('names the offered languages the way their readers name them', () => {
    // The pre-rollout form offered 25 base languages; the allowlist narrows
    // that to four. The labels are the registry's own names, so a project
    // language never reads as a bare code.
    const labels = new Map(PROJECT_LANGUAGES.map((l) => [l.value, l.label]));
    expect(labels.get('en')).toBe('English');
    expect(labels.get('hi')).toBe('हिन्दी');
    expect(labels.get('bn')).toBe('বাংলা');
    expect(labels.get('ur')).toBe('اردو');
  });
});
