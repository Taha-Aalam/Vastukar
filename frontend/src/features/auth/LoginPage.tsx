// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP​‌‍⁠​‌‍⁠​‌‍⁠​‌‍⁠
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, Globe, ChevronDown, X, Pencil,
  ShieldCheck, Zap, Brain, Info,
  FileSpreadsheet, CalendarClock, TrendingUp, Boxes, Database,
  BarChart3, Upload, FileCheck,
  Box, Ruler, Layers,
  PenTool, FolderOpen, ClipboardList,
  Sun, Moon, Monitor,
} from 'lucide-react';
import { Button, Input, Logo, LogoWithText, CountryFlag } from '@/shared/ui';
import { readRememberChoice, saveRememberChoice, useAuthStore } from '@/stores/useAuthStore';
import { useBrandingStore } from '@/stores/useBrandingStore';
import { BrandingEditorModal } from '@/app/layout/CustomBranding';
import { extractErrorMessageFromBody } from '@/shared/lib/api';
import { isTauri } from '@/shared/lib/desktop';
import { HEX_PORTRAIT_ASPECT, HEX_PORTRAIT_CLIP } from '@/shared/lib/honeycomb';
import { loginFailureKindFromResponse } from './loginError';
import { AuthBackground } from './AuthBackground';
import { ClassicAuthAside, ClassicAuthFooter } from './ClassicAuth';
import {
  shouldAttemptDesktopBootstrap,
  shouldQueryFirstRun,
  type FirstRunStatus,
} from './desktopBootstrap';
import { safeNextPath } from './nextPath';
import { SUPPORTED_LANGUAGES } from '@/app/i18n';
import { sortLanguagesByName } from '@/shared/lib/languageOrder';
import { useThemeStore } from '@/stores/useThemeStore';
import { beginOidcLogin } from './oidcPkce';

