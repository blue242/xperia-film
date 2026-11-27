import React from 'react';
import { Compass, Film, Flame, Home, Tv } from 'lucide-react';
import type { NavTab } from '../../types/catalog';
import { triggerHaptic } from '../../utils/telegram';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

const NAV_ITEMS: Array<{
  id: NavTab;
  label: string;
  emoji: string;
  Icon: React.FC<{ className?: string }>;
}> = [
  { id: 'home', label: 'Beranda', emoji: '🏠', Icon: Home },
  { id: 'movies', label: 'Film', emoji: '🎬', Icon: Film },
  { id: 'series', label: 'Series', emoji: '📺', Icon: Tv },
  { id: 'donghua', label: 'Donghua', emoji: '🐉', Icon: Flame },
  { id: 'explore', label: 'Jelajah', emoji: '🧭', Icon: Compass },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav
      aria-label="Navigasi Utama"
      className="fixed left-1/2 z-40 w-[calc(100%-1.25rem)] max-w-lg -translate-x-1/2 bottom-safe-dock touch-manipulation"
    >
      <div className="luxury-glass flex items-center justify-between rounded-2xl px-1.5 py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.82)]">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onSelectTab(id);
              }}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-bold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-b from-rose-500/25 to-amber-500/15 text-white border border-rose-400/35 shadow-[0_0_18px_rgba(225,29,72,0.32)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-transform duration-200 ${
                  active ? 'scale-110 text-amber-300' : 'text-slate-400'
                }`}
              />
              <span className="tracking-tight leading-tight">{label}</span>
              {active && (
                <span className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-gradient-to-r from-rose-500 to-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
