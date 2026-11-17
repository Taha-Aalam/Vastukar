// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
/**
 * Tests for shared resource-type helpers — ensures the locales translate the
 * canonical types and the helper falls back gracefully for missing keys /
 * unknown values.
 *
 * WHY THIS FILE READS THE LOCALE FILES AS TEXT INSTEAD OF IMPORTING THEM.
 * It used to `import { fallbackResources } from '../../app/i18n-fallbacks'`,
 * which is an aggregate of every locale bundle in the tree. On `main` that was
 * 43 files and 275.5 MB of source; the seven bundles this branch adds took it to
 * 50 files and 353.5 MB, and that was enough to kill the worker. Measured on the
 * failing CI job (Frontend CI ubuntu-latest, run 44148606822): 1410 of 1411 test
 * files reported, 15367 tests passed and none failed, and the step still exited
 * 1 because one fork died with "FATAL ERROR: Reached heap limit Allocation
 * failed - JavaScript heap out of memory" at 4137 MB of its default ~4 GB heap.
 * The file with no result was this one. Reproduced locally: alone, it burns
 * 202 s and reaches no test at all.
 *
 * `everyOfferedLanguageIsInTheFallbackAggregator.test.ts` already documents the
 * same wall for the same aggregate ("Ineffective mark-compacts near heap limit"
 * at a 12 GB worker heap) and reads it as text for that reason. This file
 * follows it: the question here is "does the shipped bundle hold this key with
 * this value", which is a question about the file, and importing 353 MB to
 * answer it is what broke.
 *
 * The population is stated and asserted, not assumed. A text scan whose files
 * are missing, or whose lines stop matching the shape, reports a clean table
 * over an empty set; the two floors at the bottom of this file exist for that.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, it, expect } from 'vitest';
import {
  RESOURCE_TYPES,
  getResourceTypeLabel,
  getResourceTypeI18nKey,
} from './boqResourceTypes';

/* ── Expected translations ─────────────────────────────────────────────
 * Construction-industry vocabulary. Read out of the shipped bundle rather
 * than translated here: a gate that carries its own copy of the answer
 * cannot tell a translation mistake from its own, and these are the words
 * the product actually prints.
 *
 * When you touch this list, also update the i18n bundle for the same locale.
 */
