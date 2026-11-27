// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
/**
 * StylesLabPage — specimen sheet for the tokens used by the product UI.
 *
 * Every sample uses the same neutral ramp, one blue accent, 4px spacing,
 * and nested radii (inner radius = outer radius - padding, min 4px).
 * Only genuinely live indicators animate; nothing here loops decoratively.
 *
 * Open at /styles-lab.
 */

import { useState, type ReactNode } from 'react';
import {
  Hammer, Building2, Calculator, Ruler, FileText, Layers,
  CircleDot, ChevronRight, Download, Plus, ArrowRight, ArrowUpRight, X, Check,
  AlertTriangle, Zap, Box, Boxes, Settings, TrendingUp,
  Bell, Activity, Cpu,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* ────────────────────────────────────────────────────────────────────────── */
/* Page shell                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export function StylesLabPage() {
  const [section, setSection] = useState<'headings' | 'buttons' | 'icons' | 'tags' | 'backgrounds'>('headings');

  const tabs: Array<{ key: typeof section; label: string; count: number }> = [
    { key: 'headings',    label: 'Headings',    count: 12 },
    { key: 'buttons',     label: 'Buttons',     count: 14 },
    { key: 'icons',       label: 'Icons',       count: 12 },
    { key: 'tags',        label: 'Tags',        count: 13 },
    { key: 'backgrounds', label: 'Backgrounds', count: 13 },
  ];

  return (
    <div className="min-h-full bg-surface-secondary">
      {/* Header: calm surface, no decorative field */}
      <div className="border-b border-border-light bg-surface-primary">
        <div className="mx-auto max-w-content px-8 py-8">
          <div className="text-xs text-content-tertiary">
            Internal · Design reference
          </div>
          <h1 className="mt-2 text-3xl font-medium text-content-primary">
            Styles Lab
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-content-secondary">
            Specimens for the type, controls, icons and surfaces used in the product.
            Each sample uses the current token ramp and spacing scale.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSection(tab.key)}
                className={[
                  'inline-flex h-9 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors duration-fast ease-oe',
                  section === tab.key
                    ? 'border-oe-blue/30 bg-oe-blue-subtle text-oe-blue-text'
                    : 'border-border bg-surface-primary text-content-secondary hover:border-content-tertiary hover:bg-surface-secondary',
                ].join(' ')}
                aria-pressed={section === tab.key}
              >
                {tab.label}
                <span className="text-xs tabular-nums text-content-tertiary">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-content px-8 py-8">
        {section === 'headings'    && <HeadingsSection />}
        {section === 'buttons'     && <ButtonsSection />}
        {section === 'icons'       && <IconsSection />}
        {section === 'tags'        && <TagsSection />}
        {section === 'backgrounds' && <BackgroundsSection />}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Reusable specimen frame                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

