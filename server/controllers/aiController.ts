import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { parseMovieQueryWithAI, generatePersonalizedReason } from "../services/geminiService.js";
import { tmdbService } from "../services/tmdbService.js";
import { Movie, MOCK_MOVIES } from "../services/mockMovies.js";

export const aiController = {
  async handleMovieQuery(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string" || !query.trim()) {
        res.status(400).json({ success: false, message: "Query string is required." });
        return;
      }

      // Parse structured preferences with Gemini
      const structured = await parseMovieQueryWithAI(query.trim());

      // Query TMDB or fallback catalog based on structured preferences
      let matchedMovies: Movie[] = [];

      // Try suggested titles first
      if (structured.suggestedTitles && structured.suggestedTitles.length > 0) {
        for (const title of structured.suggestedTitles.slice(0, 3)) {
          const results = await tmdbService.searchMovies(title);
          if (results.length > 0) matchedMovies.push(results[0]);
        }
      }

      // If needed, search with main query or primary genre
      if (matchedMovies.length < 4) {
        const keywordResults = await tmdbService.searchMovies(query);
        for (const m of keywordResults) {
          if (!matchedMovies.some(existing => existing.id === m.id)) {
            matchedMovies.push(m);
          }
        }
      }

      if (matchedMovies.length < 4 && structured.genres.length > 0) {
        const genreResults = await tmdbService.getMoviesByGenre(structured.genres[0]);
        for (const m of genreResults) {
          if (!matchedMovies.some(existing => existing.id === m.id)) {
            matchedMovies.push(m);
          }
        }
      }

      if (matchedMovies.length === 0) {
        matchedMovies = MOCK_MOVIES.slice(0, 6);
      }

      res.json({
        success: true,
        data: {
          structured,
          movies: matchedMovies.slice(0, 8),
          aiEnabled: Boolean(process.env.GEMINI_API_KEY)
        }
      });
    } catch (err: any) {
      console.error("[AI] movie-query error:", err);
      res.status(500).json({ success: false, message: "Failed to process AI movie query." });
    }
  },

  async explainRecommendation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { movieTitle, userGenres, referenceMovie } = req.body;
      if (!movieTitle) {
        res.status(400).json({ success: false, message: "Movie title is required." });
        return;
      }

      const explanation = await generatePersonalizedReason(
        movieTitle,
        Array.isArray(userGenres) ? userGenres : ["Sci-Fi", "Drama"],
        referenceMovie
      );

      res.json({
        success: true,
        data: {
          explanation
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to generate explanation." });
    }
  }
};
