import React, { useEffect } from 'react';
import { hexToRgbString } from '../../utils/assetUrl';

interface AmbientBackgroundProps {
  accentColor?: string | null;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ accentColor }) => {
  const rgb = hexToRgbString(accentColor, '225, 29, 72');

  useEffect(() => {
    document.documentElement.style.setProperty('--ambient-rgb', rgb);
  }, [rgb]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#06060b] cinema-bg-pattern">
      {/* Primary Top Aurora Glow */}
      <div
        className="absolute -top-32 left-1/2 h-[440px] w-[135vw] max-w-[1150px] -translate-x-1/2 rounded-full blur-[110px]"
        style={{
          background: `radial-gradient(ellipse at center, rgba(${rgb}, 0.34) 0%, rgba(${rgb}, 0.12) 45%, rgba(6, 6, 11, 0) 75%)`,
          transition: 'background 800ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      {/* Secondary Diagonal Rim Glow */}
      <div
        className="absolute top-28 -right-24 h-[340px] w-[340px] rounded-full blur-[120px] opacity-65"
        style={{
          background: `radial-gradient(circle, rgba(${rgb}, 0.26) 0%, rgba(245, 158, 11, 0.08) 55%, transparent 78%)`,
          transition: 'background 800ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      {/* Subtle Deep Indigo Counter-Glow Bottom Left */}
      <div
        className="absolute bottom-12 -left-28 h-[320px] w-[320px] rounded-full blur-[130px] opacity-40"
        style={{
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(6, 6, 11, 0) 72%)',
        }}
      />
    </div>
  );
};
