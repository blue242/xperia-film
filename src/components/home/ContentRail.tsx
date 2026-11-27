import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CatalogItem, GridViewContext } from '../../types/catalog';
import { triggerHaptic } from '../../utils/telegram';
import { PosterCard } from '../cards/PosterCard';

interface ContentRailProps {
  title: string;
  subtitle?: string;
  accentGradient?: string;
  items: CatalogItem[];
  gridContext: GridViewContext;
  maxPreview?: number;
  onOpenGrid: (ctx: GridViewContext) => void;
  onSelectItem: (item: CatalogItem) => void;
  onTagGenre: (genre: string) => void;
  onTagPlatform: (platform: string) => void;
  onTagStudio: (studio: string) => void;
}

const ContentRailInner: React.FC<ContentRailProps> = ({
  title,
  subtitle,
  accentGradient = 'from-rose-500 via-red-500 to-amber-400',
  items,
  gridContext,
  maxPreview = 12,
  onOpenGrid,
  onSelectItem,
  onTagGenre,
  onTagPlatform,
  onTagStudio,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  if (!items || items.length === 0) return null;

  const visibleItems = items.slice(0, maxPreview);

  const scrollByOffset = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth * 0.78;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -width : width,
      behavior: 'smooth',
    });
  };

  return (
    <section className="mx-auto mt-6 sm:mt-7 w-full max-w-7xl">
      {/* Rail Header with Gradient Accent Bar + LK21-style Crimson SEMUA Button */}
      <div className="mb-2.5 sm:mb-3 flex items-center justify-between gap-2 px-3 sm:px-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`h-6 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${accentGradient}`}
          />
          <div className="min-w-0">
            <h2 className="truncate font-display text-[15px] sm:text-lg font-extrabold tracking-tight text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-[10.5px] sm:text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Desktop Scroll Buttons */}
          <div className="hidden md:flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={() => scrollByOffset('left')}
              aria-label="Geser Kiri"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/15 border border-white/10 text-slate-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByOffset('right')}
              aria-label="Geser Kanan"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/15 border border-white/10 text-slate-200 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Signature Crimson SEMUA Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onOpenGrid(gridContext);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-amber-500 border border-rose-300/35 px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-xs font-black uppercase tracking-wider text-white shadow-sm active:scale-95 transition-transform"
          >
            <span>SEMUA</span>
            <span className="rounded bg-black/25 px-1 text-[9.5px] font-bold">
              {items.length}
            </span>
          </button>
        </div>
      </div>

      {/* Horizontal Card Track (touch-pan-x + overscroll-x-contain for smooth 60fps mobile) */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-2.5 sm:gap-3.5 overflow-x-auto overscroll-x-contain touch-pan-x px-3 sm:px-5 pb-1"
      >
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="w-[126px] xs:w-[136px] sm:w-[158px] md:w-[172px] shrink-0"
          >
            <PosterCard
              item={item}
              onSelect={onSelectItem}
              onTagGenre={onTagGenre}
              onTagPlatform={onTagPlatform}
              onTagStudio={onTagStudio}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export const ContentRail = React.memo(ContentRailInner);
ContentRail.displayName = 'ContentRail';
