import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  Compass,
  Dices,
  Heart,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  CatalogItem,
  CatalogStats,
  DonghuaItem,
  ExplorerFilter,
  SortOption,
} from '../../types/catalog';
import {
  collectAllStudios,
  DEFAULT_EXPLORER_FILTER,
  filterAndSortCatalog,
} from '../../utils/catalogHelpers';
import { triggerHaptic } from '../../utils/telegram';
import { PosterCard } from '../cards/PosterCard';
import { AlphabetBar } from './AlphabetBar';

interface SuperExplorerViewProps {
  allItems: CatalogItem[];
  donghuaList: DonghuaItem[];
  stats: CatalogStats | null;
  watchlistItems: CatalogItem[];
  initialSubTab?: 'filter' | 'watchlist';
  externalFilterPatch?: Partial<ExplorerFilter> | null;
  onConsumeExternalPatch?: () => void;
  onSelectItem: (item: CatalogItem) => void;
  onOpenRoulette: () => void;
  onTagGenre: (genre: string) => void;
  onTagPlatform: (platform: string) => void;
  onTagStudio: (studio: string) => void;
}

const PAGE_SIZE = 36;

const PRIORITY_COUNTRIES = [
  'Korea Selatan',
  'China',
  'Indonesia',
  'Jepang',
  'Amerika Serikat',
  'Thailand',
  'India',
  'Vietnam',
  'Inggris',
  'Filipina',
];

