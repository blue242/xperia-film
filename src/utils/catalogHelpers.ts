import type {
  CatalogItem,
  DonghuaItem,
  DonghuaResolutionPref,
  ExplorerFilter,
  MovieItem,
  SeriesItem,
} from '../types/catalog';
import { splitCountries, splitPeople } from './assetUrl';

export const DEFAULT_EXPLORER_FILTER: ExplorerFilter = {
  category: 'all',
  query: '',
  genre: '',
  country: '',
  year: null,
  platform: '',
  studio: '',
  cast: '',
  director: '',
  status: 'all',
  letter: 'ALL',
  sort: 'latest',
};

export function getItemTimestamp(item: CatalogItem): number {
  const raw =
    item.category === 'movies'
      ? item.uploaded_at
      : item.latest_update;
  if (!raw) return item.year ? new Date(item.year, 0, 1).getTime() : 0;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getItemEpisodeCount(item: CatalogItem): number {
  if (item.category === 'movies') {
    return item.parts?.length && item.parts.length > 1 ? item.parts.length : 1;
  }
  if (item.category === 'series') {
    return item.latest_episode || item.uploaded_episodes || 0;
  }
  return item.latest_episode || item.total_uploaded_episodes || item.episodes.length || 0;
}

export function isItemCompleted(item: CatalogItem): boolean {
  if (item.category === 'movies') return true;
  if (item.category === 'donghua') {
    return item.status === 'Completed' || Boolean(item.is_completed_tag);
  }
  return item.status === 'Completed';
}

export function getItemStudios(item: CatalogItem): string[] {
  if (item.category !== 'donghua') return [];
  const set = new Set<string>();
  if (item.studio) set.add(item.studio.trim());
  item.studios?.forEach((s) => {
    if (s && s.trim()) set.add(s.trim());
  });
  return Array.from(set);
}

export function getItemPrimaryWatchInfo(
  item: CatalogItem,
  donghuaPref: DonghuaResolutionPref = 'auto'
): {
  link: string;
  watchLabel: string;
  buttonLabel: string;
  seasonKey?: string;
  episodeNumber?: number;
  partNumber?: number;
  quality?: string;
} {
  if (item.category === 'movies') {
    if (item.parts && item.parts.length > 0) {
      const firstPart = item.parts[0];
      return {
        link: firstPart.link || item.video_link,
        watchLabel: `Part ${firstPart.part} • ${firstPart.quality || item.quality || 'HD'}`,
        buttonLabel: `Lanjut Part ${firstPart.part}`,
        partNumber: firstPart.part,
        quality: firstPart.quality || item.quality || 'HD',
      };
    }
    return {
      link: item.video_link,
      watchLabel: `Film • ${item.quality || 'HD'}`,
      buttonLabel: 'Tonton Film',
      quality: item.quality || 'HD',
    };
  }

  if (item.category === 'series') {
    const seasonKeys = Object.keys(item.seasons || {}).sort((a, b) => Number(a) - Number(b));
    const firstSeason = seasonKeys[0] || '1';
    const eps = item.seasons?.[firstSeason] || [];
    const firstEp = eps[0];
    if (firstEp) {
      return {
        link: firstEp.link,
        watchLabel: `S.${firstSeason} • Ep ${firstEp.episode}`,
        buttonLabel: `Lanjut Ep ${firstEp.episode}`,
        seasonKey: firstSeason,
        episodeNumber: firstEp.episode,
      };
    }
    return {
      link: item.poster_link || 'https://t.me/Gudang_Series_Terbaru',
      watchLabel: `${item.season_label || 'S.1'}`,
      buttonLabel: 'Buka Series',
    };
  }

  // Donghua
  const sortedEps = [...(item.episodes || [])].sort((a, b) => b.episode - a.episode);
  const latestEp = sortedEps[0];
  if (latestEp) {
    const resolved = resolveDonghuaEpisodeLink(latestEp, donghuaPref);
    return {
      link: resolved.link,
      watchLabel: `Ep ${latestEp.episode}${resolved.quality ? ` • ${resolved.quality}` : ''}`,
      buttonLabel: `Lanjut Ep ${latestEp.episode}`,
      episodeNumber: latestEp.episode,
      quality: resolved.quality,
    };
  }
  return {
    link: item.channel_link || 'https://t.me',
    watchLabel: item.latest_episode ? `Ep ${item.latest_episode}` : 'Channel',
    buttonLabel: 'Buka Channel',
  };
}

export function resolveDonghuaEpisodeLink(
  ep: { default_link: string; qualities: Record<string, string> },
  pref: DonghuaResolutionPref
): { link: string; quality: string } {
  const quals = ep.qualities || {};
  const availableKeys = Object.keys(quals);

  if (pref !== 'auto' && quals[pref]) {
    return { link: quals[pref], quality: pref };
  }

  const priorityOrder = ['1080p', '4K', 'HD', '720p', '480p'];
  for (const q of priorityOrder) {
    if (quals[q]) {
      return { link: quals[q], quality: q };
    }
  }

  if (availableKeys.length > 0) {
    const firstKey = availableKeys[0];
    return { link: quals[firstKey], quality: firstKey };
  }

  return { link: ep.default_link, quality: 'HD' };
}

export interface SearchMatchResult {
  item: CatalogItem;
  matchBadge?: string;
  score: number;
}

export function searchCatalogInstant(
  allItems: CatalogItem[],
  rawQuery: string,
  limit = 24
): SearchMatchResult[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const results: SearchMatchResult[] = [];

  for (const item of allItems) {
    let score = 0;
    let matchBadge: string | undefined;

    const titleLower = item.title.toLowerCase();
    const origLower = (item.original_title || '').toLowerCase();

    if (titleLower === q) {
      score += 120;
    } else if (titleLower.startsWith(q)) {
      score += 90;
    } else if (titleLower.includes(q)) {
      score += 65;
    }

    if (origLower && origLower.includes(q)) {
      score += 55;
      matchBadge = `Judul Asli: ${item.original_title}`;
    }

    if (item.category !== 'donghua') {
      const matchedCast = item.cast?.find((c) => c.toLowerCase().includes(q));
      if (matchedCast) {
        score += 50;
        if (!matchBadge) matchBadge = `Pemeran: ${matchedCast}`;
      }

      const directors = splitPeople(item.director);
      const matchedDir = directors.find((d) => d.toLowerCase().includes(q));
      if (matchedDir) {
        score += 45;
        if (!matchBadge) matchBadge = `Sutradara: ${matchedDir}`;
      }
    } else {
      const studios = getItemStudios(item);
      const matchedStudio = studios.find((s) => s.toLowerCase().includes(q));
      if (matchedStudio) {
        score += 45;
        if (!matchBadge) matchBadge = `Studio: ${matchedStudio}`;
      }
    }

    const matchedGenre = item.genres?.find((g) => g.toLowerCase().includes(q));
    if (matchedGenre) {
      score += 30;
      if (!matchBadge) matchBadge = `Genre: ${matchedGenre}`;
    }

    if (item.country && item.country.toLowerCase().includes(q)) {
      score += 28;
      if (!matchBadge) matchBadge = `Negara: ${item.country}`;
    }

    if (item.platform && item.platform.toLowerCase().includes(q)) {
      score += 25;
      if (!matchBadge) matchBadge = `Platform: ${item.platform}`;
    }

    if (item.category === 'movies' && item.theme && item.theme.toLowerCase().includes(q)) {
      score += 20;
    }

    if (item.year && String(item.year) === q) {
      score += 35;
    }

    if (score > 0) {
      results.push({ item, matchBadge, score: score + (item.rating || 0) });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export function filterAndSortCatalog(
  allItems: CatalogItem[],
  filter: ExplorerFilter
): CatalogItem[] {
  const q = filter.query.trim().toLowerCase();

  const filtered = allItems.filter((item) => {
    if (filter.category !== 'all' && item.category !== filter.category) {
      return false;
    }

    if (filter.genre && !item.genres?.some((g) => g.toLowerCase() === filter.genre.toLowerCase())) {
      return false;
    }

    if (filter.country) {
      const countries = splitCountries(item.country).map((c) => c.toLowerCase());
      if (!countries.includes(filter.country.toLowerCase())) return false;
    }

    if (filter.year !== null && item.year !== filter.year) {
      return false;
    }

    if (filter.platform) {
      if (!item.platform || item.platform.toLowerCase() !== filter.platform.toLowerCase()) {
        return false;
      }
    }

    if (filter.studio) {
      const studios = getItemStudios(item).map((s) => s.toLowerCase());
      if (!studios.includes(filter.studio.toLowerCase())) return false;
    }

    if (filter.cast) {
      if (item.category === 'donghua') return false;
      const hasCast = item.cast?.some((c) => c.toLowerCase() === filter.cast.toLowerCase());
      if (!hasCast) return false;
    }

    if (filter.director) {
      if (item.category === 'donghua') return false;
      const dirs = splitPeople(item.director).map((d) => d.toLowerCase());
      if (!dirs.includes(filter.director.toLowerCase())) return false;
    }

    if (filter.status !== 'all') {
      const completed = isItemCompleted(item);
      if (filter.status === 'Completed' && !completed) return false;
      if (filter.status === 'Ongoing' && (completed || item.category === 'movies')) return false;
    }

    if (filter.letter && filter.letter !== 'ALL') {
      const firstChar = item.title.trim().charAt(0).toUpperCase();
      if (filter.letter === '#') {
        if (/^[A-Z]$/.test(firstChar)) return false;
      } else if (firstChar !== filter.letter) {
        return false;
      }
    }

    if (q) {
      const inTitle = item.title.toLowerCase().includes(q);
      const inOrig = Boolean(item.original_title?.toLowerCase().includes(q));
      const inCast =
        item.category !== 'donghua' &&
        Boolean(item.cast?.some((c) => c.toLowerCase().includes(q)));
      const inDir =
        item.category !== 'donghua' && Boolean(item.director?.toLowerCase().includes(q));
      const inGenre = Boolean(item.genres?.some((g) => g.toLowerCase().includes(q)));
      const inCountry = Boolean(item.country?.toLowerCase().includes(q));
      const inStudio =
        item.category === 'donghua' &&
        getItemStudios(item).some((s) => s.toLowerCase().includes(q));
      const inTheme =
        item.category === 'movies' && Boolean(item.theme?.toLowerCase().includes(q));
      const inYear = Boolean(item.year && String(item.year).includes(q));

      if (
        !inTitle &&
        !inOrig &&
        !inCast &&
        !inDir &&
        !inGenre &&
        !inCountry &&
        !inStudio &&
        !inTheme &&
        !inYear
      ) {
        return false;
      }
    }

    return true;
  });

  filtered.sort((a, b) => {
    switch (filter.sort) {
      case 'rating': {
        const diff = (b.rating || 0) - (a.rating || 0);
        return diff !== 0 ? diff : getItemTimestamp(b) - getItemTimestamp(a);
      }
      case 'az':
        return a.title.localeCompare(b.title, 'id');
      case 'year': {
        const diff = (b.year || 0) - (a.year || 0);
        return diff !== 0 ? diff : (b.rating || 0) - (a.rating || 0);
      }
      case 'episodes': {
        const diff = getItemEpisodeCount(b) - getItemEpisodeCount(a);
        return diff !== 0 ? diff : (b.rating || 0) - (a.rating || 0);
      }
      case 'latest':
      default: {
        const diff = getItemTimestamp(b) - getItemTimestamp(a);
        return diff !== 0 ? diff : (b.rating || 0) - (a.rating || 0);
      }
    }
  });

  return filtered;
}

export function getSimilarItems(
  target: CatalogItem,
  allItems: CatalogItem[],
  limit = 9
): CatalogItem[] {
  const targetGenres = new Set((target.genres || []).map((g) => g.toLowerCase()));
  const targetCountries = new Set(splitCountries(target.country).map((c) => c.toLowerCase()));

  const scored = allItems
    .filter((item) => item.id !== target.id)
    .map((item) => {
      let score = 0;
      if (item.category === target.category) score += 25;

      for (const g of item.genres || []) {
        if (targetGenres.has(g.toLowerCase())) score += 18;
      }

      for (const c of splitCountries(item.country)) {
        if (targetCountries.has(c.toLowerCase())) score += 12;
      }

      if (item.rating && item.rating >= 7.5) score += 6;
      return { item, score };
    })
    .filter((entry) => entry.score > 15);

  scored.sort((a, b) => b.score - a.score || (b.item.rating || 0) - (a.item.rating || 0));
  return scored.slice(0, limit).map((s) => s.item);
}

export function collectAllStudios(donghuaList: DonghuaItem[]): string[] {
  const set = new Set<string>();
  donghuaList.forEach((d) => {
    getItemStudios(d).forEach((s) => set.add(s));
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function sortByLatest<T extends CatalogItem>(items: T[]): T[] {
  return [...items].sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));
}

export function sortByRating<T extends CatalogItem>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (b.rating || 0) - (a.rating || 0) || getItemTimestamp(b) - getItemTimestamp(a)
  );
}

export function isAsianCountry(countryStr?: string | null): boolean {
  const asian = new Set([
    'Korea Selatan',
    'China',
    'Jepang',
    'Indonesia',
    'Thailand',
    'Vietnam',
    'India',
    'Filipina',
    'Taiwan',
    'Hong Kong',
    'Malaysia',
    'Singapore',
  ]);
  return splitCountries(countryStr).some((c) => asian.has(c));
}

export function isWesternCountry(countryStr?: string | null): boolean {
  const western = new Set([
    'Amerika Serikat',
    'Inggris',
    'Prancis',
    'Jerman',
    'Spain',
    'Kanada',
    'Australia',
    'Italy',
    'Belgia',
    'Austria',
    'Netherlands',
    'Switzerland',
    'Selandia Baru',
  ]);
  return splitCountries(countryStr).some((c) => western.has(c));
}

export function buildCuratedHeroForCategory(
  category: 'movies' | 'series' | 'donghua',
  movies: MovieItem[],
  series: SeriesItem[],
  donghua: DonghuaItem[]
): CatalogItem[] {
  const pool: CatalogItem[] =
    category === 'movies' ? movies : category === 'series' ? series : donghua;

  const withBackdrop = pool.filter((i) => Boolean(i.backdrop_local));
  const topRatedRest = sortByRating(pool.filter((i) => !i.backdrop_local)).slice(0, 6);
  return [...withBackdrop, ...topRatedRest].slice(0, 8);
}
