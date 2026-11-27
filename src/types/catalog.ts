export type CategoryType = 'movies' | 'series' | 'donghua';

export type NavTab = 'home' | 'movies' | 'series' | 'donghua' | 'explore';

export interface MoviePart {
  part: number;
  label: string;
  quality?: string | null;
  message_id: number;
  link: string;
}

export interface MovieItem {
  id: string;
  category: 'movies';
  title: string;
  original_title?: string | null;
  year: number | null;
  rating: number | null;
  genres: string[];
  theme?: string | null;
  country: string | null;
  director?: string | null;
  cast: string[];
  runtime_minutes?: number | null;
  duration_label?: string | null;
  quality?: string | null;
  platform?: string | null;
  has_sub_indo?: boolean;
  synopsis?: string | null;
  uploaded_at?: string | null;
  poster_message_id?: number;
  video_message_id?: number;
  video_link: string;
  parts: MoviePart[];
  poster_local: string;
  backdrop_local?: string | null;
  poster_remote?: string | null;
  backdrop_remote?: string | null;
  accent_color?: string | null;
}

export interface SeriesEpisode {
  episode: number;
  message_id: number;
  link: string;
}

export interface SeriesItem {
  id: string;
  category: 'series';
  title: string;
  original_title?: string | null;
  year: number | null;
  country: string | null;
  status: string;
  status_raw?: string;
  platform?: string | null;
  rating: number | null;
  genres: string[];
  season_label?: string | null;
  latest_episode?: number | null;
  total_episodes?: number | null;
  uploaded_episodes?: number | null;
  director?: string | null;
  cast: string[];
  has_sub_indo?: boolean;
  synopsis?: string | null;
  poster_message_id?: number;
  poster_link?: string | null;
  latest_update?: string | null;
  seasons: Record<string, SeriesEpisode[]>;
  poster_local: string;
  backdrop_local?: string | null;
  poster_remote?: string | null;
  backdrop_remote?: string | null;
  accent_color?: string | null;
}

export interface DonghuaEpisode {
  episode: number;
  default_link: string;
  qualities: Record<string, string>;
}

export interface DonghuaItem {
  id: string;
  category: 'donghua';
  title: string;
  original_title?: string | null;
  channel_username?: string | null;
  channel_link?: string | null;
  year: number | null;
  country: string | null;
  status: string;
  is_completed_tag?: boolean;
  has_sub_indo?: boolean;
  season_label?: string | null;
  rating: number | null;
  genres: string[];
  studio?: string | null;
  studios?: string[];
  platform?: string | null;
  latest_episode?: number | null;
  total_uploaded_episodes?: number | null;
  total_episodes?: number | null;
  latest_update?: string | null;
  synopsis?: string | null;
  episodes: DonghuaEpisode[];
  poster_local: string;
  backdrop_local?: string | null;
  poster_remote?: string | null;
  backdrop_remote?: string | null;
  accent_color?: string | null;
}

export type CatalogItem = MovieItem | SeriesItem | DonghuaItem;

export interface FeaturedHeroItem {
  id: string;
  category: CategoryType;
  badge_category: string;
  title: string;
  year: number | null;
  rating: number | null;
  genres: string[];
  country: string | null;
  quality?: string | null;
  season_label?: string | null;
  latest_episode?: number | null;
  duration_label?: string | null;
  status?: string | null;
  synopsis?: string | null;
  poster_local: string;
  backdrop_local?: string | null;
  accent_color?: string | null;
  watch_link: string;
}

export interface CatalogStats {
  updated_at: string;
  total_movies: number;
  total_series: number;
  total_series_episodes: number;
  total_donghua: number;
  total_donghua_channels_with_episodes: number;
  total_donghua_episodes: number;
  featured_hero: FeaturedHeroItem[];
  genres: string[];
  countries: string[];
  years: number[];
  platforms: string[];
}

export type SortOption = 'latest' | 'rating' | 'az' | 'year' | 'episodes';

export type DonghuaResolutionPref = 'auto' | '4K' | '1080p' | '720p' | '480p' | 'HD';

export interface ExplorerFilter {
  category: 'all' | CategoryType;
  query: string;
  genre: string;
  country: string;
  year: number | null;
  platform: string;
  studio: string;
  cast: string;
  director: string;
  status: 'all' | 'Ongoing' | 'Completed';
  letter: string;
  sort: SortOption;
}

export interface GridViewContext {
  title: string;
  subtitle?: string;
  breadcrumbParent: string;
  breadcrumbLabel: string;
  presetItems?: CatalogItem[];
  initialFilter?: Partial<ExplorerFilter>;
}

export interface ContinueWatchingEntry {
  itemId: string;
  category: CategoryType;
  title: string;
  posterLocal: string;
  accentColor: string;
  watchLabel: string;
  buttonLabel: string;
  seasonKey?: string;
  episodeNumber?: number;
  partNumber?: number;
  quality?: string;
  link: string;
  updatedAt: number;
}

export interface RailDefinition {
  id: string;
  title: string;
  subtitle?: string;
  accentGradient: string;
  items: CatalogItem[];
  gridContext: GridViewContext;
}
