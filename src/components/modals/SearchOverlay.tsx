import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, Sparkles, X } from 'lucide-react';
import type { CatalogItem, GridViewContext } from '../../types/catalog';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { searchCatalogInstant } from '../../utils/catalogHelpers';
import { triggerHaptic } from '../../utils/telegram';

interface SearchOverlayProps {
  isOpen: boolean;
  allItems: CatalogItem[];
  onClose: () => void;
  onSelectItem: (item: CatalogItem) => void;
  onOpenGrid: (ctx: GridViewContext) => void;
}

const QUICK_SUGGESTIONS: Array<{ label: string; query?: string; genre?: string; country?: string }> = [
  { label: '🇰🇷 Drakor & Film Korea', country: 'Korea Selatan' },
  { label: '🇨🇳 Kultivasi & China', country: 'China' },
  { label: '👻 Horror & Mistis', genre: 'Horror' },
  { label: '💥 Action & Pertarungan', genre: 'Action' },
  { label: '💕 Romance Baper', genre: 'Romance' },
  { label: '🔮 Fantasy & Sci-Fi', genre: 'Fantasy' },
  { label: '🕵️ Mystery & Thriller', genre: 'Mystery' },
  { label: '🇮🇩 Film Indonesia', country: 'Indonesia' },
];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  allItems,
  onClose,
  onSelectItem,
  onOpenGrid,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    return searchCatalogInstant(allItems, query, 30);
  }, [allItems, query]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Instan"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/88 p-3 sm:p-6 pt-4 sm:pt-10"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="luxury-glass flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl"
      >
        {/* Top Search Input */}
        <div className="flex items-center gap-2.5 border-b border-white/12 px-4 py-3.5">
          <Search className="h-5 w-5 text-rose-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik judul, pemeran, sutradara, genre, studio..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white"
            >
              Hapus
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Pencarian"
            className="rounded-full bg-white/10 hover:bg-rose-600 p-1.5 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results or Quick Suggestions */}
        <div className="slim-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-4">
          {!query.trim() ? (
            <div className="space-y-4">
              <div>
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Pintasan Eksplorasi Cepat</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        onClose();
                        onOpenGrid({
                          title: sug.label,
                          subtitle: 'Koleksi tersaring instan siap tonton',
                          breadcrumbParent: 'Pencarian',
                          breadcrumbLabel: sug.label,
                          initialFilter: {
                            genre: sug.genre || '',
                            country: sug.country || '',
                            query: sug.query || '',
                          },
                        });
                      }}
                      className="rounded-xl bg-white/[0.06] hover:bg-rose-500/25 border border-white/12 hover:border-rose-400/40 px-3 py-2 text-xs font-bold text-slate-100 transition-all"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-slate-300/90">
                🔍 <strong>Mesin Pencari Cerdas:</strong> Lo bisa langsung ketik nama artis favorit (contoh:{' '}
                <button
                  type="button"
                  onClick={() => setQuery('Tom Hiddleston')}
                  className="font-bold text-amber-300 underline"
                >
                  Tom Hiddleston
                </button>
                ,{' '}
                <button
                  type="button"
                  onClick={() => setQuery('Shin Min-a')}
                  className="font-bold text-amber-300 underline"
                >
                  Shin Min-a
                </button>
                ), studio animasi (
                <button
                  type="button"
                  onClick={() => setQuery('Cloud Art')}
                  className="font-bold text-amber-300 underline"
                >
                  Cloud Art
                </button>
                ), atau kata judul apa saja!
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  Hasil instan untuk <strong className="text-white">"{query}"</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const qClean = query.trim();
                    onClose();
                    onOpenGrid({
                      title: `Hasil Pencarian: "${qClean}"`,
                      breadcrumbParent: 'Pencarian',
                      breadcrumbLabel: qClean,
                      initialFilter: { query: qClean },
                    });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300 hover:underline"
                >
                  <span>Buka di Grid 3 Kolom</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {results.map(({ item, matchBadge }) => {
                const catStyle =
                  item.category === 'movies'
                    ? { text: 'FILM', cls: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/35' }
                    : item.category === 'series'
                    ? { text: 'SERIES', cls: 'bg-fuchsia-500/25 text-fuchsia-300 border-fuchsia-400/35' }
                    : { text: 'DONGHUA', cls: 'bg-rose-500/25 text-rose-300 border-rose-400/35' };

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onClose();
                      onSelectItem(item);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 p-2.5 text-left transition-all"
                  >
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-xl bg-[#11111d] border border-white/15">
                      <img
                        src={resolveAssetUrl(item.poster_local)}
                        alt={item.title}
                        loading="lazy"
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded border px-1.5 py-0.2 text-[9.5px] font-black ${catStyle.cls}`}
                        >
                          {catStyle.text}
                        </span>
                        {item.rating && (
                          <span className="text-[11px] font-extrabold text-amber-300">
                            ⭐ {item.rating.toFixed(1)}
                          </span>
                        )}
                        {item.year && (
                          <span className="text-[11px] font-semibold text-slate-400">
                            • {item.year}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-0.5 truncate font-display text-sm font-bold text-white">
                        {item.title}
                      </h4>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                        {matchBadge ? (
                          <span className="rounded bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.2 text-[10px] font-bold text-amber-200">
                            {matchBadge}
                          </span>
                        ) : (
                          <span className="truncate">
                            {(item.genres || []).slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-2xl mb-1">🔎</p>
              <p className="font-display text-sm font-bold text-white">
                Tidak ditemukan hasil untuk "{query}"
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Coba gunakan kata kunci lebih pendek, nama negara, atau genre.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
