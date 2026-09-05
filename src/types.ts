export interface MovieGenre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  runtime?: number;
  genres: MovieGenre[];
  tagline?: string;
  director?: string;
  cast?: CastMember[];
  trailer_key?: string;
  certification?: string;
  popularity?: number;
  matchPercentage?: number;
  reason?: string;
  surpriseScore?: number;
  editorialBadge?: string;
}

export interface UserStats {
  ratedCount: number;
  watchlistCount: number;
  watchedCount: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  favoriteGenres: string[];
  favoriteActors: string[];
  favoriteDirectors: string[];
  createdAt: string;
  stats?: UserStats;
}

export type WatchlistStatus = "want_to_watch" | "currently_watching" | "watched";

export interface WatchlistItem {
  _id: string;
  userId: string;
  movieId: number;
  status: WatchlistStatus;
  addedAt: string;
  updatedAt: string;
  movie?: Movie;
}

export interface RatingItem {
  _id: string;
  userId: string;
  movieId: number;
  rating: number; // 1-5
  createdAt: string;
  updatedAt: string;
  movie?: Movie;
}

export interface RecommendationItem {
  movieId: number;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  genres: string[];
  matchPercentage: number;
  reason: string;
  category?: string;
  release_date?: string;
  director?: string;
  surpriseScore?: number;
  editorialBadge?: string;
}

export interface RecommendationResponse {
  spotlight: RecommendationItem;
  topRecommendations: RecommendationItem[];
  becauseYouWatched: {
    referenceMovie: { id: number; title: string };
    items: RecommendationItem[];
  };
  hiddenGems: RecommendationItem[];
  trendingForYou: RecommendationItem[];
  categories: {
    name: string;
    items: RecommendationItem[];
  }[];
}

export interface AIQueryResponse {
  structured: {
    query: string;
    genres: string[];
    keywords: string[];
    mood: string;
    similarToTitles: string[];
    suggestedTitles: string[];
    summary: string;
  };
  movies: Movie[];
  aiEnabled: boolean;
}

export interface SearchHistoryItem {
  _id: string;
  userId: string;
  query: string;
  createdAt: string;
}