function Specimen({
  no, name, family, note, children,
}: {
  no: number; name: string; family: string; note: string; children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-light bg-surface-primary p-4 transition-colors duration-fast ease-oe hover:border-border">
      <div className="flex items-center gap-2 text-xs text-content-tertiary">
        <span className="tabular-nums">{String(no).padStart(2, '0')}</span>
        <span className="h-px flex-1 bg-border-light" />
        <span>{family}</span>
      </div>
      <div className="mt-2 text-sm font-medium text-content-primary">{name}</div>
      <p className="mt-1 text-xs leading-relaxed text-content-tertiary">{note}</p>

      <div className="mt-4 flex min-h-20 items-center justify-center rounded-md bg-surface-secondary px-4 py-4 ring-1 ring-inset ring-border-light/60">
        {children}
      </div>
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <h2 className="text-xl font-medium text-content-primary">{children}</h2>
      {sub && <span className="text-xs text-content-tertiary">{sub}</span>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* HEADINGS                                                                  */
/* ════════════════════════════════════════════════════════════════════════ */

function HeadingsSection() {
  return (
    <>
      <SectionTitle sub="text-display family · 12 directions">Headings</SectionTitle>
      <Grid>
        <Specimen no={1} name="Plain" family="Default" note="Quiet heading on the base surface.">
          <h3 className="text-2xl font-medium text-content-primary">Project overview</h3>
        </Specimen>

        <Specimen no={2} name="Accent" family="Emphasis" note="Heading paired with one accent word.">
          <h3 className="text-2xl font-medium text-content-primary">
            Project <span className="text-oe-blue-text">overview</span>
          </h3>
        </Specimen>

        <Specimen no={3} name="Context + heading" family="Editorial" note="Small context line above the heading.">
          <div className="text-center">
            <div className="text-xs text-content-tertiary">Phase 02 · Cost plan</div>
            <h3 className="mt-1 text-2xl font-medium text-content-primary">Project overview</h3>
          </div>
        </Specimen>

        <Specimen no={4} name="Rule" family="Structural" note="Hairline mark under a section heading.">
          <div>
            <h3 className="text-2xl font-medium text-content-primary">Project overview</h3>
            <div className="mt-2 h-px w-12 bg-oe-blue" />
          </div>
        </Specimen>

        <Specimen no={5} name="Numbered" family="Editorial" note="Step number set as tabular text beside the heading.">
          <div className="flex items-baseline gap-3">
            <span className="text-sm tabular-nums text-content-tertiary">03</span>
            <h3 className="text-2xl font-medium text-content-primary">Project overview</h3>
          </div>
        </Specimen>

        <Specimen no={6} name="Icon + heading + meta" family="Functional" note="Tile pattern with a module icon and a metadata line.">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-oe-blue-subtle text-oe-blue-text">
              <Building2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-medium leading-tight text-content-primary">Project overview</h3>
              <div className="mt-1 text-xs text-content-tertiary">12 BOQs · 4 active phases</div>
            </div>
          </div>
        </Specimen>

        <Specimen no={7} name="Accent line" family="Hero" note="Heading in the single accent colour, no glow.">
          <h3 className="text-2xl font-medium text-oe-blue-text">Project overview</h3>
        </Specimen>

        <Specimen no={8} name="Mono fingerprint" family="Technical" note="Mono version chip beside a sans heading.">
          <div className="flex items-baseline gap-3">
            <span className="rounded border border-border-light bg-surface-tertiary px-2 py-1 font-mono text-xs text-content-tertiary">v2.9.36</span>
            <h3 className="text-2xl font-medium text-content-primary">Project overview</h3>
          </div>
        </Specimen>

        <Specimen no={9} name="Quiet display" family="Display" note="Larger plain heading, no outline or stroke treatment.">
          <h3 className="text-3xl font-medium text-content-primary">
            Project overview
          </h3>
        </Specimen>

        <Specimen no={10} name="Context weight" family="Editorial" note="Muted context word with a normal-weight name.">
          <h3 className="text-2xl">
            <span className="font-normal text-content-tertiary">Project </span>
            <span className="font-medium text-content-primary">overview</span>
          </h3>
        </Specimen>

        <Specimen no={11} name="Display" family="Hero" note="Largest heading size, no negative tracking.">
          <h3 className="text-4xl font-medium leading-tight text-content-primary">
            Build it<br />brilliantly.
          </h3>
        </Specimen>

        <Specimen no={12} name="Figure + metric" family="Analytics" note="Tabular figure with a small trend mark.">
          <div className="flex items-end gap-3">
            <h3 className="text-2xl font-medium tabular-nums text-content-primary">€2.4M</h3>
            <svg viewBox="0 0 60 24" className="h-6 w-16 text-semantic-success" aria-hidden="true">
              <polyline points="0,18 10,15 20,16 30,10 40,12 50,5 60,7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs tabular-nums text-semantic-success">+12.4%</span>
          </div>
        </Specimen>
      </Grid>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* BUTTONS                                                                   */
/* ════════════════════════════════════════════════════════════════════════ */

function ButtonsSection() {
  return (
    <>
      <SectionTitle sub="14 directions · 8px controls">Buttons</SectionTitle>
      <Grid>
        <Specimen no={1} name="Primary" family="Current" note="Solid accent action.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-oe-blue px-4 text-sm font-medium text-white transition-colors duration-fast ease-oe hover:bg-oe-blue-hover">
            <Plus className="h-4 w-4" strokeWidth={1.5} /> Create BOQ
          </button>
        </Specimen>

        <Specimen no={2} name="Secondary" family="Current" note="Neutral surface action with a hairline border.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-primary px-4 text-sm font-medium text-content-primary transition-colors duration-fast ease-oe hover:bg-surface-secondary">
            <FileText className="h-4 w-4" strokeWidth={1.5} /> Open report
          </button>
        </Specimen>

        <Specimen no={3} name="Accent emphasis" family="Emphasis" note="Primary action on a dense toolbar.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-oe-blue px-4 text-sm font-medium text-white transition-colors duration-fast ease-oe hover:bg-oe-blue-hover">
            <FileText className="h-4 w-4" strokeWidth={1.5} /> Generate
          </button>
        </Specimen>

        <Specimen no={4} name="Quiet dark" family="Subtle" note="Neutral dark surface on a tinted panel.">
          <div className="-m-4 w-full rounded-md bg-surface-tertiary p-4">
            <div className="grid place-items-center">
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-surface-primary px-4 text-sm font-medium text-content-primary transition-colors duration-fast ease-oe hover:bg-surface-secondary">
                <Zap className="h-4 w-4" strokeWidth={1.5} /> Run check
              </button>
            </div>
          </div>
        </Specimen>

        <Specimen no={5} name="Outline" family="Minimal" note="Text action with a hairline border.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-content-primary transition-colors duration-fast ease-oe hover:bg-surface-secondary">
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} /> Ship it
          </button>
        </Specimen>

        <Specimen no={6} name="Hairline focus" family="Focus" note="Control with a visible focus ring.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-oe-blue/40 bg-surface-primary px-4 text-sm font-medium text-oe-blue-text focus:outline-none focus:ring-2 focus:ring-oe-blue/30">
            <FileText className="h-4 w-4" strokeWidth={1.5} /> Open report
          </button>
        </Specimen>

        <Specimen no={7} name="Neutral solid" family="SaaS" note="Pressed-state styling kept to a colour step.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-content-primary px-4 text-sm font-medium text-content-inverse transition-colors duration-fast ease-oe hover:opacity-90">
            <FileText className="h-4 w-4" strokeWidth={1.5} /> Open report
          </button>
        </Specimen>

        <Specimen no={8} name="Tactile" family="Solid" note="Solid action without a 3D edge.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-oe-blue px-4 text-sm font-medium text-white transition-colors duration-fast ease-oe hover:bg-oe-blue-hover">
            <Download className="h-4 w-4" strokeWidth={1.5} /> Export GAEB
          </button>
        </Specimen>

        <Specimen no={9} name="Outline refined" family="Minimal" note="Secondary action on a light surface.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-primary px-4 text-sm font-medium text-content-primary transition-colors duration-fast ease-oe hover:border-content-tertiary hover:bg-surface-secondary">
            <FileText className="h-4 w-4" strokeWidth={1.5} /> Open report
          </button>
        </Specimen>

        <Specimen no={10} name="Emphasis CTA" family="Attention" note="Rare action that carries the accent.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-oe-blue px-4 text-sm font-medium text-white transition-colors duration-fast ease-oe hover:bg-oe-blue-hover">
            <Check className="h-4 w-4" strokeWidth={1.5} /> Approve change order
          </button>
        </Specimen>

        <Specimen no={11} name="Pressed" family="Calm" note="Selected state shown with a neutral tint.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-tertiary px-4 text-sm font-medium text-content-primary transition-colors duration-fast ease-oe hover:bg-surface-secondary">
            <Settings className="h-4 w-4" strokeWidth={1.5} /> Configure
          </button>
        </Specimen>

        <Specimen no={12} name="Notification" family="Status" note="Count beside a label, no pulse.">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-oe-blue px-4 text-sm font-medium text-white transition-colors duration-fast ease-oe hover:bg-oe-blue-hover">
            <Bell className="h-4 w-4" strokeWidth={1.5} /> 3 new updates
          </button>
        </Specimen>

        <Specimen no={13} name="Text action" family="Text-only" note="Inline link with a steady underline.">
          <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-oe-blue-text hover:underline">
            <span className="border-b border-current">View pricing details</span>
            <ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </Specimen>

        <Specimen no={14} name="Segmented control" family="View switch" note="Neutral ramp steps mark the selected view.">
          <div className="inline-flex h-9 items-center gap-1 rounded-lg bg-surface-tertiary p-1">
            <button type="button" className="h-7 rounded-md bg-surface-primary px-3 text-xs font-medium text-content-primary">List</button>
            <button type="button" className="h-7 rounded-md px-3 text-xs font-medium text-content-tertiary hover:text-content-primary">Grid</button>
            <button type="button" className="h-7 rounded-md px-3 text-xs font-medium text-content-tertiary hover:text-content-primary">Map</button>
          </div>
        </Specimen>
      </Grid>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* ICONS                                                                     */
/* ════════════════════════════════════════════════════════════════════════ */

function IconsSection() {
  return (
    <>
      <SectionTitle sub="12 treatments · 18px icons at 1.5 stroke">Icons</SectionTitle>
      <Grid>
        <Specimen no={1} name="Plain stroke" family="Default" note="Lucide icon in the text-role colour.">
          <Hammer className="h-[18px] w-[18px] text-content-secondary" strokeWidth={1.5} />
        </Specimen>

        <Specimen no={2} name="Soft chip" family="Functional" note="Icon on a tinted neutral/accent square.">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-oe-blue-subtle text-oe-blue-text">
            <Building2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </div>
        </Specimen>

        <Specimen no={3} name="Solid chip" family="Emphasis" note="Solid accent square with a white glyph.">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-oe-blue text-white">
            <FileText className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </div>
        </Specimen>

        <Specimen no={4} name="Ring" family="Status" note="Status ring around a check glyph.">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-semantic-success-bg text-semantic-success ring-2 ring-semantic-success/30">
            <Check className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </Specimen>

        <Specimen no={5} name="Tinted chip" family="Subtle" note="Glyph on a quiet neutral square.">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-surface-tertiary text-content-secondary">
            <FileText className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </div>
        </Specimen>

        <Specimen no={6} name="Duotone stack" family="Editorial" note="Two glyphs offset for an empty state.">
          <div className="relative h-12 w-12">
            <Boxes className="absolute inset-0 m-auto h-10 w-10 text-content-quaternary" strokeWidth={1.5} />
            <Box className="absolute inset-0 m-auto h-7 w-7 translate-x-1 translate-y-1 text-content-secondary" strokeWidth={1.5} />
          </div>
        </Specimen>

        <Specimen no={7} name="Icon + label" family="Metadata" note="Chip for a unit or source label.">
          <span className="inline-flex h-8 items-center gap-2 rounded-lg bg-surface-tertiary px-3 text-xs font-medium text-content-secondary">
            <Ruler className="h-4 w-4 text-oe-blue-text" strokeWidth={1.5} />
            243 m²
          </span>
        </Specimen>

        <Specimen no={8} name="Inset" family="Tactile" note="Control icon on a recessed neutral square.">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-surface-secondary text-content-primary">
            <Calculator className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </div>
        </Specimen>

        <Specimen no={9} name="Neutral ramp" family="iOS Native" note="Grey ramp step for a settings glyph.">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-surface-tertiary text-content-secondary">
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </div>
        </Specimen>

        <Specimen no={10} name="Overlay chip" family="Modern" note="Neutral chip for use over a drawing.">
          <div className="grid place-items-center">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-border bg-surface-primary text-content-primary">
              <Cpu className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </div>
          </div>
        </Specimen>

        <Specimen no={11} name="Stacked layers" family="Editorial" note="Neutral steps suggest depth without a gradient.">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-lg bg-surface-tertiary translate-x-2 translate-y-2" />
            <div className="absolute inset-0 rounded-lg bg-surface-secondary translate-x-1 translate-y-1" />
            <div className="absolute inset-0 grid place-items-center rounded-lg bg-oe-blue text-white">
              <Layers className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </div>
          </div>
        </Specimen>

        <Specimen no={12} name="Live status" family="Realtime" note="The pulse here marks a genuinely live connection.">
          <div className="relative">
            <span aria-hidden className="absolute inset-0 rounded-full bg-semantic-success/40 animate-ping" />
            <div className="relative grid h-12 w-12 place-items-center rounded-full bg-semantic-success text-white">
              <Activity className="h-5 w-5" strokeWidth={1.5} />
            </div>
          </div>
        </Specimen>
      </Grid>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* TAGS                                                                      */
/* ════════════════════════════════════════════════════════════════════════ */

function TagsSection() {
  const { t } = useTranslation();
  return (
    <>
      <SectionTitle sub="13 directions · 6px tags, dots stay round">Tags & badges</SectionTitle>
      <Grid>
        <Specimen no={1} name="Soft badge" family="Default" note="Tinted neutral badge for a status value.">
          <span className="inline-flex h-6 items-center gap-2 rounded-md px-2 text-xs font-medium bg-semantic-success-bg text-semantic-success">Approved</span>
        </Specimen>

        <Specimen no={2} name="Emphatic" family="Alert" note="Solid semantic colour for a hard alert.">
          <span className="inline-flex h-6 items-center gap-2 rounded-md px-2 text-xs font-medium bg-semantic-error text-white">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.5} /> Overdue
          </span>
        </Specimen>

        <Specimen no={3} name="Outline" family="Minimal" note="Border and text on a transparent field.">
          <span className="inline-flex h-6 items-center gap-2 rounded-md px-2 text-xs font-medium text-content-secondary border border-border">Draft</span>
        </Specimen>

        <Specimen no={4} name="Dot + label" family="Status" note="Status dot with plain text.">
          <span className="inline-flex h-6 items-center gap-2 text-xs font-medium text-content-primary">
            <span className="h-2 w-2 rounded-full bg-semantic-success" />
            In progress
          </span>
        </Specimen>

        <Specimen no={5} name="Suggested" family="Emphasis" note="Single accent for a suggested value.">
          <span className="inline-flex h-6 items-center gap-2 rounded-md px-2 text-xs font-medium text-oe-blue-text bg-oe-blue-subtle">
            Suggested
          </span>
        </Specimen>

        <Specimen no={6} name="Live dot" family="Realtime" note="Pulse marks a live presence, not a static state.">
          <span className="inline-flex h-6 items-center gap-2 rounded-md bg-surface-tertiary px-2 text-xs font-medium text-content-secondary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-semantic-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-semantic-success" />
            </span>
            Live · 3 viewers
          </span>
        </Specimen>

        <Specimen no={7} name="Mono chip" family="Technical" note="Monospace chip for a version or code.">
          <span className="inline-flex h-6 items-center rounded border border-border-light bg-surface-tertiary px-2 font-mono text-xs font-normal text-content-primary">DIN-276/330</span>
        </Specimen>

        <Specimen no={8} name="Overlay badge" family="Subtle" note="Neutral label for use over a drawing.">
          <span className="inline-flex h-6 items-center gap-2 rounded-md border border-border bg-surface-primary px-2 text-xs font-medium text-content-primary">
            <Layers className="h-4 w-4" strokeWidth={1.5} /> Level 02
          </span>
        </Specimen>

        <Specimen no={9} name="Removable chip" family="Functional" note="Applied filter with a remove control.">
          <span className="inline-flex h-7 items-center gap-2 rounded-md ps-3 pe-1 text-xs font-medium text-oe-blue-text bg-oe-blue-subtle">
            <CircleDot className="h-4 w-4" strokeWidth={1.5} /> Concrete C30/37
            <button type="button" className="grid h-5 w-5 place-items-center rounded hover:bg-oe-blue-subtle" aria-label={t('styles_lab.remove_filter', { defaultValue: 'Remove filter' })}>
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </span>
        </Specimen>

        <Specimen no={10} name="Category tags" family="Taxonomy" note="Neutral tint steps for categories.">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 items-center rounded-md bg-surface-tertiary px-2 text-xs font-medium text-content-secondary">Concrete</span>
            <span className="inline-flex h-6 items-center rounded-md bg-surface-tertiary px-2 text-xs font-medium text-content-secondary">Rebar</span>
            <span className="inline-flex h-6 items-center rounded-md bg-surface-tertiary px-2 text-xs font-medium text-content-secondary">Finish</span>
          </div>
        </Specimen>

        <Specimen no={11} name="Trend value" family="Analytics" note="Figure with a semantic trend glyph.">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex h-6 items-center gap-2 rounded-md px-2 text-xs font-medium tabular-nums bg-semantic-success-bg text-semantic-success">
              <TrendingUp className="h-4 w-4" strokeWidth={1.5} /> +12.4%
            </span>
            <span className="inline-flex h-6 items-center gap-2 rounded-md px-2 text-xs font-medium tabular-nums bg-semantic-error-bg text-semantic-error">
              <TrendingUp className="h-4 w-4 rotate-180" strokeWidth={1.5} /> −3.1%
            </span>
          </div>
        </Specimen>

        <Specimen no={12} name="Counter" family="Notification" note="Round count badge on an icon.">
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-surface-tertiary text-content-secondary">
              <Bell className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <span className="absolute -top-1 -right-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-semantic-error px-1 text-xs font-medium tabular-nums text-white ring-2 ring-surface-primary">12</span>
          </div>
        </Specimen>

        <Specimen no={13} name="Processing" family="Status" note="Steady label for an in-progress state.">
          <span className="inline-flex h-6 items-center gap-2 rounded-md bg-surface-tertiary px-2 text-xs font-medium text-content-secondary">
            Processing…
          </span>
        </Specimen>
      </Grid>

      {/* Composite demo */}
      <div className="mt-8 rounded-xl border border-border-light bg-surface-primary p-4">
        <div className="text-xs text-content-tertiary">Example · realistic row</div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex h-6 items-center gap-2 rounded-md bg-semantic-success-bg px-2 text-xs font-medium text-semantic-success">Approved</span>
          <span className="inline-flex h-6 items-center gap-2 text-xs font-medium text-content-primary"><span className="h-2 w-2 rounded-full bg-semantic-warning" />Waiting client</span>
          <span className="inline-flex h-6 items-center rounded border border-border-light bg-surface-tertiary px-2 font-mono text-xs font-normal text-content-primary">v2.9.36</span>
          <span className="inline-flex h-6 items-center rounded-md bg-surface-tertiary px-2 text-xs font-medium text-content-secondary">Concrete</span>
          <span className="inline-flex h-6 items-center gap-2 rounded-md px-2 text-xs font-medium tabular-nums bg-semantic-success-bg text-semantic-success"><TrendingUp className="h-4 w-4" strokeWidth={1.5} /> +12.4%</span>
          <span className="inline-flex h-6 items-center gap-2 rounded-md px-2 text-xs font-medium text-oe-blue-text bg-oe-blue-subtle">Suggested</span>
          <span className="inline-flex h-6 items-center gap-2 rounded-md px-2 text-xs font-medium text-content-secondary border border-border">Draft</span>
          <ChevronRight className="h-[18px] w-[18px] text-content-quaternary" strokeWidth={1.5} />
          <span className="text-xs text-content-tertiary">12 more</span>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* BACKGROUNDS                                                               */
/* ════════════════════════════════════════════════════════════════════════ */

function BgSpecimen({
  no, name, family, note, bgClass, bgStyle, dark = false, children,
}: {
  no: number;
  name: string;
  family: string;
  note: string;
  bgClass?: string;
  bgStyle?: React.CSSProperties;
  dark?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-light bg-surface-primary overflow-hidden transition-colors duration-fast ease-oe hover:border-border">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 text-xs text-content-tertiary">
          <span className="tabular-nums">{String(no).padStart(2, '0')}</span>
          <span className="h-px flex-1 bg-border-light" />
          <span>{family}</span>
        </div>
        <div className="mt-2 text-sm font-medium text-content-primary">{name}</div>
        <p className="mt-1 text-xs leading-relaxed text-content-tertiary">{note}</p>
      </div>
      <div
        className={['relative h-60 overflow-hidden border-t border-border-light', bgClass ?? ''].join(' ')}
        style={bgStyle}
      >
        {children ?? <SampleContent dark={dark} />}
      </div>
    </div>
  );
}

/** Realistic content overlay so readability can be judged against each surface. */
function SampleContent({ dark = false }: { dark?: boolean }) {
  const titleColor = dark ? 'text-white' : 'text-content-primary';
  const subColor   = dark ? 'text-white/70' : 'text-content-secondary';
  const cardBg     = dark ? 'border-white/20 bg-white/10' : 'border-border bg-surface-primary';
  const btnBg      = dark ? 'bg-white text-[#0f1117]' : 'bg-oe-blue text-white';

  return (
    <div className="relative flex h-full flex-col justify-between p-4">
      <div>
        <div className={['text-xs', dark ? 'text-white/60' : 'text-content-tertiary'].join(' ')}>
          Phase 02 · Cost plan
        </div>
        <h4 className={['mt-1 text-lg font-medium', titleColor].join(' ')}>
          Berlin Mitte · Tower B
        </h4>
        <p className={['mt-1 max-w-md text-xs leading-relaxed', subColor].join(' ')}>
          BOQ ready for review. 1,284 positions across 12 sections.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className={['inline-flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium', btnBg].join(' ')}>
          Review estimate
        </button>
        <span className={['inline-flex h-6 items-center gap-2 rounded-md border px-2 text-xs font-medium tabular-nums', cardBg].join(' ')}>
          €2.4M
        </span>
      </div>
    </div>
  );
}

function BackgroundsSection() {
  const noiseSvg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";

  return (
    <>
      <SectionTitle sub="13 surface treatments · content overlay shows readability">Backgrounds</SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">

        <BgSpecimen no={1} name="Plain" family="Default"
          note="Single neutral surface. Safe for content-dense screens such as the BOQ."
          bgClass="bg-surface-secondary"
        />

        <BgSpecimen no={2} name="Dot grid" family="Technical"
          note="Fine neutral dot grid at a 24px pitch."
          bgStyle={{
            backgroundColor: 'var(--oe-bg-secondary)',
            backgroundImage: 'radial-gradient(circle, rgba(60,60,67,0.16) 0.9px, transparent 0.9px)',
            backgroundSize: '24px 24px',
          }}
        />

        <BgSpecimen no={3} name="Dot grid + edge rule" family="Technical"
          note="Dot grid with a quiet hairline at the top edge."
          bgStyle={{
            backgroundColor: 'var(--oe-bg-secondary)',
            backgroundImage: 'radial-gradient(circle, rgba(60,60,67,0.16) 0.9px, transparent 0.9px)',
            backgroundSize: '24px 24px',
            borderTop: '2px solid var(--oe-border-light)',
          }}
        />

        <BgSpecimen no={4} name="Line grid" family="Technical"
          note="Fine coordinate grid for engineering screens."
          bgStyle={{
            backgroundColor: 'var(--oe-bg-secondary)',
            backgroundImage:
              'linear-gradient(to right, var(--oe-border-light) 1px, transparent 1px),' +
              'linear-gradient(to bottom, var(--oe-border-light) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <BgSpecimen no={5} name="Neutral wash" family="Subtle"
          note="One neutral step darker at the top, without a spotlight."
          bgStyle={{
            background: 'linear-gradient(180deg, var(--oe-bg-secondary) 0%, var(--oe-bg-tertiary, var(--oe-bg-secondary)) 100%)',
          }}
        />

        <BgSpecimen no={6} name="Ramp steps" family="Neutral"
          note="Three neutral steps as flat bands, no drifting shapes."
          bgClass="bg-surface-secondary"
        >
          <div className="absolute inset-0 flex flex-col">
            <div className="h-1/3 bg-surface-primary" />
            <div className="h-1/3 bg-surface-secondary" />
            <div className="h-1/3 bg-surface-tertiary" />
          </div>
          <SampleContent />
        </BgSpecimen>

        <BgSpecimen no={7} name="Solid accent" family="Flat" dark
          note="One flat accent field, no animation."
          bgStyle={{ background: 'var(--oe-blue)' }}
        />

        <BgSpecimen no={8} name="Noise grain" family="Subtle"
          note="Fine neutral grain over the base surface."
          bgStyle={{
            backgroundColor: 'var(--oe-bg-secondary)',
            backgroundImage: `url("${noiseSvg}")`,
          }}
        />

        <BgSpecimen no={9} name="Topographic contours" family="Construction"
          note="Contour lines: a literal reference to drawings and site plans."
        >
          <div className="absolute inset-0 bg-surface-secondary" />
          <svg className="absolute inset-0 h-full w-full text-oe-blue/15" viewBox="0 0 800 240" preserveAspectRatio="none" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M-50 50 Q150 10, 350 60 T800 50" />
              <path d="M-50 80 Q150 40, 350 90 T800 80" />
              <path d="M-50 110 Q150 70, 350 120 T800 110" />
              <path d="M-50 140 Q150 100, 350 150 T800 140" />
              <path d="M-50 170 Q150 130, 350 180 T800 170" />
              <path d="M-50 200 Q150 160, 350 210 T800 200" />
            </g>
            <g fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.7">
              <path d="M-50 65 Q150 25, 350 75 T800 65" />
              <path d="M-50 95 Q150 55, 350 105 T800 95" />
              <path d="M-50 125 Q150 85, 350 135 T800 125" />
              <path d="M-50 155 Q150 115, 350 165 T800 155" />
              <path d="M-50 185 Q150 145, 350 195 T800 185" />
            </g>
          </svg>
          <SampleContent />
        </BgSpecimen>

        <BgSpecimen no={10} name="Bottom rule" family="Subtle"
          note="A single quiet rule marks the context change."
          bgStyle={{
            backgroundColor: 'var(--oe-bg-secondary)',
            backgroundImage: 'linear-gradient(180deg, transparent 0%, transparent 96%, var(--oe-border-light) 100%)',
          }}
        />

        <BgSpecimen no={11} name="Diagonal stripes" family="Editorial"
          note="Repeat hatching for an exceptional section."
          bgStyle={{
            backgroundColor: 'var(--oe-bg-secondary)',
            backgroundImage: 'repeating-linear-gradient(45deg, var(--oe-border-light) 0 1px, transparent 1px 14px)',
          }}
        />

        <BgSpecimen no={12} name="Cross-hatch" family="Construction"
          note="Drafting hatch at 45° and 135°, as on a detail sheet."
          bgStyle={{
            backgroundColor: 'var(--oe-bg-secondary)',
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--oe-border-light) 0 1px, transparent 1px 12px),' +
              'repeating-linear-gradient(135deg, var(--oe-border-light) 0 1px, transparent 1px 12px)',
          }}
        />

        <BgSpecimen no={13} name="Dark surface" family="Chat" dark
          note="One flat dark surface for chat and advisor panes."
          bgStyle={{ background: '#0a0c14' }}
        >
          <SampleContent dark />
        </BgSpecimen>

      </div>
    </>
  );
}
