import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailModal } from './components/detail/DetailModal';
import { CatalogGridView } from './components/explore/CatalogGridView';
import { SuperExplorerView } from './components/explore/SuperExplorerView';
import { CategoryTabView } from './components/home/CategoryTabView';
import { HomeTabView } from './components/home/HomeTabView';
import { AmbientBackground } from './components/layout/AmbientBackground';
import { BottomNav } from './components/layout/BottomNav';
import { CatalogStateScreen } from './components/layout/CatalogStateScreen';
import { TopHeader } from './components/layout/TopHeader';
import { InfoRequestModal } from './components/modals/InfoRequestModal';
import { RouletteModal } from './components/modals/RouletteModal';
import { SearchOverlay } from './components/modals/SearchOverlay';
import { useCatalogData } from './hooks/useCatalogData';
import { useUserLibrary } from './hooks/useUserLibrary';
import type {
  CatalogItem,
  CategoryType,
  GridViewContext,
  NavTab,
} from './types/catalog';
import { getItemPrimaryWatchInfo } from './utils/catalogHelpers';
import {
  initTelegramWebApp,
  openTelegramLink,
  syncTelegramBackButton,
  triggerHaptic,
} from './utils/telegram';

export const App: React.FC = () => {
  const {
    stats,
    movies,
    series,
    donghua,
    allItems,
    itemById,
    loading,
    error,
    reload,
  } = useCatalogData();

  const {
    watchlistIds,
    isSaved,
    toggleSave,
    continueList,
    recordWatch,
    removeContinueItem,
    clearContinueWatching,
    isTokenWatched,
    getLastContinueForItem,
    donghuaResPref,
    setDonghuaResPref,
  } = useUserLibrary();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [exploreSubTab, setExploreSubTab] = useState<'filter' | 'watchlist'>('filter');
  const [gridContext, setGridContext] = useState<GridViewContext | null>(null);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [heroAccent, setHeroAccent] = useState<string | null>('#e11d48');

  const handleHeroAccentChange = useCallback((color?: string | null) => {
    setHeroAccent(color || '#e11d48');
  }, []);

  const [searchOpen, setSearchOpen] = useState(false);
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // Initialize Telegram Mini App SDK once
  useEffect(() => {
    initTelegramWebApp();
  }, []);

  // Sync Telegram Native BackButton with UI Layer Stack
  useEffect(() => {
    const hasOverlay =
      searchOpen ||
      rouletteOpen ||
      infoOpen ||
      Boolean(selectedItem) ||
      Boolean(gridContext) ||
      activeTab !== 'home';

    const cleanup = syncTelegramBackButton(hasOverlay, () => {
      if (searchOpen) {
        setSearchOpen(false);
      } else if (rouletteOpen) {
        setRouletteOpen(false);
      } else if (infoOpen) {
        setInfoOpen(false);
      } else if (selectedItem) {
        setSelectedItem(null);
      } else if (gridContext) {
        setGridContext(null);
      } else if (activeTab !== 'home') {
        setActiveTab('home');
      }
    });

    return cleanup;
  }, [searchOpen, rouletteOpen, infoOpen, selectedItem, gridContext, activeTab]);

  // Dynamic Ambient Color Priority: Open DetailModal -> Active Hero Slide
  const activeAmbientColor = selectedItem?.accent_color || heroAccent || '#e11d48';

  const watchlistItems = useMemo(() => {
    return watchlistIds
      .map((id) => itemById.get(id))
      .filter((x): x is CatalogItem => Boolean(x));
  }, [watchlistIds, itemById]);

  const handleSelectTab = useCallback((tab: NavTab) => {
    setGridContext(null);
    if (tab === 'explore') {
      setExploreSubTab('filter');
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoHomeTop = useCallback(() => {
    triggerHaptic('light');
    setSelectedItem(null);
    setGridContext(null);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenWatchlist = useCallback(() => {
    triggerHaptic('selection');
    setSelectedItem(null);
    setGridContext(null);
    setExploreSubTab('watchlist');
    setActiveTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleWatchNowImmediate = useCallback(
    (item: CatalogItem) => {
      const last = getLastContinueForItem(item.id);
      if (last) {
        openTelegramLink(last.link);
        return;
      }

      const info = getItemPrimaryWatchInfo(item, donghuaResPref);
      const token =
        item.category === 'movies'
          ? info.partNumber
            ? `part:${info.partNumber}`
            : 'movie:main'
          : item.category === 'series'
          ? `s${info.seasonKey || '1'}:e${info.episodeNumber || 1}`
          : `ep:${info.episodeNumber || 1}`;

      recordWatch({
        item,
        link: info.link,
        watchLabel: info.watchLabel,
        buttonLabel: info.buttonLabel,
        token,
        seasonKey: info.seasonKey,
        episodeNumber: info.episodeNumber,
        partNumber: info.partNumber,
        quality: info.quality,
      });
      openTelegramLink(info.link);
    },
    [donghuaResPref, getLastContinueForItem, recordWatch]
  );

  // Zero Dead Text Metadata Jump Handlers
  const openTagGrid = useCallback((ctx: GridViewContext) => {
    triggerHaptic('selection');
    setSelectedItem(null);
    setGridContext(ctx);
  }, []);

  const handleTagGenre = useCallback(
    (genre: string) => {
      openTagGrid({
        title: `🎭 Genre: ${genre}`,
        subtitle: `Menampilkan seluruh Film, Series, dan Donghua bergenre ${genre}`,
        breadcrumbParent: 'Beranda',
        breadcrumbLabel: `Genre: ${genre}`,
        initialFilter: { genre },
      });
    },
    [openTagGrid]
  );

  const handleTagCountry = useCallback(
    (country: string) => {
      openTagGrid({
        title: `🌏 Negara: ${country}`,
        subtitle: `Koleksi tontonan pilihan dari ${country}`,
        breadcrumbParent: 'Beranda',
        breadcrumbLabel: `Negara: ${country}`,
        initialFilter: { country },
      });
    },
    [openTagGrid]
  );

  const handleTagYear = useCallback(
    (year: number) => {
      openTagGrid({
        title: `📅 Rilisan Tahun ${year}`,
        subtitle: `Kumpulan tontonan rilisan tahun ${year}`,
        breadcrumbParent: 'Beranda',
        breadcrumbLabel: `Tahun: ${year}`,
        initialFilter: { year },
      });
    },
    [openTagGrid]
  );

  const handleTagPlatform = useCallback(
    (platform: string) => {
      openTagGrid({
        title: `📡 Platform: ${platform}`,
        subtitle: `Daftar judul dari jaringan distribusi ${platform}`,
        breadcrumbParent: 'Beranda',
        breadcrumbLabel: `Platform: ${platform}`,
        initialFilter: { platform },
      });
    },
    [openTagGrid]
  );

  const handleTagStudio = useCallback(
    (studio: string) => {
      openTagGrid({
        title: `🎨 Studio Animasi: ${studio}`,
        subtitle: `Deretan karya donghua & anime produksi ${studio}`,
        breadcrumbParent: 'Beranda',
        breadcrumbLabel: `Studio: ${studio}`,
        initialFilter: { studio },
      });
    },
    [openTagGrid]
  );

  const handleTagCast = useCallback(
    (castName: string) => {
      openTagGrid({
        title: `✨ Pemeran: ${castName}`,
        subtitle: `Daftar Film & Series yang dibintangi oleh ${castName}`,
        breadcrumbParent: 'Beranda',
        breadcrumbLabel: `Pemeran: ${castName}`,
        initialFilter: { cast: castName },
      });
    },
    [openTagGrid]
  );

  const handleTagDirector = useCallback(
    (directorName: string) => {
      openTagGrid({
        title: `🎬 Sutradara: ${directorName}`,
        subtitle: `Karya sinema & series arahan ${directorName}`,
        breadcrumbParent: 'Beranda',
        breadcrumbLabel: `Sutradara: ${directorName}`,
        initialFilter: { director: directorName },
      });
    },
    [openTagGrid]
  );

  const handleFilterCategory = useCallback(
    (cat: CategoryType) => {
      setSelectedItem(null);
      setGridContext(null);
      setActiveTab(cat);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const handleOpenItemById = useCallback(
    (id: string) => {
      const found = itemById.get(id);
      if (found) {
        triggerHaptic('light');
        setSelectedItem(found);
      }
    },
    [itemById]
  );

  return (
    <div className="relative min-h-screen w-full text-slate-100 pb-safe-dock">
      {/* Dynamic Ambient Aurora Backdrop */}
      <AmbientBackground accentColor={activeAmbientColor} />

      {/* Main Foreground Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <TopHeader
          watchlistCount={watchlistItems.length}
          onLogoClick={handleGoHomeTop}
          onOpenSearch={() => {
            triggerHaptic('light');
            setSearchOpen(true);
          }}
          onOpenRoulette={() => {
            triggerHaptic('medium');
            setRouletteOpen(true);
          }}
          onOpenWatchlist={handleOpenWatchlist}
          onOpenInfo={() => {
            triggerHaptic('light');
            setInfoOpen(true);
          }}
        />

        <main className="flex-1">
          {loading || error ? (
            <CatalogStateScreen loading={loading} error={error} onRetry={reload} />
          ) : gridContext ? (
            <CatalogGridView
              context={gridContext}
              allItems={allItems}
              onClose={() => setGridContext(null)}
              onSelectItem={setSelectedItem}
              onTagGenre={handleTagGenre}
              onTagPlatform={handleTagPlatform}
              onTagStudio={handleTagStudio}
            />
          ) : activeTab === 'home' ? (
            <HomeTabView
              stats={stats}
              movies={movies}
              series={series}
              donghua={donghua}
              allItems={allItems}
              itemById={itemById}
              continueList={continueList}
              isSaved={isSaved}
              onToggleSave={toggleSave}
              onWatchNow={handleWatchNowImmediate}
              onSelectItem={setSelectedItem}
              onOpenItemById={handleOpenItemById}
              onRemoveContinue={removeContinueItem}
              onClearContinue={clearContinueWatching}
              onSelectTab={handleSelectTab}
              onOpenGrid={openTagGrid}
              onTagGenre={handleTagGenre}
              onTagYear={handleTagYear}
              onTagCountry={handleTagCountry}
              onTagPlatform={handleTagPlatform}
              onTagStudio={handleTagStudio}
              onHeroAccentChange={handleHeroAccentChange}
            />
          ) : activeTab === 'movies' || activeTab === 'series' || activeTab === 'donghua' ? (
            <CategoryTabView
              category={activeTab}
              movies={movies}
              series={series}
              donghua={donghua}
              isSaved={isSaved}
              onToggleSave={toggleSave}
              onWatchNow={handleWatchNowImmediate}
              onSelectItem={setSelectedItem}
              onOpenGrid={openTagGrid}
              onTagGenre={handleTagGenre}
              onTagPlatform={handleTagPlatform}
              onTagStudio={handleTagStudio}
              onHeroAccentChange={handleHeroAccentChange}
            />
          ) : (
            <SuperExplorerView
              allItems={allItems}
              donghuaList={donghua}
              stats={stats}
              watchlistItems={watchlistItems}
              initialSubTab={exploreSubTab}
              onSelectItem={setSelectedItem}
              onOpenRoulette={() => setRouletteOpen(true)}
              onTagGenre={handleTagGenre}
              onTagPlatform={handleTagPlatform}
              onTagStudio={handleTagStudio}
            />
          )}
        </main>
      </div>

      {/* Floating Frosted Glass Bottom Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Luxury Detail & Episode/Resolution Selector Modal */}
      <DetailModal
        item={selectedItem}
        allItems={allItems}
        isSaved={isSaved}
        onToggleSave={toggleSave}
        isTokenWatched={isTokenWatched}
        getLastContinueForItem={getLastContinueForItem}
        onRecordWatch={recordWatch}
        donghuaResPref={donghuaResPref}
        onChangeDonghuaResPref={setDonghuaResPref}
        onClose={() => setSelectedItem(null)}
        onSelectItem={setSelectedItem}
        onFilterCategory={handleFilterCategory}
        onFilterGenre={handleTagGenre}
        onFilterCountry={handleTagCountry}
        onFilterYear={handleTagYear}
        onFilterPlatform={handleTagPlatform}
        onFilterStudio={handleTagStudio}
        onFilterCast={handleTagCast}
        onFilterDirector={handleTagDirector}
      />

      {/* Instant Search Overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        allItems={allItems}
        onClose={() => setSearchOpen(false)}
        onSelectItem={setSelectedItem}
        onOpenGrid={openTagGrid}
      />

      {/* Cinema Roulette Modal */}
      <RouletteModal
        isOpen={rouletteOpen}
        allItems={allItems}
        onClose={() => setRouletteOpen(false)}
        onOpenDetail={setSelectedItem}
        onWatchNow={handleWatchNowImmediate}
      />

      {/* Info, Stats & Request Title Modal */}
      <InfoRequestModal
        isOpen={infoOpen}
        stats={stats}
        onClose={() => setInfoOpen(false)}
      />
    </div>
  );
};

export default App;
