import React from 'react';

interface BrandLogoProps {
  onClick?: () => void;
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ onClick, compact = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Xperia Film — Kembali ke Beranda"
      className="group inline-flex items-center gap-2.5 text-left focus:outline-none active:scale-95 transition-transform"
    >
      {/* Custom Projector X + Film Reel + Play Lens Emblem */}
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#171728] to-[#090913] border border-white/15 shadow-[0_0_20px_rgba(244,63,94,0.32)] group-hover:shadow-[0_0_26px_rgba(251,191,36,0.48)] transition-shadow">
        <svg
          viewBox="0 0 48 48"
          className="h-7 w-7 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="xperiaBeamA" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="48%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="xperiaBeamB" x1="42" y1="6" x2="6" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Subtle film sprocket accents left & right */}
          <rect x="3" y="12" width="2.5" height="4" rx="1" fill="rgba(255,255,255,0.28)" />
          <rect x="3" y="22" width="2.5" height="4" rx="1" fill="rgba(255,255,255,0.28)" />
          <rect x="3" y="32" width="2.5" height="4" rx="1" fill="rgba(255,255,255,0.28)" />
          <rect x="42.5" y="12" width="2.5" height="4" rx="1" fill="rgba(255,255,255,0.28)" />
          <rect x="42.5" y="22" width="2.5" height="4" rx="1" fill="rgba(255,255,255,0.28)" />
          <rect x="42.5" y="32" width="2.5" height="4" rx="1" fill="rgba(255,255,255,0.28)" />

          {/* Crossed Projector Light Beams forming 'X' */}
          <path
            d="M10 8H18.5L38 40H29.5L10 8Z"
            fill="url(#xperiaBeamA)"
          />
          <path
            d="M38 8H29.5L10 40H18.5L38 8Z"
            fill="url(#xperiaBeamB)"
            fillOpacity="0.92"
          />

          {/* Center Cinema Play Lens Core */}
          <circle
            cx="24"
            cy="24"
            r="6.6"
            fill="#090913"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.2"
          />
          <polygon points="22.3,20.8 27.8,24 22.3,27.2" fill="#ffffff" />
        </svg>
      </span>

      <span className="flex items-center gap-1.5">
        <span
          className={`font-display font-black tracking-[0.08em] text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.18)] ${
            compact ? 'text-base' : 'text-[17px] sm:text-xl'
          }`}
        >
          XPERIA
        </span>
        <span
          className={`inline-flex items-center rounded-md bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 px-1.5 py-0.5 font-display font-extrabold tracking-[0.1em] text-white shadow-[0_2px_12px_rgba(225,29,72,0.55)] border border-white/25 ${
            compact ? 'text-[10px]' : 'text-[11px] sm:text-xs'
          }`}
        >
          FILM
        </span>
      </span>
    </button>
  );
};
