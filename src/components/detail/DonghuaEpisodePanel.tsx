import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check, ExternalLink, Flame, Play, Search } from 'lucide-react';
import type {
  ContinueWatchingEntry,
  DonghuaEpisode,
  DonghuaItem,
  DonghuaResolutionPref,
} from '../../types/catalog';
import type { RecordWatchPayload } from '../../hooks/useUserLibrary';
import { resolveDonghuaEpisodeLink } from '../../utils/catalogHelpers';
import { openTelegramLink, triggerHaptic } from '../../utils/telegram';

interface DonghuaEpisodePanelProps {
  item: DonghuaItem;
  resPref: DonghuaResolutionPref;
  onChangeResPref: (pref: DonghuaResolutionPref) => void;
  isTokenWatched: (itemId: string, token: string) => boolean;
  lastContinue?: ContinueWatchingEntry;
  onRecordWatch: (payload: RecordWatchPayload) => void;
}

const RES_ORDER: DonghuaResolutionPref[] = ['4K', '1080p', '720p', '480p', 'HD'];

export const DonghuaEpisodePanel: React.FC<DonghuaEpisodePanelProps> = ({
  item,
  resPref,
  onChangeResPref,
  isTokenWatched,
  lastContinue,
  onRecordWatch,
}) => {
  const [newestFirst, setNewestFirst] = useState<boolean>(true);
  const [epQuery, setEpQuery] = useState<string>('');
  const [showAllEps, setShowAllEps] = useState<boolean>(false);

  useEffect(() => {
    setNewestFirst(true);
    setEpQuery('');
    setShowAllEps(false);
  }, [item.id]);

  // Discover unique resolutions actually present in this Donghua
  const availableResolutions = useMemo(() => {
    const found = new Set<string>();
    for (const ep of item.episodes || []) {
      Object.keys(ep.qualities || {}).forEach((q) => found.add(q));
    }
    return RES_ORDER.filter((r) => found.has(r));
  }, [item.episodes]);

  const sortedEpisodes = useMemo(() => {
    const list = [...(item.episodes || [])];
    list.sort((a, b) => (newestFirst ? b.episode - a.episode : a.episode - b.episode));
    const q = epQuery.trim();
    if (!q) return list;
    return list.filter((ep) => String(ep.episode).includes(q));
  }, [item.episodes, newestFirst, epQuery]);

  const visibleEpisodes = showAllEps || epQuery.trim() ? sortedEpisodes : sortedEpisodes.slice(0, 96);

  const handlePlayEpisode = (ep: DonghuaEpisode) => {
    const resolved = resolveDonghuaEpisodeLink(ep, resPref);
    const token = `ep:${ep.episode}`;
    onRecordWatch({
      item,
      link: resolved.link,
      watchLabel: `Ep ${ep.episode} • ${resolved.quality}`,
      buttonLabel: `Lanjut Ep ${ep.episode}`,
      token,
      episodeNumber: ep.episode,
      quality: resolved.quality,
    });
    openTelegramLink(resolved.link);
  };

  const quickEp = useMemo(() => {
    if (lastContinue?.episodeNumber) {
      const found = item.episodes?.find((e) => e.episode === lastContinue.episodeNumber);
      if (found) return { ep: found, isResume: true };
    }
    const highest = [...(item.episodes || [])].sort((a, b) => b.episode - a.episode)[0];
    return highest ? { ep: highest, isResume: false } : null;
  }, [item.episodes, lastContinue]);

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5 space-y-4">
      {/* Header + Quick Watch Latest / Resume */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-400" />
          <div>
            <h3 className="font-display text-sm sm:text-base font-extrabold text-white">
              Pemilih Episode & Resolusi Donghua
            </h3>
            <p className="text-[11px] text-slate-400">
              {item.episodes?.length || 0} episode terindeks • Ep terbaru:{' '}
              <strong className="text-amber-300">{item.latest_episode || '-'}</strong>
            </p>
          </div>
        </div>

        {quickEp && (
          <button
            type="button"
            onClick={() => handlePlayEpisode(quickEp.ep)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:brightness-110 px-3.5 py-2 text-xs font-black text-white shadow-[0_6px_20px_rgba(249,115,22,0.45)] border border-white/20 active:scale-95 transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>
              {quickEp.isResume
                ? `Lanjut Ep ${quickEp.ep.episode}`
                : `Putar Ep Terbaru (${quickEp.ep.episode})`}
            </span>
          </button>
        )}
      </div>

      {/* Resolution Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/40 border border-white/10 p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-300 mr-1">Resolusi Favorit:</span>
          <button
            type="button"
            onClick={() => onChangeResPref('auto')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold border transition-all ${
              resPref === 'auto'
                ? 'bg-amber-500 text-black border-amber-300 shadow'
                : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/15'
            }`}
          >
            ⚡ Otomatis Terbaik
          </button>
          {availableResolutions.map((res) => {
            const active = resPref === res;
            return (
              <button
                key={res}
                type="button"
                onClick={() => onChangeResPref(res)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold border transition-all ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300 shadow'
                    : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/15'
                }`}
              >
                {res}
              </button>
            );
          })}
        </div>

        {/* Sort Order Toggle (Newest on Top vs Ep 1 on Top) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            setNewestFirst((prev) => !prev);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1 text-[11px] font-bold text-amber-200 transition-colors"
        >
          {newestFirst ? (
            <>
              <ArrowDownWideNarrow className="h-3.5 w-3.5 text-amber-300" />
              <span>Terbaru di Atas</span>
            </>
          ) : (
            <>
              <ArrowUpNarrowWide className="h-3.5 w-3.5 text-emerald-300" />
              <span>Ep Awal di Atas</span>
            </>
          )}
        </button>
      </div>

      {/* Jump Episode Search Input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          inputMode="numeric"
          value={epQuery}
          onChange={(e) => setEpQuery(e.target.value)}
          placeholder="Ketik nomor episode untuk lompat cepat (contoh: 191)..."
          className="w-full rounded-xl bg-black/50 border border-white/15 py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
        />
      </div>

      {/* Episode Grid */}
      {visibleEpisodes.length > 0 ? (
        <>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {visibleEpisodes.map((ep) => {
              const token = `ep:${ep.episode}`;
              const watched = isTokenWatched(item.id, token);
              const isLast = lastContinue?.episodeNumber === ep.episode;
              const resolved = resolveDonghuaEpisodeLink(ep, resPref);
              const qualKeys = Object.keys(ep.qualities || {});

              return (
                <button
                  key={ep.episode}
                  type="button"
                  onClick={() => handlePlayEpisode(ep)}
                  className={`group flex flex-col justify-between gap-1 rounded-xl border p-2.5 text-left transition-all active:scale-95 ${
                    isLast
                      ? 'bg-gradient-to-br from-amber-500/35 to-rose-500/25 border-amber-400 text-white shadow-[0_0_16px_rgba(245,158,11,0.38)]'
                      : watched
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/25'
                      : 'bg-white/[0.05] hover:bg-rose-500/20 border-white/12 hover:border-rose-400/40 text-slate-100'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span className="flex items-center gap-1 font-display text-xs font-extrabold">
                      <Play className="h-3 w-3 fill-current text-amber-400" />
                      <span>Ep {ep.episode}</span>
                    </span>
                    {watched && (
                      <Check
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isLast ? 'text-amber-300' : 'text-emerald-400'
                        }`}
                      />
                    )}
                  </div>

                  {/* Resolution Micro Badges */}
                  <div className="flex flex-wrap items-center gap-1">
                    {(qualKeys.length > 0 ? qualKeys : [resolved.quality]).map((qk) => {
                      const chosen = qk === resolved.quality;
                      return (
                        <span
                          key={qk}
                          className={`rounded px-1 py-0.2 text-[9px] font-extrabold leading-tight ${
                            chosen
                              ? 'bg-amber-400/90 text-black'
                              : 'bg-black/45 text-slate-300 border border-white/10'
                          }`}
                        >
                          {qk}
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {!showAllEps && !epQuery.trim() && sortedEpisodes.length > 96 && (
            <button
              type="button"
              onClick={() => setShowAllEps(true)}
              className="w-full rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/15 py-2.5 text-xs font-bold text-amber-200 transition-colors"
            >
              Tampilkan Seluruh {sortedEpisodes.length} Episode
            </button>
          )}
        </>
      ) : (
        <p className="py-4 text-center text-xs text-slate-400">
          Episode "{epQuery}" belum ditemukan di daftar terindeks. Cek langsung di channel lengkap di bawah!
        </p>
      )}

      {/* Prominent Glass Channel Button */}
      {item.channel_link && (
        <button
          type="button"
          onClick={() => openTelegramLink(item.channel_link!)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-amber-500/20 hover:from-sky-500/35 hover:to-amber-500/35 border border-sky-400/40 px-4 py-3 text-xs sm:text-sm font-extrabold text-sky-100 shadow-lg active:scale-[0.99] transition-all"
        >
          <span>
            🚀 Buka Channel Lengkap (
            {item.channel_username ? `@${item.channel_username}` : 'Telegram'})
          </span>
          <ExternalLink className="h-4 w-4 text-amber-300" />
        </button>
      )}
    </div>
  );
};
