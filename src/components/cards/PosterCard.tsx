import React, { useState } from 'react';
import type { CatalogItem } from '../../types/catalog';
import {
  getGenrePalette,
  getPlatformBadgeStyle,
  getShortCountry,
  resolveAssetUrl,
} from '../../utils/assetUrl';
import { getItemStudios, isItemCompleted } from '../../utils/catalogHelpers';
import { triggerHaptic } from '../../utils/telegram';

interface PosterCardProps {
  item: CatalogItem;
  onSelect: (item: CatalogItem) => void;
  onTagGenre?: (genre: string) => void;
  onTagPlatform?: (platform: string) => void;
  onTagStudio?: (studio: string) => void;
  className?: string;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  item,
  onSelect,
  onTagGenre,
  onTagPlatform,
  onTagStudio,
  className = '',
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const posterSrc = resolveAssetUrl(item.poster_local);
  const completed = isItemCompleted(item);
  const shortCountry = getShortCountry(item.country);
  const primaryGenre = item.genres?.[0];
  const secondaryGenre = item.genres?.[1];
  const studios = getItemStudios(item);
  const primaryStudio = studios[0];

  const handleCardClick = () => {
    triggerHaptic('light');
    onSelect(item);
  };

  return (
    <article
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`group luxury-card-frame relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer select-none ${className}`}
    >
      {/* 2:3 Poster Frame with 4-Corner Rich Badges */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#10101c]">
        {/* Shimmer skeleton before image loads */}
        {!imgLoaded && !imgError && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${item.accent_color || '#1f1f35'}33 0%, #0d0d18 100%)`,
            }}
          />
        )}

        {!imgError ? (
          <img
            src={posterSrc}
            alt={item.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center p-3 text-center"
            style={{
              background: `radial-gradient(circle at top, ${
                item.accent_color || '#e11d48'
              }55, #090912 80%)`,
            }}
          >
            <span className="text-2xl mb-1">🎬</span>
            <span className="font-display text-xs font-bold text-white/90 line-clamp-3">
              {item.title}
            </span>
          </div>
        )}

        {/* Top subtle vignette & Bottom rich dark gradient for crisp corner legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

        {/* ==================== CATEGORY 1: MOVIES ==================== */}
        {item.category === 'movies' && (
          <>
            {/* Top-Left: Rating or BARU */}
            <div className="absolute left-1.5 top-1.5 z-10">
              {item.rating ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/35 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow">
                  <span className="text-amber-400">⭐</span>
                  <span>{item.rating.toFixed(1)}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500/90 to-yellow-600/90 border border-amber-200/40 px-1.5 py-0.5 text-[9.5px] font-extrabold text-black shadow">
                  🎬 BARU
                </span>
              )}
            </div>

            {/* Top-Right: Emerald Quality + Multi-part indicator */}
            <div className="absolute right-1.5 top-1.5 z-10 flex flex-col items-end gap-1">
              <span
                className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-black tracking-wide text-white shadow-[0_2px_10px_rgba(16,185,129,0.5)] border border-emerald-300/35"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }}
              >
                {item.quality || 'HD'}
              </span>
              {item.parts && item.parts.length > 1 && (
                <span className="inline-flex items-center rounded bg-amber-500/95 px-1.5 py-0.5 text-[8.5px] font-black tracking-tight text-black shadow">
                  {item.parts.length} PART
                </span>
              )}
            </div>

            {/* Bottom-Left & Bottom-Right */}
            <div className="absolute inset-x-1.5 bottom-1.5 z-10 flex items-center justify-between gap-1">
              <span className="text-[10.5px] font-extrabold tracking-tight text-slate-100 drop-shadow">
                {item.year || '2026'}
              </span>
              <span className="inline-flex items-center rounded bg-white/15 backdrop-blur-md border border-white/15 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-100">
                {item.duration_label || shortCountry || 'SUB'}
              </span>
            </div>
          </>
        )}

        {/* ==================== CATEGORY 2: SERIES ==================== */}
        {item.category === 'series' && (
          <>
            {/* Top-Left: Rating or HOT */}
            <div className="absolute left-1.5 top-1.5 z-10">
              {item.rating ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/35 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow">
                  <span className="text-amber-400">⭐</span>
                  <span>{item.rating.toFixed(1)}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 border border-orange-300/40 px-1.5 py-0.5 text-[9.5px] font-extrabold text-white shadow">
                  🔥 HOT
                </span>
              )}
            </div>

            {/* Top-Right: LK21 Signature Vertical Ribbon */}
            <div
              className="lk21-ribbon absolute right-2 top-0 z-20 flex min-w-[30px] flex-col items-center justify-start px-1.5 pt-1 pb-2.5 text-white shadow-[0_4px_14px_rgba(0,0,0,0.65)]"
              style={{
                background: completed
                  ? 'linear-gradient(180deg, #d97706 0%, #f59e0b 100%)'
                  : 'linear-gradient(180deg, #9333ea 0%, #ec4899 100%)',
              }}
            >
              <span className="text-[7.5px] font-extrabold uppercase tracking-wider leading-none opacity-95">
                EPS
              </span>
              <span className="mt-0.5 font-display text-[13px] font-black leading-none drop-shadow">
                {item.latest_episode || item.uploaded_episodes || 1}
              </span>
            </div>

            {/* Bottom-Left & Bottom-Right */}
            <div className="absolute inset-x-1.5 bottom-1.5 z-10 flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-100 drop-shadow">
                <span>{item.year || '2026'}</span>
                {shortCountry && (
                  <span className="rounded bg-white/15 px-1 py-0.2 text-[8.5px] text-amber-200">
                    {shortCountry}
                  </span>
                )}
              </span>
              <span className="rounded bg-fuchsia-500/30 backdrop-blur-md border border-fuchsia-300/35 px-1.5 py-0.5 font-display text-[10px] font-black tracking-wide text-fuchsia-100">
                {item.season_label || 'S.1'}
              </span>
            </div>
          </>
        )}

        {/* ==================== CATEGORY 3: DONGHUA ==================== */}
        {item.category === 'donghua' && (
          <>
            {/* Top-Left: Anichin Style Diagonal COMPLETED Ribbon OR Fire Ongoing + Score */}
            {completed ? (
              <>
                <div className="anichin-diagonal-ribbon">COMPLETED</div>
                {item.rating && (
                  <div className="absolute left-1.5 top-8 z-10">
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/35 px-1.5 py-0.5 text-[9.5px] font-extrabold text-white shadow">
                      <span className="text-amber-400">⭐</span>
                      <span>{item.rating.toFixed(1)}</span>
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute left-1.5 top-1.5 z-10 flex items-center gap-1">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 text-[11px] shadow-[0_0_12px_rgba(249,115,22,0.8)] border border-amber-200/40">
                  🔥
                </span>
                {item.rating && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/30 px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                    <span className="text-amber-400">⭐</span>
                    <span>{item.rating.toFixed(1)}</span>
                  </span>
                )}
              </div>
            )}

            {/* Top-Right: Coral Red Donghua Capsule */}
            <div className="absolute right-1.5 top-1.5 z-10">
              <span
                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-white shadow-[0_2px_10px_rgba(244,63,94,0.45)] border border-rose-200/30"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)',
                }}
              >
                Donghua
              </span>
            </div>

            {/* Bottom-Left: Orange-Red Ep Badge & Bottom-Right: Gold Sub Capsule */}
            <div className="absolute inset-x-1.5 bottom-1.5 z-10 flex items-center justify-between gap-1">
              <span className="inline-flex items-center rounded-md bg-gradient-to-r from-orange-600 to-rose-600 border border-orange-300/35 px-1.5 py-0.5 text-[9.5px] font-black tracking-tight text-white shadow">
                Ep {item.latest_episode || item.total_uploaded_episodes || 1}
                {completed ? ' END' : ''}
              </span>
              <span className="inline-flex items-center rounded-md bg-[#f59e0b] px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-tight text-black shadow">
                Sub
              </span>
            </div>
          </>
        )}
      </div>

      {/* Below Poster Metadata Strip + Crisp 2-Line Title */}
      <div className="flex flex-1 flex-col justify-between gap-1.5 p-2 sm:p-2.5">
        {/* Interactive Micro Pills (Genre / Platform / Studio) */}
        <div className="flex flex-wrap items-center gap-1 overflow-hidden max-h-[20px]">
          {primaryGenre && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onTagGenre) {
                  triggerHaptic('selection');
                  onTagGenre(primaryGenre);
                }
              }}
              className={`rounded border px-1.5 py-0.2 text-[9px] font-bold leading-4 transition-colors ${
                getGenrePalette(primaryGenre).bg
              } ${getGenrePalette(primaryGenre).text} ${getGenrePalette(primaryGenre).border}`}
            >
              {primaryGenre}
            </button>
          )}

          {item.category === 'series' && item.platform ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onTagPlatform && item.platform) {
                  triggerHaptic('selection');
                  onTagPlatform(item.platform);
                }
              }}
              className={`rounded border px-1.5 py-0.2 text-[9px] font-bold leading-4 truncate max-w-[72px] ${getPlatformBadgeStyle(
                item.platform
              )}`}
            >
              {item.platform}
            </button>
          ) : item.category === 'donghua' && primaryStudio ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onTagStudio) {
                  triggerHaptic('selection');
                  onTagStudio(primaryStudio);
                }
              }}
              className="rounded border border-amber-400/25 bg-amber-500/10 hover:bg-amber-500/25 px-1.5 py-0.2 text-[9px] font-semibold leading-4 text-amber-200 truncate max-w-[82px]"
            >
              {primaryStudio}
            </button>
          ) : secondaryGenre ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onTagGenre) {
                  triggerHaptic('selection');
                  onTagGenre(secondaryGenre);
                }
              }}
              className={`rounded border px-1.5 py-0.2 text-[9px] font-bold leading-4 transition-colors ${
                getGenrePalette(secondaryGenre).bg
              } ${getGenrePalette(secondaryGenre).text} ${getGenrePalette(secondaryGenre).border}`}
            >
              {secondaryGenre}
            </button>
          ) : null}
        </div>

        {/* Title (Max 2 Lines) */}
        <h3 className="font-display text-[12px] sm:text-[13.5px] font-bold leading-[1.28] text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 min-h-[2.5em]">
          {item.title}
        </h3>
      </div>
    </article>
  );
};
