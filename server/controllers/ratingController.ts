import { Response } from "express";
import { dbService } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";
import { tmdbService } from "../services/tmdbService.js";

export const ratingController = {
  async addOrUpdateRating(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Please log in to rate movies." });
        return;
      }

      const movieId = Number(req.body.movieId);
      const rating = Number(req.body.rating);

      if (!movieId || isNaN(movieId)) {
        res.status(400).json({ success: false, message: "Valid movieId is required." });
        return;
      }

      if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        res.status(400).json({ success: false, message: "Rating must be an integer between 1 and 5." });
        return;
      }

      const savedRating = await dbService.setRating(userId, movieId, rating);
      await dbService.recordInteraction(userId, movieId, "watched");

      res.status(200).json({
        success: true,
        data: savedRating
      });
    } catch (err: any) {
      console.error("[Rating] set error:", err);
      res.status(500).json({ success: false, message: "Failed to save movie rating." });
    }
  },

  async getRatingForMovie(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const movieId = Number(req.params.movieId);

      if (!movieId || isNaN(movieId)) {
        res.status(400).json({ success: false, message: "Valid movieId is required." });
        return;
      }

      if (!userId) {
        res.json({ success: true, data: null });
        return;
      }

      const rating = await dbService.getRatingForMovie(userId, movieId);
      res.json({ success: true, data: rating });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to load rating." });
    }
  },

  async getUserRatings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const ratings = await dbService.getRatingsByUser(userId);
      const enriched = await Promise.all(
        ratings.map(async (r) => {
          const movie = await tmdbService.getMovieDetails(r.movieId);
          return {
            ...r,
            movie
          };
        })
      );

      res.json({ success: true, data: enriched });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to load user ratings." });
    }
  },

  async updateRating(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const movieId = Number(req.params.movieId);
      const rating = Number(req.body.rating);

      if (!movieId || isNaN(movieId) || !rating || rating < 1 || rating > 5) {
        res.status(400).json({ success: false, message: "Invalid movieId or rating (1-5)." });
        return;
      }

      const updated = await dbService.setRating(userId, movieId, rating);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to update rating." });
    }
  },

  async deleteRating(req: AuthRequest, res: Response): Promise<void> {
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

      const success = await dbService.deleteRating(userId, movieId);
      if (!success) {
        res.status(404).json({ success: false, message: "Rating not found." });
        return;
      }

      res.json({ success: true, message: "Rating removed successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Unable to delete rating." });
    }
  }
};
