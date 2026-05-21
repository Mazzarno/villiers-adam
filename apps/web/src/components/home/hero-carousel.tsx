'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HERO_SLIDES } from '@/components/home/hero-slides';
import { useAccessibility } from '@/contexts/accessibility-context';

const AUTOPLAY_DELAY_MS = 7000;
const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HERO_IMAGE_POSITION_CLASSES = [
  'object-[58%_50%] sm:object-[56%_48%] md:object-[54%_44%] lg:object-[52%_42%]',
  'object-[44%_55%] sm:object-[46%_52%] md:object-[50%_48%] lg:object-[52%_46%]',
  'object-[64%_49%] sm:object-[60%_47%] md:object-[56%_45%] lg:object-[53%_44%]',
] as const;
const HERO_SLIDE_OVERLAYS = [
  'bg-[linear-gradient(110deg,rgba(8,25,45,0.62)_2%,rgba(8,25,45,0.33)_46%,rgba(8,25,45,0.08)_84%)]',
  'bg-[linear-gradient(108deg,rgba(9,23,42,0.58)_4%,rgba(9,23,42,0.31)_48%,rgba(9,23,42,0.07)_85%)]',
  'bg-[linear-gradient(111deg,rgba(7,21,39,0.6)_4%,rgba(7,21,39,0.33)_50%,rgba(7,21,39,0.08)_85%)]',
] as const;

