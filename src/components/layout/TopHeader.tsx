import React from 'react';
import { Dices, Heart, MessageCircleQuestion, Search } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface TopHeaderProps {
  watchlistCount: number;
  onLogoClick: () => void;
  onOpenSearch: () => void;
  onOpenRoulette: () => void;
  onOpenWatchlist: () => void;
  onOpenInfo: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  watchlistCount,
  onLogoClick,
  onOpenSearch,
  onOpenRoulette,
  onOpenWatchlist,
  onOpenInfo,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07070f]/75 backdrop-blur-2xl saturate-150 shadow-[0_8px_30px_rgba(0,0,0,0.55)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-5">
        <BrandLogo onClick={onLogoClick} />

        {/* Desktop / Tablet Instant Search Trigger Bar */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden md:flex flex-1 max-w-md mx-4 items-center justify-between gap-3 rounded-full bg-white/[0.06] hover:bg-white/[0.11] border border-white/15 px-4 py-2 text-left text-xs text-slate-300 transition-all shadow-inner"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="h-4 w-4 text-rose-400 shrink-0" />
            <span>Cari judul film, drakor, donghua, artis, genre...</span>
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
            LIVE
          </span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Pill */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Cari Katalog"
            className="md:hidden inline-flex items-center gap-1.5 rounded-full luxury-glass-pill px-2.5 py-1.5 text-xs font-semibold text-slate-100 hover:border-white/30 active:scale-95 transition-all"
          >
            <Search className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden xs:inline">Cari</span>
          </button>

          {/* Cinema Roulette Button */}
          <button
            type="button"
            onClick={onOpenRoulette}
            title="Acak Rekomendasi Tontonan"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600/30 via-fuchsia-600/25 to-amber-500/30 hover:from-violet-600/45 hover:to-amber-500/45 border border-fuchsia-400/35 px-2.5 py-1.5 text-xs font-bold text-amber-100 shadow-[0_0_16px_rgba(217,70,239,0.25)] active:scale-95 transition-all"
          >
            <Dices className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden sm:inline">Acak</span>
          </button>

          {/* Watchlist / Simpanan Button */}
          <button
            type="button"
            onClick={onOpenWatchlist}
            title="Simpanan Gua (Watchlist)"
            className="relative inline-flex items-center justify-center rounded-full luxury-glass-pill p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-100 hover:border-rose-400/40 active:scale-95 transition-all"
          >
            <Heart
              className={`h-3.5 w-3.5 ${
                watchlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-rose-300'
              }`}
            />
            <span className="hidden lg:inline ml-1.5">Simpanan</span>
            {watchlistCount > 0 && (
              <span className="ml-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-1 text-[10px] font-extrabold leading-4 text-white shadow">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Info & Request Button */}
          <button
            type="button"
            onClick={onOpenInfo}
            title="Info Koleksi & Request Judul"
            className="inline-flex items-center justify-center rounded-full luxury-glass-pill p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-200 hover:border-amber-400/40 active:scale-95 transition-all"
          >
            <MessageCircleQuestion className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden lg:inline ml-1.5">Info</span>
          </button>
        </div>
      </div>
    </header>
  );
};
