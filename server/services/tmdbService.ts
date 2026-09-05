import axios from "axios";
import { Movie, MOCK_MOVIES } from "./mockMovies.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w780";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data as T;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

function getApiKey(): string | undefined {
  return process.env.TMDB_API_KEY;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

function formatTmdbMovie(item: any): Movie {
  const genres = item.genres || (item.genre_ids ? item.genre_ids.map((id: number) => ({ id, name: GENRE_MAP[id] || "Cinema" })) : []);
  
  const poster = item.poster_path
    ? (item.poster_path.startsWith("http") ? item.poster_path : `${TMDB_IMAGE_BASE}${item.poster_path}`)
    : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500";
    
  const backdrop = item.backdrop_path
    ? (item.backdrop_path.startsWith("http") ? item.backdrop_path : `${TMDB_BACKDROP_BASE}${item.backdrop_path}`)
    : poster;

  return {
    id: item.id,
    title: item.title || item.name || "Untitled",
    original_title: item.original_title,
    overview: item.overview || "No overview available.",
    poster_path: poster,
    backdrop_path: backdrop,
    release_date: item.release_date || item.first_air_date || "2024",
    vote_average: Number((item.vote_average || 7.0).toFixed(1)),
    vote_count: item.vote_count || 100,
    runtime: item.runtime || 120,
    genres,
    tagline: item.tagline || "",
    popularity: item.popularity || 80
  };
}

export const tmdbService = {
  async getTrending(): Promise<Movie[]> {
    const key = getApiKey();
    const cacheKey = "movies_trending";
    const cached = getCached<Movie[]>(cacheKey);
    if (cached) return cached;

    if (!key) {
      return MOCK_MOVIES.slice(0, 10);
    }

    try {
      const res = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
        params: { api_key: key },
        timeout: 4000
      });
      const results: Movie[] = (res.data.results || []).map(formatTmdbMovie);
      setCache(cacheKey, results);
      return results;
    } catch (err: any) {
      console.warn(`[TMDB] getTrending fallback triggered: ${err.message}`);
      return MOCK_MOVIES.slice(0, 10);
    }
  },

  async getPopular(): Promise<Movie[]> {
    const key = getApiKey();
    const cacheKey = "movies_popular";
    const cached = getCached<Movie[]>(cacheKey);
    if (cached) return cached;

    if (!key) {
      return [...MOCK_MOVIES].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 10);
    }

    try {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: { api_key: key },
        timeout: 4000
      });
      const results: Movie[] = (res.data.results || []).map(formatTmdbMovie);
      setCache(cacheKey, results);
      return results;
    } catch (err: any) {
      console.warn(`[TMDB] getPopular fallback triggered: ${err.message}`);
      return [...MOCK_MOVIES].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 10);
    }
  },

  async getTopRated(): Promise<Movie[]> {
    const key = getApiKey();
    const cacheKey = "movies_top_rated";
    const cached = getCached<Movie[]>(cacheKey);
    if (cached) return cached;

    if (!key) {
      return [...MOCK_MOVIES].sort((a, b) => b.vote_average - a.vote_average).slice(0, 10);
    }

    try {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
        params: { api_key: key },
        timeout: 4000
      });
      const results: Movie[] = (res.data.results || []).map(formatTmdbMovie);
      setCache(cacheKey, results);
      return results;
    } catch (err: any) {
      console.warn(`[TMDB] getTopRated fallback triggered: ${err.message}`);
      return [...MOCK_MOVIES].sort((a, b) => b.vote_average - a.vote_average).slice(0, 10);
    }
  },

  async getUpcoming(): Promise<Movie[]> {
    const key = getApiKey();
    const cacheKey = "movies_upcoming";
    const cached = getCached<Movie[]>(cacheKey);
    if (cached) return cached;

    if (!key) {
      return MOCK_MOVIES.filter(m => m.release_date.startsWith("2024") || m.release_date.startsWith("2023")).slice(0, 8);
    }

    try {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
        params: { api_key: key },
        timeout: 4000
      });
      const results: Movie[] = (res.data.results || []).map(formatTmdbMovie);
      setCache(cacheKey, results);
      return results;
    } catch (err: any) {
      console.warn(`[TMDB] getUpcoming fallback triggered: ${err.message}`);
      return MOCK_MOVIES.slice(0, 8);
    }
  },

  async searchMovies(query: string): Promise<Movie[]> {
    const cleanQuery = (query || "").trim().toLowerCase();
    if (!cleanQuery) return [];

    const key = getApiKey();
    if (!key) {
      return MOCK_MOVIES.filter(m =>
        m.title.toLowerCase().includes(cleanQuery) ||
        m.overview.toLowerCase().includes(cleanQuery) ||
        (m.director && m.director.toLowerCase().includes(cleanQuery)) ||
        m.genres.some(g => g.name.toLowerCase().includes(cleanQuery)) ||
        (m.cast && m.cast.some(c => c.name.toLowerCase().includes(cleanQuery)))
      );
    }

    try {
      const res = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: { api_key: key, query: cleanQuery },
        timeout: 4000
      });
      return (res.data.results || []).map(formatTmdbMovie);
    } catch (err: any) {
      console.warn(`[TMDB] searchMovies fallback triggered: ${err.message}`);
      return MOCK_MOVIES.filter(m =>
        m.title.toLowerCase().includes(cleanQuery) ||
        m.overview.toLowerCase().includes(cleanQuery)
      );
    }
  },

  async getMoviesByGenre(genreName: string): Promise<Movie[]> {
    const cleanGenre = (genreName || "").trim().toLowerCase();
    const localMatches = MOCK_MOVIES.filter(m =>
      m.genres.some(g => g.name.toLowerCase() === cleanGenre || cleanGenre.includes(g.name.toLowerCase()))
    );

    const key = getApiKey();
    if (!key) return localMatches.length > 0 ? localMatches : MOCK_MOVIES.slice(0, 8);

    const genreEntry = Object.entries(GENRE_MAP).find(([_, name]) => name.toLowerCase() === cleanGenre);
    if (!genreEntry) return localMatches;

    try {
      const res = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params: { api_key: key, with_genres: genreEntry[0], sort_by: "popularity.desc" },
        timeout: 4000
      });
      return (res.data.results || []).map(formatTmdbMovie);
    } catch {
      return localMatches;
    }
  },

  async getMovieDetails(movieId: number): Promise<Movie | null> {
    const mock = MOCK_MOVIES.find(m => m.id === Number(movieId));
    const key = getApiKey();

    if (!key) {
      return mock || null;
    }

    const cacheKey = `movie_details_${movieId}`;
    const cached = getCached<Movie>(cacheKey);
    if (cached) return cached;

    try {
      const [detailsRes, creditsRes, videosRes] = await Promise.all([
        axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, { params: { api_key: key }, timeout: 4000 }),
        axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, { params: { api_key: key }, timeout: 4000 }).catch(() => ({ data: { crew: [], cast: [] } })),
        axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, { params: { api_key: key }, timeout: 4000 }).catch(() => ({ data: { results: [] } }))
      ]);

      const data = detailsRes.data;
      const formatted = formatTmdbMovie(data);
      formatted.runtime = data.runtime || (mock ? mock.runtime : 120);

      const directorObj = (creditsRes.data.crew || []).find((c: any) => c.job === "Director");
      if (directorObj) formatted.director = directorObj.name;
      else if (mock?.director) formatted.director = mock.director;

      formatted.cast = (creditsRes.data.cast || []).slice(0, 8).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile_path: c.profile_path ? `${TMDB_IMAGE_BASE}${c.profile_path}` : undefined
      }));

      const trailer = (videosRes.data.results || []).find((v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
      if (trailer) formatted.trailer_key = trailer.key;
      else if (mock?.trailer_key) formatted.trailer_key = mock.trailer_key;

      setCache(cacheKey, formatted);
      return formatted;
    } catch (err: any) {
      console.warn(`[TMDB] getMovieDetails fallback for ${movieId}: ${err.message}`);
      return mock || null;
    }
  },

  async getSimilarMovies(movieId: number): Promise<Movie[]> {
    const key = getApiKey();
    if (!key) {
      return MOCK_MOVIES.filter(m => m.id !== Number(movieId)).slice(0, 6);
    }

    try {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/similar`, {
        params: { api_key: key },
        timeout: 4000
      });
      const results = (res.data.results || []).map(formatTmdbMovie);
      return results.length > 0 ? results : MOCK_MOVIES.filter(m => m.id !== Number(movieId)).slice(0, 6);
    } catch {
      return MOCK_MOVIES.filter(m => m.id !== Number(movieId)).slice(0, 6);
    }
  },

  async getMovieCredits(movieId: number): Promise<{ director?: string; cast: any[] }> {
    const mock = MOCK_MOVIES.find(m => m.id === Number(movieId));
    const key = getApiKey();

    if (!key) {
      return {
        director: mock?.director,
        cast: mock?.cast || []
      };
    }

    try {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
        params: { api_key: key },
        timeout: 4000
      });
      const directorObj = (res.data.crew || []).find((c: any) => c.job === "Director");
      return {
        director: directorObj ? directorObj.name : mock?.director,
        cast: (res.data.cast || []).slice(0, 10).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profile_path: c.profile_path ? `${TMDB_IMAGE_BASE}${c.profile_path}` : undefined
        }))
      };
    } catch {
      return {
        director: mock?.director,
        cast: mock?.cast || []
      };
    }
  }
};
