import React, { useEffect, useMemo, useState } from 'react';
import { Check, Play, Search, Tv } from 'lucide-react';
import type { ContinueWatchingEntry, SeriesEpisode, SeriesItem } from '../../types/catalog';
import type { RecordWatchPayload } from '../../hooks/useUserLibrary';
import { openTelegramLink, triggerHaptic } from '../../utils/telegram';

interface SeriesEpisodePanelProps {
  item: SeriesItem;
  isTokenWatched: (itemId: string, token: string) => boolean;
  lastContinue?: ContinueWatchingEntry;
  onRecordWatch: (payload: RecordWatchPayload) => void;
}

export const SeriesEpisodePanel: React.FC<SeriesEpisodePanelProps> = ({
  item,
  isTokenWatched,
  lastContinue,
  onRecordWatch,
}) => {
  const seasonKeys = useMemo(
    () => Object.keys(item.seasons || {}).sort((a, b) => Number(a) - Number(b)),
    [item.seasons]
  );

  const [selectedSeason, setSelectedSeason] = useState<string>(
    lastContinue?.seasonKey && item.seasons?.[lastContinue.seasonKey]
      ? lastContinue.seasonKey
      : seasonKeys[0] || '1'
  );
  const [epQuery, setEpQuery] = useState('');

  useEffect(() => {
    const initial =
      lastContinue?.seasonKey && item.seasons?.[lastContinue.seasonKey]
        ? lastContinue.seasonKey
        : seasonKeys[0] || '1';
    setSelectedSeason(initial);
    setEpQuery('');
  }, [item.id, lastContinue?.seasonKey, item.seasons, seasonKeys]);

  const rawEpisodes: SeriesEpisode[] = useMemo(() => {
    const list = item.seasons?.[selectedSeason] || [];
    return [...list].sort((a, b) => a.episode - b.episode);
  }, [item.seasons, selectedSeason]);

  const filteredEpisodes = useMemo(() => {
    const q = epQuery.trim();
    if (!q) return rawEpisodes;
    return rawEpisodes.filter((ep) => String(ep.episode).includes(q));
  }, [rawEpisodes, epQuery]);

  const handlePlayEpisode = (seasonKey: string, ep: SeriesEpisode) => {
    const token = `s${seasonKey}:e${ep.episode}`;
    onRecordWatch({
      item,
      link: ep.link,
      watchLabel: `S.${seasonKey} • Ep ${ep.episode}`,
      buttonLabel: `Lanjut Ep ${ep.episode}`,
      token,
      seasonKey,
      episodeNumber: ep.episode,
    });
    openTelegramLink(ep.link);
  };

  const quickTarget = useMemo(() => {
    if (lastContinue?.seasonKey && lastContinue.episodeNumber) {
      const sList = item.seasons?.[lastContinue.seasonKey] || [];
      const found = sList.find((e) => e.episode === lastContinue.episodeNumber);
      if (found) return { seasonKey: lastContinue.seasonKey, ep: found, isResume: true };
    }
    const firstS = seasonKeys[0] || '1';
    const firstEp = item.seasons?.[firstS]?.[0];
    if (firstEp) return { seasonKey: firstS, ep: firstEp, isResume: false };
    return null;
  }, [item.seasons, lastContinue, seasonKeys]);

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5 space-y-4">
      {/* Header + Quick Resume CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Tv className="h-4 w-4 text-fuchsia-400" />
          <div>
            <h3 className="font-display text-sm sm:text-base font-extrabold text-white">
              Pilih Season & Episode
            </h3>
            <p className="text-[11px] text-slate-400">
              {rawEpisodes.length} episode tersedia di Season {selectedSeason}
              {item.total_episodes ? ` (Total ${item.total_episodes} Ep)` : ''}
            </p>
          </div>
        </div>

        {quickTarget && (
          <button
            type="button"
            onClick={() => handlePlayEpisode(quickTarget.seasonKey, quickTarget.ep)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-rose-600 to-amber-500 hover:brightness-110 px-3.5 py-2 text-xs font-black text-white shadow-[0_6px_20px_rgba(217,70,239,0.4)] border border-white/20 active:scale-95 transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>
              {quickTarget.isResume
                ? `Lanjut S.${quickTarget.seasonKey} Ep ${quickTarget.ep.episode}`
                : `Mulai Ep ${quickTarget.ep.episode}`}
            </span>
          </button>
        )}
      </div>

      {/* Season Tabs + Episode Number Jump Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="horizontal-rail-scroll no-scrollbar flex items-center gap-1.5 overflow-x-auto overflow-y-hidden py-0.5">
          {seasonKeys.map((sk) => {
            const active = sk === selectedSeason;
            const epCount = item.seasons?.[sk]?.length || 0;
            return (
              <button
                key={sk}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedSeason(sk);
                }}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-extrabold border transition-all ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-fuchsia-300/50 shadow'
                    : 'bg-white/[0.05] hover:bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                Season {sk} ({epCount})
              </button>
            );
          })}
        </div>

        {rawEpisodes.length > 6 && (
          <div className="relative w-full sm:w-48">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              inputMode="numeric"
              value={epQuery}
              onChange={(e) => setEpQuery(e.target.value)}
              placeholder="Lompat nomor ep..."
              className="w-full rounded-xl bg-black/50 border border-white/15 py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Episode Buttons Grid */}
      {filteredEpisodes.length > 0 ? (
        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {filteredEpisodes.map((ep) => {
            const token = `s${selectedSeason}:e${ep.episode}`;
            const watched = isTokenWatched(item.id, token);
            const isLast =
              lastContinue?.seasonKey === selectedSeason &&
              lastContinue?.episodeNumber === ep.episode;

            return (
              <button
                key={ep.episode}
                type="button"
                onClick={() => handlePlayEpisode(selectedSeason, ep)}
                className={`group flex items-center justify-between gap-1 rounded-xl border px-2.5 py-2.5 text-xs font-extrabold transition-all active:scale-95 ${
                  isLast
                    ? 'bg-gradient-to-r from-amber-500/35 to-rose-500/25 border-amber-400 text-amber-100 shadow-[0_0_16px_rgba(245,158,11,0.38)]'
                    : watched
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25'
                    : 'bg-white/[0.05] hover:bg-fuchsia-500/20 border-white/12 hover:border-fuchsia-400/40 text-slate-100'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3 fill-current opacity-80 group-hover:text-amber-300" />
                  <span>Ep {ep.episode}</span>
                </span>
                {watched && (
                  <Check
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isLast ? 'text-amber-300' : 'text-emerald-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="py-4 text-center text-xs text-slate-400">
          Episode dengan nomor "{epQuery}" tidak ditemukan di Season {selectedSeason}.
        </p>
      )}
    </div>
  );
};
