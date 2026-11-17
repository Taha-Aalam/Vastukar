// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
//
// The document-language choice is one searchable list of every language a
// document exists in, each under its own name, wherever a screen asks for one.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import { DocumentLanguageSelect } from './DocumentLanguageSelect';
import {
  MESSAGE_DOCUMENT_LOCALES,
  PROPERTY_DOCUMENT_LOCALES,
  REGISTER_DOCUMENT_LOCALES,
  REGISTER_RENDERABLE,
} from '@/shared/lib/documentExport';
import { SUPPORTED_LANGUAGES } from '@/app/i18n';

Element.prototype.scrollIntoView = vi.fn();

afterEach(cleanup);

describe('DocumentLanguageSelect', () => {
  it('lists every language it is given under its own name and searches by English name', () => {
    const onChange = vi.fn();
    render(<DocumentLanguageSelect value="en" onChange={onChange} locales={PROPERTY_DOCUMENT_LOCALES} data-testid="lang" />);
    fireEvent.click(screen.getByTestId('lang'));
    expect(screen.getAllByRole('option')).toHaveLength(PROPERTY_DOCUMENT_LOCALES.length);
    // Urdu, because it is offered and its English name is not the name it
    // shows: the search has to cross from "Urdu" to `اردو`. Hebrew was the old
    // probe here and it no longer reaches this list — the allowlist removed it,
    // and a search that matches nothing was failing for the right reason.
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'urdu' } });
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    fireEvent.click(options[0]!);
    expect(onChange).toHaveBeenCalledWith('ur');
  });

  it('offers the property documents in the register languages plus Mongolian', () => {
    // Mongolian is on disk but not in the allowlist, so it is not offered: the
    // list this family is built from is the registers' set plus `mn`, narrowed
    // by the offer, and `mn` falls out. The assertion that matters is that the
    // Mongolian extension is still *in the source list* and that the menu is
    // exactly the offered register set — not that `mn` reaches a reader.
    expect(PROPERTY_DOCUMENT_LOCALES).not.toContain('mn');
    expect(PROPERTY_DOCUMENT_LOCALES).toEqual(REGISTER_DOCUMENT_LOCALES);
    expect(PROPERTY_DOCUMENT_LOCALES).toContain('en');
    expect(PROPERTY_DOCUMENT_LOCALES).not.toContain('uk');
    expect(PROPERTY_DOCUMENT_LOCALES).not.toContain('he');
    expect(new Set(PROPERTY_DOCUMENT_LOCALES).size).toBe(PROPERTY_DOCUMENT_LOCALES.length);
  });

  it('offers messages and workbooks in every offered backend language, Bengali included', () => {
    // Bengali needs no PDF face, so it is in the source list; the offer decides
    // where it stops. Before the allowlist narrowed to eleven this was 38
    // languages, which is the number the test used to hard-code.
    expect(MESSAGE_DOCUMENT_LOCALES).toContain('bn');
    const offeredBackend = REGISTER_RENDERABLE.filter((c) => SUPPORTED_LANGUAGES.some((l) => l.code === c));
    expect([...MESSAGE_DOCUMENT_LOCALES].sort()).toEqual([...offeredBackend, 'bn'].sort());
    expect(MESSAGE_DOCUMENT_LOCALES).toEqual([...REGISTER_DOCUMENT_LOCALES, 'bn']);
  });
});