export const SuperExplorerView: React.FC<SuperExplorerViewProps> = ({
  allItems,
  donghuaList,
  stats,
  watchlistItems,
  initialSubTab = 'filter',
  externalFilterPatch,
  onConsumeExternalPatch,
  onSelectItem,
  onOpenRoulette,
  onTagGenre,
  onTagPlatform,
  onTagStudio,
}) => {
  const [subTab, setSubTab] = useState<'filter' | 'watchlist'>(initialSubTab);
  const [filter, setFilter] = useState<ExplorerFilter>(DEFAULT_EXPLORER_FILTER);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    if (externalFilterPatch) {
      setSubTab('filter');
      setFilter({
        ...DEFAULT_EXPLORER_FILTER,
        ...externalFilterPatch,
      });
      onConsumeExternalPatch?.();
    }
  }, [externalFilterPatch, onConsumeExternalPatch]);

  const studios = useMemo(() => collectAllStudios(donghuaList), [donghuaList]);

  const orderedCountries = useMemo(() => {
    const raw = stats?.countries || [];
    const prio = PRIORITY_COUNTRIES.filter((c) => raw.includes(c));
    const rest = raw.filter((c) => !PRIORITY_COUNTRIES.includes(c));
    return [...prio, ...rest];
  }, [stats]);

  const filteredItems = useMemo(
    () => filterAndSortCatalog(allItems, filter),
    [allItems, filter]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, subTab]);

  const updateFilter = <K extends keyof ExplorerFilter>(key: K, val: ExplorerFilter[K]) => {
    triggerHaptic('selection');
    setFilter((prev) => ({ ...prev, [key]: val }));
  };

  const resetAllFilters = () => {
    triggerHaptic('medium');
    setFilter(DEFAULT_EXPLORER_FILTER);
  };

  const activeTagsCount = useMemo(() => {
    let count = 0;
    if (filter.category !== 'all') count++;
    if (filter.query.trim()) count++;
    if (filter.genre) count++;
    if (filter.country) count++;
    if (filter.year !== null) count++;
    if (filter.platform) count++;
    if (filter.studio) count++;
    if (filter.cast) count++;
    if (filter.director) count++;
    if (filter.status !== 'all') count++;
    if (filter.letter !== 'ALL') count++;
    return count;
  }, [filter]);

  const genresList = stats?.genres || [];
  const displayedGenres = showAllGenres ? genresList : genresList.slice(0, 14);
  const displayedCountries = showAllCountries
    ? orderedCountries
    : orderedCountries.slice(0, 10);

  const activeList = subTab === 'watchlist' ? watchlistItems : filteredItems;
  const paginatedList = activeList.slice(0, visibleCount);
  const hasMore = visibleCount < activeList.length;

  return (
    <section className="mx-auto w-full max-w-7xl px-3 pt-3 pb-8 sm:px-5 sm:pt-4">
      {/* Mode Switcher: Multi-Filter Explorer vs Watchlist */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            setSubTab('filter');
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 px-3 text-xs sm:text-sm font-extrabold border transition-all ${
            subTab === 'filter'
              ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white border-white/25 shadow-[0_8px_25px_rgba(225,29,72,0.4)]'
              : 'luxury-glass-pill text-slate-300 hover:text-white'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>Mesin Saringan Lengkap</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            setSubTab('watchlist');
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 px-3 text-xs sm:text-sm font-extrabold border transition-all ${
            subTab === 'watchlist'
              ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white border-white/25 shadow-[0_8px_25px_rgba(244,63,94,0.4)]'
              : 'luxury-glass-pill text-slate-300 hover:text-white'
          }`}
        >
          <Heart
            className={`h-4 w-4 ${
              watchlistItems.length > 0 ? 'fill-current text-amber-200' : ''
            }`}
          />
          <span>Simpanan Gua ({watchlistItems.length})</span>
        </button>
      </div>

      {subTab === 'filter' ? (
        <div className="luxury-glass rounded-2xl p-3.5 sm:p-5 space-y-3.5">
          {/* Search Input + Sort Select */}
          <div className="flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
              <input
                type="text"
                value={filter.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                placeholder="Ketik judul, nama artis (mis. Shin Min-a), sutradara, studio, tema..."
                className="w-full rounded-xl bg-black/55 border border-white/15 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:border-rose-400 focus:outline-none"
              />
              {filter.query && (
                <button
                  type="button"
                  onClick={() => updateFilter('query', '')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-1 text-slate-300 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              {/* Status Selector */}
              <select
                value={filter.status}
                onChange={(e) =>
                  updateFilter('status', e.target.value as ExplorerFilter['status'])
                }
                aria-label="Filter Status"
                className="rounded-xl bg-[#121222] border border-white/15 px-3 py-2.5 text-xs font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="Ongoing">🔥 Ongoing</option>
                <option value="Completed">✓ Tamat / Rilis</option>
              </select>

              {/* Sort Selector */}
              <select
                value={filter.sort}
                onChange={(e) => updateFilter('sort', e.target.value as SortOption)}
                aria-label="Urutan Hasil"
                className="rounded-xl bg-[#121222] border border-white/15 px-3 py-2.5 text-xs font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
              >
                <option value="latest">Urut: Terbaru</option>
                <option value="rating">Urut: Skor Rating</option>
                <option value="az">Urut: Judul A–Z</option>
                <option value="year">Urut: Tahun Rilis</option>
                <option value="episodes">Urut: Episode Terbanyak</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: '✨ Semua Koleksi' },
                { id: 'movies', label: '🎬 Film HD' },
                { id: 'series', label: '📺 Series' },
                { id: 'donghua', label: '🐉 Donghua' },
              ] as const
            ).map((cat) => {
              const active = filter.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateFilter('category', cat.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold border transition-all ${
                    active
                      ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white border-white/25 shadow'
                      : 'bg-white/[0.05] hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Genre Multi-Chip Selector */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Genre Pilihan
              </span>
              {genresList.length > 14 && (
                <button
                  type="button"
                  onClick={() => setShowAllGenres((p) => !p)}
                  className="text-[11px] font-bold text-amber-300 hover:underline"
                >
                  {showAllGenres ? 'Ringkas Genre' : `Lihat Semua (${genresList.length})`}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => updateFilter('genre', '')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  !filter.genre
                    ? 'bg-amber-500/25 border-amber-400/50 text-amber-200'
                    : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                Semua Genre
              </button>
              {displayedGenres.map((g) => {
                const active = filter.genre.toLowerCase() === g.toLowerCase();
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => updateFilter('genre', active ? '' : g)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                      active
                        ? 'bg-rose-600 border-rose-300/50 text-white shadow'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Country Chips */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Negara Asal
              </span>
              {orderedCountries.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAllCountries((p) => !p)}
                  className="text-[11px] font-bold text-amber-300 hover:underline"
                >
                  {showAllCountries
                    ? 'Ringkas Negara'
                    : `Semua Negara (${orderedCountries.length})`}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => updateFilter('country', '')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  !filter.country
                    ? 'bg-amber-500/25 border-amber-400/50 text-amber-200'
                    : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                Semua Negara
              </button>
              {displayedCountries.map((c) => {
                const active = filter.country.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateFilter('country', active ? '' : c)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                      active
                        ? 'bg-rose-600 border-rose-300/50 text-white shadow'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dropdown Row: Tahun, Platform, Studio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={filter.year ?? ''}
              onChange={(e) =>
                updateFilter('year', e.target.value ? Number(e.target.value) : null)
              }
              aria-label="Filter Tahun Rilis"
              className="rounded-xl bg-[#121222] border border-white/15 px-3 py-2 text-xs font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
            >
              <option value="">📅 Semua Tahun Rilis</option>
              {(stats?.years || []).map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>

            <select
              value={filter.platform}
              onChange={(e) => updateFilter('platform', e.target.value)}
              aria-label="Filter Platform"
              className="rounded-xl bg-[#121222] border border-white/15 px-3 py-2 text-xs font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
            >
              <option value="">📡 Semua Platform Tayang</option>
              {(stats?.platforms || []).map((pf) => (
                <option key={pf} value={pf}>
                  {pf}
                </option>
              ))}
            </select>

            <select
              value={filter.studio}
              onChange={(e) => updateFilter('studio', e.target.value)}
              aria-label="Filter Studio Animasi"
              className="rounded-xl bg-[#121222] border border-white/15 px-3 py-2 text-xs font-bold text-slate-100 focus:border-amber-400 focus:outline-none"
            >
              <option value="">🎨 Semua Studio Donghua</option>
              {studios.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* A-Z Alphabet Bar */}
          <div className="border-t border-white/10 pt-2.5">
            <AlphabetBar
              activeLetter={filter.letter}
              onSelectLetter={(ltr) => updateFilter('letter', ltr)}
            />
          </div>

          {/* Active Filter Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-slate-300">
                Ditemukan{' '}
                <strong className="text-amber-300">{filteredItems.length}</strong> judul
              </span>
              {filter.cast && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-400/35 px-2 py-0.5 text-[11px] font-bold text-rose-200">
                  Pemeran: {filter.cast}
                  <button type="button" onClick={() => updateFilter('cast', '')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filter.director && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-400/35 px-2 py-0.5 text-[11px] font-bold text-rose-200">
                  Sutradara: {filter.director}
                  <button type="button" onClick={() => updateFilter('director', '')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            {activeTagsCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 px-3 py-1.5 text-xs font-bold text-rose-200 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Semua Filter ({activeTagsCount})</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="luxury-glass rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-black text-white">
              ❤️ Daftar Simpanan Gua
            </h2>
            <p className="text-xs text-slate-300/85">
              Koleksi film, series, dan donghua favorit yang lo tandai tersimpan otomatis di perangkat ini.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRoulette}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-amber-500 px-3.5 py-2 text-xs font-extrabold text-white shadow"
          >
            <Dices className="h-4 w-4" />
            <span>Acak Tontonan</span>
          </button>
        </div>
      )}

      {/* Results 3-Column Grid */}
      {paginatedList.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {paginatedList.map((item) => (
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

          {hasMore && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-xs text-slate-400">
                Menampilkan <strong className="text-white">{paginatedList.length}</strong> dari{' '}
                <strong className="text-amber-300">{activeList.length}</strong> judul
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
                  {Math.min(PAGE_SIZE, activeList.length - paginatedList.length)} Judul)
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 luxury-glass rounded-2xl p-8 text-center">
          <p className="text-3xl mb-2">{subTab === 'watchlist' ? '❤️' : '🔍'}</p>
          <h3 className="font-display text-base sm:text-lg font-bold text-white">
            {subTab === 'watchlist'
              ? 'Belum ada judul di Simpanan Gua'
              : 'Belum ketemu judul dengan kombinasi filter tersebut'}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            {subTab === 'watchlist'
              ? 'Tekan tombol "+ Simpan" di banner utama atau di dalam detail film/series/donghua buat menandai tontonan incaran lo!'
              : 'Coba kurangi salah satu filter atau tekan Reset Semua Filter buat melihat seluruh katalog.'}
          </p>
          {subTab === 'filter' ? (
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSubTab('filter')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-2 text-xs font-bold text-white"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Jelajahi Katalog</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
