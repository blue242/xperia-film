import React from 'react';
import { ExternalLink, Film, HeartHandshake, MessageSquarePlus, Sparkles, Tv, X } from 'lucide-react';
import type { CatalogStats } from '../../types/catalog';
import { openTelegramLink } from '../../utils/telegram';

interface InfoRequestModalProps {
  isOpen: boolean;
  stats: CatalogStats | null;
  onClose: () => void;
}

export const InfoRequestModal: React.FC<InfoRequestModalProps> = ({
  isOpen,
  stats,
  onClose,
}) => {
  if (!isOpen) return null;

  const formattedDate = stats?.updated_at
    ? new Date(stats.updated_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Terbaru';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Informasi Katalog & Request Judul"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slim-scrollbar luxury-glass max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-amber-500 text-white shadow">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black text-white">
                Pusat Info & Request Xperia Film
              </h2>
              <p className="text-[11px] text-slate-400">
                Sinkronisasi Katalog: {formattedDate}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Info"
            className="rounded-full bg-white/10 hover:bg-rose-600 p-1.5 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Stats Summary */}
        {stats && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/25 p-3 text-center">
              <p className="font-display text-xl font-black text-emerald-300">
                {stats.total_movies}
              </p>
              <p className="text-[10.5px] font-bold text-slate-300">Film HD</p>
            </div>
            <div className="rounded-2xl bg-fuchsia-500/10 border border-fuchsia-400/25 p-3 text-center">
              <p className="font-display text-xl font-black text-fuchsia-300">
                {stats.total_series}
              </p>
              <p className="text-[10.5px] font-bold text-slate-300">
                Series ({stats.total_series_episodes} Ep)
              </p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 border border-amber-400/25 p-3 text-center">
              <p className="font-display text-xl font-black text-amber-300">
                {stats.total_donghua}
              </p>
              <p className="text-[10.5px] font-bold text-slate-300">
                Donghua ({stats.total_donghua_episodes} Ep)
              </p>
            </div>
          </div>
        )}

        {/* Official Channels Direct Access */}
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 space-y-2.5">
          <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-300">
            <span>📡 Channel Resmi Ekosistem</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openTelegramLink('https://t.me/film_fast_update')}
              className="flex items-center justify-between rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 px-3 py-2.5 text-xs font-bold text-emerald-100 transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-emerald-300" />
                <span>@film_fast_update</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </button>

            <button
              type="button"
              onClick={() => openTelegramLink('https://t.me/Gudang_Series_Terbaru')}
              className="flex items-center justify-between rounded-xl bg-fuchsia-500/15 hover:bg-fuchsia-500/25 border border-fuchsia-400/35 px-3 py-2.5 text-xs font-bold text-fuchsia-100 transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Tv className="h-3.5 w-3.5 text-fuchsia-300" />
                <span>@Gudang_Series_Terbaru</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* Request Judul Guide */}
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 space-y-2">
          <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-300">
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>Cara Request Judul & Lapor Video</span>
          </h3>
          <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed text-slate-300">
            <li>
              Cek dulu lewat tombol <strong>Cari</strong> di atas — bisa jadi judulnya sudah masuk dengan judul bahasa Inggris/asli.
            </li>
            <li>
              Untuk request Film, Drakor, atau Donghua baru, gabung ke channel utama di atas dan tulis judul + tahun rilis di kolom diskusi/komentar postingan terbaru.
            </li>
            <li>
              Semua video diputar langsung di dalam Telegram tanpa iklan pop-up dan bebas blokir ISP!
            </li>
          </ul>
        </div>

        {/* Support / Appreciation */}
        <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-4 space-y-1.5">
          <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-200">
            <HeartHandshake className="h-3.5 w-3.5 text-amber-300" />
            <span>Dukungan Komunitas</span>
          </h3>
          <p className="text-xs leading-relaxed text-slate-200/90">
            Bantu Xperia Film makin ramai dengan membagikan tontonan favorit lo ke teman atau grup Telegram lewat tombol <strong>Bagikan</strong> di halaman detail!
          </p>
        </div>
      </div>
    </div>
  );
};
