import React, { useMemo } from 'react';
import type {
  CatalogItem,
  CatalogStats,
  ContinueWatchingEntry,
  DonghuaItem,
  GridViewContext,
  MovieItem,
  NavTab,
  RailDefinition,
  SeriesItem,
} from '../../types/catalog';
import { splitCountries } from '../../utils/assetUrl';
import { sortByLatest, sortByRating } from '../../utils/catalogHelpers';
import { ContentRail } from './ContentRail';
import { ContinueWatchingBar } from './ContinueWatchingBar';
import { HeroCarousel } from './HeroCarousel';
import { StatsRibbon } from './StatsRibbon';

interface HomeTabViewProps {
  stats: CatalogStats | null;
  movies: MovieItem[];
  series: SeriesItem[];
  donghua: DonghuaItem[];
  allItems: CatalogItem[];
  itemById: Map<string, CatalogItem>;
  continueList: ContinueWatchingEntry[];
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onWatchNow: (item: CatalogItem) => void;
  onSelectItem: (item: CatalogItem) => void;
  onOpenItemById: (itemId: string) => void;
  onRemoveContinue: (itemId: string) => void;
  onClearContinue: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenGrid: (ctx: GridViewContext) => void;
  onTagGenre: (genre: string) => void;
  onTagYear: (year: number) => void;
  onTagCountry: (country: string) => void;
  onTagPlatform: (platform: string) => void;
  onTagStudio: (studio: string) => void;
}

