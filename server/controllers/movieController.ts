import { Response } from "express";
import { tmdbService } from "../services/tmdbService.js";
import { dbService } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";

export const movieController = {
  async getTrending(req: AuthRequest, res: Response): Promise<void> {
    try {
      const movies = await tmdbService.getTrending();
      res.json({ success: true, data: movies });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to load trending movies." });
    }
  },

  async getPopular(req: AuthRequest, res: Response): Promise<void> {
    try {
      const movies = await tmdbService.getPopular();
      res.json({ success: true, data: movies });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to load popular movies." });
    }
  },

  async getTopRated(req: AuthRequest, res: Response): Promise<void> {
    try {
      const movies = await tmdbService.getTopRated();
      res.json({ success: true, data: movies });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to load top-rated movies." });
    }
  },

  async getUpcoming(req: AuthRequest, res: Response): Promise<void> {
    try {
      const movies = await tmdbService.getUpcoming();
      res.json({ success: true, data: movies });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to load upcoming movies." });
    }
  },

  async searchMovies(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = String(req.query.query || "").trim();
      if (!query) {
        res.json({ success: true, data: [] });
        return;
      }

      // Record authenticated user search history
      if (req.user?.userId) {
        await dbService.addSearchHistory(req.user.userId, query);
        // Record search interaction
        await dbService.recordInteraction(req.user.userId, 0, "search");
      }

      const results = await tmdbService.searchMovies(query);
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Error searching movies." });
    }
  },

  async getGenre(req: AuthRequest, res: Response): Promise<void> {
    try {
      const genre = req.params.genre;
      const results = await tmdbService.getMoviesByGenre(genre);
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to load movies for this genre." });
    }
  },

  async getMovieDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const movieId = Number(req.params.id);
      if (!movieId || isNaN(movieId)) {
        res.status(400).json({ success: false, message: "Invalid movie ID." });
        return;
      }

      const movie = await tmdbService.getMovieDetails(movieId);
      if (!movie) {
        res.status(404).json({ success: false, message: "Movie not found." });
        return;
      }

      // Record a "view" interaction for authenticated users
      if (req.user?.userId) {
        await dbService.recordInteraction(req.user.userId, movieId, "view");
      }

      res.json({ success: true, data: movie });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to fetch movie details." });
    }
  },

  async getSimilar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const movieId = Number(req.params.id);
      const similar = await tmdbService.getSimilarMovies(movieId);
      res.json({ success: true, data: similar });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to load similar movies." });
    }
  },

  async getCredits(req: AuthRequest, res: Response): Promise<void> {
    try {
      const movieId = Number(req.params.id);
      const credits = await tmdbService.getMovieCredits(movieId);
      res.json({ success: true, data: credits });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to load movie credits." });
    }
  },

  async getSearchHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.json({ success: true, data: [] });
        return;
      }

      const history = await dbService.getSearchHistory(userId);
      res.json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to retrieve search history." });
    }
  },

  async clearSearchHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      await dbService.clearSearchHistory(userId);
      res.json({ success: true, message: "Search history cleared." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to clear search history." });
    }
  }
};
