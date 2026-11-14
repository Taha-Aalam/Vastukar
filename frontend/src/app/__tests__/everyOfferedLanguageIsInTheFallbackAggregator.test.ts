// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
/**
 * The list of languages we offer and the list every locale test iterates must
 * not drift apart.
 *
 * ``i18n-fallbacks.ts`` aggregates the per-locale resources so that tests can
 * iterate the locales without repeating forty imports. A locale missing from it
 * is not offered any less; it is simply invisible to every test that iterates
 * the object, which is how Kyrgyz, Greek and Ukrainian each went unchecked
 * while shipping.
 *
 * That file already carried a comment telling whoever enabled Uzbek to add the
 * import in the same commit. Uzbek was enabled, the import was not added, and
 * the locale shipped unchecked anyway. This test exists because a comment
 * recording a rule cannot enforce it.
 *
 * Since the India rollout the offered set is the ``ENABLED_LOCALES`` allowlist
 * in ``i18n.ts`` — English plus the Indian languages whose bundles are
 * complete — while the aggregator still imports every locale file on disk.
 * That is deliberate and it is the ``mn`` precedent grown to full size: a
 * bundle nobody can select still sits in the tree, still syncs from upstream,
 * and still gets whatever test coverage the aggregator gives it, so the file
 * does not rot while it waits. Hiding a language is one code removed from the
 * allowlist, never an import to delete.
 *
 * Three assertions, each guarding a direction of the drift this test exists
 * for:
 *
 * - the offered set is exactly the allowlist, so a registry entry that nobody
 *   can explain and nobody enabled cannot sneak into the picker;
 * - no offered language is missing from the aggregator, so a newly enabled
 *   language cannot ship invisible to every locale test (the Kyrgyz failure);
 * - the aggregator misses no full locale file on disk except the two English
 *   overlays, so a file added under ``locales/`` cannot sit unimported and
 *   untested (the Greek and Ukrainian failure) — now checked against the
 *   directory itself rather than against the offered list, because with 39
 *   hidden-but-kept locales the old "nothing unselectable may be aggregated"
 *   direction would fail on every file the India decision deliberately keeps.
 *
 * Writing them as exact set comparisons rather than as counts is deliberate: a
 * count passes again the moment two mistakes cancel out.
 */

import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ENABLED_LOCALES, SUPPORTED_LANGUAGES } from '../i18n';
import { fallbackResources } from '../i18n-fallbacks';

/**
 * Overrides-only overlays rather than full locales, so a test that iterates
 * the object would compare a deliberate 9 key and ~1.6k key file against a
 * ~35k key one and report a gap that is the whole point of those files.
 *
 * Neither is offered today — ``ENABLED_LOCALES`` answers every English region
 * with plain ``en`` — but they stay on disk, and they stay out of the
 * aggregator on the old grounds: overlay size is deliberately not comparable.
 */
const OVERLAY_FILES = ['en-GB.ts', 'en-US.ts'];

describe('the offered languages and the fallback aggregator', () => {
  const offered = new Set(SUPPORTED_LANGUAGES.map((language) => language.code));
  const aggregated = new Set(Object.keys(fallbackResources));

  it('offers exactly the allowlist, nothing more and nothing less', () => {
    expect([...offered].sort()).toEqual([...ENABLED_LOCALES].sort());
  });

  it('leaves no offered language out of the aggregator', () => {
    const missing = [...offered].filter((code) => !aggregated.has(code)).sort();

    expect(missing).toEqual([]);
  });

  it('aggregates every full locale file on disk except the two overlays', () => {
    const dir = resolve(__dirname, '../locales');
    const onDisk = readdirSync(dir)
      .filter((name) => name.endsWith('.ts') && !OVERLAY_FILES.includes(name))
      .map((name) => name.replace(/\.ts$/, ''))
      .sort();

    expect([...aggregated].sort()).toEqual(onDisk);
  });

  it('names the shape of the set rather than merely trusting it', () => {
    // The counts are the weakest form of these checks and are asserted only to
    // catch a rewrite that empties one of the comparisons above and leaves
    // them trivially true. Four offered is the India decision itself; 43
    // aggregated is every file under locales/ minus the two overlays.
    expect(offered.size).toBe(4);
    expect(aggregated.size).toBe(43);
  });
});
