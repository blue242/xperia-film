import React, { useState } from 'react';
import { ChevronDown, ChevronUp, History, Play, Trash2, X } from 'lucide-react';
import type { ContinueWatchingEntry } from '../../types/catalog';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { openTelegramLink } from '../../utils/telegram';

interface ContinueWatchingBarProps {
  entries: ContinueWatchingEntry[];
  onOpenItemById: (itemId: string) => void;
  onRemoveEntry: (itemId: string) => void;
  onClearAll: () => void;
}

export const ContinueWatchingBar: React.FC<ContinueWatchingBarProps> = React.memo(({
  entries,
  onOpenItemById,
  onRemoveEntry,
  onClearAll,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (entries.length === 0) return null;

  return (
    <section className="mx-auto mt-4 w-full max-w-7xl px-3 sm:px-5">
      <div className="overflow-hidden rounded-2xl border border-amber-400/35 bg-gradient-to-r from-[#1f170d]/95 via-[#12111f]/96 to-[#1e1017]/95 shadow-lg">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="flex items-center gap-2 text-left"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-black shadow">
              <History className="h-3.5 w-3.5 stroke-[2.5]" />
            </span>
            <div>
              <span className="font-display text-xs sm:text-sm font-extrabold tracking-wide text-amber-200">
                ▶ Lanjutkan Menonton
              </span>
              <span className="ml-2 rounded-full bg-amber-400/20 border border-amber-300/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                {entries.length}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1.5">
            {!collapsed && entries.length > 1 && (
              <button
                type="button"
                onClick={onClearAll}
                title="Bersihkan Riwayat"
                className="inline-flex items-center gap-1 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 px-2 py-1 text-[10.5px] font-semibold text-slate-300 hover:text-rose-200 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden xs:inline">Bersihkan</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? 'Buka Riwayat' : 'Tutup Riwayat'}
              className="rounded-lg bg-white/5 hover:bg-white/15 p-1 text-amber-200 transition-colors"
            >
              {collapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Cards */}
        {!collapsed && (
          <div className="horizontal-rail-scroll no-scrollbar flex gap-2.5 overflow-x-auto overflow-y-hidden px-3.5 pb-3.5 pt-0.5 sm:px-4">
            {entries.map((entry) => (
              <div
                key={entry.itemId}
                onClick={() => onOpenItemById(entry.itemId)}
                className="group relative flex w-[250px] sm:w-[275px] shrink-0 cursor-pointer items-center gap-2.5 rounded-xl bg-black/55 hover:bg-black/75 border border-amber-300/20 hover:border-amber-300/45 p-2 transition-all select-none"
              >
                {/* Poster Thumbnail */}
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-[#121220]">
                  <img
                    src={resolveAssetUrl(entry.posterLocal)}
                    alt={entry.title}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Details + Direct Resume Action */}
                <div className="min-w-0 flex-1 pr-4">
                  <p className="truncate font-display text-xs font-bold text-white group-hover:text-amber-200">
                    {entry.title}
                  </p>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-amber-300/90">
                    {entry.watchLabel}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTelegramLink(entry.link);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 px-2.5 py-1 text-[10.5px] font-black text-black shadow"
                  >
                    <Play className="h-2.5 w-2.5 fill-black" />
                    <span>{entry.buttonLabel}</span>
                  </button>
                </div>

                {/* Remove Single Item */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveEntry(entry.itemId);
                  }}
                  aria-label={`Hapus ${entry.title} dari riwayat`}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/10 hover:bg-rose-600 p-1 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

ContinueWatchingBar.displayName = 'ContinueWatchingBar';