const EXPECTED_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: { material: 'Material', labor: 'Labor', equipment: 'Equipment', operator: 'Operator', subcontractor: 'Subcontractor', electricity: 'Electricity', composite: 'Composite', other: 'Other' },
  de: { material: 'Material', labor: 'Arbeit', equipment: 'Gerät', operator: 'Bediener', subcontractor: 'Nachunternehmer', electricity: 'Energie', composite: 'Verbundposition', other: 'Sonstige' },
  fr: { material: 'Matériel', labor: "Main-d'œuvre", equipment: 'Équipement', operator: 'Opérateur', subcontractor: 'Sous-traitant', electricity: 'Électricité', composite: 'Composé', other: 'Autre' },
  es: { material: 'Material', labor: 'Mano de obra', equipment: 'Equipo', operator: 'Operario', subcontractor: 'Subcontratista', electricity: 'Electricidad', composite: 'Composición', other: 'Otro' },
  pt: { material: 'Material', labor: 'Mão de obra', equipment: 'Equipamento', operator: 'Operador', subcontractor: 'Subempreiteiro', electricity: 'Eletricidade', composite: 'Composto', other: 'Outro' },
  ru: { material: 'Материалы', labor: 'Труд', equipment: 'Оборудование', operator: 'Машинист', subcontractor: 'Субподряд', electricity: 'Электроэнергия', composite: 'Составная', other: 'Прочее' },
  zh: { material: '材料', labor: '人工', equipment: '设备', operator: '操作员', subcontractor: '分包', electricity: '电力', composite: '复合', other: '其他' },
  ar: { material: 'مواد', labor: 'عمالة', equipment: 'معدات', operator: 'مشغل', subcontractor: 'مقاول من الباطن', electricity: 'كهرباء', composite: 'مركب', other: 'أخرى' },
  hi: { material: 'सामग्री', labor: 'श्रम', equipment: 'उपकरण', operator: 'ऑपरेटर', subcontractor: 'उप-ठेकेदार', electricity: 'बिजली', composite: 'संयुक्त', other: 'अन्य' },
  tr: { material: 'Malzeme', labor: 'İşçilik', equipment: 'Ekipman', operator: 'Operatör', subcontractor: 'Taşeron', electricity: 'Elektrik', composite: 'Bileşik', other: 'Diğer' },
  it: { material: 'Materiale', labor: 'Manodopera', equipment: 'Attrezzatura', operator: 'Operatore', subcontractor: 'Subappaltatore', electricity: 'Elettricità', composite: 'Composto', other: 'Altro' },
  nl: { material: 'Materiaal', labor: 'Arbeid', equipment: 'Materieel', operator: 'Machinist', subcontractor: 'Onderaannemer', electricity: 'Elektriciteit', composite: 'Samengesteld', other: 'Overig' },
  pl: { material: 'Materiał', labor: 'Robocizna', equipment: 'Sprzęt', operator: 'Operator', subcontractor: 'Podwykonawca', electricity: 'Energia elektryczna', composite: 'Złożony', other: 'Inne' },
  cs: { material: 'Materiál', labor: 'Práce', equipment: 'Vybavení', operator: 'Obsluha', subcontractor: 'Subdodavatel', electricity: 'Elektřina', composite: 'Složená', other: 'Ostatní' },
  ja: { material: '資材', labor: '労務', equipment: '機械', operator: 'オペレーター', subcontractor: '下請', electricity: '電力', composite: '複合', other: 'その他' },
  ko: { material: '자재', labor: '인건비', equipment: '장비', operator: '운전자', subcontractor: '외주', electricity: '전기', composite: '복합', other: '기타' },
  sv: { material: 'Material', labor: 'Arbete', equipment: 'Utrustning', operator: 'Operatör', subcontractor: 'Underleverantör', electricity: 'El', composite: 'Sammansatt', other: 'Övrigt' },
  no: { material: 'Materialer', labor: 'Arbeidskraft', equipment: 'Utstyr', operator: 'Operatør', subcontractor: 'Underleverandør', electricity: 'Strøm', composite: 'Sammensatt', other: 'Annet' },
  da: { material: 'Materialer', labor: 'Arbejdskraft', equipment: 'Udstyr', operator: 'Operatør', subcontractor: 'Underleverandør', electricity: 'El', composite: 'Sammensat', other: 'Andet' },
  fi: { material: 'Materiaali', labor: 'Työ', equipment: 'Kalusto', operator: 'Käyttäjä', subcontractor: 'Aliurakoitsija', electricity: 'Sähkö', composite: 'Yhdistetty', other: 'Muu' },
  bg: { material: 'Материали', labor: 'Труд', equipment: 'Оборудване', operator: 'Оператор', subcontractor: 'Подизпълнител', electricity: 'Електричество', composite: 'Съставна', other: 'Други' },
  // The seven bundles this branch adds. Read out of each shipped file, not
  // translated here.
  ta: { material: 'பொருள்', labor: 'உழைப்பு', equipment: 'உபகரணங்கள்', operator: 'ஆபரேட்டர்', subcontractor: 'துணை ஒப்பந்ததாரர்', electricity: 'மின்சாரம்', composite: 'கூட்டு', other: 'மற்றவை' },
  te: { material: 'మెటీరియల్', labor: 'శ్రమ', equipment: 'పరికరాలు', operator: 'ఆపరేటర్', subcontractor: 'సబ్ కాంట్రాక్టర్', electricity: 'విద్యుత్', composite: 'మిశ్రమ', other: 'ఇతర' },
  mr: { material: 'साहित्य', labor: 'श्रम', equipment: 'उपकरणे', operator: 'ऑपरेटर', subcontractor: 'उपकंत्राटदार', electricity: 'वीज', composite: 'संमिश्र', other: 'इतर' },
  gu: { material: 'સામગ્રી', labor: 'મજૂરી', equipment: 'સાધનસામગ્રી', operator: 'ઓપરેટર', subcontractor: 'પેટા કોન્ટ્રાક્ટર', electricity: 'વીજળી', composite: 'સંયુક્ત', other: 'અન્ય' },
  kn: { material: 'ವಸ್ತು', labor: 'ಕಾರ್ಮಿಕ', equipment: 'ಸಲಕರಣೆ', operator: 'ಆಪರೇಟರ್', subcontractor: 'ಉಪಗುತ್ತಿಗೆದಾರ', electricity: 'ವಿದ್ಯುತ್', composite: 'ಸಂಯೋಜಿತ', other: 'ಇತರೆ' },
  ml: { material: 'മെറ്റീരിയൽ', labor: 'തൊഴിൽ', equipment: 'ഉപകരണങ്ങൾ', operator: 'ഓപ്പറേറ്റർ', subcontractor: 'സബ് കോൺട്രാക്ടർ', electricity: 'വൈദ്യുതി', composite: 'സംയുക്തം', other: 'മറ്റുള്ളവ' },
  pa: { material: 'ਸਮੱਗਰੀ', labor: 'ਲੇਬਰ', equipment: 'ਉਪਕਰਨ', operator: 'ਆਪਰੇਟਰ', subcontractor: 'ਉਪ-ਠੇਕੇਦਾਰ', electricity: 'ਬਿਜਲੀ', composite: 'ਸੰਯੁਕਤ', other: 'ਹੋਰ' },
};