const HomeTabViewInner: React.FC<HomeTabViewProps> = ({
  stats,
  movies,
  series,
  donghua,
  allItems,
  itemById,
  continueList,
  isSaved,
  onToggleSave,
  onWatchNow,
  onSelectItem,
  onOpenItemById,
  onRemoveContinue,
  onClearContinue,
  onSelectTab,
  onOpenGrid,
  onTagGenre,
  onTagYear,
  onTagCountry,
  onTagPlatform,
  onTagStudio,
}) => {
  // Resolve featured_hero into full CatalogItem objects while preserving sharp backdrop_local
  const heroItems = useMemo<CatalogItem[]>(() => {
    const rawHero = stats?.featured_hero || [];
    const mapped: CatalogItem[] = [];
    for (const h of rawHero) {
      const found = itemById.get(h.id);
      if (found) {
        mapped.push({
          ...found,
          backdrop_local: h.backdrop_local || found.backdrop_local,
          accent_color: h.accent_color || found.accent_color,
        });
      }
    }
    return mapped.length > 0 ? mapped : sortByRating(allItems).slice(0, 10);
  }, [stats, itemById, allItems]);

  const rails = useMemo<RailDefinition[]>(() => {
    const featuredSeries = sortByRating(series);
    const latestSeries = sortByLatest(series);
    const latestMovies = sortByLatest(movies);
    const hotDonghua = sortByLatest(donghua);
    const topRatedAll = sortByRating(allItems.filter((x) => (x.rating || 0) >= 8.0));
    const koreanItems = sortByLatest(
      allItems.filter((x) => splitCountries(x.country).includes('Korea Selatan'))
    );
    const chinaItems = sortByLatest(
      allItems.filter((x) => splitCountries(x.country).includes('China'))
    );
    const horrorThriller = sortByLatest(
      allItems.filter((x) =>
        x.genres?.some((g) => g === 'Horror' || g === 'Thriller' || g === 'Mystery')
      )
    );
    const actionAdventure = sortByRating(
      allItems.filter((x) => x.genres?.some((g) => g === 'Action' || g === 'Adventure'))
    );

    return [
      {
        id: 'series-featured',
        title: '👑 Series Unggulan Pilihan',
        subtitle: 'Drakor & drama Asia rating tertinggi wajib tonton',
        accentGradient: 'from-fuchsia-500 via-purple-500 to-pink-500',
        items: featuredSeries,
        gridContext: {
          title: '👑 Semua Series Unggulan',
          subtitle: 'Urutan drama & series berdasarkan skor tertinggi',
          breadcrumbParent: 'Beranda',
          breadcrumbLabel: 'Series Unggulan',
          presetItems: featuredSeries,
          initialFilter: { sort: 'rating' },
        },
      },
      {
        id: 'series-latest',
        title: '📺 Series Update Terbaru',
        subtitle: 'Episode baru yang baru saja mendarat minggu ini',
        accentGradient: 'from-purple-500 to-rose-500',
        items: latestSeries,
        gridContext: {
          title: '📺 Series Update Terbaru',
          subtitle: 'Seluruh koleksi series diurutkan dari update paling segar',
          breadcrumbParent: 'Beranda',
          breadcrumbLabel: 'Series Terbaru',
          presetItems: latestSeries,
        },
      },
      {
        id: 'movies-latest',
        title: '🎬 Film Terbaru',
        subtitle: 'Rilisan bioskop & VOD HD terbaru lengkap Sub Indo',
        accentGradient: 'from-emerald-400 via-teal-500 to-cyan-500',
        items: latestMovies,
        gridContext: {
          title: '🎬 Katalog Lengkap Film Terbaru',
          subtitle: `${movies.length} film siap tonton langsung di Telegram`,
          breadcrumbParent: 'Beranda',
          breadcrumbLabel: 'Film Terbaru',
          initialFilter: { category: 'movies', sort: 'latest' },
        },
      },
      {
        id: 'donghua-hot',
        title: '🐉 Donghua Rilisan Panas',
        subtitle: 'Kultivasi & animasi 3D multi-resolusi 1080p/4K',
        accentGradient: 'from-amber-400 via-orange-500 to-rose-600',
        items: hotDonghua,
        gridContext: {
          title: '🐉 Donghua Rilisan Panas',
          subtitle: `${donghua.length} judul donghua & anime aktif`,
          breadcrumbParent: 'Beranda',
          breadcrumbLabel: 'Donghua Panas',
          initialFilter: { category: 'donghua', sort: 'latest' },
        },
      },
      {
        id: 'top-rating-8',
        title: '⭐ Top Rating 8.0+',
        subtitle: 'Mahakarya sinema & animasi dengan skor minimal 8.0',
        accentGradient: 'from-yellow-400 via-amber-500 to-orange-500',
        items: topRatedAll,
        gridContext: {
          title: '⭐ Koleksi Top Rating 8.0+',
          subtitle: 'Kumpulan film, series, dan donghua berpredikat terbaik',
          breadcrumbParent: 'Beranda',
          breadcrumbLabel: 'Top Rating 8.0+',
          presetItems: topRatedAll,
          initialFilter: { sort: 'rating' },
        },
      },
      {
        id: 'korea-collection',
        title: '🇰🇷 Drakor & Film Korea',
        subtitle: 'Romansa, aksi, medis, hingga thriller khas Korea Selatan',
        accentGradient: 'from-pink-500 via-rose-500 to-indigo-500',
        items: koreanItems,
        gridContext: {
          title: '🇰🇷 Koleksi Drakor & Film Korea Selatan',
          breadcrumbParent: 'Beranda',
          breadcrumbLabel: 'Korea Selatan',
          initialFilter: { country: 'Korea Selatan' },
        },
      },
      {
        id: 'china-cultivation',
        title: '🇨🇳 Koleksi China & Kultivasi',
        subtitle: 'Dunia persilatan, dewa kuno, drama & sinema Tiongkok',
        accentGradient: 'from-red-500 via-orange-500 to-amber-400',
        items: chinaItems,
        gridContext: {
          title: '🇨🇳 Koleksi Lengkap China & Kultivasi',
          breadcrumbParent: 'Beranda',
          breadcrumbLabel: 'China',
          initialFilter: { country: 'China' },
        },
      },
      {
        id: 'horror-thriller',
        title: '👻 Horror & Thriller',
        subtitle: 'Uji adrenalin dengan teror supranatural & misteri kelam',
        accentGradient: 'from-red-700 via-rose-600 to-orange-500',
        items: horrorThriller,
        gridContext: {
          title: '👻 Koleksi Horror, Thriller & Misteri',
          breadcrumbParent: 'Beranda',
          breadcrumbLabel: 'Horror & Thriller',
          presetItems: horrorThriller,
        },
      },
      {
        id: 'action-adventure',
        title: '💥 Action & Petualangan',
        subtitle: 'Pertarungan intens tanpa henti dari awal sampai akhir',
        accentGradient: 'from-sky-500 via-blue-500 to-rose-500',
        items: actionAdventure,
        gridContext: {
          title: '💥 Koleksi Action & Petualangan',
          breadcrumbParent: 'Beranda',
          breadcrumbLabel: 'Action & Petualangan',
          presetItems: actionAdventure,
          initialFilter: { sort: 'rating' },
        },
      },
    ];
  }, [series, movies, donghua, allItems]);

  return (
    <div className="pb-6">
      <HeroCarousel
        items={heroItems}
        isSaved={isSaved}
        onToggleSave={onToggleSave}
        onWatchNow={onWatchNow}
        onOpenDetail={onSelectItem}
        onSelectGenre={onTagGenre}
        onSelectYear={onTagYear}
        onSelectCountry={onTagCountry}
      />

      <ContinueWatchingBar
        entries={continueList}
        onOpenItemById={onOpenItemById}
        onRemoveEntry={onRemoveContinue}
        onClearAll={onClearContinue}
      />

      <StatsRibbon stats={stats} onSelectTab={onSelectTab} />

      {rails.map((rail) => (
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
    </div>
  );
};

export const HomeTabView = React.memo(HomeTabViewInner);
HomeTabView.displayName = 'HomeTabView';
