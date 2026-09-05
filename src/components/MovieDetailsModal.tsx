import React, { useEffect, useState } from "react";
import { X, Play, Plus, Check, Star, Sparkles, Clock, Calendar, Film, User, Eye } from "lucide-react";
import { Movie, WatchlistStatus } from "../types";
import { api } from "../services/api";

interface MovieDetailsModalProps {
  movieId: number;
  onClose: () => void;
  onWatchTrailer: (movieId: number) => void;
  onSelectSimilar: (movieId: number) => void;
  onWatchlistChange?: () => void;
  onRatingChange?: () => void;
  userWatchlistStatus?: WatchlistStatus | null;
  userRating?: number;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movieId,
  onClose,
  onWatchTrailer,
  onSelectSimilar,
  onWatchlistChange,
  onRatingChange,
  userWatchlistStatus: initialWatchlistStatus,
  userRating: initialUserRating,
}) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [watchlistStatus, setWatchlistStatus] = useState<WatchlistStatus | null>(initialWatchlistStatus || null);
  const [currentRating, setCurrentRating] = useState<number>(initialUserRating || 0);
  const [isSavingRating, setIsSavingRating] = useState<boolean>(false);
  const [isUpdatingWatchlist, setIsUpdatingWatchlist] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    async function loadDetails() {
      setIsLoading(true);
      try {
        const [details, sim] = await Promise.all([
          api.movies.getDetails(movieId),
          api.movies.getSimilar(movieId),
        ]);

        if (mounted) {
          setMovie(details);
          setSimilar(sim.slice(0, 5));

          // Also check user's existing rating if not passed
          if (initialUserRating === undefined) {
            const userRat = await api.ratings.getRatingForMovie(movieId);
            if (userRat) setCurrentRating(userRat.rating);
          }
        }
      } catch (err) {
        console.error("Failed to load movie details:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadDetails();
    return () => {
      mounted = false;
    };
  }, [movieId, initialUserRating]);

  // Handle rating click
  const handleRate = async (stars: number) => {
    try {
      setIsSavingRating(true);
      if (stars === currentRating) {
        await api.ratings.deleteRating(movieId);
        setCurrentRating(0);
      } else {
        await api.ratings.setRating(movieId, stars);
        setCurrentRating(stars);
      }
      onRatingChange?.();
    } catch (err) {
      console.error("Failed to set rating:", err);
    } finally {
      setIsSavingRating(false);
    }
  };

  // Handle watchlist status change
  const handleSetWatchlistStatus = async (status: WatchlistStatus) => {
    try {
      setIsUpdatingWatchlist(true);
      if (watchlistStatus === status) {
        // Toggle off / remove
        await api.watchlist.remove(movieId);
        setWatchlistStatus(null);
      } else {
        await api.watchlist.add(movieId, status);
        setWatchlistStatus(status);
      }
      onWatchlistChange?.();
    } catch (err) {
      console.error("Failed to update watchlist:", err);
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-xl overflow-y-auto">
      <div className="relative my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black">
        
        {/* Close Button */}
        <button
          id="close-details-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-zinc-300 backdrop-blur-md transition hover:bg-[#F27D26] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading || !movie ? (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F27D26] border-t-transparent" />
              <p className="text-xs text-zinc-400">Loading cinematic profile...</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Backdrop Banner */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <img
                src={movie.backdrop_path || movie.poster_path}
                alt={movie.title}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent" />

              {/* Match Percentage Pill */}
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/20 px-3.5 py-1 text-xs font-bold text-green-400 backdrop-blur-md shadow-lg">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{movie.matchPercentage || 96}% CineMatch</span>
                </div>
                {movie.certification && (
                  <span className="rounded-md border border-white/15 bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                    {movie.certification}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Title & Metadata */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h2 className="font-['Outfit'] text-2xl font-bold text-white sm:text-3xl">
                    {movie.title}
                  </h2>
                  {movie.tagline && (
                    <p className="mt-0.5 text-xs text-zinc-400 italic">"{movie.tagline}"</p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  {movie.release_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#F27D26]" />
                      {movie.release_date.split("-")[0]}
                    </span>
                  )}
                  {movie.runtime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#F27D26]" />
                      {movie.runtime} min
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[#F27D26] text-[#F27D26]" />
                    <strong className="text-white">{movie.vote_average}</strong> / 10
                  </span>
                </div>
              </div>

              {/* Genres Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g.id || g.name}
                    className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-200"
                  >
                    {g.name}
                  </span>
                ))}
                {movie.director && (
                  <span className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                    Director: <strong className="text-white">{movie.director}</strong>
                  </span>
                )}
              </div>

              {/* Recommendation Reason Box */}
              {movie.reason && (
                <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 text-xs text-zinc-300 shadow-md">
                  <span className="font-semibold text-[#F27D26]">Algorithmic Insight: </span>
                  {movie.reason}
                </div>
              )}

              {/* Action Bar: Trailer + Watchlist Status + User Rating */}
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/5 bg-zinc-900/50 p-4 sm:grid-cols-3">
                
                {/* 1. Watch Trailer */}
                <div className="flex flex-col justify-center space-y-1">
                  <span className="text-[11px] font-medium text-zinc-400">Video:</span>
                  <button
                    id="modal-watch-trailer-btn"
                    onClick={() => onWatchTrailer(movie.id)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#F27D26] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-950/50 transition hover:bg-orange-600 active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Watch Trailer
                  </button>
                </div>

                {/* 2. Watchlist Status Switcher */}
                <div className="flex flex-col justify-center space-y-1">
                  <span className="text-[11px] font-medium text-zinc-400">Watchlist Status:</span>
                  <div className="flex rounded-xl border border-white/10 bg-zinc-950 p-1 text-[11px]">
                    <button
                      onClick={() => handleSetWatchlistStatus("want_to_watch")}
                      className={`flex-1 rounded-lg py-1.5 font-medium transition ${
                        watchlistStatus === "want_to_watch"
                          ? "bg-[#F27D26] text-white font-bold shadow-md shadow-orange-950/40"
                          : "text-zinc-400 hover:text-white"
                      }`}
                      title="Want to Watch"
                    >
                      Want
                    </button>
                    <button
                      onClick={() => handleSetWatchlistStatus("currently_watching")}
                      className={`flex-1 rounded-lg py-1.5 font-medium transition ${
                        watchlistStatus === "currently_watching"
                          ? "bg-[#F27D26] text-white font-bold shadow-md shadow-orange-950/40"
                          : "text-zinc-400 hover:text-white"
                      }`}
                      title="Currently Watching"
                    >
                      Watching
                    </button>
                    <button
                      onClick={() => handleSetWatchlistStatus("watched")}
                      className={`flex-1 rounded-lg py-1.5 font-medium transition ${
                        watchlistStatus === "watched"
                          ? "bg-[#F27D26] text-white font-bold shadow-md shadow-orange-950/40"
                          : "text-zinc-400 hover:text-white"
                      }`}
                      title="Watched"
                    >
                      Watched
                    </button>
                  </div>
                </div>

                {/* 3. Your Rating (1-5 Stars) */}
                <div className="flex flex-col justify-center space-y-1">
                  <span className="text-[11px] font-medium text-zinc-400">
                    Your Rating: {currentRating > 0 ? `${currentRating}/5 Stars` : "Not rated"}
                  </span>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(star)}
                        disabled={isSavingRating}
                        className="transition hover:scale-125"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            currentRating >= star
                              ? "fill-[#F27D26] text-[#F27D26]"
                              : "text-zinc-700 hover:text-[#F27D26]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Synopsis / Overview */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Synopsis
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                  {movie.overview}
                </p>
              </div>

              {/* Cast Row */}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Featured Cast
                  </h4>
                  <div className="no-scrollbar mt-2 flex gap-3 overflow-x-auto pb-1">
                    {movie.cast.map((actor) => (
                      <div
                        key={actor.id}
                        className="flex w-24 shrink-0 flex-col items-center text-center"
                      >
                        <div className="h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-zinc-950">
                          {actor.profile_path ? (
                            <img
                              src={actor.profile_path}
                              alt={actor.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-400">
                              <User className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <span className="mt-1 line-clamp-1 text-[11px] font-medium text-white">
                          {actor.name}
                        </span>
                        {actor.character && (
                          <span className="line-clamp-1 text-[10px] text-zinc-400">
                            {actor.character}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Movies */}
              {similar.length > 0 && (
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    You Might Also Like
                  </h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {similar.map((simMovie) => (
                      <div
                        key={simMovie.id}
                        onClick={() => onSelectSimilar(simMovie.id)}
                        className="group cursor-pointer space-y-1"
                      >
                        <div className="aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-zinc-950">
                          <img
                            src={simMovie.poster_path}
                            alt={simMovie.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <p className="line-clamp-1 text-xs font-medium text-white group-hover:text-[#F27D26]">
                          {simMovie.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
