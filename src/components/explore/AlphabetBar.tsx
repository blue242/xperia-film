import React from 'react';
import { triggerHaptic } from '../../utils/telegram';

interface AlphabetBarProps {
  activeLetter: string;
  onSelectLetter: (letter: string) => void;
  className?: string;
}

const LETTERS = [
  'ALL',
  '#',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

export const AlphabetBar: React.FC<AlphabetBarProps> = ({
  activeLetter,
  onSelectLetter,
  className = '',
}) => {
  return (
    <div
      className={`horizontal-rail-scroll no-scrollbar flex items-center gap-1 overflow-x-auto overflow-y-hidden py-1 ${className}`}
    >
      {LETTERS.map((ltr) => {
        const isActive = activeLetter === ltr;
        return (
          <button
            key={ltr}
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onSelectLetter(ltr);
            }}
            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-extrabold tracking-wide transition-all ${
              isActive
                ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-[0_2px_10px_rgba(225,29,72,0.5)] border border-white/25'
                : 'bg-white/[0.05] hover:bg-white/[0.14] text-slate-300 border border-white/10'
            }`}
          >
            {ltr === 'ALL' ? 'SEMUA A–Z' : ltr}
          </button>
        );
      })}
    </div>
  );
};