/* Segmented theme switch (Light / Dark / System) for the login page. */
function ThemeSwitch() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const opts = [
    { mode: 'light' as const, icon: Sun, label: t('theme.light', { defaultValue: 'Light' }) },
    { mode: 'dark' as const, icon: Moon, label: t('theme.dark', { defaultValue: 'Dark' }) },
    { mode: 'system' as const, icon: Monitor, label: t('theme.system', { defaultValue: 'System' }) },
  ];
  return (
    <div
      role="radiogroup"
      aria-label={t('theme.label', { defaultValue: 'Theme' })}
      className="flex items-center gap-1 rounded-lg border border-border-light bg-surface-elevated p-1"
    >
      {opts.map(({ mode, icon: Icon, label }) => {
        const active = theme === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            title={label}
            aria-label={label}
            onClick={() => setTheme(mode)}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              active
                ? 'bg-oe-blue text-white shadow-sm'
                : 'text-content-tertiary hover:text-content-secondary hover:bg-surface-secondary'
            }`}
          >
            <Icon size={16} strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const setTokens = useAuthStore((s) => s.setTokens);
  // White-label brand (same localStorage store the in-app sidebar editor
  // writes to). When a tenant has set a logo / company name we show it
  // on the login card instead of the default OpenConstructionERP wordmark.
  const { mode: brandMode, logoDataUrl: brandLogo, companyName: brandName } =
    useBrandingStore();
  const showLogoEdit = useBrandingStore((s) => s.options.showLogoEdit);
  const brandCustomised = brandMode === 'logo' || brandMode === 'text';
  // Pull the workspace brand from the server so an invited user sees it on this
  // very first (pre-auth) screen, not just the browser that set it (issue #272).
  // Public endpoint, best-effort: the card paints instantly from localStorage
  // and this reconciles to whatever the workspace admin saved.
  useEffect(() => {
    void useBrandingStore.getState().hydrateFromServer();
  }, []);
  // `?next=/path` lets guarded routes send the user back to where they wanted
  // to go after login. Falls back to `/` for direct visits. Shared with the
  // authenticated-route guard (AuthedHome) so a redirect race between the two
  // cannot silently drop the `next` (the demo deep-link bug).
  const nextPath = safeNextPath(location.search);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Checked unless the user unchecked it last time they signed in here.
  const [rememberMe, setRememberMe] = useState(readRememberChoice);
  const [langOpen, setLangOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(true);
  const [demoHint, setDemoHint] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  // The demo sign-in is shown by DEFAULT and only hidden when the server
  // explicitly reports demo is off (SEED_DEMO=false, or an admin turned it off
  // in Settings). Starting true means a probe that fails or races the ~60s
  // first-boot demo seeding can never leave the block hidden (see the effect
  // below). This is deliberate: demo access is a headline feature of the open
  // platform, so it should always be there on a fresh install.
  const [demoEnabled, setDemoEnabled] = useState<boolean>(true);
  const langRef = useRef<HTMLDivElement>(null);

  // Desktop first-run: when running inside the Tauri shell with no stored
  // token and no deliberate manual logout this session, we silently auto-sign
  // in to the local workspace owner. Seed the pending flag synchronously so the
  // very first paint shows "Preparing your workspace..." rather than flashing
  // the login form before the bootstrap effect runs.
  const [bootstrapping, setBootstrapping] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored =
      localStorage.getItem('oe_access_token') || sessionStorage.getItem('oe_access_token');
    const manual = sessionStorage.getItem('oe_manual_login');
    return shouldQueryFirstRun(isTauri, Boolean(stored), manual);
  });

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0]!;

  // Clear form on mount (prevents pre-fill after logout)
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, []);

  // Probe whether this server has demo turned OFF (public, no auth). The block
  // is shown by default (see the state above); this effect only ever HIDES it,
  // and only when the server explicitly reports `demo_enabled: false` - a
  // production install with SEED_DEMO=false, or an admin who turned demo off in
  // Settings. Older servers omit the field, which keeps the block shown. The
  // very first probe on a fresh install can race the ~60s demo seeding, so a
  // failed probe is retried a few times and NEVER hides the block on its own.
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const probe = async (): Promise<void> => {
      attempts += 1;
      try {
        const res = await fetch('/api/v1/auth/first-run', {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`first-run probe HTTP ${res.status}`);
        const status = (await res.json()) as FirstRunStatus;
        if (!cancelled) setDemoEnabled(status.demo_enabled !== false);
      } catch {
        // Transient failure (server still booting / seeding). Retry, but leave
        // the optimistic default in place so demo never vanishes on a hiccup.
        if (!cancelled && attempts < 6) {
          window.setTimeout(() => void probe(), 1500);
        }
      }
    };
    void probe();
    return () => {
      cancelled = true;
    };
  }, []);

  // Desktop auto-bootstrap. Runs once on mount. On ANY failure it silently
  // falls back to the normal login form (clears `bootstrapping`); it never
  // surfaces an error to the user because manual login is always a valid path.
  useEffect(() => {
    if (!bootstrapping) return;
    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch('/api/v1/auth/first-run', {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('first-run probe failed');
        const status = (await res.json()) as FirstRunStatus;

        const manual = sessionStorage.getItem('oe_manual_login');
        if (!shouldAttemptDesktopBootstrap(status, false, manual)) {
          throw new Error('bootstrap not applicable');
        }

        const bootRes = await fetch('/api/v1/auth/desktop-bootstrap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!bootRes.ok) throw new Error('desktop bootstrap failed');
        const data = (await bootRes.json()) as {
          access_token?: string;
          refresh_token?: string;
          user?: { email?: string };
        };
        if (!data.access_token || !data.refresh_token) {
          throw new Error('bootstrap response missing tokens');
        }
        if (cancelled) return;

        // Persist through the existing auth store path with remember=true so the
        // desktop owner stays signed in across launches.
        setTokens(data.access_token, data.refresh_token, true, data.user?.email);
        navigate(status.onboarding_completed === true ? '/dashboard' : '/onboarding', {
          replace: true,
        });
      } catch {
        // Silent fallback to the manual login form.
        if (!cancelled) setBootstrapping(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // Mount-only: the gate inputs are read fresh inside `run`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // OIDC configuration (fetched once on mount)
  const [oidcConfig, setOidcConfig] = useState<{
    enabled: boolean;
    issuer_url: string;
    authorization_endpoint?: string;
    client_id: string;
    scopes: string;
  } | null>(null);
  // Hide "Create account" when the server refuses self-registration. Any
  // failure keeps the link: the register page explains a refusal itself.
  const [registrationOpen, setRegistrationOpen] = useState(true);
  useEffect(() => {
    fetch('/api/v1/users/auth/registration/')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { open?: boolean } | null) => {
        if (d && d.open === false) setRegistrationOpen(false);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    fetch('/api/v1/users/auth/oidc/config/')
      .then((r) => r.json())
      .then((d) => setOidcConfig(d))
      .catch(() => setOidcConfig(null));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/users/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        // A proxy answering 502 for a backend that is down is a response, not
        // a network error, so the catch below never sees it. Without this the
        // outage lands on the credentials wording and the person is told the
        // one thing we know is untrue: nothing read their password. A 4xx
        // carrying no message we can read is that same outage told by whatever
        // stands in front of us, so the body decides alongside the status.
        const data = await res.json().catch(() => null);
        const parsed = extractErrorMessageFromBody(data);
        if (loginFailureKindFromResponse(res.status, parsed) === 'unavailable') {
          setError(
            t('auth.server_unavailable', {
              defaultValue:
                'The server did not answer, so your details were never checked. Try again in a moment.',
            }),
          );
          return;
        }
        setError(parsed || t('auth.invalid_credentials', 'Invalid email or password'));
        return;
      }
      const data = await res.json();
      saveRememberChoice(rememberMe);
      setTokens(data.access_token, data.refresh_token, rememberMe, email);
      navigate(nextPath, { replace: true });
    } catch {
      setError(t('auth.connection_error', 'Unable to connect to server. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Mirrors the seeded demo accounts in backend/app/main.py::_seed_demo_account:
  // every email here has to be one that seeder creates, and each name has to
  // match that account's full_name. The admin tile shows the role word instead
  // of the seeded person on purpose - that is what a first-time visitor scans
  // for. No password is listed on purpose either: the seeder generates a fresh
  // random one per install, so any literal printed here would be wrong on every
  // install. The tiles sign in through /auth/demo-login/ instead.
  const demoAccounts = [
    { email: 'demo@vastukar.com', name: 'Admin', role: t('auth.demo_role_admin', 'Administrator'), color: 'bg-blue-500', letter: 'A' },
    { email: 'manager@vastukar.com', name: 'Michael Carter', role: t('auth.demo_role_manager', 'Manager'), color: 'bg-[#7cd0ff]', letter: 'M' },
  ];

  const handleDemoLogin = async (demoEmail: string) => {
    setDemoLoading(demoEmail);
    setError('');
    setEmail('');
    setPassword('');
    try {
      // Password-less demo sign-in for the seeded showcase accounts. The
      // backend seeder generates a fresh random password per install (BUG-D01)
      // that the frontend cannot read, so this dedicated endpoint mints tokens
      // from the demo email alone. When demo seeding is disabled the server
      // returns 404 and we surface that message - we never fall back to
      // registering the account, so a demo click cannot create one in
      // production. The demo block is also hidden entirely in that config.
      const res = await fetch('/api/v1/users/auth/demo-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        // A real administrator exists, so the server no longer opens the
        // demo administrator without a password (app.core.demo_admin).
        if (data?.detail?.error === 'demo_admin_superseded') {
          setError(t('auth.demo_admin_superseded', 'This installation has an administrator. Please sign in with your own account.'));
          return;
        }
        const parsed = extractErrorMessageFromBody(data);
        setError(parsed || t('auth.demo_login_failed', 'Demo login failed. Please try again.'));
        return;
      }
      const data = await res.json();
      setTokens(data.access_token, data.refresh_token, false, demoEmail);
      navigate(nextPath, { replace: true });
    } catch {
      setError(t('auth.connection_error', 'Unable to connect to server. Please try again.'));
    } finally {
      setDemoLoading(null);
    }
  };

  /* Benefits list - reserved for future hero section layout
  const benefits = [
    { icon: HardDrive, color: 'text-emerald-500 bg-emerald-500/10', title: t('login.benefit.local', 'Your data stays on your computer'), desc: t('login.benefit.local_desc', 'No cloud. No third-party servers. Full control.') },
    { icon: ShieldCheck, color: 'text-blue-500 bg-blue-500/10', title: t('login.benefit.open_source', '100% open source'), desc: t('login.benefit.open_source_desc', 'Transparent code. No vendor lock-in.') },
    { icon: Globe2, color: 'text-violet-500 bg-violet-500/10', title: t('login.benefit.standards', 'International standards'), desc: t('login.benefit.standards_desc', '120,000+ cost items across 9 cost bases worldwide.') },
    { icon: Brain, color: 'text-amber-500 bg-amber-500/10', title: t('login.benefit.ai', 'AI-assisted estimation'), desc: t('login.benefit.ai_desc', 'Smart suggestions. You decide, AI assists.') },
    { icon: Zap, color: 'text-rose-500 bg-rose-500/10', title: t('login.benefit.allinone', 'BOQ + 4D + 5D + Tendering'), desc: t('login.benefit.allinone_desc', 'Full workflow in one tool.') },
    { icon: Users, color: 'text-cyan-500 bg-cyan-500/10', title: t('login.benefit.free', 'Free for everyone'), desc: t('login.benefit.free_desc', 'No fees. No limits. By estimators.') },
  ]; */

  // Desktop first-run: clean centered pending state while we silently sign in
  // to the local workspace. Falls back to the form on any failure (see effect).
  if (bootstrapping) {
    return (
      <div className="relative flex h-screen flex-col items-center justify-center bg-surface-secondary overflow-hidden">
        <AuthBackground />
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
          <Logo size="lg" animate />
          <svg
            className="h-7 w-7 animate-spin text-oe-blue"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm font-medium text-content-secondary">
            {t('auth.preparing_workspace', { defaultValue: 'Preparing your workspace...' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="oe-auth relative grid h-screen grid-cols-1 lg:grid-cols-2 bg-surface-secondary overflow-hidden">
      <AuthBackground />
      <ClassicAuthAside />

      {/* Cards use the shared surface tokens; no page-local glass, glow or drifting decoration. */}
      {/* Theme + Language - top right (enlarged for /login so discoverable). */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <ThemeSwitch />
        <div className="relative" ref={langRef}>
        <button
          type="button"
          onClick={() => setLangOpen(!langOpen)}
          aria-haspopup="listbox"
          aria-expanded={langOpen}
          aria-label={t('theme.language', { defaultValue: 'Language' })}
          className="flex items-center gap-2 rounded-lg border border-border-light bg-surface-elevated px-3 py-2 text-sm text-content-secondary transition-colors hover:bg-surface-secondary"
        >
          <Globe size={16} strokeWidth={1.5} className="text-content-tertiary" />
          <CountryFlag code={currentLang.country} size={20} />
          <span className="hidden sm:inline">{currentLang.name}</span>
          <ChevronDown size={16} strokeWidth={1.5} className={`text-content-tertiary transition-transform ${langOpen ? 'rotate-180' : ''}`} />
        </button>
        {langOpen && (
          <div role="listbox" aria-label={t('theme.language', { defaultValue: 'Language' })} className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-lg border border-border-light bg-surface-elevated py-1">
            {sortLanguagesByName(SUPPORTED_LANGUAGES).map((lang) => {
              const isActive = i18n.language === lang.code;
              const english = 'english' in lang ? (lang as { english?: string }).english : undefined;
              return (
                <button
                  key={lang.code}
                  onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${isActive ? 'bg-oe-blue/10 text-oe-blue font-medium' : 'text-content-primary hover:bg-surface-secondary'}`}
                >
                  <CountryFlag code={lang.country} size={18} />
                  <span className="truncate">
                    {lang.name}
                    {english && (
                      <span className="ml-1 text-2xs text-content-tertiary">({english})</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* ── Right column on lg+: marketing & benefits.
          Order swap (lg:order-2) puts the form on the left so it's the
          first thing the eye lands on - primary action priority. */}
      <div className="oe-auth-standard-only hidden lg:flex relative z-10 lg:order-2 flex-col justify-center pl-14 xl:pl-20 pr-12 xl:pr-16 py-6 overflow-hidden">
        {/* Calm tinted surface; the product data below carries the colour. */}
        <div className="absolute inset-0 -z-10 bg-oe-blue/[0.03] dark:bg-oe-blue/[0.06]" aria-hidden />

        <p className="mb-4 text-xs text-content-secondary">Open source · AGPL-3.0</p>

        {/* Marketing headline - kept as h2 because the form panel below has the
            authoritative h1 (visually hidden, always present in DOM). */}
        <h2 className="text-3xl font-medium text-content-primary leading-tight animate-stagger-in" style={{ animationDelay: '60ms' }}>
          {t('login.hero_tagline', { defaultValue: 'The first construction ERP designed from the ground up for the agentic era: a construction ERP for human teams and their AI agents.' })}
        </h2>

        {/* Subhead */}
        <p className="mt-4 text-base text-content-secondary leading-relaxed max-w-md animate-stagger-in" style={{ animationDelay: '120ms' }}>
          {t('login.hero_desc', { defaultValue: 'BOQ editing, 4D scheduling, 5D cost model, and tendering in one workspace.' })}
        </p>

        {/* Checkable capabilities - no unverified counts. */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-content-secondary animate-stagger-in" style={{ animationDelay: '180ms' }}>
          <span>{t('nav.boq', { defaultValue: 'Bill of Quantities' })}</span>
          <span aria-hidden className="text-content-quaternary">·</span>
          <span>{String(SUPPORTED_LANGUAGES.length)} {t('login.stat_langs', { defaultValue: 'languages' })}</span>
          <span aria-hidden className="text-content-quaternary">·</span>
          <span>{t('nav.schedule', { defaultValue: '4D Schedule' })}</span>
          <span aria-hidden className="text-content-quaternary">·</span>
          <span>{t('about.cap.costmodel', { defaultValue: '5D Cost Model' })}</span>
          <span aria-hidden className="text-content-quaternary">·</span>
          <span>{t('about.cap.tendering', { defaultValue: 'Tendering & Bids' })}</span>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-border-light animate-stagger-in" style={{ animationDelay: '220ms' }} />

        {/* Module honeycomb - proper pointy-top hex grid where every cell
            shares an edge with its neighbours. Layout is intentionally
            wider on the top/bottom rows (6 cells) than on the middle
            row (5 cells) so it reads as a real, naturally-extending
            honeycomb. Every cell is a real module - no decorative
            placeholders. Math:
              hex width   = 88px (left vertex to right vertex)
              hex height  = 100px (top vertex to bottom vertex)
              row stride  = 75px (3/4 of height - pointy-top step)
              column step = 88px (one hex width on the same row)
              alternating rows are offset by 44px (half a hex) - that's
              what makes the slanted edges meet exactly. */}
        <div className="relative mt-1 mr-auto h-[280px] w-[560px] max-w-full overflow-hidden animate-stagger-in" style={{ animationDelay: '260ms' }}>
          {([
            // Top row (y = -75) - 6 cells, offset by 44.
            { x: -220, y: -76, icon: ShieldCheck,     label: t('login.mod.local',     { defaultValue: 'Local' }) },
            { x: -132, y: -76, icon: Brain,           label: t('login.mod.ai',       { defaultValue: 'AI' }) },
            { x:  -44, y: -76, icon: Ruler,           label: t('login.mod.takeoff',  { defaultValue: 'Takeoff' }) },
            { x:   44, y: -76, icon: PenTool,         label: t('login.mod.cad',      { defaultValue: 'CAD' }) },
            { x:  132, y: -76, icon: Box,             label: t('login.mod.bim',      { defaultValue: 'BIM' }) },
            { x:  220, y: -76, icon: TrendingUp,      label: t('login.mod.cost5d',   { defaultValue: '5D' }) },
            // Mid row (y = 0) - 5 cells aligned on the same axis.
            { x: -176, y:  0,  icon: Database,        label: t('login.mod.costs',    { defaultValue: 'Costs' }) },
            { x:  -88, y:  0,  icon: FileSpreadsheet, label: t('common.boq') },
            { x:    0, y:  0,  icon: Layers,          label: t('login.mod.core',     { defaultValue: 'Workspace' }), accent: true },
            { x:   88, y:  0,  icon: CalendarClock,   label: t('login.mod.schedule', { defaultValue: 'Schedule' }) },
            { x:  176, y:  0,  icon: BarChart3,       label: t('login.mod.tender',   { defaultValue: 'Tendering' }) },
            // Bottom row (y = 75) - 6 cells, offset by 44.
            { x: -220, y:  76, icon: Zap,             label: t('login.mod.realtime', { defaultValue: 'Realtime' }) },
            { x: -132, y:  76, icon: Boxes,           label: t('login.mod.resources',{ defaultValue: 'Resources' }) },
            { x:  -44, y:  76, icon: ClipboardList,   label: t('login.mod.tasks',    { defaultValue: 'Tasks' }) },
            { x:   44, y:  76, icon: FileCheck,       label: t('login.mod.validate', { defaultValue: 'Validate' }) },
            { x:  132, y:  76, icon: FolderOpen,      label: t('login.mod.files',    { defaultValue: 'Files' }) },
            { x:  220, y:  76, icon: Upload,          label: t('login.mod.exports',  { defaultValue: 'Exports' }) },
          ] as const).map((cell, idx) => {
            const isAccent = 'accent' in cell && cell.accent === true;
            const Icon = cell.icon;
            return (
              // Outer wrapper handles ABSOLUTE POSITIONING only - its
              // transform is the hex-grid offset and must never be
              // overridden by an animation. Animations live on the inner
              // cell so they don't fight with our positioning maths.
              <div
                key={idx}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(calc(-50% + ${cell.x}px), calc(-50% + ${cell.y}px))`,
                }}
              >
                <div
                  className={`relative flex flex-col items-center justify-center w-24 aspect-square ${
                    isAccent
                      ? 'bg-oe-blue text-white'
                      : 'border border-border-light bg-surface-primary text-content-primary'
                  }`}
                  style={{
                    aspectRatio: HEX_PORTRAIT_ASPECT,
                    clipPath: HEX_PORTRAIT_CLIP,
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span className={`mt-1 text-xs font-medium ${isAccent ? 'text-white' : 'text-content-secondary'}`}>
                    {cell.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value props - restored as a clean two-up grid with refined
            typography (no boxed icon backgrounds, accent rule above each
            title) so the marketing column lands on something concrete
            after the honeycomb. */}
        <div className="mt-2 flex flex-wrap items-start gap-x-5 gap-y-2 animate-stagger-in" style={{ animationDelay: '320ms' }}>
          {[
            { icon: ShieldCheck, title: t('login.feat_local_title', { defaultValue: 'Your data, your machine' }), desc: t('login.feat_local', { defaultValue: 'Nothing leaves your computer. Full ownership,\nzero cloud dependency.' }) },
            { icon: Brain,       title: t('login.feat_ai_title',    { defaultValue: 'AI-assisted, human-confirmed' }), desc: t('login.feat_ai',    { defaultValue: 'Smart suggestions with confidence scores. You always have the final say.' }) },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="relative pl-4 max-w-[210px]">
                <span aria-hidden className="absolute left-0 top-1 h-4 w-px bg-oe-blue" />
                <div className="flex items-center gap-1.5">
                  <Icon size={16} strokeWidth={1.5} className="text-oe-blue" />
                  <span className="text-xs font-medium text-content-primary leading-tight">
                    {feat.title}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-content-tertiary whitespace-pre-line">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 space-y-1 animate-stagger-in" style={{ animationDelay: '380ms' }}>
          <div className="flex items-center gap-2 text-xs text-content-tertiary">
            <Github size={16} strokeWidth={1.5} aria-hidden />
            <a href="/api/source" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-content-secondary">AGPL-3.0</a>
            <span className="opacity-30">&middot;</span>
            <a href="https://vastukar.com" target="_blank" rel="noopener noreferrer" className="hover:text-content-tertiary transition-colors">vastukar.com</a>
          </div>
        </div>
      </div>

      {/* Center column removed - tags moved to left panel footer */}

      {/* ── Left column on lg+: logo + form (primary action). ── */}
      <div className="oe-auth-form-col relative flex items-center justify-center p-4 sm:p-6 z-10 lg:order-1 overflow-hidden">
        {/* Flat field so the form card reads without a glow or gradient. */}
        <div className="absolute inset-0 hidden lg:block bg-white dark:bg-[#070912]" aria-hidden />
        <div className="w-full max-w-[380px] relative z-10">
          {/* Logo - tenant white-label (logo / company name) when set via
              the in-app sidebar editor; otherwise the default brand. The
              small "by Vastukar" attribution stays visible in
              customised modes (AGPL-3.0 requirement). */}
          <div className="relative mb-5 flex flex-col items-center animate-stagger-in" style={{ animationDelay: '0ms' }}>
            {/* Brand + edit-pencil row - grouped together and visually
                centered in the form column (previously the pencil was
                pinned to the far right edge which made the brand block
                look off-centre relative to the form below). */}
            <div className="flex items-center gap-2">
              {brandCustomised ? (
                <div className="flex flex-col items-center">
                  {brandMode === 'logo' && brandLogo ? (
                    <img
                      src={brandLogo}
                      alt={brandName || 'Custom logo'}
                      className="block max-h-16 w-auto max-w-full object-contain"
                      draggable={false}
                    />
                  ) : (
                    <span
                      className="block max-w-full truncate text-center text-2xl font-medium text-content-primary leading-tight"
                      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                      title={brandName}
                    >
                      {brandName}
                    </span>
                  )}
                  {/* "by Vastukar" - subordinate attribution that
                      stays visible (AGPL-3.0). Mirrors CustomBranding.tsx. */}
                  <span
                    className="mt-2 block text-xs text-content-tertiary"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                  >
                    by{' '}
                    <span className="font-medium">Vastukar</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Logo size="md" />
                  <span
                    className="text-2xl font-medium text-content-primary whitespace-nowrap"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                  >
                    Vastukar
                  </span>
                </div>
              )}
              {/* White-label trigger - same editor as the in-app sidebar
                  brand control, available pre-auth so a tenant can put
                  their own logo on the sign-in screen. */}
              {showLogoEdit && (
              <button
                type="button"
                onClick={() => setBrandOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-light bg-surface-elevated text-content-tertiary transition-colors hover:bg-surface-secondary hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-blue/40"
                aria-label={t('login.brand_edit', { defaultValue: 'Customize logo' })}
                title={t('login.brand_edit', { defaultValue: 'Customize logo' })}
              >
                <Pencil size={16} strokeWidth={1.5} />
              </button>
              )}
            </div>
            <p className="mt-2 text-sm text-content-tertiary">
              {t('login.workspace_tagline', { defaultValue: 'Professional construction project workspace' })}
            </p>
          </div>

          {/* Form card - flat surface, hairline border, no glass or glow. */}
          <div className="relative rounded-2xl border border-border-light bg-surface-elevated px-6 py-5">
            {/* Visually hidden h1 for screen readers + a11y tools - visible text uses h2 below */}
            <h1 className="sr-only">{t('auth.login', 'Sign in')}</h1>
            <div className="animate-stagger-in" style={{ animationDelay: '200ms' }}>
              <h2 className="text-base font-semibold text-content-primary mb-0.5">{t('auth.login', 'Sign in')}</h2>
              <p className="text-xs text-content-secondary mb-4">{t('auth.login_subtitle', 'Enter your credentials to access your workspace')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3" aria-label={t('auth.login', 'Sign in')}>
              <div className="animate-stagger-in" style={{ animationDelay: '280ms' }}>
                <Input id="login-email" name="email" label={t('auth.email', 'Email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required aria-required="true" autoFocus icon={<Mail size={16} strokeWidth={1.5} />} />
              </div>

              <div className="flex flex-col gap-1 animate-stagger-in" style={{ animationDelay: '340ms' }}>
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-sm font-medium text-content-primary">{t('auth.password', 'Password')}</label>
                  <Link to="/forgot-password" className="text-2xs font-medium text-oe-blue hover:text-oe-blue-hover transition-colors">{t('auth.forgot_password', 'Forgot password?')}</Link>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-content-tertiary"><Lock size={16} strokeWidth={1.5} /></div>
                  <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password_placeholder', 'Enter your password')} autoComplete="current-password" required aria-required="true" minLength={8} className="h-9 w-full rounded-lg border border-border bg-surface-primary pl-9 pr-9 text-sm text-content-primary placeholder:text-content-tertiary transition-colors duration-fast ease-oe focus:outline-none focus:ring-2 focus:ring-oe-blue focus:border-transparent hover:border-content-tertiary" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('auth.hide_password', 'Hide password') : t('auth.show_password', 'Show password')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-content-tertiary hover:text-content-secondary transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <div className="animate-stagger-in" style={{ animationDelay: '380ms' }}>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-3.5 w-3.5 rounded border-border text-oe-blue focus:ring-oe-blue accent-oe-blue" />
                  <span className="text-xs text-content-secondary">{t('auth.remember_me', 'Remember me for 30 days')}</span>
                </label>
              </div>

              {error && (
                <div
                  data-testid="login-error"
                  className="flex items-start gap-2 rounded-lg bg-semantic-error-bg px-3 py-2 text-xs text-semantic-error animate-stagger-in"
                >
                  <span className="shrink-0 mt-0.5">!</span><span>{error}</span>
                </div>
              )}

              <div className="animate-stagger-in" style={{ animationDelay: '400ms' }}>
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">{t('auth.login', 'Sign in')}</Button>
              </div>
            </form>

            {/* OIDC / SSO login - shown when the server has OIDC enabled */}
            {oidcConfig?.enabled && (
              <div className="mt-3 animate-stagger-in" style={{ animationDelay: '440ms' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 border-t border-border-light" />
                  <span className="text-2xs text-content-tertiary">{t('auth.or', { defaultValue: 'or' })}</span>
                  <div className="flex-1 border-t border-border-light" />
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  icon={<ShieldCheck size={16} />}
                  onClick={async () => {
                    const { state, nonce, codeChallenge } = await beginOidcLogin();
                    const params = new URLSearchParams({
                      client_id: oidcConfig.client_id,
                      response_type: 'code',
                      scope: oidcConfig.scopes,
                      redirect_uri: `${window.location.origin}/auth/oidc/callback`,
                      state,
                      nonce,
                      code_challenge: codeChallenge,
                      code_challenge_method: 'S256',
                    });
                    const authorize = oidcConfig.authorization_endpoint
                      ?? `${oidcConfig.issuer_url.replace(/\/$/, '')}/protocol/openid-connect/auth`;
                    window.location.href = `${authorize}?${params}`;
                  }}
                >
                  {t('auth.sso_login', { defaultValue: 'Sign in with SSO' })}
                </Button>
              </div>
            )}

            {registrationOpen && (
              <div className="mt-4 border-t border-border-light pt-3.5 animate-stagger-in" style={{ animationDelay: '460ms' }}>
                <p className="text-center text-xs text-content-secondary">
                  {t('auth.no_account', "Don't have an account?")}{' '}
                  <Link to="/register" className="font-medium text-oe-blue hover:text-oe-blue-hover transition-colors">{t('auth.create_account', 'Create account')}</Link>
                </p>
              </div>
            )}
          </div>

          {/* Demo Access - shown by default. Hidden only when the server
              reports demo is off (SEED_DEMO=false, or an admin turned it off in
              Settings), which flips demoEnabled to false in the effect above. */}
          {demoEnabled && (
          <div className="relative mt-3 animate-stagger-in" style={{ animationDelay: '500ms' }}>
            <div className="login-glass-pro relative rounded-2xl overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-0 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)',
                }}
              />
              <div className="relative flex w-full items-center">
                <button
                  type="button"
                  onClick={() => setDemoOpen(!demoOpen)}
                  aria-expanded={demoOpen}
                  className="flex flex-1 items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-oe-blue hover:bg-oe-blue/[0.04] transition-colors"
                >
                  <Zap size={14} className="text-oe-blue" />
                  <span>{t('auth.try_demo', { defaultValue: 'Try demo (no signup)' })}</span>
                  <ChevronDown size={14} className={`text-oe-blue/70 transition-transform duration-200 ${demoOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {demoOpen && (
                <div className="border-t border-border-light/60 px-3 py-2.5 space-y-1.5 animate-stagger-in">
                  {demoAccounts.map((acct) => (
                    <button
                      key={acct.email}
                      type="button"
                      onClick={() => handleDemoLogin(acct.email)}
                      disabled={demoLoading !== null}
                      className="flex w-full items-center gap-3 rounded-xl border border-border-light/50 dark:border-white/10 bg-surface-secondary/50 dark:bg-white/[0.06] px-3.5 py-2.5 text-left transition-colors hover:border-oe-blue/40 hover:bg-oe-blue/[0.05] dark:hover:bg-oe-blue/[0.14] hover:shadow-sm disabled:opacity-50 group"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${acct.color} text-white text-sm font-medium shadow-sm`}>
                        {demoLoading === acct.email ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        ) : (
                          acct.letter
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-content-primary">{acct.name}</div>
                        <div className="text-[11px] text-content-tertiary dark:text-content-secondary truncate">{acct.email} · {acct.role}</div>
                      </div>
                      <ChevronDown size={15} className="text-content-quaternary -rotate-90 group-hover:text-oe-blue transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Info affordance - kept OUTSIDE the overflow-hidden card above so
                the hint popover is never clipped and always paints on top of the
                demo accounts and the links below. Hover reveals it; click pins it
                (touch / keyboard). Anchored to this relative wrapper at a fixed
                top offset so it stays on the header row whether the demo list is
                open or closed. */}
            <div className="group absolute right-2 top-2 z-40">
              <button
                type="button"
                aria-label={t('auth.demo_hint_aria', { defaultValue: 'About the demo sign-in block' })}
                onClick={() => setDemoHint((v) => !v)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-oe-blue/50 hover:text-oe-blue hover:bg-oe-blue/[0.08] transition-colors"
              >
                <Info size={14} />
              </button>
              <div
                role="tooltip"
                className={`pointer-events-none absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-surface-elevated backdrop-blur-md px-3.5 py-2.5 text-left text-xs leading-relaxed text-content-primary shadow-2xl transition-opacity duration-150 ${demoHint ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                {t('auth.demo_hint', {
                  defaultValue:
                    'Optional demo sign-in. It only appears while demo accounts are enabled, so an administrator can turn it off.',
                })}
              </div>
            </div>
          </div>
          )}

          <ClassicAuthFooter />
        </div>
      </div>

      {/* ── White-label branding editor (pre-auth) ── */}
      {brandOpen && <BrandingEditorModal onClose={() => setBrandOpen(false)} />}

      {/* ── About modal ── */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" onClick={() => setShowInfo(false)} />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-light bg-surface-elevated shadow-2xl">
            <button aria-label={t('common.close', { defaultValue: 'Close' })}
              onClick={() => setShowInfo(false)}
              className="sticky top-0 float-right m-3 p-1.5 rounded-lg text-content-tertiary hover:text-content-primary hover:bg-surface-secondary transition-colors z-10 bg-surface-elevated/80 backdrop-blur-sm"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-border-light clear-both">
              <LogoWithText size="sm" className="mb-3" />
              <h3 className="text-base font-medium text-content-primary mb-2">
                {t('about.title', 'Professional construction cost estimation - free and open source')}
              </h3>
              <p className="text-[13px] text-content-secondary leading-relaxed">
                {t('about.intro', 'Vastukar is a modern platform for construction cost management. It covers the full estimation workflow - from creating a bill of quantities to tendering and bid comparison. Designed for professionals worldwide, it supports international standards and works in 24 languages.')}
              </p>
              <p className="mt-2 text-[13px] text-content-secondary leading-relaxed">
                {t('about.intro2', 'Unlike traditional commercial solutions, Vastukar runs entirely on your computer. Your project data never leaves your machine - you have full ownership and control. The source code is open and auditable, so you always know exactly what the software does.')}
              </p>
            </div>

            {/* What you can do */}
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-content-primary mb-3">
                {t('about.capabilities_title', 'What you can do')}
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-500/10', title: t('about.cap.boq', 'Bill of Quantities'), desc: t('about.cap.boq_desc', 'Create detailed BOQ with hierarchical sections, positions, assemblies, markups (overhead, profit, VAT), and automatic totals. Works with regional classification systems or your own custom schema.') },
                  { icon: Database, color: 'text-blue-500 bg-blue-500/10', title: t('about.cap.costs', 'Cost Databases'), desc: t('about.cap.costs_desc', '55,000+ cost items across 48 regional databases worldwide. Add your own rates, import from Excel, or build a custom database from scratch.') },
                  { icon: CalendarClock, color: 'text-amber-500 bg-amber-500/10', title: t('about.cap.schedule', '4D Scheduling'), desc: t('about.cap.schedule_desc', 'Create project schedules with CPM critical path calculation, interactive Gantt charts, Monte Carlo risk analysis, resource assignment, and auto-generation of activities from your BOQ.') },
                  { icon: TrendingUp, color: 'text-violet-500 bg-violet-500/10', title: t('about.cap.costmodel', '5D Cost Model'), desc: t('about.cap.costmodel_desc', 'Track budgets over time with Earned Value Management (SPI, CPI), S-curve visualization, cash flow projections, cost snapshots, and what-if scenario modeling for informed decision-making.') },
                  { icon: Boxes, color: 'text-rose-500 bg-rose-500/10', title: t('about.cap.catalog', 'Resource Catalog'), desc: t('about.cap.catalog_desc', '7,000+ resources - materials, equipment, labor, operators, and utilities. Build reusable assemblies (composite rates) from catalog items and apply them directly to BOQ positions.') },
                  { icon: BarChart3, color: 'text-cyan-500 bg-cyan-500/10', title: t('about.cap.tendering', 'Tendering & Bids'), desc: t('about.cap.tendering_desc', 'Create tender packages with scope and positions, distribute to subcontractors, collect and compare bids side-by-side in a price mirror, and make award decisions based on data.') },
                  { icon: Upload, color: 'text-orange-500 bg-orange-500/10', title: t('about.cap.import', 'Import & Export'), desc: t('about.cap.import_desc', 'Full support for GAEB XML (X83), Excel, and CSV import/export. Generate professional PDF reports. Seamlessly integrate with your existing tools and workflows.') },
                  { icon: FileCheck, color: 'text-teal-500 bg-teal-500/10', title: t('about.cap.validation', 'Quality Validation'), desc: t('about.cap.validation_desc', 'Built-in quality engine automatically checks for missing quantities, zero prices, duplicate positions, classification compliance, and rate anomalies - with a traffic-light dashboard.') },
                ].map((cap, idx) => {
                  const Icon = cap.icon;
                  return (
                    <div key={idx} className="rounded-lg border border-border-light/60 bg-surface-secondary/50 px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${cap.color}`}>
                          <Icon size={13} />
                        </div>
                        <span className="text-xs font-semibold text-content-primary">{cap.title}</span>
                      </div>
                      <p className="text-2xs text-content-tertiary leading-relaxed pl-8">{cap.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Why open source */}
            <div className="px-6 py-4 border-t border-border-light">
              <h3 className="text-sm font-semibold text-content-primary mb-2">
                {t('about.why_title', 'Why open source matters')}
              </h3>
              <div className="space-y-2 text-[13px] text-content-secondary leading-relaxed">
                <p>{t('about.why_1', 'Construction cost data is one of the most valuable assets a company owns. With proprietary software, your data is often locked inside formats you cannot control. If the vendor raises prices, changes terms, or discontinues the product - you may lose access to years of work.')}</p>
                <p>{t('about.why_2', 'Vastukar takes a different approach. Your data is stored in open formats (SQLite, JSON, CSV) on your own hardware. You can export everything at any time. The source code is publicly auditable under AGPL-3.0, so there are no hidden data transfers, no telemetry, and no surprises.')}</p>
                <p>{t('about.why_3', 'The platform is modular - install only what you need. Community modules extend functionality without bloating the core. And because it runs locally, it works offline and performs fast even with large projects.')}</p>
              </div>
            </div>

            {/* Who is it for */}
            <div className="px-6 py-4 border-t border-border-light">
              <h3 className="text-sm font-semibold text-content-primary mb-2">
                {t('about.who_title', 'Who is it for')}
              </h3>
              <p className="text-[13px] text-content-secondary leading-relaxed mb-3">
                {t('about.who_desc', 'Vastukar is designed for anyone involved in construction cost management - whether you work on residential projects or large-scale infrastructure, in-house or as a consultant.')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  t('about.who.estimators', 'Cost estimators'),
                  t('about.who.qsurveyor', 'Quantity surveyors'),
                  t('about.who.pm', 'Project managers'),
                  t('about.who.contractors', 'General contractors'),
                  t('about.who.subs', 'Subcontractors'),
                  t('about.who.architects', 'Architects & engineers'),
                  t('about.who.developers', 'Real estate developers'),
                  t('about.who.public', 'Public sector & municipalities'),
                  t('about.who.students', 'Students & educators'),
                  t('about.who.freelancers', 'Freelance consultants'),
                ].map((role) => (
                  <span key={role} className="inline-flex items-center rounded-full bg-oe-blue/10 px-2.5 py-1 text-2xs font-medium text-oe-blue">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Key facts */}
            <div className="px-6 py-4 border-t border-border-light">
              <h3 className="text-sm font-semibold text-content-primary mb-3">
                {t('about.numbers_title', 'Platform in numbers')}
              </h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { value: '120,441', label: t('about.stat.costs', 'Cost items') },
                  { value: '48', label: t('about.stat.regions', 'Regional databases') },
                  { value: String(SUPPORTED_LANGUAGES.length), label: t('about.stat.languages', 'Languages') },
                  { value: '100%', label: t('about.stat.free', 'Free & open source') },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-surface-secondary/50 py-2.5">
                    <div className="text-lg font-medium text-oe-blue">{stat.value}</div>
                    <div className="text-2xs text-content-tertiary">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI note */}
            <div className="px-6 py-4 border-t border-border-light">
              <h3 className="text-sm font-semibold text-content-primary mb-2">
                {t('about.ai_title', 'About AI features')}
              </h3>
              <p className="text-[13px] text-content-secondary leading-relaxed">
                {t('about.ai_desc', 'Vastukar includes optional AI-powered tools - quick estimation from text descriptions, smart cost suggestions, and BOQ chat assistant. These features require an API key from a provider of your choice (Anthropic, OpenAI, Google). AI is always opt-in: it only activates when you configure it, and you decide what data to send. Without an API key, all other features work fully offline.')}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
              <div className="flex items-center gap-3 text-2xs text-content-quaternary">
                <a href="/api/source" target="_blank" rel="noopener noreferrer" className="hover:text-content-secondary transition-colors">AGPL-3.0</a>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowInfo(false)}>
                {t('about.close', 'Got it')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
