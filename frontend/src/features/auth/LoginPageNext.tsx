// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP​‌‍⁠​‌‍⁠​‌‍⁠​‌‍⁠
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
/**
 * Experimental login page — v3.
 *
 * Left half: aurora + cursor spotlight under a grid of module tiles
 * (mirrors the dashboard's module visualisation — same Lucide icons,
 * same colour language, same icon-on-coloured-square pattern).
 *
 * Right half: clean white form pane — solid background for max
 * readability. No rotating ring, no glass on the form itself.
 *
 * Mounted at /login-next so /login stays untouched while we iterate.
 */
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, Globe, ChevronDown, Zap,
  ArrowUpRight,
  Table2, Database, Layers, Box, Ruler, Sparkles,
  CalendarDays, ShieldCheck, BrainCircuit, Boxes,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Input, Logo, CountryFlag } from '@/shared/ui';
import { safeNextPath } from './nextPath';
import { readRememberChoice, saveRememberChoice, useAuthStore } from '@/stores/useAuthStore';
import { extractErrorMessageFromBody } from '@/shared/lib/api';
import { loginFailureKindFromResponse } from './loginError';
import { AuthBackground } from './AuthBackground';
import { SUPPORTED_LANGUAGES } from '@/app/i18n';
import { sortLanguagesByName } from '@/shared/lib/languageOrder';

interface ModuleTile {
  icon: LucideIcon;
  label: string;
  stat: string;
  hint: string;
  tone: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'teal';
}

const TONE_STYLES: Record<ModuleTile['tone'], { bg: string; fg: string; ring: string }> = {
  blue:    { bg: 'bg-[#007AFF]/12',  fg: 'text-[#007AFF]',  ring: 'ring-[#007AFF]/15' },
  violet:  { bg: 'bg-violet-500/10', fg: 'text-violet-600', ring: 'ring-violet-500/15' },
  emerald: { bg: 'bg-emerald-500/10',fg: 'text-emerald-600',ring: 'ring-emerald-500/15' },
  amber:   { bg: 'bg-amber-500/10',  fg: 'text-amber-600',  ring: 'ring-amber-500/15' },
  rose:    { bg: 'bg-rose-500/10',   fg: 'text-rose-600',   ring: 'ring-rose-500/15' },
  cyan:    { bg: 'bg-cyan-500/10',   fg: 'text-cyan-600',   ring: 'ring-cyan-500/15' },
  indigo:  { bg: 'bg-indigo-500/10', fg: 'text-indigo-600', ring: 'ring-indigo-500/15' },
  teal:    { bg: 'bg-teal-500/10',   fg: 'text-teal-600',   ring: 'ring-teal-500/15' },
};

