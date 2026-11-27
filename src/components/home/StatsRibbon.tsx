import React from 'react';
import type { CatalogStats, NavTab } from '../../types/catalog';
import { triggerHaptic } from '../../utils/telegram';

interface StatsRibbonProps {
  stats: CatalogStats | null;
  onSelectTab: (tab: NavTab) => void;
}

export const StatsRibbon: React.FC<StatsRibbonProps> = React.memo(({ stats, onSelectTab }) => {
  if (!stats) return null;

  const cards: Array<{
    tab: NavTab;
    label: string;
    value: string;
    sub: string;
    accent: string;
  }> = [
    {
      tab: 'movies',
      label: '🎬 Film Bioskop',
      value: `${stats.total_movies}`,
      sub: 'Judul HD & Sub Indo',
      accent: 'from-emerald-500/20 to-teal-500/5 border-emerald-400/25 text-emerald-300',
    },
    {
      tab: 'series',
      label: '📺 Drama & Series',
      value: `${stats.total_series}`,
      sub: `${stats.total_series_episodes} Episode Siap Putar`,
      accent: 'from-fuchsia-500/20 to-purple-500/5 border-fuchsia-400/25 text-fuchsia-300',
    },
    {
      tab: 'donghua',
      label: '🐉 Donghua & Anime',
      value: `${stats.total_donghua}`,
      sub: `${stats.total_donghua_episodes.toLocaleString('id-ID')} Episode Multi-Res`,
      accent: 'from-amber-500/20 to-rose-500/5 border-amber-400/25 text-amber-300',
    },
    {
      tab: 'explore',
      label: '🧭 Super Explorer',
      value: `${stats.genres.length} Genre`,
      sub: `${stats.countries.length} Negara & Filter Artis`,
      accent: 'from-sky-500/20 to-indigo-500/5 border-sky-400/25 text-sky-300',
    },
  ];

  return (
    <section className="mx-auto mt-4 w-full max-w-7xl px-3 sm:px-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {cards.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onSelectTab(c.tab);
            }}
            className={`group flex flex-col justify-between rounded-xl sm:rounded-2xl bg-[#111120]/92 bg-gradient-to-br ${c.accent} border p-2.5 sm:p-3.5 text-left md:hover:brightness-125 active:scale-[0.98] transition-transform`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-200">{c.label}</span>
              <span className="text-[10px] font-bold opacity-70 group-hover:translate-x-0.5 transition-transform">
                Buka ›
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-display text-lg sm:text-2xl font-black text-white">
                {c.value}
              </span>
              <span className="truncate text-[10px] sm:text-[11px] font-medium text-slate-300/90">
                {c.sub}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
});

StatsRibbon.displayName = 'StatsRibbon';
