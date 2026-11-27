import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import type {
  CatalogItem,
  DonghuaItem,
  GridViewContext,
  MovieItem,
  RailDefinition,
  SeriesItem,
} from '../../types/catalog';
import { splitCountries } from '../../utils/assetUrl';
import {
  buildCuratedHeroForCategory,
  getItemEpisodeCount,
  isAsianCountry,
  isItemCompleted,
  isWesternCountry,
  sortByLatest,
  sortByRating,
} from '../../utils/catalogHelpers';
import { triggerHaptic } from '../../utils/telegram';
import { PosterCard } from '../cards/PosterCard';
import { AlphabetBar } from '../explore/AlphabetBar';
import { ContentRail } from './ContentRail';
import { HeroCarousel } from './HeroCarousel';

interface CategoryTabViewProps {
  category: 'movies' | 'series' | 'donghua';
  movies: MovieItem[];
  series: SeriesItem[];
  donghua: DonghuaItem[];
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onWatchNow: (item: CatalogItem) => void;
  onSelectItem: (item: CatalogItem) => void;
  onOpenGrid: (ctx: GridViewContext) => void;
  onTagGenre: (genre: string) => void;
  onTagPlatform: (platform: string) => void;
  onTagStudio: (studio: string) => void;
}

const GRID_STEP = 36;