export function LoginPageNext() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const setTokens = useAuthStore((s) => s.setTokens);
  // Routed at /login-next, so this is a second front door and has to validate
  // the redirect exactly as /login does. It used to carry its own weaker copy
  // of the check, which accepted auth routes and let a backslash authority
  // through. Both doors now share one helper so they cannot drift again.
  const nextPath = safeNextPath(location.search);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Checked unless the user unchecked it last time they signed in here.
  const [rememberMe, setRememberMe] = useState(readRememberChoice);
  const [langOpen, setLangOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(true);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  // null = not probed yet; the demo block renders only once the server
  // confirms demo accounts are available (see the first-run effect below).
  const [demoEnabled, setDemoEnabled] = useState<boolean | null>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0]!;

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, []);

  // Probe whether this server offers demo accounts (public, no auth). The
  // demo block is shown only when the server confirms demo is enabled, so
  // production installs (SEED_DEMO=false) never present a demo sign-in - and a
  // click can never silently create a demo account. Older servers omit the
  // field, which we treat as enabled. A probe failure leaves the block hidden.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/v1/auth/first-run', {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { demo_enabled?: boolean };
        if (!cancelled) setDemoEnabled(data.demo_enabled !== false);
      } catch {
        /* leave demoEnabled null -> demo block stays hidden */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cursor spotlight — track mouse and write to CSS custom properties on
  // the hero element. The gradient lookup happens inside CSS, so React
  // never re-renders for mouse moves.
  const onHeroMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
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
        // Same reasoning as the other sign-in screen: a 5xx, and equally a 4xx
        // with no message in it, means nothing read the password, so the
        // credentials wording would be a claim we cannot support.
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
    { email: 'manager@vastukar.com', name: 'Michael Carter', role: t('auth.demo_role_manager', 'Manager'), color: 'bg-amber-500', letter: 'M' },
  ];

  const handleDemoLogin = async (demoEmail: string) => {
    setDemoLoading(demoEmail);
    setError('');
    setEmail('');
    setPassword('');
    try {
      // Password-less demo sign-in for the seeded showcase accounts only.
      // When demo seeding is disabled the server returns 404 and we surface
      // the message - we never fall back to registering the account, so a
      // demo click cannot create one in production. The demo block is also
      // hidden entirely in that configuration.
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

  // Module tiles — first-run / empty-state view. New users haven't
  // imported anything yet, so each tile shows an em-dash for the stat
  // and an onboarding cue for the hint instead of fake metrics.
  const modules: ModuleTile[] = [
    { icon: Table2,       label: t('nav.boq', 'Bill of Quantities'), stat: '—', hint: t('login.zero_boq', 'create first BOQ'),       tone: 'blue' },
    { icon: Database,     label: t('nav.costs', 'Cost Database'),    stat: '—', hint: t('login.zero_costs', 'import to start'),       tone: 'cyan' },
    { icon: Layers,       label: t('nav.assemblies', 'Assemblies'),  stat: '—', hint: t('login.zero_assemblies', 'no recipes yet'),    tone: 'violet' },
    { icon: Boxes,        label: t('nav.catalog', 'Catalog'),        stat: '—', hint: t('login.zero_catalog', 'add resources'),       tone: 'indigo' },
    { icon: Ruler,        label: t('nav.takeoff', 'PDF Takeoff'),    stat: '—', hint: t('login.zero_takeoff', 'upload a drawing'),    tone: 'amber' },
    { icon: Box,          label: t('nav.bim', 'BIM Viewer'),         stat: '—', hint: t('login.zero_bim', 'no models yet'),           tone: 'teal' },
    { icon: Sparkles,     label: t('nav.ai_estimate', 'AI Estimate'), stat: t('login.zero_ai', 'Ready'), hint: t('login.zero_ai_hint', 'BETA'), tone: 'rose' },
    { icon: BrainCircuit, label: t('nav.intelligence', 'Project IQ'), stat: '—', hint: t('login.zero_iq', 'awaiting data'),            tone: 'violet' },
    { icon: CalendarDays, label: t('nav.schedule', '4D Schedule'),    stat: '—', hint: t('login.zero_schedule', 'no tasks'),           tone: 'cyan' },
    { icon: ShieldCheck,  label: t('nav.validation', 'Validation'),   stat: '—', hint: t('login.zero_validation', 'run checks'),      tone: 'emerald' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-surface-secondary">
      {/* Original BIM cost-table background — sits at the bottom layer
          and shows through the aurora at low opacity on the left only. */}
      <AuthBackground />

      {/* Page-scoped CSS — keeps this experimental page self-contained. */}
      <style>{`
        /* No decorative loops on this screen. */
        /* Calm neutral surface. The world shows in the content, not the chrome. */
        .oe-hero { background: var(--oe-bg-page); }
        .dark .oe-hero { background: var(--oe-bg); }

        /* Glass module tiles. */
        .oe-tile {
          background: var(--oe-bg-elevated);
          border: 1px solid var(--oe-border-light);
          border-radius: var(--oe-radius-md);
          transition: border-color 120ms ease, background-color 120ms ease;
        }
        .dark .oe-tile {
          background: var(--oe-bg-elevated);
          border-color: var(--oe-border);
        }
        .oe-tile:hover { border-color: var(--oe-border); }

        /* Lite glass for demo accounts (right side stays solid white,
           but the demo tiles need a touch of glass over the white). */
        .oe-glass-lite {
          background: var(--oe-bg-elevated);
          border: 1px solid var(--oe-border-light);
        }
        .dark .oe-glass-lite {
          background: var(--oe-bg-elevated);
          border-color: var(--oe-border);
        }

        /* Animated spectrum bar - sky-only palette. */
        .oe-spec-bar {
          background: var(--oe-blue);
        }

        /* Module tiles stay still. */
        .oe-font-display {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          font-feature-settings: 'cv11', 'ss01', 'ss03';
          font-variant-numeric: tabular-nums;
        }
        .oe-font-serif {
          font-family: 'Instrument Serif', 'Iowan Old Style', 'Apple Garamond', Georgia, serif;
          font-feature-settings: 'liga', 'dlig';
          letter-spacing: -0.01em;
        }
      `}</style>

      {/* Preview badge — top-left so users know this is /login-next. */}
      <div className="absolute top-4 left-4 z-30">
        <span className="inline-flex items-center gap-2 rounded-md border border-border-light bg-surface-elevated px-3 py-1.5 text-xs text-content-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Preview · /login-next
        </span>
      </div>

      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-30" ref={langRef}>
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="flex items-center gap-2 rounded-xl border border-border-light bg-surface-primary px-3.5 py-2.5 text-sm font-medium text-content-secondary hover:bg-surface-secondary hover:border-oe-blue/30 transition-colors shadow-sm"
        >
          <Globe size={16} className="text-content-tertiary" />
          <CountryFlag code={currentLang.country} size={18} />
          <span className="hidden sm:inline">{currentLang.name}</span>
          <ChevronDown size={16} className={`text-content-tertiary transition-transform ${langOpen ? 'rotate-180' : ''}`} />
        </button>
        {langOpen && (
          <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-xl border border-border-light bg-surface-elevated shadow-xl py-1 animate-stagger-in">
            {sortLanguagesByName(SUPPORTED_LANGUAGES).map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${isActive ? 'bg-oe-blue/10 text-oe-blue font-medium' : 'text-content-primary hover:bg-surface-secondary'}`}
                >
                  <CountryFlag code={lang.country} size={16} />
                  <span className="truncate">{lang.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* ── LEFT: hero + module tiles grid ──────────────────────────── */}
        <div
          ref={heroRef}
          onMouseMove={onHeroMouseMove}
          className="oe-hero relative hidden lg:flex flex-col justify-center overflow-hidden px-12 xl:px-20 py-14"
        >
          {/* Eyebrow */}
          <div className="relative mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-border-light bg-surface-elevated px-3 py-1.5 text-xs text-content-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{t('login.welcome_eyebrow', 'First-time setup')}</span>
          </div>

          {/* Headline */}
          <h1 className="relative max-w-[640px] text-[44px] xl:text-[52px] leading-[1.08] font-medium text-content-primary dark:text-white">
            {t('login.welcome_h_a', 'A clean slate,')}{' '}
            <span>{t('login.welcome_h_b', 'ready to build.')}</span>
          </h1>

          <p className="oe-font-display relative mt-5 max-w-[480px] text-[15px] leading-[1.6] text-content-secondary dark:text-white/65">
            {t('login.welcome_sub_modules', 'Sign in to unlock every module - your workspace is empty until you import or create.')}
          </p>

          {/* Module tiles grid — same icon language as the dashboard
              and sidebar. Five columns at xl, four at lg. */}
          <div className="relative mt-9 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-3 max-w-[680px]">
            {modules.map((m, i) => {
              const tone = TONE_STYLES[m.tone];
              const Icon = m.icon;
              const floatClass = i % 3 === 0 ? 'oe-tile-float-a' : i % 3 === 1 ? 'oe-tile-float-b' : '';
              return (
                <div
                  key={m.label}
                  className={`oe-tile oe-font-display ${floatClass} rounded-2xl p-3.5 animate-stagger-in`}
                  style={{ animationDelay: `${80 + i * 40}ms` }}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${tone.bg} ${tone.fg} ${tone.ring}`}>
                    <Icon size={16} strokeWidth={1.8} />
                  </div>
                  <div className="mt-2.5 text-[12px] font-semibold leading-tight text-content-primary dark:text-white">
                    {m.label}
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className={`text-lg font-medium leading-none ${m.stat === '—' ? 'text-content-quaternary/60' : 'text-content-primary dark:text-white'}`}>
                      {m.stat}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.08em] font-medium text-content-tertiary">
                      {m.hint}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="oe-font-display relative mt-7 flex items-center gap-3 text-[11px] font-medium text-content-tertiary">
            <div className="oe-spec-bar h-[2px] w-12 rounded-full" />
            <span>{t('login.workspace_status_first', 'Empty workspace - sign in to set up your first project')}</span>
          </div>

          {/* Copyright — left-bottom, sits below the hero content. */}
          <div className="relative mt-auto pt-10 text-[11px] text-content-tertiary/80 dark:text-white/40">
            © 2026{' '}
            <a
              href="https://www.linkedin.com/in/boikoartem/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-content-secondary hover:text-oe-blue transition-colors dark:text-white/70 dark:hover:text-oe-blue"
            >
              Artem Boiko
            </a>{' '}
            · Vastukar
          </div>
        </div>

        {/* ── RIGHT: clean white form pane ─────────────────────────────── */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-10 relative z-10">
          <div className="oe-form-pane w-full max-w-[420px] rounded-[24px]">
            <div className="rounded-[24px] p-7 sm:p-9">
              {/* Mobile-only logo */}
              <div className="lg:hidden mb-6 flex flex-col items-center">
                <Logo size="md" animate />
                <span
                  className="mt-2.5 text-xl font-medium text-content-primary dark:text-white"
                  style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  Vastukar
                </span>
              </div>

              {/* Brand row (desktop) */}
              <div className="hidden lg:flex items-center gap-2.5 mb-7">
                <Logo size="sm" animate />
                <span
                  className="text-[15px] font-medium text-content-primary dark:text-white"
                  style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  Vastukar
                </span>
              </div>

              {/* Headline */}
              <div className="animate-stagger-in" style={{ animationDelay: '60ms' }}>
                <h2 className="text-2xl font-medium text-content-primary dark:text-white">
                  {t('auth.welcome_back', 'Welcome back')}
                </h2>
                <p className="oe-font-display mt-1.5 text-sm text-content-secondary dark:text-white/60">
                  {t('auth.login_subtitle', 'Sign in to your workspace')}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-3.5 animate-stagger-in"
                style={{ animationDelay: '160ms' }}
                aria-label={t('auth.login', 'Sign in')}
              >
                <Input
                  id="login-email-next"
                  name="email"
                  label={t('auth.email', 'Email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required aria-required="true"
                  autoFocus
                  icon={<Mail size={15} />}
                />

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password-next" className="text-sm font-medium text-content-primary dark:text-white">
                      {t('auth.password', 'Password')}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-2xs font-medium text-oe-blue hover:text-oe-blue-hover transition-colors"
                    >
                      {t('auth.forgot_password', 'Forgot password?')}
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-content-tertiary">
                      <Lock size={15} />
                    </div>
                    <input
                      id="login-password-next"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.password_placeholder', 'Enter your password')}
                      autoComplete="current-password"
                      required aria-required="true"
                      minLength={8}
                      className="h-9 w-full rounded-lg border border-border bg-surface-primary pl-9 pr-9 text-sm text-content-primary placeholder:text-content-tertiary transition-colors duration-fast ease-oe focus:outline-none focus:ring-2 focus:ring-oe-blue focus:border-transparent hover:border-content-tertiary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t('auth.hide_password', 'Hide password') : t('auth.show_password', 'Show password')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-content-tertiary hover:text-content-secondary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border text-oe-blue focus:ring-oe-blue accent-oe-blue"
                  />
                  <span className="text-xs text-content-secondary dark:text-white/60">
                    {t('auth.remember_me', 'Remember me for 30 days')}
                  </span>
                </label>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-semantic-error-bg px-3 py-2 text-xs text-semantic-error animate-stagger-in">
                    <span className="shrink-0 mt-0.5">!</span>
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  {t('auth.login', 'Sign in')}
                </Button>
              </form>

              {/* Demo accounts - shown only when the server confirms demo
                  accounts exist (SEED_DEMO on). Production installs hide it. */}
              {demoEnabled === true && (
              <div className="mt-6 animate-stagger-in" style={{ animationDelay: '260ms' }}>
                <button
                  type="button"
                  onClick={() => setDemoOpen(!demoOpen)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-light bg-surface-primary px-4 py-2.5 text-sm text-content-secondary hover:text-oe-blue hover:border-oe-blue/40 transition-colors"
                >
                  <Zap size={14} className="text-oe-blue" />
                  <span className="font-semibold">{t('auth.demo_access', 'Demo Access')}</span>
                  <ChevronDown
                    size={14}
                    className={`text-content-tertiary transition-transform duration-200 ${demoOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {demoOpen && (
                  <div className="mt-2 space-y-1.5 animate-stagger-in">
                    {demoAccounts.map((acct) => (
                      <button
                        key={acct.email}
                        type="button"
                        onClick={() => handleDemoLogin(acct.email)}
                        disabled={demoLoading !== null}
                        className="oe-glass-lite group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors hover:border-oe-blue/30 disabled:opacity-50"
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${acct.color} text-white text-sm font-medium shadow-sm`}>
                          {demoLoading === acct.email ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            acct.letter
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-content-primary dark:text-white">{acct.name}</div>
                          <div className="text-[11px] text-content-tertiary truncate">{acct.email} · {acct.role}</div>
                        </div>
                        <ArrowUpRight size={15} className="text-content-quaternary group-hover:text-oe-blue transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              )}

              {/* Footer */}
              <div className="mt-7 animate-stagger-in" style={{ animationDelay: '340ms' }}>
                <p className="text-center text-xs text-content-secondary dark:text-white/60">
                  {t('auth.no_account', "Don't have an account?")}{' '}
                  <Link
                    to="/register"
                    className="font-medium text-oe-blue hover:text-oe-blue-hover transition-colors"
                  >
                    {t('auth.create_account', 'Create account')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
