import React from "react";
import { Star, Plus, Check, Play, Sparkles } from "lucide-react";
import { Movie, RecommendationItem } from "../types";

interface MovieCardProps {
  movie: Movie | RecommendationItem;
  isInWatchlist?: boolean;
  userRating?: number;
  onSelect: (movieId: number) => void;
  onToggleWatchlist?: (movieId: number) => void;
  onWatchTrailer?: (movieId: number) => void;
  onRate?: (movieId: number, rating: number) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isInWatchlist = false,
  userRating,
  onSelect,
  onToggleWatchlist,
  onWatchTrailer,
  onRate,
}) => {
  const movieId = "movieId" in movie ? movie.movieId : movie.id;
  const poster = "poster" in movie ? movie.poster : movie.poster_path;
  const rating = "rating" in movie ? movie.rating : movie.vote_average;
  const matchPercentage = movie.matchPercentage;
  const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "";
  const genres = "genres" in movie
    ? Array.isArray(movie.genres)
      ? typeof movie.genres[0] === "string"
        ? (movie.genres as string[])
        : (movie.genres as any[]).map((g) => g.name)
      : []
    : [];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/70 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#F27D26]/40 hover:shadow-2xl hover:shadow-black/90">
      
      {/* Poster Container */}
      <div
        onClick={() => onSelect(movieId)}
        className="relative aspect-[2/3] w-full cursor-pointer overflow-hidden bg-zinc-950"
      >
        <img
          src={poster}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/50 opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
          {/* Match % Badge */}
          {matchPercentage ? (
            <div className="flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400 backdrop-blur-md shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>{matchPercentage}%</span>
            </div>
          ) : (
            <span />
          )}

          {/* TMDB Rating */}
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[11px] font-medium text-zinc-200 backdrop-blur-md">
            <Star className="h-3 w-3 fill-[#F27D26] text-[#F27D26]" />
            <span className="font-semibold text-white">{rating ? rating.toFixed(1) : "7.5"}</span>
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/70 p-4 opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
          
          {onWatchTrailer && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWatchTrailer(movieId);
              }}
              className="flex items-center gap-1.5 rounded-full bg-[#F27D26] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-orange-950/40 transition hover:bg-orange-600 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              Trailer
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(movieId);
            }}
            className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
          >
            View Details
          </button>

          {/* Quick Rating on hover */}
          {onRate && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-black/80 px-2.5 py-1 backdrop-blur-sm"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onRate(movieId, star)}
                  className="transition hover:scale-125"
                  title={`Rate ${star}`}
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      (userRating || 0) >= star
                        ? "fill-[#F27D26] text-[#F27D26]"
                        : "text-zinc-600 hover:text-[#F27D26]"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Watchlist Quick Button (Bottom Corner) */}
        {onToggleWatchlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(movieId);
            }}
            className={`absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition ${
              isInWatchlist
                ? "bg-[#F27D26] text-white shadow-orange-950/40"
                : "border border-white/20 bg-black/70 text-white hover:bg-[#F27D26] hover:border-transparent hover:text-white"
            }`}
            title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isInWatchlist ? <Check className="h-4 w-4 stroke-[2.5]" /> : <Plus className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-1 flex-col p-3.5">
        <h3
          onClick={() => onSelect(movieId)}
          className="cursor-pointer truncate font-['Outfit'] text-sm font-bold text-white transition hover:text-[#F27D26]"
          title={movie.title}
        >
          {movie.title}
        </h3>

        <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
          <span>{releaseYear || "2024"}</span>
          <span className="truncate max-w-[120px] text-zinc-400">{genres.slice(0, 2).join(" • ")}</span>
        </div>

        {/* Reason snippet for recommendations */}
        {movie.reason && (
          <p className="mt-1.5 line-clamp-1 text-[11px] text-zinc-400 italic">
            "{movie.reason}"
          </p>
        )}
      </div>
    </div>
  );
};