export function HeroCarousel() {
  const prefersReducedMotion = useReducedMotion();
  const { reducedMotion: userReducedMotion } = useAccessibility();
  const reduceMotion = prefersReducedMotion || userReducedMotion;
  const autoplay = React.useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY_MS,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
      stopOnInteraction: false,
      playOnInit: false,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: HERO_SLIDES.length > 1,
      align: 'start',
      duration: 28,
    },
    [autoplay.current]
  );

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(HERO_SLIDES.length);
  const [canScrollPrev, setCanScrollPrev] = React.useState(HERO_SLIDES.length > 1);
  const [canScrollNext, setCanScrollNext] = React.useState(HERO_SLIDES.length > 1);
  const [autoplayProgress, setAutoplayProgress] = React.useState(0);
  const [isAutoplayRunning, setIsAutoplayRunning] = React.useState(false);
  const hasMultipleSlides = HERO_SLIDES.length > 1;
  const progressValue = reduceMotion || !hasMultipleSlides ? 1 : autoplayProgress;

  const textContainerVariants = React.useMemo<Variants>(
    () => ({
      hidden: {
        opacity: 0,
        y: reduceMotion ? 0 : 12,
      },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: reduceMotion ? 0.01 : 0.44,
          ease: EASE_OUT_QUINT,
          when: 'beforeChildren',
          staggerChildren: reduceMotion ? 0 : 0.08,
          delayChildren: reduceMotion ? 0 : 0.03,
        },
      },
      exit: {
        opacity: 0,
        y: reduceMotion ? 0 : -10,
        transition: {
          duration: reduceMotion ? 0.01 : 0.27,
          ease: EASE_OUT_QUINT,
          when: 'afterChildren',
          staggerChildren: reduceMotion ? 0 : 0.05,
          staggerDirection: -1,
        },
      },
    }),
    [reduceMotion]
  );

  const textItemVariants = React.useMemo<Variants>(
    () => ({
      hidden: {
        opacity: 0,
        y: reduceMotion ? 0 : 14,
        filter: reduceMotion ? 'blur(0px)' : 'blur(6px)',
      },
      show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: reduceMotion ? 0.01 : 0.52,
          ease: EASE_OUT_QUINT,
        },
      },
      exit: {
        opacity: 0,
        y: reduceMotion ? 0 : -10,
        filter: reduceMotion ? 'blur(0px)' : 'blur(4px)',
        transition: {
          duration: reduceMotion ? 0.01 : 0.22,
          ease: EASE_OUT_QUINT,
        },
      },
    }),
    [reduceMotion]
  );

  const pauseAutoplayAfterInteraction = React.useCallback(() => {
    if (!emblaApi || reduceMotion || !hasMultipleSlides) return;
    const autoplayApi = emblaApi.plugins().autoplay;
    if (!autoplayApi) return;

    autoplayApi.stop();
    setIsAutoplayRunning(false);
    setAutoplayProgress(0);
  }, [emblaApi, hasMultipleSlides, reduceMotion]);

  const onScrollPrev = React.useCallback(() => {
    pauseAutoplayAfterInteraction();
    emblaApi?.scrollPrev();
  }, [emblaApi, pauseAutoplayAfterInteraction]);

  const onScrollNext = React.useCallback(() => {
    pauseAutoplayAfterInteraction();
    emblaApi?.scrollNext();
  }, [emblaApi, pauseAutoplayAfterInteraction]);

  const onDotClick = React.useCallback(
    (index: number) => {
      if (!emblaApi) return;
      const autoplayApi = emblaApi.plugins().autoplay;
      const isActiveDot = index === activeIndex;

      if (reduceMotion || !hasMultipleSlides || !autoplayApi) {
        emblaApi.scrollTo(index);
        return;
      }

      if (autoplayApi.isPlaying()) {
        emblaApi.scrollTo(index);
        autoplayApi.stop();
        setIsAutoplayRunning(false);
        setAutoplayProgress(0);
        return;
      }

      if (isActiveDot) {
        autoplayApi.play();
        autoplayApi.reset();
        setIsAutoplayRunning(true);
        setAutoplayProgress(0);
        return;
      }

      emblaApi.scrollTo(index);
      setAutoplayProgress(0);
    },
    [activeIndex, emblaApi, hasMultipleSlides, reduceMotion]
  );

  const onCarouselKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (!hasMultipleSlides) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onScrollPrev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onScrollNext();
      }
    },
    [hasMultipleSlides, onScrollNext, onScrollPrev]
  );

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      setAutoplayProgress(0);
    };

    const onReInit = () => {
      setSnapCount(emblaApi.scrollSnapList().length);
      onSelect();
    };

    onReInit();

    const onPointerDown = () => {
      pauseAutoplayAfterInteraction();
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onReInit);
    emblaApi.on('pointerDown', onPointerDown);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onReInit);
      emblaApi.off('pointerDown', onPointerDown);
    };
  }, [emblaApi, pauseAutoplayAfterInteraction]);

  React.useEffect(() => {
    if (!emblaApi) return;
    const autoplayApi = emblaApi.plugins().autoplay;
    if (!autoplayApi) return;

    if (reduceMotion || !hasMultipleSlides) {
      autoplayApi.stop();
      setIsAutoplayRunning(false);
      setAutoplayProgress(1);
      return;
    }

    autoplayApi.play();
    autoplayApi.reset();
    setIsAutoplayRunning(true);
    setAutoplayProgress(0);
  }, [emblaApi, hasMultipleSlides, reduceMotion]);

  React.useEffect(() => {
    if (!emblaApi) return;
    const autoplayApi = emblaApi.plugins().autoplay;
    if (!autoplayApi) return;

    const syncAutoplayState = () => {
      setIsAutoplayRunning(autoplayApi.isPlaying());
    };

    syncAutoplayState();
    emblaApi.on('autoplay:play', syncAutoplayState);
    emblaApi.on('autoplay:stop', syncAutoplayState);
    emblaApi.on('autoplay:timerset', syncAutoplayState);
    emblaApi.on('autoplay:timerstopped', syncAutoplayState);

    return () => {
      emblaApi.off('autoplay:play', syncAutoplayState);
      emblaApi.off('autoplay:stop', syncAutoplayState);
      emblaApi.off('autoplay:timerset', syncAutoplayState);
      emblaApi.off('autoplay:timerstopped', syncAutoplayState);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi || reduceMotion || !hasMultipleSlides) return;
    const autoplayApi = emblaApi.plugins().autoplay;
    if (!autoplayApi) return;

    let frameId: number | null = null;

    const stopProgressLoop = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const animateProgress = () => {
      if (!autoplayApi.isPlaying()) {
        frameId = null;
        return;
      }

      const timeUntilNext = autoplayApi.timeUntilNext();
      if (timeUntilNext === null) {
        frameId = null;
        return;
      }

      setAutoplayProgress(Math.min(1, Math.max(0, 1 - timeUntilNext / AUTOPLAY_DELAY_MS)));
      frameId = window.requestAnimationFrame(animateProgress);
    };

    const startProgressLoop = () => {
      stopProgressLoop();
      frameId = window.requestAnimationFrame(animateProgress);
    };

    startProgressLoop();
    emblaApi.on('autoplay:timerset', startProgressLoop);
    emblaApi.on('autoplay:timerstopped', stopProgressLoop);

    return () => {
      stopProgressLoop();
      emblaApi.off('autoplay:timerset', startProgressLoop);
      emblaApi.off('autoplay:timerstopped', stopProgressLoop);
    };
  }, [emblaApi, hasMultipleSlides, reduceMotion]);

  const canResumeViaDot = hasMultipleSlides && !reduceMotion && !isAutoplayRunning;

  return (
    <section
      aria-label="Carrousel principal"
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden min-h-[clamp(36rem,76svh,51.25rem)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-villiers-gold focus-visible:ring-offset-2 focus-visible:ring-offset-villiers-blue"
      onKeyDown={onCarouselKeyDown}
      tabIndex={0}
    >
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.image}
              aria-hidden={index !== activeIndex}
              className="relative min-w-0 flex-[0_0_100%]"
            >
              <motion.div
                animate={{
                  scale: reduceMotion ? 1 : index === activeIndex ? 1.03 : 1.01,
                }}
                transition={{
                  duration: reduceMotion ? 0.01 : 1.2,
                  ease: EASE_OUT_QUINT,
                }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={cn('object-cover', HERO_IMAGE_POSITION_CLASSES[index] ?? '')}
                />
              </motion.div>
              <div className={cn('absolute inset-0', HERO_SLIDE_OVERLAYS[index] ?? HERO_SLIDE_OVERLAYS[0])} />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,16,30,0.3)] via-[rgba(6,16,30,0.13)] to-[rgba(6,16,30,0.08)]" />
      <div className="absolute inset-0 z-10 hero-text-scrim" />
      <div className="absolute inset-0 texture-grain opacity-80" />

      <div className="container relative z-20 flex h-full items-end pt-[clamp(5rem,11vh,7.5rem)] pb-[clamp(5.75rem,13vh,8.25rem)]">
        <div className="max-w-3xl">
          <p className="sr-only" aria-live="polite">
            {`Diapositive ${activeIndex + 1} sur ${HERO_SLIDES.length} : ${HERO_SLIDES[activeIndex]?.title}`}
          </p>

          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={activeIndex}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={textContainerVariants}
              className="hero-copy-surface relative max-w-[68ch] px-1 py-3 sm:py-4"
            >
              <motion.p
                variants={textItemVariants}
                className="hero-eyebrow mb-5 inline-flex w-fit items-center rounded-full border border-villiers-gold/40 bg-villiers-gold/14 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] sm:text-xs"
              >
                {HERO_SLIDES[activeIndex].eyebrow}
              </motion.p>

              <motion.h1
                variants={textItemVariants}
                className="hero-title font-heading text-[length:var(--hero-title-size)] leading-[var(--hero-title-line-height)]"
              >
                {HERO_SLIDES[activeIndex].title}
              </motion.h1>

              <motion.p
                variants={textItemVariants}
                className="hero-subtitle mt-5 max-w-[62ch] text-[length:var(--hero-subtitle-size)] leading-[var(--hero-subtitle-line-height)]"
              >
                {HERO_SLIDES[activeIndex].description}
              </motion.p>

              <motion.div
                variants={textItemVariants}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Button
                  asChild
                  size="lg"
                  className="hero-primary-button group min-h-12 w-full rounded-organic bg-villiers-gold text-villiers-blue transition-all duration-300 hover:scale-[1.01] hover:bg-villiers-gold-soft hover:shadow-villiers sm:w-auto"
                >
                  <Link href={HERO_SLIDES[activeIndex].primaryHref}>
                    {HERO_SLIDES[activeIndex].primaryLabel}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="hero-secondary-button group min-h-12 w-full rounded-organic border border-white/64 bg-white/14 text-white transition-all duration-300 hover:scale-[1.01] hover:bg-white/24 hover:border-white/85 sm:w-auto"
                >
                  <Link href={HERO_SLIDES[activeIndex].secondaryHref}>
                    {HERO_SLIDES[activeIndex].secondaryLabel}
                  </Link>
                </Button>
              </motion.div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>

      {hasMultipleSlides && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between px-4 md:flex lg:px-6">
            <button
              type="button"
              onClick={onScrollPrev}
              disabled={!canScrollPrev}
              aria-label="Diapositive précédente"
              className={cn(
                'group pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-villiers-blue/45 text-white backdrop-blur-sm transition-all duration-300 lg:h-12 lg:w-12',
                'hover:scale-105 hover:border-villiers-gold hover:bg-villiers-blue/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-villiers-gold focus-visible:ring-offset-2 focus-visible:ring-offset-villiers-blue',
                !canScrollPrev && 'cursor-not-allowed opacity-45 hover:scale-100'
              )}
            >
              <ChevronLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={onScrollNext}
              disabled={!canScrollNext}
              aria-label="Diapositive suivante"
              className={cn(
                'group pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-villiers-blue/45 text-white backdrop-blur-sm transition-all duration-300 lg:h-12 lg:w-12',
                'hover:scale-105 hover:border-villiers-gold hover:bg-villiers-blue/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-villiers-gold focus-visible:ring-offset-2 focus-visible:ring-offset-villiers-blue',
                !canScrollNext && 'cursor-not-allowed opacity-45 hover:scale-100'
              )}
            >
              <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-5 z-20 px-4 sm:bottom-7">
            <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-white/28 bg-villiers-blue/35 px-2.5 py-1.5 backdrop-blur-[1px]">
              {Array.from({ length: snapCount }).map((_, index) => {
                const isActive = index === activeIndex;
                const dotAriaLabel = canResumeViaDot && isActive
                  ? 'Relancer le défilement automatique'
                  : `Afficher la diapositive ${index + 1}`;
                return (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    onClick={() => onDotClick(index)}
                    aria-label={dotAriaLabel}
                    aria-current={isActive ? 'true' : undefined}
                    aria-pressed={canResumeViaDot && isActive ? true : undefined}
                    className={cn(
                      'relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ease-organic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-villiers-gold focus-visible:ring-offset-2 focus-visible:ring-offset-villiers-blue',
                      isActive
                        ? 'bg-white/14'
                        : 'bg-transparent hover:bg-white/14'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute rounded-full transition-all duration-300',
                        isActive ? 'h-2 w-6 bg-white/36' : 'h-2.5 w-2.5 bg-white/80'
                      )}
                    />
                    <span
                      className={cn(
                        'absolute origin-left rounded-full bg-villiers-gold transition-transform duration-200',
                        isActive ? 'h-2 w-6' : 'h-2.5 w-2.5'
                      )}
                      style={{
                        transform: `scaleX(${isActive ? progressValue : 0})`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
