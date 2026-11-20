// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
/**
 * The bug menu must not be able to file a report that says nothing.
 *
 * A report arrived from /modules on 16.8.0 whose Description section still
 * held the template's own `<!-- describe what you were doing -->`. An HTML
 * comment renders as nothing on GitHub, so the issue looked deliberately
 * blank; the reporter had done everything the form asked of them and only
 * learned it was useless when we wrote back a day later to ask what they had
 * clicked. The defect was ours: the menu opened GitHub straight away with the
 * placeholder already in the body, and the only submit control in the flow
 * belonged to GitHub, where we cannot disable anything.
 *
 * So the guard has to sit on this side of the hand-off, which is why these
 * tests drive the menu rather than `buildBugReportUrl`. Two directions:
 *
 *  - the channels that transmit a written report are disabled, with the
 *    reason visible in the control itself, while the description is short;
 *  - once it is long enough, what actually leaves carries the reporter's
 *    words and no placeholder.
 *
 * The third test pins the mechanism rather than the result. Restoring
 * prefilled text would satisfy "the body is not empty" while restoring the
 * whole defect, so the untouched field is asserted to be empty: the prompt is
 * a placeholder attribute, which cannot travel.
 *
 * The fourth is a positive control. A gate that blocked every channel would
 * pass the first test for the wrong reason and would also stop somebody
 * downloading the log they were about to attach.
 *
 * `react-i18next` is mocked globally in `src/test/setup.ts` and returns each
 * `defaultValue` with `{{var}}` interpolated, so assertions read in English.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const openLink = vi.hoisted(() => vi.fn());
// Default null: the existing tests exercise a quiet session. A test that needs
// an error switches this on, so both URL-bearing lines in the report body can
// be checked without changing the meaning of the other cases.
const lastError = vi.hoisted(() => ({
  value: null as { message: string; stack: string; at: string; url: string } | null,
}));

// Keep the real module; observe only the call that hands the report off.
vi.mock('@/shared/lib/desktop', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib/desktop')>();
  return { ...actual, openLink };
});

vi.mock('@/shared/lib/errorLogger', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib/errorLogger')>();
  return { ...actual, getLastError: () => lastError.value };
});

import { BugReportMenu, MIN_DESCRIPTION_LENGTH } from './Header';

/** A description a real reporter would write, comfortably over the minimum. */
const REAL_DESCRIPTION =
  'I clicked Install on the UK JCT pack on the modules page and nothing happened.';

function openMenu() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <BugReportMenu />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByLabelText('Report a bug or send feedback'));
}

// Located by their visible label rather than by role, so these queries hold
// across the popover's move from `role="menu"` to `role="dialog"` - a menu is
// not a valid parent for a text field. A role-based query would report the
// pre-change build as "no such button", which would make every assertion below
// pass or fail for a reason that has nothing to do with empty reports.
const channel = (label: string) =>
  screen.getByText(label).closest('button') as HTMLButtonElement;
const githubChannel = () => channel('Report a bug (with logs)');
const emailChannel = () => channel('Email the team');
const downloadChannel = () => channel('Download log only');
const descriptionField = () => screen.getByLabelText(/What happened/) as HTMLTextAreaElement;

function type(text: string) {
  fireEvent.change(descriptionField(), { target: { value: text } });
}

const originalHref = window.location.pathname + window.location.search + window.location.hash;

beforeEach(() => {
  openLink.mockClear();
  lastError.value = null;
  window.history.replaceState({}, '', originalHref);
});

