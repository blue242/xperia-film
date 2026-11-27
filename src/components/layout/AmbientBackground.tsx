import React, { useEffect, useRef, useState } from 'react';
import { AMBIENT_COLOR_EVENT, hexToRgbString } from '../../utils/assetUrl';

interface AmbientBackgroundProps {
  overrideColor?: string | null;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = React.memo(
  ({ overrideColor }) => {
    const lastHeroRgbRef = useRef<string>('225, 29, 72');
    const [rgb, setRgb] = useState<string>(() =>
      hexToRgbString(overrideColor, '225, 29, 72')
    );

    useEffect(() => {
      const handleAmbientEvent = (e: Event) => {
        const nextRgb = (e as CustomEvent<string>).detail || '225, 29, 72';
        lastHeroRgbRef.current = nextRgb;
        if (!overrideColor) {
          setRgb(nextRgb);
        }
      };

      window.addEventListener(AMBIENT_COLOR_EVENT, handleAmbientEvent);
      return () => window.removeEventListener(AMBIENT_COLOR_EVENT, handleAmbientEvent);
    }, [overrideColor]);

    useEffect(() => {
      if (overrideColor) {
        const modalRgb = hexToRgbString(overrideColor, lastHeroRgbRef.current);
        document.documentElement.style.setProperty('--ambient-rgb', modalRgb);
        setRgb(modalRgb);
      } else {
        document.documentElement.style.setProperty('--ambient-rgb', lastHeroRgbRef.current);
        setRgb(lastHeroRgbRef.current);
      }
    }, [overrideColor]);

    return (
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[#06060b] cinema-bg-pattern"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 380px at 50% -40px, rgba(${rgb}, 0.30) 0%, rgba(${rgb}, 0.10) 52%, rgba(6, 6, 11, 0) 82%),
            radial-gradient(circle 340px at 92% 150px, rgba(${rgb}, 0.18) 0%, rgba(245, 158, 11, 0.05) 55%, rgba(6, 6, 11, 0) 80%),
            radial-gradient(circle 320px at 8% 86%, rgba(99, 102, 241, 0.12) 0%, rgba(6, 6, 11, 0) 76%),
            radial-gradient(rgba(255, 255, 255, 0.026) 1px, transparent 0)
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 28px 28px',
          transition: 'background-image 600ms ease',
        }}
      />
    );
  }
);

AmbientBackground.displayName = 'AmbientBackground';
