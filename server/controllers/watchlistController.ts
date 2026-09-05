import { Response } from "express";
import { dbService } from "../models/index.js";
import { tmdbService } from "../services/tmdbService.js";
import { AuthRequest } from "../middleware/auth.js";

export const watchlistController = {
  async getWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Please log in to access your watchlist." });
        return;
      }

      const rawItems = await dbService.getWatchlist(userId);

      // Enrich with movie metadata
      const enriched = await Promise.all(
        rawItems.map(async (item) => {
          const movie = await tmdbService.getMovieDetails(item.movieId);
          return {
            ...item,
            movie: movie || {
              id: item.movieId,
              title: "Movie #" + item.movieId,
              poster_path: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500",
              vote_average: 7.5,
              release_date: "2024",
              genres: []
            }
          };
        })
      );

      res.json({ success: true, data: enriched });
    } catch (err: any) {
      console.error("[Watchlist] get error:", err);
      res.status(500).json({ success: false, message: "Unable to load watchlist." });
    }
  },

  async addMovie(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Please log in to add movies to your watchlist." });
        return;
      }

      const movieId = Number(req.body.movieId);
      const status = req.body.status || "want_to_watch";

      if (!movieId || isNaN(movieId)) {
        res.status(400).json({ success: false, message: "Valid movieId is required." });
        return;
      }

      const item = await dbService.addToWatchlist(userId, movieId, status);
      await dbService.recordInteraction(userId, movieId, status === "watched" ? "watched" : "watchlist");

      const movie = await tmdbService.getMovieDetails(movieId);

      res.status(201).json({
        success: true,
        data: {
          ...item,
          movie
        }
      });
    } catch (err: any) {
      console.error("[Watchlist] add error:", err);
      res.status(500).json({ success: false, message: "Failed to add movie to watchlist." });
    }
  },

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const movieId = Number(req.params.movieId);
      const status = req.body.status;

      if (!movieId || isNaN(movieId) || !["want_to_watch", "currently_watching", "watched"].includes(status)) {
        res.status(400).json({ success: false, message: "Invalid movieId or status." });
        return;
      }

      const updated = await dbService.updateWatchlistStatus(userId, movieId, status);
      if (!updated) {
        res.status(404).json({ success: false, message: "Watchlist entry not found." });
        return;
      }

      if (status === "watched") {
        await dbService.recordInteraction(userId, movieId, "watched");
      }

      const movie = await tmdbService.getMovieDetails(movieId);

      res.json({
        success: true,
        data: {
          ...updated,
          movie
        }
      });
    } catch (err: any) {
      console.error("[Watchlist] update error:", err);
      res.status(500).json({ success: false, message: "Failed to update watchlist status." });
    }
  },

  async removeMovie(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const movieId = Number(req.params.movieId);
      if (!movieId || isNaN(movieId)) {
        res.status(400).json({ success: false, message: "Valid movieId is required." });
        return;
      }

      const success = await dbService.removeFromWatchlist(userId, movieId);
      if (!success) {
        res.status(404).json({ success: false, message: "Movie not found in your watchlist." });
        return;
      }

      res.json({ success: true, message: "Movie removed from watchlist." });
    } catch (err: any) {
      console.error("[Watchlist] remove error:", err);
      res.status(500).json({ success: false, message: "Failed to remove movie." });
    }
  }
};