/* ── Reading a locale bundle without importing it ────────────────────── */

const LOCALES_DIR = ['src/app/locales', 'frontend/src/app/locales']
  .map((p) => resolve(process.cwd(), p))
  .find(existsSync);

/** `  "key": "value",` — the shape every line in a locale file has. */
const PAIR = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$/;

const UNESCAPE: Record<string, string> = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
};

/**
 * One locale's `boq.resource_type_*` entries, read from its source file.
 *
 * JSON string escapes are decoded, because a value is compared against the
 * table above as text and an un-decoded `\"` would make an identical
 * translation read as a different one.
 *
 * Memoised: the suites below ask for the same locale once per canonical type,
 * and each read is a 10 MB file. Reading it eight times is what made this file
 * take 19 s of test time for 261 trivial assertions.
 */
const cache = new Map<string, Map<string, string>>();

function resourceTypeKeys(locale: string): Map<string, string> {
  const cached = cache.get(locale);
  if (cached) return cached;
  if (!LOCALES_DIR) throw new Error('could not find src/app/locales');
  const path = resolve(LOCALES_DIR, `${locale}.ts`);
  if (!existsSync(path)) throw new Error(`locale file is missing: ${path}`);

  const entries = new Map<string, string>();
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = PAIR.exec(line);
    if (!match) continue;
    const [, key, raw] = match;
    if (!key!.startsWith('boq.resource_type_')) continue;
    entries.set(key!, raw!.replace(/\\(["\\/bfnrt])/g, (_, c: string) => UNESCAPE[c]!));
  }
  cache.set(locale, entries);
  return entries;
}

/** A `t` that resolves against one locale's shipped keys, as i18next would. */
function tFor(locale: string) {
  const bundle = resourceTypeKeys(locale);
  return (key: string, opts?: Record<string, string>) =>
    bundle.get(key) ?? opts?.defaultValue ?? key;
}

describe('boqResourceTypes - RESOURCE_TYPES list', () => {
  it('exposes the canonical 8 types in expected order', () => {
    expect(RESOURCE_TYPES.map((rt) => rt.value)).toEqual([
      'material',
      'labor',
      'equipment',
      'operator',
      'subcontractor',
      'electricity',
      'composite',
      'other',
    ]);
  });

  it('every entry has a unique boq.resource_type_* i18n key', () => {
    const keys = RESOURCE_TYPES.map((rt) => rt.i18nKey);
    expect(new Set(keys).size).toBe(keys.length);
    keys.forEach((k) => expect(k).toMatch(/^boq\.resource_type_[a-z]+$/));
  });
});

describe('boqResourceTypes - getResourceTypeLabel', () => {
  it('returns English fallback when no `t` is provided', () => {
    expect(getResourceTypeLabel('material')).toBe('Material');
    expect(getResourceTypeLabel('labor')).toBe('Labor');
    expect(getResourceTypeLabel('subcontractor')).toBe('Subcontractor');
  });

  it('returns the unmapped value verbatim for unknown types', () => {
    expect(getResourceTypeLabel('weird-legacy-type')).toBe('weird-legacy-type');
    expect(getResourceTypeLabel('')).toBe('');
  });

  it('passes the canonical i18n key + English defaultValue to `t`', () => {
    const calls: Array<[string, Record<string, string> | undefined]> = [];
    const fakeT = (key: string, opts?: Record<string, string>) => {
      calls.push([key, opts]);
      return `[${key}]`;
    };
    expect(getResourceTypeLabel('equipment', fakeT)).toBe('[boq.resource_type_equipment]');
    expect(calls).toEqual([['boq.resource_type_equipment', { defaultValue: 'Equipment' }]]);
  });
});

describe('boqResourceTypes - getResourceTypeI18nKey', () => {
  it('maps canonical values to their i18n key', () => {
    expect(getResourceTypeI18nKey('material')).toBe('boq.resource_type_material');
    expect(getResourceTypeI18nKey('composite')).toBe('boq.resource_type_composite');
  });

  it('falls back to the `other` key for unknown values', () => {
    expect(getResourceTypeI18nKey('legacy_unmapped')).toBe('boq.resource_type_other');
    expect(getResourceTypeI18nKey('')).toBe('boq.resource_type_other');
  });
});

describe('i18n bundle - every locale ships every resource-type key', () => {
  // Every canonical type must have a translation in every locale listed
  // above. Missing entries fall back to English at runtime, but they would
  // be a regression: i18next would log a warning and the chip would render
  // as English in an otherwise-localised UI.
  for (const [locale, dict] of Object.entries(EXPECTED_TRANSLATIONS)) {
    describe(locale, () => {
      for (const rt of RESOURCE_TYPES) {
        it(`translates ${rt.value}`, () => {
          const bundle = resourceTypeKeys(locale);
          const expected = dict[rt.value];
          expect(bundle.get(rt.i18nKey), `missing ${rt.i18nKey} for ${locale}`).toBe(expected);
        });
      }
    });
  }
});

describe('integration - getResourceTypeLabel hooked up to live bundles', () => {
  for (const [locale, dict] of Object.entries(EXPECTED_TRANSLATIONS)) {
    it(`renders all canonical types for ${locale}`, () => {
      const t = tFor(locale);
      for (const rt of RESOURCE_TYPES) {
        expect(getResourceTypeLabel(rt.value, t)).toBe(dict[rt.value]);
      }
    });
  }
});

describe('the scan covers what it claims to', () => {
  it('finds a locale directory to read', () => {
    // Without this floor a wrong cwd makes every `describe` above skip its
    // reads and the whole file pass having examined nothing.
    expect(LOCALES_DIR, 'no src/app/locales directory under the cwd').toBeTruthy();
  });

  it('reads every key the table expects, in every locale', () => {
    // A shape change in the locale files (a value wrapped onto another line,
    // a different quote style) turns `resourceTypeKeys` into a map that is
    // merely incomplete, and every assertion above would then compare
    // `undefined` against an expected string and fail loudly - which is fine -
    // but only for the key that broke. This states the size, so a scan that
    // silently stops reading is caught even if the expectations are relaxed.
    const thin = Object.keys(EXPECTED_TRANSLATIONS).filter(
      (locale) => resourceTypeKeys(locale).size !== 10,
    );
    // Ten, not eight: every full locale also carries `variant_chip` and
    // `variant_tooltip` beside the eight canonical types. Counting only the
    // eight would go green on a file that had lost those two.
    expect(thin).toEqual([]);
  });
});
