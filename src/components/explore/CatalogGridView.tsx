import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, Home, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import type {
  CatalogItem,
  ExplorerFilter,
  GridViewContext,
  SortOption,
} from '../../types/catalog';
import {
  DEFAULT_EXPLORER_FILTER,
  filterAndSortCatalog,
} from '../../utils/catalogHelpers';
import { triggerHaptic } from '../../utils/telegram';
import { PosterCard } from '../cards/PosterCard';
import { AlphabetBar } from './AlphabetBar';

interface CatalogGridViewProps {
  context: GridViewContext;
  allItems: CatalogItem[];
  onClose: () => void;
  onSelectItem: (item: CatalogItem) => void;
  onTagGenre: (genre: string) => void;
  onTagPlatform: (platform: string) => void;
  onTagStudio: (studio: string) => void;
}

const PAGE_SIZE = 36;

export const CatalogGridView: React.FC<CatalogGridViewProps> = ({
  context,
  allItems,
  onClose,
  onSelectItem,
  onTagGenre,
  onTagPlatform,
  onTagStudio,
}) => {
  const [localQuery, setLocalQuery] = useState('');
  const [letter, setLetter] = useState<string>(context.initialFilter?.letter || 'ALL');
  const [sort, setSort] = useState<SortOption>(context.initialFilter?.sort || 'latest');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  useEffect(() => {
    setLocalQuery(context.initialFilter?.query || '');
    setLetter(context.initialFilter?.letter || 'ALL');
    setSort(context.initialFilter?.sort || 'latest');
    setVisibleCount(PAGE_SIZE);
    window.scrollTo(0, 0);
  }, [context]);

  const baseSource = context.presetItems ?? allItems;

  const computedItems = useMemo(() => {
    const mergedFilter: ExplorerFilter = {
      ...DEFAULT_EXPLORER_FILTER,
      ...(context.presetItems ? {} : context.initialFilter),
      query: localQuery,
      letter,
      sort,
    };
    return filterAndSortCatalog(baseSource, mergedFilter);
  }, [baseSource, context.presetItems, context.initialFilter, localQuery, letter, sort]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [localQuery, letter, sort]);

  const displayedItems = computedItems.slice(0, visibleCount);
  const hasMore = visibleCount < computedItems.length;
  const hasLocalModification =
    localQuery.trim() !== '' ||
    letter !== (context.initialFilter?.letter || 'ALL') ||
    sort !== (context.initialFilter?.sort || 'latest');

  return (
    <section className="mx-auto w-full max-w-7xl px-3 pt-3 pb-8 sm:px-5 sm:pt-4">
      {/* Glass Header & Breadcrumb Box */}
      <div className="luxury-glass rounded-2xl p-3.5 sm:p-5">
        {/* Top Row: Back Button + Live Breadcrumb + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 font-bold text-white active:scale-95 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-amber-300" />
              <span>Kembali</span>
            </button>

            <div className="flex items-center gap-1.5 rounded-xl bg-black/40 border border-white/10 px-3 py-1.5 text-[11px] sm:text-xs text-slate-300">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 font-semibold text-slate-300 hover:text-amber-300 transition-colors"
              >
                <Home className="h-3 w-3 text-rose-400" />
                <span>{context.breadcrumbParent}</span>
              </button>
              <span className="text-slate-500">/</span>
              <span className="font-bold text-amber-300">{context.breadcrumbLabel}</span>
              <span className="ml-1 rounded-full bg-rose-500/25 border border-rose-400/35 px-1.5 py-0.2 text-[10px] font-extrabold text-rose-200">
                {computedItems.length} judul
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasLocalModification && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setLocalQuery('');
                  setLetter(context.initialFilter?.letter || 'ALL');
                  setSort(context.initialFilter?.sort || 'latest');
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 px-2.5 py-1.5 text-[11px] font-bold text-amber-200 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Saringan</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/35 px-2.5 py-1.5 text-[11px] font-bold text-rose-200 transition-colors"
            >
              <span>Tutup Grid</span>
            </button>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="mt-3">
          <h1 className="font-display text-xl sm:text-2xl font-black text-white">
            {context.title}
          </h1>
          {context.subtitle && (
            <p className="mt-0.5 text-xs sm:text-sm text-slate-300/85">{context.subtitle}</p>
          )}
        </div>

        {/* In-Grid Search + Quick Sort */}
        <div className="mt-3.5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Saring cepat judul, artis, negara di daftar ini..."
              className="w-full rounded-xl bg-black/50 border border-white/15 py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:border-rose-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4 text-amber-300 shrink-0 hidden sm:block" />
            <select
              value={sort}
              onChange={(e) => {
                triggerHaptic('selection');
                setSort(e.target.value as SortOption);
              }}
              aria-label="Urutkan Katalog"
              className="w-full sm:w-auto rounded-xl bg-[#121222] border border-white/15 px-3 py-2 text-xs sm:text-sm font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
            >
              <option value="latest">Urut: Terbaru Diupdate</option>
              <option value="rating">Urut: Rating Tertinggi</option>
              <option value="az">Urut: Abjad A–Z</option>
              <option value="year">Urut: Tahun Rilis</option>
              <option value="episodes">Urut: Episode Terbanyak</option>
            </select>
          </div>
        </div>

        {/* Alphabet Jump Bar */}
        <div className="mt-3 border-t border-white/10 pt-2.5">
          <AlphabetBar activeLetter={letter} onSelectLetter={setLetter} />
        </div>
      </div>

      {/* 3-Column Mobile / 4-6 Column Desktop Responsive Grid */}
      {displayedItems.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {displayedItems.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                onTagGenre={onTagGenre}
                onTagPlatform={onTagPlatform}
                onTagStudio={onTagStudio}
              />
            ))}
          </div>

          {/* Smooth 36-Item Load More Pagination */}
          {hasMore && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-xs text-slate-400">
                Menampilkan <strong className="text-white">{displayedItems.length}</strong> dari{' '}
                <strong className="text-amber-300">{computedItems.length}</strong> judul
              </p>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setVisibleCount((prev) => prev + PAGE_SIZE);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:brightness-110 border border-white/25 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(225,29,72,0.45)] active:scale-95 transition-all"
              >
                <ChevronDown className="h-4 w-4" />
                <span>
                  Muat Lebih Banyak (+
                  {Math.min(PAGE_SIZE, computedItems.length - displayedItems.length)} Judul)
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-8 luxury-glass rounded-2xl p-8 text-center">
          <p className="text-3xl mb-2">🎬</p>
          <h3 className="font-display text-base font-bold text-white">
            Tidak ada judul yang cocok dengan saringan ini
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Coba pilih huruf lain atau tekan Reset Saringan untuk menampilkan kembali koleksi.
          </p>
          <button
            type="button"
            onClick={() => {
              setLocalQuery('');
              setLetter('ALL');
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Tampilkan Semua di Kategori Ini</span>
          </button>
        </div>
      )}
    </section>
  );
};
