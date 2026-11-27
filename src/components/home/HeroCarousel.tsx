import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Info, Play, Plus } from 'lucide-react';
import type { CatalogItem } from '../../types/catalog';
import {
  emitAmbientColor,
  getGenrePalette,
  hexToRgbString,
  resolveAssetUrl,
  splitCountries,
} from '../../utils/assetUrl';
import { isItemCompleted } from '../../utils/catalogHelpers';
import { triggerHaptic } from '../../utils/telegram';

interface HeroCarouselProps {
  items: CatalogItem[];
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onWatchNow: (item: CatalogItem) => void;
  onOpenDetail: (item: CatalogItem) => void;
  onSelectGenre: (genre: string) => void;
  onSelectYear: (year: number) => void;
  onSelectCountry: (country: string) => void;
}

const HeroCarouselInner: React.FC<HeroCarouselProps> = ({
  items,
  isSaved,
  onToggleSave,
  onWatchNow,
  onOpenDetail,
  onSelectGenre,
  onSelectYear,
  onSelectCountry,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isPausedRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const clearResumeTimer = () => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  const safeIndex = items.length > 0 ? activeIndex % items.length : 0;
  const current = items[safeIndex];

  // Directly emit CSS variable & lightweight custom event without triggering App tree re-renders!
  useEffect(() => {
    if (current) {
      emitAmbientColor(current.accent_color);
    }
  }, [current]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => {
      if (isPausedRef.current) return;
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [items.length, safeIndex]);

  if (!current) return null;

  const accentRgb = hexToRgbString(current.accent_color, '225, 29, 72');
  const hasBackdrop = Boolean(current.backdrop_local);
  const bgUrl = resolveAssetUrl(current.backdrop_local || current.poster_local);
  const posterUrl = resolveAssetUrl(current.poster_local);
  const saved = isSaved(current.id);
  const countries = splitCountries(current.country);
  const completed = isItemCompleted(current);

  const badgeConfig =
    current.category === 'movies'
      ? {
          text: '🎬 FILM UNGGULAN',
          gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
        }
      : current.category === 'series'
      ? {
          text: '📺 SERIES HITS',
          gradient: 'from-purple-600 via-fuchsia-500 to-pink-500',
        }
      : {
          text: '🐉 DONGHUA POPULER',
          gradient: 'from-rose-600 via-orange-500 to-amber-500',
        };

  const goPrev = () => {
    triggerHaptic('selection');
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goNext = () => {
    triggerHaptic('selection');
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const scheduleResume = () => {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      isPausedRef.current = false;
      resumeTimerRef.current = null;
    }, 1500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    clearResumeTimer();
    isPausedRef.current = true;
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    const endTouch = e.changedTouches[0];
    if (start && endTouch && items.length > 1) {
      const dx = endTouch.clientX - start.x;
      const dy = endTouch.clientY - start.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        if (dx < 0) goNext();
        else goPrev();
      }
    }
    touchStartRef.current = null;
    scheduleResume();
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
    scheduleResume();
  };

  return (
    <section
      onMouseEnter={() => {
        clearResumeTimer();
        isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        clearResumeTimer();
        isPausedRef.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className="relative mx-auto w-full max-w-7xl px-3 pt-3 sm:px-5 sm:pt-4 touch-pan-y select-none"
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0a0a14] shadow-[0_18px_42px_-12px_rgba(0,0,0,0.85)] min-h-[340px] sm:min-h-[410px] lg:min-h-[450px] flex items-end touch-pan-y">
        {/* Widescreen Backdrop Layer (No heavy CSS blur or mix-blend-mode) */}
        <div className="absolute inset-0 overflow-hidden bg-[#0a0a14]">
          <img
            key={current.id}
            src={bgUrl}
            alt={current.title}
            decoding="async"
            draggable={false}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              hasBackdrop ? 'object-center' : 'object-center scale-105 opacity-35'
            }`}
          />

          {/* Multi-stop cinematic dark & accent vignette overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06060b] via-[#06060b]/72 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06060b]/95 via-[#06060b]/55 to-transparent" />
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              background: `radial-gradient(circle at 82% 22%, rgba(${accentRgb}, 0.45), transparent 58%)`,
            }}
          />
        </div>

        {/* Desktop / Non-backdrop Crisp Floating Poster Accent */}
        <div
          onClick={() => onOpenDetail(current)}
          className={`${
            hasBackdrop ? 'hidden lg:block' : 'hidden sm:block'
          } absolute right-7 bottom-10 z-10 w-36 lg:w-44 aspect-[2/3] overflow-hidden rounded-2xl border border-white/25 shadow-2xl cursor-pointer md:hover:scale-[1.03] transition-transform`}
        >
          <img
            src={posterUrl}
            alt={current.title}
            draggable={false}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Left / Right Subtle Navigation Arrows on Larger Screens */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Slide Sebelumnya"
              className="hidden sm:flex absolute left-3 top-1/2 z-20 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-[#090913]/80 hover:bg-[#090913] border border-white/15 text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Slide Berikutnya"
              className="hidden sm:flex absolute right-3 top-1/2 z-20 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-[#090913]/80 hover:bg-[#090913] border border-white/15 text-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Foreground Spotlight Content */}
        <div className="relative z-10 w-full max-w-2xl p-4 sm:p-7 lg:p-9">
          {/* Category Badge + Live Status */}
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full bg-gradient-to-r ${badgeConfig.gradient} px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black tracking-wider text-white border border-white/25`}
            >
              {badgeConfig.text}
            </span>

            {current.rating && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#090913]/88 border border-amber-400/40 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300">
                ⭐ {current.rating.toFixed(1)}
              </span>
            )}

            {current.year && (
              <button
                type="button"
                onClick={() => onSelectYear(current.year!)}
                className="rounded-full bg-[#121222]/90 hover:bg-white/20 border border-white/15 px-2.5 py-0.5 text-[11px] font-bold text-slate-100 transition-colors"
              >
                {current.year}
              </button>
            )}

            {countries[0] && (
              <button
                type="button"
                onClick={() => onSelectCountry(countries[0])}
                className="rounded-full bg-[#121222]/90 hover:bg-white/20 border border-white/15 px-2.5 py-0.5 text-[11px] font-bold text-slate-200 transition-colors"
              >
                {countries[0]}
              </button>
            )}

            {/* Duration / Episode / Quality Chip */}
            {current.category === 'movies' && (
              <span className="rounded-full bg-emerald-950/85 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
                {current.quality || 'HD'}
                {current.duration_label ? ` • ${current.duration_label}` : ''}
              </span>
            )}
            {current.category === 'series' && (
              <span className="rounded-full bg-fuchsia-950/85 border border-fuchsia-400/40 px-2.5 py-0.5 text-[11px] font-extrabold text-fuchsia-200">
                {current.season_label || 'S.1'} • Ep {current.latest_episode || 1}
              </span>
            )}
            {current.category === 'donghua' && (
              <span className="rounded-full bg-amber-950/85 border border-amber-400/45 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-200">
                Ep {current.latest_episode || 1} {completed ? 'END' : 'Ongoing'} • Sub Indo
              </span>
            )}
          </div>

          {/* Hero Title */}
          <h1
            onClick={() => onOpenDetail(current)}
            className="cursor-pointer font-display text-2xl sm:text-4xl lg:text-[42px] font-black leading-[1.08] tracking-tight text-white line-clamp-2 md:hover:text-amber-200 transition-colors"
          >
            {current.title}
          </h1>

          {/* Clickable Genre Capsules */}
          {current.genres && current.genres.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {current.genres.slice(0, 4).map((genre) => {
                const pal = getGenrePalette(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      onSelectGenre(genre);
                    }}
                    className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold transition-colors ${pal.bg} ${pal.text} ${pal.border}`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          )}

          {/* 2-Line Synopsis Excerpt */}
          {current.synopsis && (
            <p className="mt-2.5 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-200/90 line-clamp-2">
              {current.synopsis}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => onWatchNow(current)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:brightness-110 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg border border-white/25 active:scale-95 transition-transform"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Tonton Sekarang</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onOpenDetail(current);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#131324]/92 hover:bg-white/15 border border-white/15 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-white active:scale-95 transition-transform"
            >
              <Info className="h-4 w-4 text-amber-300" />
              <span>Detail</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(current.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold border active:scale-95 transition-transform ${
                saved
                  ? 'bg-amber-950/90 border-amber-400/55 text-amber-200'
                  : 'bg-[#131324]/92 hover:bg-white/15 border-white/15 text-slate-200'
              }`}
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 text-amber-300" />
                  <span>Tersimpan</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-slate-200" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Slide Dots */}
          {items.length > 1 && (
            <div className="mt-4 flex items-center gap-1.5">
              {items.map((slide, idx) => {
                const active = idx === safeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Slide ${idx + 1}: ${slide.title}`}
                    onClick={() => {
                      triggerHaptic('selection');
                      setActiveIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      active
                        ? 'w-7 bg-gradient-to-r from-rose-500 to-amber-400'
                        : 'w-2 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const HeroCarousel = React.memo(HeroCarouselInner);
HeroCarousel.displayName = 'HeroCarousel';