describe('BugReportMenu - a report with no description cannot be sent', () => {
  it('disables the reporting channels and says why in the control itself', () => {
    openMenu();

    expect(githubChannel().disabled).toBe(true);
    expect(emailChannel().disabled).toBe(true);
    // The reason travels with the control, not in a toast that would only
    // appear after a click the button no longer accepts.
    expect(githubChannel().textContent).toContain('Describe what happened above');

    // The defect itself: before the guard, this click handed GitHub a body
    // whose Description was the literal `<!-- describe what you were doing -->`
    // and the reporter met our submit button already holding nothing to say.
    fireEvent.click(githubChannel());
    expect(openLink).not.toHaveBeenCalled();
  });

  it('still refuses a description too short to act on, and states the minimum up front', () => {
    openMenu();

    // Stated before anyone types, not discovered on the way out.
    expect(screen.getByText(new RegExp(`at least ${MIN_DESCRIPTION_LENGTH} characters`))).toBeTruthy();

    type('x'.repeat(MIN_DESCRIPTION_LENGTH - 1));
    expect(githubChannel().disabled).toBe(true);

    // Whitespace is not a description either.
    type(`   ${'x'.repeat(MIN_DESCRIPTION_LENGTH - 1)}   `);
    expect(githubChannel().disabled).toBe(true);

    type('x'.repeat(MIN_DESCRIPTION_LENGTH));
    expect(githubChannel().disabled).toBe(false);
  });

  it('sends the reporter words instead of a placeholder once the field is filled', () => {
    openMenu();
    type(REAL_DESCRIPTION);

    fireEvent.click(githubChannel());

    expect(openLink).toHaveBeenCalledTimes(1);
    const url = new URL(openLink.mock.calls[0]![0] as string);
    const body = url.searchParams.get('body') ?? '';

    expect(body).toContain('### Description');
    expect(body).toContain(REAL_DESCRIPTION);
    // The exact shape that shipped an invisible, empty report.
    expect(body).not.toContain('<!--');
    // The description leads, so the size guard - which keeps the head and
    // trims the tail - can never be what drops it.
    expect(body.indexOf(REAL_DESCRIPTION)).toBeLessThan(body.indexOf('### Environment'));
    // A quiet session is still a legitimate report; that line stays honest.
    expect(body).toContain('No error captured during this session');
  });

  it('prompts with a placeholder attribute, so an untouched field holds nothing', () => {
    openMenu();

    expect(descriptionField().value).toBe('');
    expect(descriptionField().placeholder.length).toBeGreaterThan(0);
  });

  it('never gates downloading the log, which is what people do before writing', () => {
    openMenu();

    expect(downloadChannel().disabled).toBe(false);
  });
});

describe('BugReportMenu - a public report never carries a URL address tail', () => {
  /**
   * The report body is a GitHub issue anyone can read. A token-bearing share
   * or portal route used to go out verbatim on the Page line, and the captured
   * error's own URL went out on the Error page line. The logger masks its copy
   * of the URL, but the menu assembles these two lines itself, so it has to do
   * the stripping too. Both lines are asserted here, and the whole body is
   * swept for the query keys and values so no third copy can slip through.
   */
  it('strips ?token=…&id=… and the fragment from every URL in the body', () => {
    window.history.replaceState({}, '', '/portal/share/abc?token=SECRET123&id=42#private');
    lastError.value = {
      message: 'failed to load',
      stack: 'Error: failed to load',
      at: '2026-11-20T00:00:00Z',
      url: '/projects/p-7?token=OTHERSECRET&id=99#detail',
    };

    openMenu();
    type(REAL_DESCRIPTION);
    fireEvent.click(githubChannel());

    expect(openLink).toHaveBeenCalledTimes(1);
    const url = new URL(openLink.mock.calls[0]![0] as string);
    const body = url.searchParams.get('body') ?? '';

    // The path survives; the address tail does not.
    expect(body).toContain('- Page: /portal/share/abc');
    expect(body).toContain('- Error page: /projects/p-7');
    for (const leak of [
      'token=',
      'SECRET123',
      'OTHERSECRET',
      'id=42',
      'id=99',
      '#private',
      '#detail',
      '?',
    ]) {
      expect(body, `report body leaked ${leak}`).not.toContain(leak);
    }
  });
});
