import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { Movie, RecommendationItem } from "../types";

interface MovieSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  movies: (Movie | RecommendationItem)[];
  watchlistIds: Set<number>;
  userRatings: Map<number, number>;
  onSelectMovie: (movieId: number) => void;
  onToggleWatchlist: (movieId: number) => void;
  onWatchTrailer: (movieId: number) => void;
  onRate: (movieId: number, rating: number) => void;
}

export const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  subtitle,
  icon,
  badge,
  movies,
  watchlistIds,
  userRatings,
  onSelectMovie,
  onToggleWatchlist,
  onWatchTrailer,
  onRate,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="space-y-3.5">
      {/* Header */}
      <div className="flex items-end justify-between px-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {icon && <span className="text-[#F27D26]">{icon}</span>}
            <h2 className="font-['Outfit'] text-xl font-bold tracking-tight text-white sm:text-2xl">
              {title}
            </h2>
            {badge && (
              <span className="rounded-full border border-[#F27D26]/30 bg-[#F27D26]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F27D26]">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
        </div>

        {/* Scroll Buttons */}
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-400 transition hover:border-[#F27D26]/40 hover:bg-zinc-800 hover:text-white active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-400 transition hover:border-[#F27D26]/40 hover:bg-zinc-800 hover:text-white active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Movies Row */}
      <div
        ref={rowRef}
        className="no-scrollbar flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {movies.map((movie) => {
          const id = "movieId" in movie ? movie.movieId : movie.id;
          return (
            <div
              key={id}
              className="w-[170px] shrink-0 sm:w-[200px] md:w-[220px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <MovieCard
                movie={movie}
                isInWatchlist={watchlistIds.has(id)}
                userRating={userRatings.get(id)}
                onSelect={onSelectMovie}
                onToggleWatchlist={onToggleWatchlist}
                onWatchTrailer={onWatchTrailer}
                onRate={onRate}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
