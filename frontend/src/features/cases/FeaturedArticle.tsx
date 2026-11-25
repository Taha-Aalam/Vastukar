// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP​‌‍⁠​‌‍⁠​‌‍⁠​‌‍⁠
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
//
// The long-form article on the uberization of construction, featured at the
// top of the Cases hub. It used to be a small card at the foot of the sidebar;
// it sits here now because it is reading about why the cases exist, next to
// the cases themselves, rather than one more item in the menu.
//
// The cover is the article's own social image on our site. When it cannot load
// (an offline desktop install, a blocked host) the frame falls back to a drawn
// panel, so the card never shows a broken image.

import { useTranslation } from 'react-i18next';
import { Newspaper } from 'lucide-react';

export function FeaturedArticle() {
  const { t } = useTranslation();
  const title = t('sidebar.video_news.title', { defaultValue: 'Uberization of Construction' });
  const subtitle = t('sidebar.video_news.subtitle', {
    defaultValue: 'Open data, transparency, and the idea behind the platform',
  });
  const eyebrow = t('cases.featured_article.eyebrow', { defaultValue: 'Featured article' });
  const label = t('cases.featured_article.label', {
    defaultValue: 'Featured article: {{title}}.',
    title,
  });

  return (
    <div
      data-testid="cases-featured-article"
      aria-label={label}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border-light bg-surface-elevated shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-oe-blue dark:ring-white/5 sm:flex-row"
    >
      <div className="relative aspect-[1200/630] w-full shrink-0 overflow-hidden bg-gradient-to-br from-oe-blue/25 via-oe-blue/10 to-sky-400/10 sm:w-64 md:w-80">
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <div className="absolute -left-6 -top-8 h-32 w-32 rounded-full bg-oe-blue/20 blur-2xl" />
          <div className="absolute -bottom-10 right-0 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-primary/80 text-oe-blue shadow-sm ring-1 ring-oe-blue/20 dark:text-sky-300">
            <Newspaper size={26} strokeWidth={1.8} />
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4 sm:p-5">
        <span className="inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-oe-blue dark:text-sky-300">
          <Newspaper size={12} aria-hidden="true" />
          {eyebrow}
        </span>
        <span className="text-lg font-semibold leading-snug tracking-tight text-content-primary">{title}</span>
        <span className="text-sm leading-relaxed text-content-secondary">{subtitle}</span>
      </div>
    </div>
  );
}