const CategoryTabViewInner: React.FC<CategoryTabViewProps> = ({
  category,
  movies,
  series,
  donghua,
  isSaved,
  onToggleSave,
  onWatchNow,
  onSelectItem,
  onOpenGrid,
  onTagGenre,
  onTagPlatform,
  onTagStudio,
}) => {
  const [activeLetter, setActiveLetter] = useState<string>('ALL');
  const [visibleGridCount, setVisibleGridCount] = useState<number>(GRID_STEP);

  useEffect(() => {
    setActiveLetter('ALL');
    setVisibleGridCount(GRID_STEP);
  }, [category]);

  const heroItems = useMemo(
    () => buildCuratedHeroForCategory(category, movies, series, donghua),
    [category, movies, series, donghua]
  );

  const categoryItems: CatalogItem[] = useMemo(() => {
    if (category === 'movies') return sortByLatest(movies);
    if (category === 'series') return sortByLatest(series);
    return sortByLatest(donghua);
  }, [category, movies, series, donghua]);

  const letterFilteredItems = useMemo(() => {
    if (activeLetter === 'ALL') return categoryItems;
    return categoryItems.filter((item) => {
      const ch = item.title.trim().charAt(0).toUpperCase();
      if (activeLetter === '#') return !/^[A-Z]$/.test(ch);
      return ch === activeLetter;
    });
  }, [categoryItems, activeLetter]);

  const topGenres = useMemo(() => {
    const counts = new Map<string, number>();
    categoryItems.forEach((it) => {
      it.genres?.forEach((g) => counts.set(g, (counts.get(g) || 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([g]) => g);
  }, [categoryItems]);

  const rails = useMemo<RailDefinition[]>(() => {
    if (category === 'movies') {
      const latest = sortByLatest(movies);
      const topRated = sortByRating(movies);
      const multiPart = movies.filter((m) => m.parts && m.parts.length > 1);
      const asian = sortByLatest(movies.filter((m) => isAsianCountry(m.country)));
      const western = sortByLatest(movies.filter((m) => isWesternCountry(m.country)));
      const horror = sortByLatest(movies.filter((m) => m.genres?.includes('Horror')));
      const action = sortByRating(movies.filter((m) => m.genres?.includes('Action')));

      return [
        {
          id: 'mv-latest',
          title: '🎬 Film Terbaru Diunggah',
          subtitle: 'Update segar dari channel bioskop HD',
          accentGradient: 'from-emerald-400 to-teal-600',
          items: latest,
          gridContext: {
            title: `🎬 Semua ${movies.length} Film Terbaru`,
            breadcrumbParent: 'Film',
            breadcrumbLabel: 'Terbaru',
            initialFilter: { category: 'movies', sort: 'latest' },
          },
        },
        {
          id: 'mv-top',
          title: '⭐ Top Rating Film',
          subtitle: 'Deretan film skor kritik & penonton tertinggi',
          accentGradient: 'from-amber-400 to-orange-500',
          items: topRated,
          gridContext: {
            title: '⭐ Top Rating Film Bioskop',
            breadcrumbParent: 'Film',
            breadcrumbLabel: 'Top Rating',
            initialFilter: { category: 'movies', sort: 'rating' },
          },
        },
        {
          id: 'mv-multipart',
          title: '🎞️ Film Epik Multi-Part',
          subtitle: 'Film berdurasi panjang terbagi beberapa bagian',
          accentGradient: 'from-cyan-400 to-blue-600',
          items: multiPart,
          gridContext: {
            title: '🎞️ Koleksi Film Multi-Part',
            breadcrumbParent: 'Film',
            breadcrumbLabel: 'Multi-Part',
            presetItems: multiPart,
          },
        },
        {
          id: 'mv-asia',
          title: '🌏 Sinema Asia Pilihan',
          subtitle: 'Korea, Indonesia, Jepang, Thailand, Vietnam, China & India',
          accentGradient: 'from-rose-500 to-amber-500',
          items: asian,
          gridContext: {
            title: '🌏 Koleksi Film Asia',
            breadcrumbParent: 'Film',
            breadcrumbLabel: 'Film Asia',
            presetItems: asian,
          },
        },
        {
          id: 'mv-west',
          title: '🌎 Box Office Barat',
          subtitle: 'Hollywood & sinema Eropa pilihan kualitas jernih',
          accentGradient: 'from-indigo-500 to-sky-500',
          items: western,
          gridContext: {
            title: '🌎 Box Office Barat',
            breadcrumbParent: 'Film',
            breadcrumbLabel: 'Film Barat',
            presetItems: western,
          },
        },
        {
          id: 'mv-horror',
          title: '👻 Film Horror Terseram',
          subtitle: 'Mistis Asia hingga teror supranatural modern',
          accentGradient: 'from-red-600 to-rose-500',
          items: horror,
          gridContext: {
            title: '👻 Semua Film Horror',
            breadcrumbParent: 'Film',
            breadcrumbLabel: 'Horror',
            initialFilter: { category: 'movies', genre: 'Horror' },
          },
        },
        {
          id: 'mv-action',
          title: '💥 Film Action & Laga',
          subtitle: 'Aksi memukau penuh ketegangan',
          accentGradient: 'from-orange-500 to-red-600',
          items: action,
          gridContext: {
            title: '💥 Semua Film Action',
            breadcrumbParent: 'Film',
            breadcrumbLabel: 'Action',
            initialFilter: { category: 'movies', genre: 'Action' },
          },
        },
      ];
    }

    if (category === 'series') {
      const ongoing = sortByLatest(series.filter((s) => !isItemCompleted(s)));
      const korea = sortByLatest(
        series.filter((s) => splitCountries(s.country).includes('Korea Selatan'))
      );
      const china = sortByLatest(
        series.filter((s) => splitCountries(s.country).includes('China'))
      );
      const topRated = sortByRating(series);

      return [
        {
          id: 'sr-ongoing',
          title: '🔥 Series Ongoing',
          subtitle: 'Drama yang sedang hangat tayang minggu ini',
          accentGradient: 'from-purple-500 to-pink-500',
          items: ongoing,
          gridContext: {
            title: '🔥 Series Ongoing',
            breadcrumbParent: 'Series',
            breadcrumbLabel: 'Ongoing',
            initialFilter: { category: 'series', status: 'Ongoing' },
          },
        },
        {
          id: 'sr-kr',
          title: '🇰🇷 Drama Korea Selatan',
          subtitle: 'Koleksi K-Drama pilihan Sub Indo',
          accentGradient: 'from-pink-500 to-rose-500',
          items: korea,
          gridContext: {
            title: '🇰🇷 Drama Korea Selatan',
            breadcrumbParent: 'Series',
            breadcrumbLabel: 'Korea Selatan',
            initialFilter: { category: 'series', country: 'Korea Selatan' },
          },
        },
        {
          id: 'sr-cn',
          title: '🇨🇳 Drama China',
          subtitle: 'Kisah romansa & kolosal Tiongkok',
          accentGradient: 'from-amber-500 to-red-500',
          items: china,
          gridContext: {
            title: '🇨🇳 Drama China',
            breadcrumbParent: 'Series',
            breadcrumbLabel: 'China',
            initialFilter: { category: 'series', country: 'China' },
          },
        },
        {
          id: 'sr-top',
          title: '⭐ Top Rating Series',
          subtitle: 'Urutan series berdasarkan skor penonton tertinggi',
          accentGradient: 'from-yellow-400 to-amber-600',
          items: topRated,
          gridContext: {
            title: '⭐ Top Rating Series',
            breadcrumbParent: 'Series',
            breadcrumbLabel: 'Top Rating',
            initialFilter: { category: 'series', sort: 'rating' },
          },
        },
      ];
    }

    // Donghua
    const ongoingDh = sortByLatest(donghua.filter((d) => !isItemCompleted(d)));
    const completedDh = sortByRating(donghua.filter((d) => isItemCompleted(d)));
    const marathonDh = [...donghua]
      .filter((d) => getItemEpisodeCount(d) >= 100)
      .sort((a, b) => getItemEpisodeCount(b) - getItemEpisodeCount(a));
    const topScoreDh = sortByRating(donghua);

    return [
      {
        id: 'dh-ongoing',
        title: '🔥 Donghua Ongoing Panas',
        subtitle: 'Rilisan rutin episode terbaru kualitas 1080p/4K',
        accentGradient: 'from-orange-500 via-red-500 to-rose-600',
        items: ongoingDh,
        gridContext: {
          title: '🔥 Donghua Ongoing Panas',
          breadcrumbParent: 'Donghua',
          breadcrumbLabel: 'Ongoing',
          initialFilter: { category: 'donghua', status: 'Ongoing' },
        },
      },
      {
        id: 'dh-completed',
        title: '🏆 Sudah Tamat (COMPLETED)',
        subtitle: 'Siap maraton dari awal sampai tamat tanpa nunggu minggu depan',
        accentGradient: 'from-amber-400 to-red-600',
        items: completedDh,
        gridContext: {
          title: '🏆 Donghua & Anime Sudah Tamat (COMPLETED)',
          breadcrumbParent: 'Donghua',
          breadcrumbLabel: 'Completed',
          initialFilter: { category: 'donghua', status: 'Completed' },
        },
      },
      {
        id: 'dh-marathon',
        title: '⚔️ Episode Ratusan (Maraton Kultivasi)',
        subtitle: 'Kisah panjang epik 100+ hingga 1000+ episode!',
        accentGradient: 'from-rose-500 to-amber-500',
        items: marathonDh,
        gridContext: {
          title: '⚔️ Donghua Episode Ratusan (Maraton Kultivasi)',
          breadcrumbParent: 'Donghua',
          breadcrumbLabel: '100+ Episode',
          presetItems: marathonDh,
          initialFilter: { sort: 'episodes' },
        },
      },
      {
        id: 'dh-top',
        title: '⭐ Top Skor Donghua & Anime',
        subtitle: 'Peringkat tertinggi favorit komunitas',
        accentGradient: 'from-yellow-400 to-orange-500',
        items: topScoreDh,
        gridContext: {
          title: '⭐ Top Skor Donghua & Anime',
          breadcrumbParent: 'Donghua',
          breadcrumbLabel: 'Top Skor',
          initialFilter: { category: 'donghua', sort: 'rating' },
        },
      },
    ];
  }, [category, movies, series, donghua]);

  const categoryLabel =
    category === 'movies' ? 'Film' : category === 'series' ? 'Series' : 'Donghua';

  const displayedGridItems = letterFilteredItems.slice(0, visibleGridCount);
  const hasMoreGrid = visibleGridCount < letterFilteredItems.length;

  return (
    <div className="pb-8">
      {/* Category Spotlight Hero */}
      <HeroCarousel
        items={heroItems}
        isSaved={isSaved}
        onToggleSave={onToggleSave}
        onWatchNow={onWatchNow}
        onOpenDetail={onSelectItem}
        onSelectGenre={(g) =>
          onOpenGrid({
            title: `${categoryLabel} Genre: ${g}`,
            breadcrumbParent: categoryLabel,
            breadcrumbLabel: `Genre: ${g}`,
            initialFilter: { category, genre: g },
          })
        }
        onSelectYear={(yr) =>
          onOpenGrid({
            title: `${categoryLabel} Tahun ${yr}`,
            breadcrumbParent: categoryLabel,
            breadcrumbLabel: `Tahun ${yr}`,
            initialFilter: { category, year: yr },
          })
        }
        onSelectCountry={(c) =>
          onOpenGrid({
            title: `${categoryLabel} Negara: ${c}`,
            breadcrumbParent: categoryLabel,
            breadcrumbLabel: c,
            initialFilter: { category, country: c },
          })
        }
      />

      {/* Quick Filter Strip + Full Grid CTA */}
      <section className="mx-auto mt-4 w-full max-w-7xl px-3 sm:px-5">
        <div className="luxury-glass rounded-2xl p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5">
              {topGenres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    onOpenGrid({
                      title: `${categoryLabel} Genre: ${g}`,
                      breadcrumbParent: categoryLabel,
                      breadcrumbLabel: g,
                      initialFilter: { category, genre: g },
                    });
                  }}
                  className="shrink-0 rounded-xl bg-white/[0.06] hover:bg-rose-500/25 border border-white/12 hover:border-rose-400/40 px-3 py-1.5 text-xs font-bold text-slate-200 transition-all"
                >
                  {g}
                </button>
              ))}

              {category === 'movies' &&
                [2026, 2025, 2024].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      onOpenGrid({
                        title: `🎬 Film Rilisan Tahun ${yr}`,
                        breadcrumbParent: 'Film',
                        breadcrumbLabel: `Tahun ${yr}`,
                        initialFilter: { category: 'movies', year: yr },
                      });
                    }}
                    className="shrink-0 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-400/30 px-3 py-1.5 text-xs font-extrabold text-emerald-200 transition-all"
                  >
                    📅 {yr}
                  </button>
                ))}
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onOpenGrid({
                  title: `📚 Semua ${categoryItems.length} ${categoryLabel} (Grid Penuh)`,
                  subtitle: `Jelajahi seluruh koleksi ${categoryLabel} dengan pengurut lengkap`,
                  breadcrumbParent: categoryLabel,
                  breadcrumbLabel: `Semua ${categoryLabel}`,
                  initialFilter: { category },
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:brightness-110 border border-white/25 px-3.5 py-2 text-xs font-black text-white shadow active:scale-95 transition-all"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>
                Lihat Semua {categoryItems.length} {categoryLabel}
              </span>
            </button>
          </div>

          {/* A-Z Jump Bar */}
          {(category === 'movies' || category === 'donghua') && (
            <div className="border-t border-white/10 pt-2.5">
              <AlphabetBar
                activeLetter={activeLetter}
                onSelectLetter={(ltr) => {
                  setActiveLetter(ltr);
                  setVisibleGridCount(GRID_STEP);
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* If user leaves A-Z on ALL, show rich Horizontal Rails first */}
      {activeLetter === 'ALL' &&
        rails.map((rail) => (
          <ContentRail
            key={rail.id}
            title={rail.title}
            subtitle={rail.subtitle}
            accentGradient={rail.accentGradient}
            items={rail.items}
            gridContext={rail.gridContext}
            onOpenGrid={onOpenGrid}
            onSelectItem={onSelectItem}
            onTagGenre={onTagGenre}
            onTagPlatform={onTagPlatform}
            onTagStudio={onTagStudio}
          />
        ))}

      {/* Full 3-Column Grid Section at Bottom (or Filtered by A-Z immediately) */}
      <section className="mx-auto mt-7 w-full max-w-7xl px-3 sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-rose-600" />
            <div>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-white">
                {activeLetter === 'ALL'
                  ? `📚 Semua Koleksi ${categoryLabel} (${letterFilteredItems.length})`
                  : `🔤 ${categoryLabel} Awalan "${activeLetter}" (${letterFilteredItems.length})`}
              </h2>
              <p className="text-[11px] text-slate-400">
                Tampilan Grid 3 Kolom — klik kartu untuk memilih episode / memutar video
              </p>
            </div>
          </div>

          {activeLetter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setActiveLetter('ALL')}
              className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs font-bold text-amber-200"
            >
              Reset Huruf
            </button>
          )}
        </div>

        {displayedGridItems.length > 0 ? (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
              {displayedGridItems.map((item) => (
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

            {hasMoreGrid && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-xs text-slate-400">
                  Menampilkan <strong className="text-white">{displayedGridItems.length}</strong>{' '}
                  dari <strong className="text-amber-300">{letterFilteredItems.length}</strong>{' '}
                  {categoryLabel}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setVisibleGridCount((prev) => prev + GRID_STEP);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:brightness-110 border border-white/25 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(225,29,72,0.45)] active:scale-95 transition-all"
                >
                  <ChevronDown className="h-4 w-4" />
                  <span>
                    Muat Lebih Banyak (+
                    {Math.min(GRID_STEP, letterFilteredItems.length - displayedGridItems.length)}{' '}
                    Judul)
                  </span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="luxury-glass rounded-2xl p-6 text-center text-xs text-slate-300">
            Belum ada {categoryLabel} dengan huruf awalan "{activeLetter}".
          </div>
        )}
      </section>
    </div>
  );
};

export const CategoryTabView = React.memo(CategoryTabViewInner);
CategoryTabView.displayName = 'CategoryTabView';
