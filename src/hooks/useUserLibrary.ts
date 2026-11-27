import { useCallback, useState } from 'react';
import type {
  CatalogItem,
  ContinueWatchingEntry,
  DonghuaResolutionPref,
} from '../types/catalog';
import { triggerHaptic } from '../utils/telegram';

const STORAGE_KEYS = {
  watchlist: 'xperia_film_watchlist_v1',
  continueWatching: 'xperia_film_continue_v1',
  watchedTokens: 'xperia_film_watched_tokens_v1',
  donghuaRes: 'xperia_film_donghua_res_v1',
};

function readStorageJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorageJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors safely
  }
}

export interface RecordWatchPayload {
  item: CatalogItem;
  link: string;
  watchLabel: string;
  buttonLabel: string;
  token?: string;
  seasonKey?: string;
  episodeNumber?: number;
  partNumber?: number;
  quality?: string;
}

export function useUserLibrary() {
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() =>
    readStorageJson<string[]>(STORAGE_KEYS.watchlist, [])
  );

  const [continueList, setContinueList] = useState<ContinueWatchingEntry[]>(() =>
    readStorageJson<ContinueWatchingEntry[]>(STORAGE_KEYS.continueWatching, [])
  );

  const [watchedMap, setWatchedMap] = useState<Record<string, string[]>>(() =>
    readStorageJson<Record<string, string[]>>(STORAGE_KEYS.watchedTokens, {})
  );

  const [donghuaResPref, setDonghuaResPrefState] = useState<DonghuaResolutionPref>(() =>
    readStorageJson<DonghuaResolutionPref>(STORAGE_KEYS.donghuaRes, 'auto')
  );

  const isSaved = useCallback(
    (id: string) => watchlistIds.includes(id),
    [watchlistIds]
  );

  const toggleSave = useCallback((id: string) => {
    setWatchlistIds((prev) => {
      const exists = prev.includes(id);
      triggerHaptic(exists ? 'light' : 'success');
      const next = exists ? prev.filter((x) => x !== id) : [id, ...prev];
      writeStorageJson(STORAGE_KEYS.watchlist, next);
      return next;
    });
  }, []);

  const recordWatch = useCallback((payload: RecordWatchPayload) => {
    const {
      item,
      link,
      watchLabel,
      buttonLabel,
      token,
      seasonKey,
      episodeNumber,
      partNumber,
      quality,
    } = payload;

    const entry: ContinueWatchingEntry = {
      itemId: item.id,
      category: item.category,
      title: item.title,
      posterLocal: item.poster_local,
      accentColor: item.accent_color || '#e11d48',
      watchLabel,
      buttonLabel,
      seasonKey,
      episodeNumber,
      partNumber,
      quality,
      link,
      updatedAt: Date.now(),
    };

    setContinueList((prev) => {
      const filtered = prev.filter((e) => e.itemId !== item.id);
      const next = [entry, ...filtered].slice(0, 24);
      writeStorageJson(STORAGE_KEYS.continueWatching, next);
      return next;
    });

    if (token) {
      setWatchedMap((prev) => {
        const existing = prev[item.id] || [];
        if (existing.includes(token)) return prev;
        const next = {
          ...prev,
          [item.id]: [...existing, token],
        };
        writeStorageJson(STORAGE_KEYS.watchedTokens, next);
        return next;
      });
    }
  }, []);

  const removeContinueItem = useCallback((itemId: string) => {
    triggerHaptic('selection');
    setContinueList((prev) => {
      const next = prev.filter((e) => e.itemId !== itemId);
      writeStorageJson(STORAGE_KEYS.continueWatching, next);
      return next;
    });
  }, []);

  const clearContinueWatching = useCallback(() => {
    triggerHaptic('medium');
    setContinueList([]);
    writeStorageJson(STORAGE_KEYS.continueWatching, []);
  }, []);

  const isTokenWatched = useCallback(
    (itemId: string, token: string): boolean => {
      return Boolean(watchedMap[itemId]?.includes(token));
    },
    [watchedMap]
  );

  const getLastContinueForItem = useCallback(
    (itemId: string): ContinueWatchingEntry | undefined => {
      return continueList.find((c) => c.itemId === itemId);
    },
    [continueList]
  );

  const setDonghuaResPref = useCallback((pref: DonghuaResolutionPref) => {
    triggerHaptic('selection');
    setDonghuaResPrefState(pref);
    writeStorageJson(STORAGE_KEYS.donghuaRes, pref);
  }, []);

  return {
    watchlistIds,
    isSaved,
    toggleSave,
    continueList,
    recordWatch,
    removeContinueItem,
    clearContinueWatching,
    isTokenWatched,
    getLastContinueForItem,
    donghuaResPref,
    setDonghuaResPref,
  };
}
