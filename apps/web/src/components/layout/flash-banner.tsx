'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/accessibility-context';

interface FlashInfo {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  link?: string;
}

interface FlashBannerProps {
  items: FlashInfo[];
}

interface FlashMarqueeDecisionInput {
  itemCount: number;
  contentWidth: number;
  viewportWidth: number;
  reducedMotion: boolean;
}

const typeConfig = {
  info: {
    icon: Info,
    className: 'bg-villiers-blue text-white',
    borderColor: 'border-villiers-blue-light',
    iconAnimation: {},
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-villiers-gold text-villiers-blue',
    borderColor: 'border-villiers-gold-soft',
    iconAnimation: {
      rotate: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 },
    },
  },
  urgent: {
    icon: AlertCircle,
    className: 'bg-destructive text-destructive-foreground',
    borderColor: 'border-destructive/50',
    iconAnimation: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.8, repeat: Infinity },
    },
  },
};

function normalizeMessage(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function sanitizeItems(items: FlashInfo[]): FlashInfo[] {
  return items
    .map((item) => {
      const message = normalizeMessage(item.message);
      if (!message) return null;
      return {
        ...item,
        message,
      };
    })
    .filter((item): item is FlashInfo => item !== null);
}

export function shouldUseFlashMarquee({
  itemCount,
  contentWidth,
  viewportWidth,
  reducedMotion,
}: FlashMarqueeDecisionInput): boolean {
  if (itemCount === 0 || reducedMotion) return false;
  return contentWidth > viewportWidth + 1;
}

function FlashSequence({
  items,
  ariaHidden = false,
  className,
}: {
  items: FlashInfo[];
  ariaHidden?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center whitespace-nowrap', className)} aria-hidden={ariaHidden}>
      {items.map((item, index) => (
        <React.Fragment key={`${item.id}-${index}`}>
          <FlashMessage item={item} />
          {index < items.length - 1 && <span className="mx-3 shrink-0 opacity-40 text-[10px]">•</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export function FlashBanner({ items }: FlashBannerProps) {
  const prefersReducedMotion = useReducedMotion();
  const { reducedMotion: userReducedMotion } = useAccessibility();
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false);
  const [contentWidth, setContentWidth] = React.useState(0);
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLDivElement>(null);
  const reducedMotion = prefersReducedMotion || userReducedMotion;

  const visibleItems = React.useMemo(() => sanitizeItems(items), [items]);

  const measureOverflow = React.useCallback(() => {
    const viewportEl = viewportRef.current;
    const measureEl = measureRef.current;

    if (!viewportEl || !measureEl) return;

    const nextContentWidth = measureEl.scrollWidth;
    const nextViewportWidth = viewportEl.clientWidth;
    setContentWidth((current) => (Math.abs(current - nextContentWidth) > 0.5 ? nextContentWidth : current));
    setViewportWidth((current) => (Math.abs(current - nextViewportWidth) > 0.5 ? nextViewportWidth : current));
  }, []);

  React.useEffect(() => {
    if (visibleItems.length === 0) return;

    let frameId: number | null = null;

    const scheduleMeasure = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(() => {
        measureOverflow();
      });
    };

    scheduleMeasure();

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleMeasure) : null;
    if (resizeObserver) {
      if (viewportRef.current) resizeObserver.observe(viewportRef.current);
      if (measureRef.current) resizeObserver.observe(measureRef.current);
    }

    window.addEventListener('resize', scheduleMeasure);

    const fontSet = document.fonts;
    const onFontLoadingDone = () => scheduleMeasure();

    if (typeof fontSet.addEventListener === 'function') {
      fontSet.addEventListener('loadingdone', onFontLoadingDone);
    }

    void fontSet.ready.then(() => {
      scheduleMeasure();
    });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      if (typeof fontSet.removeEventListener === 'function') {
        fontSet.removeEventListener('loadingdone', onFontLoadingDone);
      }
    };
  }, [measureOverflow, visibleItems]);

  React.useEffect(() => {
    if (visibleItems.length > 0) {
      setIsDismissed(false);
      setIsHidden(false);
    }
  }, [visibleItems.length]);

  if (visibleItems.length === 0 || isHidden) return null;

  const activeType = visibleItems.some((item) => item.type === 'urgent')
    ? 'urgent'
    : visibleItems.some((item) => item.type === 'warning')
      ? 'warning'
      : 'info';

  const shouldMarquee = shouldUseFlashMarquee({
    itemCount: visibleItems.length,
    contentWidth,
    viewportWidth,
    reducedMotion,
  });
  const marqueeGap = 24;
  const marqueeShift = contentWidth + marqueeGap;
  const marqueeDuration = Math.max(18, Math.min(52, marqueeShift / 68));

  return (
    <motion.div
      initial={false}
      animate={isDismissed ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }}
      onAnimationComplete={() => {
        if (isDismissed) {
          setIsHidden(true);
        }
      }}
      transition={{ duration: reducedMotion ? 0.01 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group/flash relative overflow-hidden border-b-2 border-dashed',
        typeConfig[activeType].className,
        typeConfig[activeType].borderColor,
      )}
    >
      <div className="container flex items-start gap-3 py-2.5 sm:py-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <motion.div
            animate={reducedMotion ? {} : typeConfig[activeType].iconAnimation}
            className="mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white/10"
          >
            {React.createElement(typeConfig[activeType].icon, { className: 'h-3.5 w-3.5' })}
          </motion.div>

          <div className="relative min-w-0 flex-1" role="status" aria-live="polite" aria-atomic="true">
            <div ref={measureRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 -z-10 opacity-0">
              <FlashSequence items={visibleItems} />
            </div>

            <div ref={viewportRef} className={cn('min-w-0', shouldMarquee ? 'overflow-hidden' : '')}>
              {shouldMarquee ? (
                <div
                  className="flash-marquee-track inline-flex min-w-max items-center gap-6 text-sm leading-relaxed group-hover/flash:[animation-play-state:paused] group-focus-within/flash:[animation-play-state:paused]"
                  style={{
                    '--marquee-duration': `${marqueeDuration}s`,
                    '--flash-marquee-shift': `${marqueeShift}px`,
                  } as React.CSSProperties}
                >
                  <FlashSequence items={visibleItems} />
                  <FlashSequence items={visibleItems} ariaHidden />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-y-1 text-sm leading-relaxed">
                  {visibleItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <FlashMessage item={item} />
                      {index < visibleItems.length - 1 && <span className="mx-3 shrink-0 opacity-40 text-[10px]">•</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <motion.button
          onClick={() => setIsDismissed(true)}
          className="shrink-0 mt-0.5 rounded-full p-2 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-colors"
          aria-label="Fermer le bandeau d'information"
          whileHover={reducedMotion ? undefined : { scale: 1.06 }}
          whileTap={reducedMotion ? undefined : { scale: 0.94 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>

      {activeType === 'urgent' && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-white/30"
          animate={reducedMotion ? { opacity: 0.45 } : { opacity: [0.3, 1, 0.3] }}
          transition={reducedMotion ? { duration: 0.01 } : { duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

function FlashMessage({ item }: { item: FlashInfo }) {
  const content = (
    <span className="inline-flex min-w-max items-center gap-2 whitespace-nowrap">
      <span className="text-[11px] opacity-60">
        [{item.type === 'urgent' ? 'URGENT' : item.type === 'warning' ? 'ATTENTION' : 'INFO'}]
      </span>
      <span className="font-medium">{item.message}</span>
    </span>
  );

  if (item.link) {
    return (
      <Link href={item.link} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 hover:underline underline-offset-4">
        {content}
      </Link>
    );
  }

  return content;
}
