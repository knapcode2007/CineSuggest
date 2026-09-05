import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { movieController } from "../controllers/movieController.js";
import { watchlistController } from "../controllers/watchlistController.js";
import { ratingController } from "../controllers/ratingController.js";
import { recommendationController } from "../controllers/recommendationController.js";
import { aiController } from "../controllers/aiController.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

export const apiRouter = Router();

// Health check
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "CineSuggest",
    timestamp: new Date().toISOString(),
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    tmdbEnabled: Boolean(process.env.TMDB_API_KEY)
  });
});

// AUTH
apiRouter.post("/auth/register", authController.register);
apiRouter.post("/auth/login", authController.login);
apiRouter.get("/auth/me", requireAuth, authController.getMe);
apiRouter.get("/auth/preferences", requireAuth, authController.getPreferences);
apiRouter.put("/auth/preferences", requireAuth, authController.updatePreferences);

// MOVIES
apiRouter.get("/movies/trending", movieController.getTrending);
apiRouter.get("/movies/popular", movieController.getPopular);
apiRouter.get("/movies/top-rated", movieController.getTopRated);
apiRouter.get("/movies/upcoming", movieController.getUpcoming);
apiRouter.get("/movies/search", optionalAuth, movieController.searchMovies);
apiRouter.get("/movies/genre/:genre", movieController.getGenre);
apiRouter.get("/movies/:id", optionalAuth, movieController.getMovieDetails);
apiRouter.get("/movies/:id/similar", movieController.getSimilar);
apiRouter.get("/movies/:id/credits", movieController.getCredits);

// SEARCH HISTORY
apiRouter.get("/search/history", requireAuth, movieController.getSearchHistory);
apiRouter.delete("/search/history", requireAuth, movieController.clearSearchHistory);

// WATCHLIST
apiRouter.get("/watchlist", requireAuth, watchlistController.getWatchlist);
apiRouter.post("/watchlist", requireAuth, watchlistController.addMovie);
apiRouter.put("/watchlist/:movieId", requireAuth, watchlistController.updateStatus);
apiRouter.delete("/watchlist/:movieId", requireAuth, watchlistController.removeMovie);

// RATINGS
apiRouter.post("/ratings", requireAuth, ratingController.addOrUpdateRating);
apiRouter.get("/ratings/user", requireAuth, ratingController.getUserRatings);
apiRouter.get("/ratings/:movieId", optionalAuth, ratingController.getRatingForMovie);
apiRouter.put("/ratings/:movieId", requireAuth, ratingController.updateRating);
apiRouter.delete("/ratings/:movieId", requireAuth, ratingController.deleteRating);

// RECOMMENDATIONS
apiRouter.get("/recommendations", optionalAuth, recommendationController.getRecommendations);

// AI
apiRouter.post("/ai/movie-query", optionalAuth, aiController.handleMovieQuery);
apiRouter.post("/ai/explain", optionalAuth, aiController.explainRecommendation);
