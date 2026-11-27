import React from 'react';
import { Check, Film, Play } from 'lucide-react';
import type { ContinueWatchingEntry, MovieItem } from '../../types/catalog';
import type { RecordWatchPayload } from '../../hooks/useUserLibrary';
import { openTelegramLink } from '../../utils/telegram';

interface MovieWatchPanelProps {
  item: MovieItem;
  isTokenWatched: (itemId: string, token: string) => boolean;
  lastContinue?: ContinueWatchingEntry;
  onRecordWatch: (payload: RecordWatchPayload) => void;
}

export const MovieWatchPanel: React.FC<MovieWatchPanelProps> = ({
  item,
  isTokenWatched,
  lastContinue,
  onRecordWatch,
}) => {
  const qualityText = item.quality || 'HD';
  const mainWatched = isTokenWatched(item.id, 'movie:main');
  const hasParts = Boolean(item.parts && item.parts.length > 0);

  const handlePlayMain = () => {
    const link = hasParts && item.parts[0]?.link ? item.parts[0].link : item.video_link;
    onRecordWatch({
      item,
      link,
      watchLabel: hasParts ? `Part 1 • ${qualityText}` : `Film • ${qualityText}`,
      buttonLabel: hasParts ? 'Lanjut Part 1' : 'Tonton Film',
      token: hasParts ? 'part:1' : 'movie:main',
      partNumber: hasParts ? 1 : undefined,
      quality: qualityText,
    });
    openTelegramLink(link);
  };

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-emerald-400" />
          <h3 className="font-display text-sm sm:text-base font-extrabold text-white">
            Pemutar Instan Telegram
          </h3>
        </div>
        <span className="rounded-full bg-emerald-500/20 border border-emerald-400/35 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
          Kualitas {qualityText} • Sub Indo
        </span>
      </div>

      {/* Primary Big Glowing Watch Button */}
      <button
        type="button"
        onClick={handlePlayMain}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:brightness-110 px-5 py-3.5 text-sm sm:text-base font-black text-white shadow-[0_12px_32px_rgba(225,29,72,0.5)] border border-white/25 active:scale-[0.99] transition-all"
      >
        <Play className="h-5 w-5 fill-white" />
        <span>
          {hasParts
            ? `Tonton Film Sekarang — Mulai Part 1 (${qualityText})`
            : `Tonton Film Sekarang (${qualityText})`}
        </span>
        {mainWatched && !hasParts && (
          <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold text-amber-200">
            <Check className="h-3 w-3" /> Ditonton
          </span>
        )}
      </button>

      {/* Multi-Part Buttons (for 2+ Part Movies) */}
      {hasParts && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-bold text-amber-200/90">
            🎞️ Film ini terbagi menjadi {item.parts.length} bagian — pilih bagian yang ingin diputar:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {item.parts.map((p) => {
              const token = `part:${p.part}`;
              const watched = isTokenWatched(item.id, token);
              const isLast = lastContinue?.partNumber === p.part;

              return (
                <button
                  key={p.part}
                  type="button"
                  onClick={() => {
                    const q = p.quality || qualityText;
                    onRecordWatch({
                      item,
                      link: p.link,
                      watchLabel: `Part ${p.part} • ${q}`,
                      buttonLabel: `Lanjut Part ${p.part}`,
                      token,
                      partNumber: p.part,
                      quality: q,
                    });
                    openTelegramLink(p.link);
                  }}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-extrabold transition-all active:scale-95 ${
                    isLast
                      ? 'bg-gradient-to-r from-amber-500/30 to-rose-500/25 border-amber-400 text-amber-100 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                      : watched
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25'
                      : 'bg-white/[0.06] hover:bg-white/[0.14] border-white/15 text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Play className="h-3.5 w-3.5 fill-current text-rose-400" />
                    <span>Tonton {p.label || `Part ${p.part}`}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold">
                    <span className="rounded bg-black/35 px-1.5 py-0.5 text-emerald-300">
                      {p.quality || qualityText}
                    </span>
                    {watched && <Check className="h-3.5 w-3.5 text-amber-300" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
