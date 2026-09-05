import axios from "axios";
import {
  Movie,
  User,
  WatchlistItem,
  RatingItem,
  RecommendationResponse,
  AIQueryResponse,
  SearchHistoryItem,
  WatchlistStatus
} from "../types";

const API_BASE = "/api";

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token if stored
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("cinesuggest_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  auth: {
    async register(data: { name: string; email: string; password: string; favoriteGenres?: string[] }): Promise<{ user: User; token: string }> {
      const res = await client.post("/auth/register", data);
      return res.data.data;
    },

    async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
      const res = await client.post("/auth/login", data);
      return res.data.data;
    },

    async getMe(): Promise<User> {
      const res = await client.get("/auth/me");
      return res.data.data.user;
    },

    async getPreferences(): Promise<{ favoriteGenres: string[]; favoriteActors: string[]; favoriteDirectors: string[] }> {
      const res = await client.get("/auth/preferences");
      return res.data.data;
    },

    async updatePreferences(prefs: { favoriteGenres?: string[]; favoriteActors?: string[]; favoriteDirectors?: string[] }): Promise<{ favoriteGenres: string[]; favoriteActors: string[]; favoriteDirectors: string[] }> {
      const res = await client.put("/auth/preferences", prefs);
      return res.data.data;
    },
  },

  movies: {
    async getTrending(): Promise<Movie[]> {
      const res = await client.get("/movies/trending");
      return res.data.data;
    },

    async getPopular(): Promise<Movie[]> {
      const res = await client.get("/movies/popular");
      return res.data.data;
    },

    async getTopRated(): Promise<Movie[]> {
      const res = await client.get("/movies/top-rated");
      return res.data.data;
    },

    async getUpcoming(): Promise<Movie[]> {
      const res = await client.get("/movies/upcoming");
      return res.data.data;
    },

    async search(query: string): Promise<Movie[]> {
      const res = await client.get("/movies/search", { params: { query } });
      return res.data.data;
    },

    async getByGenre(genre: string): Promise<Movie[]> {
      const res = await client.get(`/movies/genre/${encodeURIComponent(genre)}`);
      return res.data.data;
    },

    async getDetails(id: number): Promise<Movie> {
      const res = await client.get(`/movies/${id}`);
      return res.data.data;
    },

    async getSimilar(id: number): Promise<Movie[]> {
      const res = await client.get(`/movies/${id}/similar`);
      return res.data.data;
    },

    async getCredits(id: number): Promise<{ director?: string; cast: any[] }> {
      const res = await client.get(`/movies/${id}/credits`);
      return res.data.data;
    },

    async getSearchHistory(): Promise<SearchHistoryItem[]> {
      const res = await client.get("/search/history");
      return res.data.data;
    },

    async clearSearchHistory(): Promise<void> {
      await client.delete("/search/history");
    },
  },

  watchlist: {
    async getWatchlist(): Promise<WatchlistItem[]> {
      const res = await client.get("/watchlist");
      return res.data.data;
    },

    async add(movieId: number, status: WatchlistStatus = "want_to_watch"): Promise<WatchlistItem> {
      const res = await client.post("/watchlist", { movieId, status });
      return res.data.data;
    },

    async updateStatus(movieId: number, status: WatchlistStatus): Promise<WatchlistItem> {
      const res = await client.put(`/watchlist/${movieId}`, { status });
      return res.data.data;
    },

    async remove(movieId: number): Promise<void> {
      await client.delete(`/watchlist/${movieId}`);
    },
  },

  ratings: {
    async setRating(movieId: number, rating: number): Promise<RatingItem> {
      const res = await client.post("/ratings", { movieId, rating });
      return res.data.data;
    },

    async getRatingForMovie(movieId: number): Promise<RatingItem | null> {
      const res = await client.get(`/ratings/${movieId}`);
      return res.data.data;
    },

    async getUserRatings(): Promise<RatingItem[]> {
      const res = await client.get("/ratings/user");
      return res.data.data;
    },

    async deleteRating(movieId: number): Promise<void> {
      await client.delete(`/ratings/${movieId}`);
    },
  },

  recommendations: {
    async getRecommendations(): Promise<RecommendationResponse> {
      const res = await client.get("/recommendations");
      return res.data.data;
    },
  },

  ai: {
    async queryMovie(query: string): Promise<AIQueryResponse> {
      const res = await client.post("/ai/movie-query", { query });
      return res.data.data;
    },

    async explain(movieTitle: string, userGenres: string[], referenceMovie?: string): Promise<string> {
      const res = await client.post("/ai/explain", { movieTitle, userGenres, referenceMovie });
      return res.data.data.explanation;
    },
  },
};
