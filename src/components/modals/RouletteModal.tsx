import React, { useEffect, useMemo, useState } from 'react';
import { Dices, Info, Play, X } from 'lucide-react';
import type { CatalogItem, CategoryType } from '../../types/catalog';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { triggerHaptic } from '../../utils/telegram';

interface RouletteModalProps {
  isOpen: boolean;
  allItems: CatalogItem[];
  onClose: () => void;
  onOpenDetail: (item: CatalogItem) => void;
  onWatchNow: (item: CatalogItem) => void;
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  allItems,
  onClose,
  onOpenDetail,
  onWatchNow,
}) => {
  const [scope, setScope] = useState<'all' | CategoryType>('all');
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<CatalogItem | null>(null);
  const spinIntervalRef = React.useRef<number | null>(null);

  const clearSpinInterval = () => {
    if (spinIntervalRef.current !== null) {
      window.clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
  };

  const pool = useMemo(() => {
    if (scope === 'all') return allItems;
    return allItems.filter((i) => i.category === scope);
  }, [allItems, scope]);

  const spinNow = (customPool?: CatalogItem[]) => {
    const activePool = customPool ?? pool;
    if (activePool.length === 0) return;

    clearSpinInterval();
    setSpinning(true);
    let step = 0;
    const totalSteps = 11;

    spinIntervalRef.current = window.setInterval(() => {
      const rnd = activePool[Math.floor(Math.random() * activePool.length)];
      setPicked(rnd);
      triggerHaptic('selection');
      step += 1;

      if (step >= totalSteps) {
        clearSpinInterval();
        const finalChoice = activePool[Math.floor(Math.random() * activePool.length)];
        setPicked(finalChoice);
        setSpinning(false);
        triggerHaptic('success');
      }
    }, 85);
  };

  useEffect(() => {
    if (isOpen && allItems.length > 0) {
      spinNow(pool);
    } else if (!isOpen) {
      clearSpinInterval();
      setSpinning(false);
    }
    return () => {
      clearSpinInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cinema Roulette"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slim-scrollbar luxury-glass relative max-h-[90vh] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-3xl p-5"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-amber-500 text-white shadow">
              <Dices className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
            </span>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black text-white">
                Cinema Roulette
              </h2>
              <p className="text-[11px] text-slate-400">
                Bingung mau nonton apa? Biar mesin sinema pilihkan!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Roulette"
            className="rounded-full bg-white/10 hover:bg-rose-600 p-1.5 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scope Selector */}
        <div className="mt-3.5 grid grid-cols-4 gap-1.5">
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'movies', label: '🎬 Film' },
              { id: 'series', label: '📺 Series' },
              { id: 'donghua', label: '🐉 Donghua' },
            ] as const
          ).map((tab) => {
            const active = scope === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={spinning}
                onClick={() => {
                  setScope(tab.id);
                  const nextPool =
                    tab.id === 'all'
                      ? allItems
                      : allItems.filter((x) => x.category === tab.id);
                  spinNow(nextPool);
                }}
                className={`rounded-xl py-1.5 text-[11px] font-extrabold border transition-all ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white border-white/25'
                    : 'bg-white/[0.05] text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Picked Card Display */}
        {picked && (
          <div className="mt-4 rounded-2xl border border-white/15 bg-black/50 p-3.5">
            <div className="flex gap-3.5">
              <div className="w-24 shrink-0 aspect-[2/3] overflow-hidden rounded-xl border border-white/20 bg-[#121220] shadow-lg">
                <img
                  src={resolveAssetUrl(picked.poster_local)}
                  alt={picked.title}
                  draggable={false}
                  className={`h-full w-full object-cover transition-transform duration-200 ${
                    spinning ? 'scale-105 blur-[1px]' : 'scale-100'
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 text-[10px] font-black uppercase text-amber-200">
                      {picked.category === 'movies'
                        ? 'FILM'
                        : picked.category === 'series'
                        ? 'SERIES'
                        : 'DONGHUA'}
                    </span>
                    {picked.rating && (
                      <span className="text-xs font-extrabold text-amber-300">
                        ⭐ {picked.rating.toFixed(1)}
                      </span>
                    )}
                    {picked.year && (
                      <span className="text-xs font-semibold text-slate-400">
                        • {picked.year}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-1 font-display text-base font-black text-white line-clamp-2">
                    {picked.title}
                  </h3>

                  <p className="mt-1 text-[11px] text-rose-200/90 truncate">
                    {(picked.genres || []).slice(0, 3).join(' • ')}
                  </p>

                  {picked.synopsis && (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300 line-clamp-3">
                      {picked.synopsis}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={spinning}
                onClick={() => spinNow()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 py-2.5 text-xs font-extrabold text-amber-200 active:scale-95 transition-all"
              >
                <Dices className="h-3.5 w-3.5" />
                <span>Putar Lagi</span>
              </button>

              <button
                type="button"
                disabled={spinning}
                onClick={() => {
                  onClose();
                  onOpenDetail(picked);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 py-2.5 text-xs font-extrabold text-white active:scale-95 transition-all"
              >
                <Info className="h-3.5 w-3.5 text-sky-300" />
                <span>Detail</span>
              </button>

              <button
                type="button"
                disabled={spinning}
                onClick={() => {
                  onClose();
                  onWatchNow(picked);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:brightness-110 py-2.5 text-xs font-black text-white shadow active:scale-95 transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Tonton</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
