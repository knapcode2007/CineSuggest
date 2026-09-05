import { dbService } from "../models/index.js";
import { Movie, MOCK_MOVIES } from "./mockMovies.js";
import { tmdbService } from "./tmdbService.js";

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

export async function computeRecommendations(userId?: string): Promise<RecommendationResponse> {
  // 1. Gather User Context
  let favoriteGenres = ["Sci-Fi", "Thriller", "Drama"];
  let favoriteDirectors = ["Denis Villeneuve", "Christopher Nolan"];
  let userRatings: { movieId: number; rating: number }[] = [];
  let userWatchlist: { movieId: number; status: string }[] = [];
  let userInteractions: { movieId: number; type: string }[] = [];

  if (userId) {
    const user = await dbService.findUserById(userId);
    if (user) {
      if (user.favoriteGenres && user.favoriteGenres.length > 0) favoriteGenres = user.favoriteGenres;
      if (user.favoriteDirectors && user.favoriteDirectors.length > 0) favoriteDirectors = user.favoriteDirectors;
    }
    userRatings = (await dbService.getRatingsByUser(userId)).map(r => ({ movieId: r.movieId, rating: r.rating }));
    userWatchlist = (await dbService.getWatchlist(userId)).map(w => ({ movieId: w.movieId, status: w.status }));
    userInteractions = (await dbService.getUserInteractions(userId)).map(i => ({ movieId: i.movieId, type: i.type }));
  }

  // 2. High-rated movies (rated >= 4)
  const highlyRatedIds = userRatings.filter(r => r.rating >= 4).map(r => r.movieId);
  const watchedMovieIds = new Set([
    ...userWatchlist.filter(w => w.status === "watched").map(w => w.movieId),
    ...userInteractions.filter(i => i.type === "watched").map(i => i.movieId)
  ]);

  // 3. Pool candidate movies
  const trending = await tmdbService.getTrending();
  const popular = await tmdbService.getPopular();
  const topRated = await tmdbService.getTopRated();

  const candidateMap = new Map<number, Movie>();
  for (const m of [...MOCK_MOVIES, ...trending, ...popular, ...topRated]) {
    candidateMap.set(m.id, m);
  }
  const candidateList = Array.from(candidateMap.values());

  // Find a prominent high-rated reference movie (e.g. Interstellar, Blade Runner 2049, Inception)
  let referenceMovie = candidateList.find(m => highlyRatedIds.includes(m.id)) || candidateList.find(m => m.title === "Interstellar") || candidateList[1];

  // 4. Scoring Algorithm:
  // Genre similarity: 50%
  // Similarity to highly-rated movies: 25%
  // User interaction history: 15%
  // Movie rating / popularity: 10%
  const scoredItems: RecommendationItem[] = candidateList.map(movie => {
    const movieGenres = movie.genres.map(g => g.name);

    // A. Genre similarity (50 pts max)
    const matchingGenres = movieGenres.filter(g =>
      favoriteGenres.some(fg => fg.toLowerCase() === g.toLowerCase())
    );
    const genreRatio = favoriteGenres.length > 0 ? matchingGenres.length / Math.min(favoriteGenres.length, 3) : 0.5;
    const genreScore = Math.min(50, Math.round(genreRatio * 50));

    // B. Similarity to highly-rated movies (25 pts max)
    let ratedSimScore = 15; // baseline
    if (referenceMovie && referenceMovie.id !== movie.id) {
      const commonGenres = movieGenres.filter(g => referenceMovie.genres.some(rg => rg.name.toLowerCase() === g.toLowerCase()));
      const sameDirector = (movie.director && referenceMovie.director && movie.director === referenceMovie.director) ||
                           (movie.director && favoriteDirectors.includes(movie.director));
      ratedSimScore = Math.min(25, (commonGenres.length * 8) + (sameDirector ? 12 : 0));
    }

    // C. User interaction history (15 pts max)
    let interactionScore = 8;
    const isWatchlisted = userWatchlist.some(w => w.movieId === movie.id);
    const isInteracted = userInteractions.some(i => i.movieId === movie.id);
    if (isWatchlisted) interactionScore += 5;
    if (isInteracted) interactionScore += 2;
    interactionScore = Math.min(15, interactionScore);

    // D. Movie rating & popularity (10 pts max)
    const ratingRatio = (movie.vote_average || 7.0) / 10;
    const popRatio = Math.min(1, (movie.popularity || 50) / 100);
    const qualityScore = Math.round((ratingRatio * 0.7 + popRatio * 0.3) * 10);

    // Total Match percentage normalized to 75% - 99%
    const rawTotal = genreScore + ratedSimScore + interactionScore + qualityScore;
    const normalizedMatch = Math.min(99, Math.max(72, Math.round(70 + (rawTotal / 100) * 29)));

    // Generate dynamic explanation
    let reason = "Curated based on your cinematic taste profile.";
    if (matchingGenres.length > 0 && referenceMovie) {
      reason = `Because you liked ${matchingGenres.join(" & ")} and rated ${referenceMovie.title} highly.`;
    } else if (movie.director && favoriteDirectors.includes(movie.director)) {
      reason = `Matches your affinity for director ${movie.director}.`;
    } else if (matchingGenres.length > 0) {
      reason = `High affinity match for your favorite ${matchingGenres[0]} themes.`;
    }

    return {
      movieId: movie.id,
      title: movie.title,
      poster: movie.poster_path,
      backdrop: movie.backdrop_path,
      rating: movie.vote_average,
      genres: movieGenres,
      matchPercentage: normalizedMatch,
      reason,
      release_date: movie.release_date,
      director: movie.director,
      surpriseScore: movie.surpriseScore,
      editorialBadge: movie.editorialBadge
    };
  });

  // Sort descending by match percentage
  scoredItems.sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Spotlight movie: top match (e.g., Interstellar or Dune 2)
  const spotlight = scoredItems[0] || {
    movieId: 157336,
    title: "Interstellar",
    poster: "https://lh3.googleusercontent.com/aida-public/AB6AXuCilc8Xuq4pSp50nF70KEmdhRERAHfk3Nxdux2KVgg0Fr-3pc258gGQUog6urDXvFtK2ibmUal7WrrIWz9nC2rERLyISlxTFi4V8qbMebb7IQZKKFhH8PpGLlIYEszZw_ahz2rUySeQxXmW_EQUYWrF_S4nddbUUUeJEkDIdXzBpdIopIIiMKAM7k_JP2DXc-hVTnUtoJA3IfCbeOHxob5GFMMB4qyRb4QRhECZjLFMSOkAZXCChKW8",
    backdrop: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUOgv9yz_3DQX1fTFYydTIsYfVF-fvHNZiVhKltsHN3PvjKLMXWksC0vxB-rQFWgk9TpU6WGQyFqqlOetiytLOefpkZJtECFRmIadfyl9NoC1qyz89_7Q6_QEuPFuUsqeu6J-IxqrRrif8L8vHYEuOdW-8csV1vtikQJvSLwVrsIwz32uSbvNHcxbvKHCHxovhZeVF3DMaYHjaDJyBPEq1-V7f2eUIjFGQRrqlyduHjcVjTSE6Qwv0",
    rating: 8.7,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    matchPercentage: 99,
    reason: "Matches your strong affinity for Christopher Nolan and realistic celestial physics.",
    director: "Christopher Nolan"
  };

  const topRecommendations = scoredItems.slice(0, 6);

  // Because You Watched Inception / Blade Runner 2049
  const becauseYouWatchedItems = scoredItems
    .filter(item => item.movieId !== referenceMovie.id && item.genres.some(g => g === "Sci-Fi" || g === "Mystery" || g === "Thriller"))
    .slice(0, 6);

  // Hidden Gems: films with surpriseScore or lower vote counts but high ratings (e.g. Coherence, Moon, Primer)
  const hiddenGems = scoredItems
    .filter(item => [220289, 17431, 14337, 77, 264660].includes(item.movieId))
    .slice(0, 4);

  // Trending for you
  const trendingForYou = scoredItems
    .filter(item => item.movieId !== spotlight.movieId)
    .slice(2, 8);

  const topGenre = favoriteGenres[0] || "Sci-Fi";
  const becauseYouLikeGenre = scoredItems.filter(item => item.genres.includes(topGenre)).slice(0, 6);

  return {
    spotlight,
    topRecommendations,
    becauseYouWatched: {
      referenceMovie: { id: referenceMovie.id, title: referenceMovie.title },
      items: becauseYouWatchedItems
    },
    hiddenGems,
    trendingForYou,
    categories: [
      { name: "Perfect Match", items: scoredItems.filter(i => i.matchPercentage >= 95).slice(0, 6) },
      { name: `Because You Like ${topGenre}`, items: becauseYouLikeGenre },
      { name: "Similar to Your Favorites", items: becauseYouWatchedItems },
      { name: "Hidden Gems", items: hiddenGems },
      { name: "Trending For You", items: trendingForYou }
    ]
  };
}
