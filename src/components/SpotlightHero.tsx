import React from "react";
import { Play, Plus, Check, Star, Info, Sparkles } from "lucide-react";
import { RecommendationItem } from "../types";

interface SpotlightHeroProps {
  movie: RecommendationItem;
  isInWatchlist: boolean;
  userRating?: number;
  onWatchlistToggle: (movieId: number) => void;
  onWatchTrailer: (movieId: number) => void;
  onOpenDetails: (movieId: number) => void;
  onRate: (movieId: number, rating: number) => void;
}

export const SpotlightHero: React.FC<SpotlightHeroProps> = ({
  movie,
  isInWatchlist,
  userRating,
  onWatchlistToggle,
  onWatchTrailer,
  onOpenDetails,
  onRate,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/80">
      {/* Background Backdrop with Gradient Overlays */}
      <div className="relative h-[480px] w-full sm:h-[530px] lg:h-[600px]">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover object-center transition duration-700 hover:scale-105"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/85 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,#F27D26_0%,transparent_65%)] opacity-35 mix-blend-screen pointer-events-none" />
      </div>

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14">
        <div className="max-w-2xl space-y-4">
          
          {/* Match & Affinity Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400 backdrop-blur-md shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{movie.matchPercentage || 98}% CineMatch</span>
            </div>

            {movie.editorialBadge && (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-200 backdrop-blur-md">
                {movie.editorialBadge}
              </span>
            )}

            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-zinc-200 backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-[#F27D26] text-[#F27D26]" />
              <span className="font-bold text-white">{movie.rating}</span>
              <span className="text-zinc-400">/ 10</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-['Outfit'] text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-sm">
            {movie.title}
          </h1>

          {/* Recommendation Reason */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/75 p-3.5 sm:p-4 backdrop-blur-md shadow-lg shadow-black/40">
            <p className="text-xs text-zinc-300 sm:text-sm leading-relaxed">
              <span className="font-semibold text-[#F27D26]">Why CineSuggest picked this: </span>
              {movie.reason}
            </p>
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-medium">
            {movie.release_date && <span className="text-zinc-300">{movie.release_date.split("-")[0]}</span>}
            {movie.director && (
              <>
                <span className="text-zinc-600">•</span>
                <span>Dir. {movie.director}</span>
              </>
            )}
            {movie.genres && movie.genres.length > 0 && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-200">{movie.genres.join(" / ")}</span>
              </>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Watch Trailer */}
            <button
              id="hero-watch-trailer-btn"
              onClick={() => onWatchTrailer(movie.movieId)}
              className="flex items-center gap-2 rounded-xl bg-[#F27D26] px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-orange-950/50 transition hover:bg-orange-600 active:scale-95"
            >
              <Play className="h-4 w-4 fill-white" />
              Watch Trailer
            </button>

            {/* Watchlist Toggle */}
            <button
              id="hero-watchlist-toggle-btn"
              onClick={() => onWatchlistToggle(movie.movieId)}
              className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold backdrop-blur-md transition active:scale-95 ${
                isInWatchlist
                  ? "border-[#F27D26]/50 bg-[#F27D26]/20 text-[#F27D26]"
                  : "border-white/10 bg-white/10 text-white hover:bg-white/20 hover:border-white/20"
              }`}
            >
              {isInWatchlist ? (
                <>
                  <Check className="h-4 w-4 text-[#F27D26]" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add to Watchlist
                </>
              )}
            </button>

            {/* Movie Info Modal */}
            <button
              id="hero-more-info-btn"
              onClick={() => onOpenDetails(movie.movieId)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:bg-zinc-800 hover:text-white"
            >
              <Info className="h-4 w-4" />
              Details
            </button>

            {/* Quick Star Rating */}
            <div className="hidden items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2 sm:flex backdrop-blur-sm">
              <span className="mr-1 text-[11px] text-zinc-400">Rate:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onRate(movie.movieId, star)}
                  className="transition hover:scale-125"
                  title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-4 w-4 ${
                      (userRating || 0) >= star
                        ? "fill-[#F27D26] text-[#F27D26]"
                        : "text-zinc-600 hover:text-[#F27D26]"
                    }`}
                  />
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
