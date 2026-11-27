// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
import clsx from 'clsx';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

/* Icon sizes — compact so the text dominates */
const sizeMap = {
  xs: 'h-5 w-5',
  sm: 'h-6 w-6',
  md: 'h-7 w-7',
  lg: 'h-10 w-10',
  xl: 'h-14 w-14',
};

/**
 * Brand mark — three ascending bars in front of a building, cut as one
 * flat glyph. Solid brand blue, no gradient, no gloss, no glow. The mark
 * is the only decorative colour in the chrome; everything else is neutral.
 *
 * `animate` keeps its existing API and plays one short entrance, never a loop.
 */
export function Logo({ size = 'md', animate = false, className }: LogoProps) {
  const isSmall = size === 'xs' || size === 'sm';

  return (
    <div
      className={clsx(sizeMap[size], 'relative shrink-0', animate && 'animate-fade-in', className)}
    >
      <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        {/* Flat tile. Nested radii add up: outer 96, inner 8. */}
        <rect x="32" y="32" width="448" height="448" rx="96" fill="var(--oe-blue)" />

        {/* Three ascending bars */}
        <rect x="102" y="296" width="42" height="114" rx="8" fill="#fff" opacity=".88" />
        <rect x="162" y="233" width="42" height="177" rx="8" fill="#fff" />
        <rect x="222" y="176" width="42" height="234" rx="8" fill="#fff" opacity=".88" />

        {/* Building body */}
        <rect x="282" y="150" width="128" height="260" rx="8" fill="#fff" />

        {/* Windows + door — only shown at medium+ sizes */}
        {!isSmall && (
          <g fill="var(--oe-blue)">
            <rect x="304" y="182" width="26" height="28" rx="4" opacity=".45" />
            <rect x="362" y="182" width="26" height="28" rx="4" opacity=".45" />
            <rect x="304" y="226" width="26" height="28" rx="4" opacity=".45" />
            <rect x="362" y="226" width="26" height="28" rx="4" opacity=".45" />
            <rect x="304" y="272" width="26" height="28" rx="4" opacity=".38" />
            <rect x="362" y="272" width="26" height="28" rx="4" opacity=".38" />
            <rect x="329" y="328" width="34" height="82" rx="4" opacity=".55" />
          </g>
        )}
      </svg>
    </div>
  );
}

/* ── LogoWithText ──────────────────────────────────────────────────────── */

interface LogoWithTextProps extends LogoProps {
  showVersion?: boolean;
}

/* Text sizes — larger than icon to make the name prominent */
const textSizeMap = {
  xs: 'text-[15px] leading-none',
  sm: 'text-[16px] leading-none',
  md: 'text-[17px] leading-none',
  lg: 'text-xl leading-none',
  xl: 'text-2xl leading-none',
};

const gapSizeMap = {
  xs: 'gap-1.5',
  sm: 'gap-2',
  md: 'gap-2',
  lg: 'gap-2.5',
  xl: 'gap-3',
};

/** Logo + brand name in the same interface family as the rest of the app. */
export function LogoWithText({ size = 'md', animate, className }: LogoWithTextProps) {
  return (
    <div className={clsx('flex items-center', gapSizeMap[size], className)}>
      <Logo size={size} animate={animate} />
      <span
        className={clsx(
          textSizeMap[size],
          'font-medium text-content-primary whitespace-nowrap tracking-tight',
        )}
      >
        Vastukar
      </span>
    </div>
  );
}
