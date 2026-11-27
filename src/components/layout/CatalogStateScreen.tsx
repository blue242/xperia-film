import React from 'react';
import { RefreshCw } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface CatalogStateScreenProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const CatalogStateScreen: React.FC<CatalogStateScreenProps> = ({
  loading,
  error,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 pt-4 pb-24 sm:px-5 space-y-6">
        {/* Hero Shimmer */}
        <div className="h-[340px] sm:h-[410px] w-full rounded-3xl bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-rose-500/10 border border-white/10 animate-pulse flex flex-col justify-end p-6 gap-3">
          <div className="h-5 w-32 rounded-full bg-white/10" />
          <div className="h-9 w-3/4 max-w-md rounded-xl bg-white/15" />
          <div className="h-4 w-2/3 max-w-sm rounded-lg bg-white/10" />
          <div className="flex gap-2 pt-2">
            <div className="h-10 w-36 rounded-xl bg-rose-500/30" />
            <div className="h-10 w-24 rounded-xl bg-white/10" />
          </div>
        </div>

        {/* Grid Shimmer */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-white/[0.05] border border-white/10 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
        <BrandLogo />
        <div className="mt-6 luxury-glass max-w-md rounded-3xl p-6 space-y-3">
          <p className="text-3xl">⚠️</p>
          <h2 className="font-display text-lg font-extrabold text-white">
            Katalog Belum Berhasil Dimuat
          </h2>
          <p className="text-xs text-slate-300">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Coba Muat Ulang</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
