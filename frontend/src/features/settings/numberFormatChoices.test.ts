// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
//
// A number format the preference can hold and the picker has no button for is
// a setting nobody can reach. That is not hypothetical: `en-IN` was absent from
// the type entirely while Indian rupees sat in the currency list, so a reader
// working on an Indian project was offered the currency and given no way to
// write it the way India writes it. Lakh and crore grouping was unreachable by
// any choice on any screen.
//
// The fix was to build the buttons from the store's own list. These tests hold
// that arrangement, because the failure it prevents is invisible: a second
// hand-written list looks perfectly healthy right up to the moment the two
// disagree, and nothing renders differently to say so.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NUMBER_LOCALES, type NumberLocale } from '@/stores/usePreferencesStore';

/** Every locale the preference can hold, minus the follow-the-language default. */
const CHOICES = NUMBER_LOCALES.filter((l) => l !== 'auto');

function source(): string {
  return readFileSync(resolve(__dirname, 'RegionalSettings.tsx'), 'utf-8');
}

describe('the number format picker', () => {
  it('builds its buttons from the one list, not from a second one of its own', () => {
    // The single-source assertion, and the only one that survives someone
    // adding a locale: a picker with its own literal list would still pass
    // every render test while quietly offering fewer choices than the type.
    const text = source();
    expect(text).toContain('NUMBER_LOCALES.filter');
    // And no re-declared roster beside it. The old list wrote its locales out
    // as object literals; if that shape comes back, so does the drift.
    expect(text).not.toMatch(/\{\s*locale:\s*'[a-z]{2}-[A-Z]{2}'/);
  });

  it('offers Indian grouping, which is the choice that was missing', () => {
    expect(CHOICES).toContain('en-IN' as NumberLocale);
  });

  it('shows Indian grouping as something a reader can tell apart', () => {
    // The whole point of the button. Measured through Intl rather than written
    // down, because the sample only earns its length if the runtime agrees:
    // at four digits `en-IN` and `en-US` are identical and the button is noise.
    const sample = 1234567.89;
    const india = new Intl.NumberFormat('en-IN').format(sample);
    const america = new Intl.NumberFormat('en-US').format(sample);
    expect(india).not.toEqual(america);
    // Named so a reader of this file can see what the difference is.
    expect(india).toContain('12,34,567');
    expect(america).toContain('1,234,567');
    // And the trap the old four-digit sample fell into, stated out loud.
    expect(new Intl.NumberFormat('en-IN').format(1234.56)).toEqual(
      new Intl.NumberFormat('en-US').format(1234.56),
    );
  });

  it('gives every choice an example that Intl will actually produce', () => {
    // Not a tautology: it fails the moment a locale tag in the list is one the
    // runtime cannot resolve, which is how a typo in a BCP-47 tag reaches a
    // user as a button labelled with someone else's separators.
    for (const locale of CHOICES) {
      const resolved = new Intl.NumberFormat(locale).resolvedOptions().locale;
      expect(resolved.toLowerCase(), locale).toContain(locale.slice(0, 2).toLowerCase());
    }
  });
});

// ---------------------------------------------------------------------------
// The alias that keeps the row lit for a reader who never opened this screen.
//
// `resolveNumberLocale` answers in the vocabulary of `Intl`; these buttons are
// regional tags. Where the two disagree about a tag that names the same format,
// the row used to light nothing. That is not a cosmetic gap: plain English is
// the default resolution for every English browser, because the India rollout's
// allowlist narrowed the offered set and `en-US`/`en-GB` left it, so the row
// went dark for the reader who had chosen nothing at all.
// ---------------------------------------------------------------------------

describe('the alias from a resolved locale to the button that renders it', () => {
  /** The table, read from the component so it cannot drift from the shipped one. */
  function aliases(): Record<string, string> {
    const text = source();
    const start = text.indexOf('const BUTTON_FOR_RESOLVED');
    expect(start, 'BUTTON_FOR_RESOLVED not found in RegionalSettings.tsx').toBeGreaterThan(-1);
    const body = text.slice(start, text.indexOf('};', start));
    const out: Record<string, string> = {};
    // The key is written bare (`en:`) because it is a valid identifier; the
    // value is always quoted. Accept both spellings so a future entry that
    // needs quotes (a tag with a hyphen) is read rather than silently skipped.
    for (const m of body.matchAll(/(?:'([^']+)'|([a-z]{2,3}(?:-[A-Z]{2})?)):\s*'([^']+)'/g)) {
      out[m[1] ?? m[2]!] = m[3]!;
    }
    return out;
  }

  it('sends every alias to a locale that actually has a button', () => {
    // An alias pointing at a tag the picker does not offer would leave the row
    // dark exactly as before, and would look like a fix while doing nothing.
    for (const [from, to] of Object.entries(aliases())) {
      expect(CHOICES as readonly string[], `${from} -> ${to}`).toContain(to);
    }
  });

  it('only aliases a locale that renders byte-identically to its target', () => {
    // The whole licence for the alias. If a target ever stops printing what the
    // resolved tag prints, the row would claim a format the product is not
    // using - worse than lighting nothing, and invisible in a screenshot.
    // Measured through the currencies and amounts rather than one sample,
    // because that is where `en` and `en-GB` part company.
    const sample = 1234567.89;
    const currencies = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'INR', 'BRL', 'XOF', 'AED', 'CNY'];
    for (const [from, to] of Object.entries(aliases())) {
      expect(new Intl.NumberFormat(from).format(sample), `${from} vs ${to}`).toBe(
        new Intl.NumberFormat(to).format(sample),
      );
      for (const currency of currencies) {
        const options = { style: 'currency', currency } as const;
        expect(new Intl.NumberFormat(from, options).format(sample), `${from} vs ${to} ${currency}`).toBe(
          new Intl.NumberFormat(to, options).format(sample),
        );
      }
    }
  });

  it('leaves English as the only alias, because no other offered language renders like a button', () => {
    // Stated so the table cannot quietly grow. The other ten offered languages
    // resolve to tags with no button - `hi` to `hi-IN`, `mr` to `mr` in
    // Devanagari digits - and none of them prints what any button prints, so an
    // entry for them would light a control that does not describe the product.
    const table = aliases();
    expect(Object.keys(table)).toEqual(['en']);
    expect(table.en).toBe('en-US');
  });
});
