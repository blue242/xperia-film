export function resolveAssetUrl(relativePath?: string | null): string {
  if (!relativePath) return '';
  if (
    relativePath.startsWith('http://') ||
    relativePath.startsWith('https://') ||
    relativePath.startsWith('data:')
  ) {
    return relativePath;
  }
  const clean = relativePath.replace(/^\.?\//, '');
  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${clean}`;
}

export function hexToRgbString(hex?: string | null, fallback = '225, 29, 72'): string {
  if (!hex) return fallback;
  const cleaned = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return fallback;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function splitCountries(countryStr?: string | null): string[] {
  if (!countryStr) return [];
  return countryStr
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

export function splitPeople(peopleStr?: string | null): string[] {
  if (!peopleStr) return [];
  return peopleStr
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

const SHORT_COUNTRY_MAP: Record<string, string> = {
  'Korea Selatan': 'KR',
  China: 'CN',
  'Amerika Serikat': 'US',
  Jepang: 'JP',
  Indonesia: 'ID',
  Inggris: 'UK',
  Thailand: 'TH',
  Vietnam: 'VN',
  India: 'IN',
  Filipina: 'PH',
  Prancis: 'FR',
  Jerman: 'DE',
  Spain: 'ES',
  Australia: 'AU',
  Kanada: 'CA',
  Taiwan: 'TW',
  'Hong Kong': 'HK',
  Malaysia: 'MY',
  Russia: 'RU',
  Italy: 'IT',
  Mexico: 'MX',
};

export function getShortCountry(countryStr?: string | null): string {
  const first = splitCountries(countryStr)[0];
  if (!first) return '';
  return SHORT_COUNTRY_MAP[first] || first.slice(0, 10);
}

export interface GenrePalette {
  bg: string;
  text: string;
  border: string;
}

const GENRE_PALETTES: Record<string, GenrePalette> = {
  Action: {
    bg: 'bg-rose-500/15 hover:bg-rose-500/30',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
  },
  Adventure: {
    bg: 'bg-amber-500/15 hover:bg-amber-500/30',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
  },
  Animation: {
    bg: 'bg-cyan-500/15 hover:bg-cyan-500/30',
    text: 'text-cyan-300',
    border: 'border-cyan-500/30',
  },
  Anime: {
    bg: 'bg-pink-500/15 hover:bg-pink-500/30',
    text: 'text-pink-300',
    border: 'border-pink-500/30',
  },
  Romance: {
    bg: 'bg-fuchsia-500/15 hover:bg-fuchsia-500/30',
    text: 'text-fuchsia-300',
    border: 'border-fuchsia-500/30',
  },
  Horror: {
    bg: 'bg-red-600/20 hover:bg-red-600/35',
    text: 'text-red-300',
    border: 'border-red-500/35',
  },
  Thriller: {
    bg: 'bg-orange-500/15 hover:bg-orange-500/30',
    text: 'text-orange-300',
    border: 'border-orange-500/30',
  },
  Fantasy: {
    bg: 'bg-violet-500/15 hover:bg-violet-500/30',
    text: 'text-violet-300',
    border: 'border-violet-500/30',
  },
  'Sci-Fi': {
    bg: 'bg-sky-500/15 hover:bg-sky-500/30',
    text: 'text-sky-300',
    border: 'border-sky-500/30',
  },
  Comedy: {
    bg: 'bg-yellow-500/15 hover:bg-yellow-500/30',
    text: 'text-yellow-300',
    border: 'border-yellow-500/30',
  },
  Drama: {
    bg: 'bg-indigo-500/15 hover:bg-indigo-500/30',
    text: 'text-indigo-300',
    border: 'border-indigo-500/30',
  },
  Mystery: {
    bg: 'bg-purple-500/15 hover:bg-purple-500/30',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
  },
  Crime: {
    bg: 'bg-emerald-500/15 hover:bg-emerald-500/30',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
  },
  Medical: {
    bg: 'bg-teal-500/15 hover:bg-teal-500/30',
    text: 'text-teal-300',
    border: 'border-teal-500/30',
  },
};

export function getGenrePalette(genre: string): GenrePalette {
  return (
    GENRE_PALETTES[genre] || {
      bg: 'bg-slate-500/20 hover:bg-slate-500/35',
      text: 'text-slate-200',
      border: 'border-white/15',
    }
  );
}

export function getPlatformBadgeStyle(platform?: string | null): string {
  if (!platform) return 'bg-white/10 text-slate-200 border-white/15';
  const p = platform.toLowerCase();
  if (p.includes('netflix')) return 'bg-red-600/25 text-red-300 border-red-500/40';
  if (p.includes('disney')) return 'bg-blue-600/25 text-blue-300 border-blue-500/40';
  if (p.includes('viki')) return 'bg-cyan-600/25 text-cyan-300 border-cyan-500/40';
  if (p.includes('iqiyi')) return 'bg-emerald-600/25 text-emerald-300 border-emerald-500/40';
  if (p.includes('wetv')) return 'bg-orange-500/25 text-orange-300 border-orange-500/40';
  if (p.includes('viu')) return 'bg-amber-500/25 text-amber-300 border-amber-500/40';
  if (p.includes('hbo')) return 'bg-purple-600/25 text-purple-300 border-purple-500/40';
  if (p.includes('prime')) return 'bg-sky-600/25 text-sky-300 border-sky-500/40';
  return 'bg-white/10 text-slate-200 border-white/15';
}
