import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CatalogItem,
  CatalogStats,
  DonghuaItem,
  MovieItem,
  SeriesItem,
} from '../types/catalog';
import { resolveAssetUrl } from '../utils/assetUrl';

interface UseCatalogDataReturn {
  stats: CatalogStats | null;
  movies: MovieItem[];
  series: SeriesItem[];
  donghua: DonghuaItem[];
  allItems: CatalogItem[];
  itemById: Map<string, CatalogItem>;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useCatalogData(): UseCatalogDataReturn {
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [donghua, setDonghua] = useState<DonghuaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, moviesRes, seriesRes, donghuaRes] = await Promise.all([
        fetch(resolveAssetUrl('data/catalog_stats.json')),
        fetch(resolveAssetUrl('data/movies.json')),
        fetch(resolveAssetUrl('data/series.json')),
        fetch(resolveAssetUrl('data/donghua.json')),
      ]);

      if (!statsRes.ok || !moviesRes.ok || !seriesRes.ok || !donghuaRes.ok) {
        throw new Error('Gagal memuat berkas katalog JSON.');
      }

      const [statsJson, moviesJson, seriesJson, donghuaJson] = await Promise.all([
        statsRes.json() as Promise<CatalogStats>,
        moviesRes.json() as Promise<MovieItem[]>,
        seriesRes.json() as Promise<SeriesItem[]>,
        donghuaRes.json() as Promise<DonghuaItem[]>,
      ]);

      setStats(statsJson);
      setMovies(moviesJson);
      setSeries(seriesJson);
      setDonghua(donghuaJson);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kendala saat memuat katalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const allItems = useMemo<CatalogItem[]>(() => {
    return [...movies, ...series, ...donghua];
  }, [movies, series, donghua]);

  const itemById = useMemo(() => {
    const map = new Map<string, CatalogItem>();
    for (const item of allItems) {
      map.set(item.id, item);
    }
    return map;
  }, [allItems]);

  return {
    stats,
    movies,
    series,
    donghua,
    allItems,
    itemById,
    loading,
    error,
    reload: loadAll,
  };
}
