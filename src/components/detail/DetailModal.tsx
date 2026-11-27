import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Check,
  Clapperboard,
  Globe,
  Heart,
  Share2,
  Sparkles,
  Tv2,
  Users,
  X,
} from 'lucide-react';
import type {
  CatalogItem,
  CategoryType,
  ContinueWatchingEntry,
  DonghuaResolutionPref,
} from '../../types/catalog';
import type { RecordWatchPayload } from '../../hooks/useUserLibrary';
import {
  getGenrePalette,
  getPlatformBadgeStyle,
  hexToRgbString,
  resolveAssetUrl,
  splitCountries,
  splitPeople,
} from '../../utils/assetUrl';
import {
  getItemPrimaryWatchInfo,
  getItemStudios,
  getSimilarItems,
  isItemCompleted,
} from '../../utils/catalogHelpers';
import { shareCatalogItem, triggerHaptic } from '../../utils/telegram';
import { PosterCard } from '../cards/PosterCard';
import { DonghuaEpisodePanel } from './DonghuaEpisodePanel';
import { MovieWatchPanel } from './MovieWatchPanel';
import { SeriesEpisodePanel } from './SeriesEpisodePanel';

interface DetailModalProps {
  item: CatalogItem | null;
  allItems: CatalogItem[];
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  isTokenWatched: (itemId: string, token: string) => boolean;
  getLastContinueForItem: (itemId: string) => ContinueWatchingEntry | undefined;
  onRecordWatch: (payload: RecordWatchPayload) => void;
  donghuaResPref: DonghuaResolutionPref;
  onChangeDonghuaResPref: (pref: DonghuaResolutionPref) => void;
  onClose: () => void;
  onSelectItem: (item: CatalogItem) => void;
  onFilterCategory: (cat: CategoryType) => void;
  onFilterGenre: (genre: string) => void;
  onFilterCountry: (country: string) => void;
  onFilterYear: (year: number) => void;
  onFilterPlatform: (platform: string) => void;
  onFilterStudio: (studio: string) => void;
  onFilterCast: (castName: string) => void;
  onFilterDirector: (directorName: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  allItems,
  isSaved,
  onToggleSave,
  isTokenWatched,
  getLastContinueForItem,
  onRecordWatch,
  donghuaResPref,
  onChangeDonghuaResPref,
  onClose,
  onSelectItem,
  onFilterCategory,
  onFilterGenre,
  onFilterCountry,
  onFilterYear,
  onFilterPlatform,
  onFilterStudio,
  onFilterCast,
  onFilterDirector,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  useEffect(() => {
    if (!item) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [item, onClose]);

  const similarItems = useMemo(() => {
    if (!item) return [];
    return getSimilarItems(item, allItems, 9);
  }, [item, allItems]);

  if (!item) return null;

  const accentRgb = hexToRgbString(item.accent_color, '225, 29, 72');
  const backdropUrl = resolveAssetUrl(item.backdrop_local || item.poster_local);
  const posterUrl = resolveAssetUrl(item.poster_local);
  const saved = isSaved(item.id);
  const completed = isItemCompleted(item);
  const countries = splitCountries(item.country);
  const directors = item.category !== 'donghua' ? splitPeople(item.director) : [];
  const castList = item.category !== 'donghua' ? item.cast || [] : [];
  const studios = getItemStudios(item);
  const lastContinue = getLastContinueForItem(item.id);

  const handleShare = () => {
    const info = getItemPrimaryWatchInfo(item, donghuaResPref);
    const sharedNatively = shareCatalogItem(item, info.link);
    if (!sharedNatively) {
      setCopiedNotice(true);
      window.setTimeout(() => setCopiedNotice(false), 2200);
    }
  };

  const categoryBadge =
    item.category === 'movies'
      ? { label: '🎬 FILM BIOSKOP', cls: 'from-emerald-500 to-teal-600' }
      : item.category === 'series'
      ? { label: '📺 DRAMA & SERIES', cls: 'from-purple-600 to-pink-600' }
      : { label: '🐉 DONGHUA & ANIME', cls: 'from-rose-600 to-amber-500' };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4"
    >
      {/* Dynamic Ambient Modal Glow Behind Card */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-65"
        style={{
          background: `radial-gradient(circle at 50% 18%, rgba(${accentRgb}, 0.42), rgba(6,6,11,0) 65%)`,
          transition: 'background 700ms ease',
        }}
      />

      {/* Modal Sheet Container */}
      <div
        ref={scrollContainerRef}
        onClick={(e) => e.stopPropagation()}
        className="slim-scrollbar relative z-10 h-[93vh] sm:h-auto sm:max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/15 bg-[#090913]/95 shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
      >
        {/* Top Floating Controls */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-2 bg-gradient-to-b from-black/85 via-black/45 to-transparent px-4 py-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onFilterCategory(item.category);
            }}
            className={`inline-flex items-center rounded-full bg-gradient-to-r ${categoryBadge.cls} px-3 py-1 text-[10.5px] font-black tracking-wider text-white shadow border border-white/25`}
          >
            {categoryBadge.label}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(item.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border backdrop-blur-xl transition-all active:scale-95 ${
                saved
                  ? 'bg-amber-500/25 border-amber-400/60 text-amber-200'
                  : 'bg-black/60 hover:bg-white/15 border-white/20 text-white'
              }`}
            >
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5 text-amber-300" />
                  <span>Tersimpan</span>
                </>
              ) : (
                <>
                  <Heart className="h-3.5 w-3.5 text-rose-400" />
                  <span>Simpan</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full bg-black/60 hover:bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xl active:scale-95 transition-all"
            >
              <Share2 className="h-3.5 w-3.5 text-sky-300" />
              <span>{copiedNotice ? 'Disalin!' : 'Bagikan'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              aria-label="Tutup Detail"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 hover:bg-rose-600 border border-white/25 text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Hero Banner Header Inside Modal */}
        <div className="relative -mt-14 h-56 sm:h-72 w-full overflow-hidden">
          <img
            src={backdropUrl}
            alt={item.title}
            className={`h-full w-full object-cover ${
              item.backdrop_local ? 'object-center' : 'scale-125 blur-xl opacity-60'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090913] via-[#090913]/65 to-black/25" />
          <div
            className="absolute inset-0 opacity-45 mix-blend-screen"
            style={{
              background: `radial-gradient(circle at 75% 25%, rgba(${accentRgb}, 0.5), transparent 65%)`,
            }}
          />
        </div>

        {/* Main Content Body */}
        <div className="relative z-10 -mt-24 sm:-mt-28 px-4 pb-8 sm:px-7 space-y-6">
          {/* Poster + Core Metadata Header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <div className="w-28 sm:w-36 shrink-0 aspect-[2/3] overflow-hidden rounded-2xl border-2 border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.9)] bg-[#131324]">
              <img src={posterUrl} alt={item.title} className="h-full w-full object-cover" />
            </div>

            <div className="flex-1 min-w-0 pt-1 sm:pt-8 space-y-3">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black leading-tight text-white">
                  {item.title}
                </h2>
                {item.original_title && item.original_title !== item.title && (
                  <p className="mt-0.5 text-xs font-medium text-slate-400">
                    Judul Asli: {item.original_title}
                  </p>
                )}
              </div>

              {/* Interactive Metadata Chips Row (Year, Rating, Status, Duration, Country, Platform) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {item.rating && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-400/45 px-2.5 py-1 text-xs font-black text-amber-300">
                    ⭐ {item.rating.toFixed(1)}
                  </span>
                )}

                {item.year && (
                  <button
                    type="button"
                    onClick={() => onFilterYear(item.year!)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-rose-500/25 border border-white/15 hover:border-rose-400/40 px-2.5 py-1 text-xs font-bold text-slate-100 transition-colors"
                  >
                    <Calendar className="h-3 w-3 text-rose-400" />
                    <span>{item.year}</span>
                  </button>
                )}

                {countries.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onFilterCountry(c)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-sky-500/25 border border-white/15 hover:border-sky-400/40 px-2.5 py-1 text-xs font-bold text-slate-100 transition-colors"
                  >
                    <Globe className="h-3 w-3 text-sky-400" />
                    <span>{c}</span>
                  </button>
                ))}

                {item.platform && (
                  <button
                    type="button"
                    onClick={() => onFilterPlatform(item.platform!)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-extrabold hover:brightness-125 transition-all ${getPlatformBadgeStyle(
                      item.platform
                    )}`}
                  >
                    <Tv2 className="h-3 w-3" />
                    <span>{item.platform}</span>
                  </button>
                )}

                {item.category === 'movies' && item.duration_label && (
                  <span className="rounded-lg bg-white/[0.07] border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-200">
                    ⏱ {item.duration_label}
                  </span>
                )}

                {item.category !== 'movies' && (
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-xs font-extrabold ${
                      completed
                        ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                        : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                    }`}
                  >
                    {completed ? '✓ TAMAT (COMPLETED)' : '🔥 ONGOING'}
                  </span>
                )}
              </div>

              {/* Clickable Genres */}
              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.genres.map((g) => {
                    const pal = getGenrePalette(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => onFilterGenre(g)}
                        className={`rounded-full border px-3 py-1 text-xs font-extrabold transition-all ${pal.bg} ${pal.text} ${pal.border}`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Synopsis Section */}
          {item.synopsis && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <h3 className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-300/90">
                Sinopsis Cerita
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-200/95">
                {item.synopsis}
              </p>
            </div>
          )}

          {/* Category-Specific Watch / Episode / Resolution Panel */}
          {item.category === 'movies' && (
            <MovieWatchPanel
              item={item}
              isTokenWatched={isTokenWatched}
              lastContinue={lastContinue}
              onRecordWatch={onRecordWatch}
            />
          )}

          {item.category === 'series' && (
            <SeriesEpisodePanel
              item={item}
              isTokenWatched={isTokenWatched}
              lastContinue={lastContinue}
              onRecordWatch={onRecordWatch}
            />
          )}

          {item.category === 'donghua' && (
            <DonghuaEpisodePanel
              item={item}
              resPref={donghuaResPref}
              onChangeResPref={onChangeDonghuaResPref}
              isTokenWatched={isTokenWatched}
              lastContinue={lastContinue}
              onRecordWatch={onRecordWatch}
            />
          )}

          {/* Interactive Cast, Director & Studio Chips (ZERO DEAD TEXT!) */}
          {(directors.length > 0 || castList.length > 0 || studios.length > 0) && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 space-y-3.5">
              <p className="text-[11px] font-semibold text-slate-400">
                💡 Tip: Klik nama pemeran, sutradara, atau studio di bawah buat langsung melihat semua tontonan mereka!
              </p>

              {studios.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Studio Animasi</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {studios.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onFilterStudio(st)}
                        className="rounded-xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/35 px-3 py-1 text-xs font-bold text-amber-100 transition-colors"
                      >
                        🎨 {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {directors.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-rose-300">
                    <Clapperboard className="h-3.5 w-3.5" />
                    <span>Sutradara</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {directors.map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => onFilterDirector(dir)}
                        className="rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/35 px-3 py-1 text-xs font-bold text-rose-100 transition-colors"
                      >
                        🎬 {dir}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {castList.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-sky-300">
                    <Users className="h-3.5 w-3.5" />
                    <span>Pemeran / Artis</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {castList.map((actor) => (
                      <button
                        key={actor}
                        type="button"
                        onClick={() => onFilterCast(actor)}
                        className="rounded-xl bg-white/[0.06] hover:bg-sky-500/25 border border-white/15 hover:border-sky-400/40 px-3 py-1 text-xs font-bold text-slate-100 hover:text-sky-100 transition-colors"
                      >
                        ✨ {actor}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Similar Recommendations Rail at Bottom */}
          {similarItems.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-rose-500 to-amber-400" />
                <h3 className="font-display text-base sm:text-lg font-extrabold text-white">
                  🔥 Tontonan Serupa Pilihan
                </h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {similarItems.slice(0, 6).map((sim) => (
                  <PosterCard
                    key={sim.id}
                    item={sim}
                    onSelect={(chosen) => onSelectItem(chosen)}
                    onTagGenre={onFilterGenre}
                    onTagPlatform={onFilterPlatform}
                    onTagStudio={onFilterStudio}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
