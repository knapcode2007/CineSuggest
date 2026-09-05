import React, { useState } from "react";
import { Bookmark, Film, Trash2, Play, CheckCircle2, Clock, Eye } from "lucide-react";
import { WatchlistItem, WatchlistStatus } from "../types";

interface WatchlistViewProps {
  items: WatchlistItem[];
  userRatings: Map<number, number>;
  onSelectMovie: (movieId: number) => void;
  onUpdateStatus: (movieId: number, status: WatchlistStatus) => void;
  onRemove: (movieId: number) => void;
  onWatchTrailer: (movieId: number) => void;
  onDiscoverMore: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  items,
  userRatings,
  onSelectMovie,
  onUpdateStatus,
  onRemove,
  onWatchTrailer,
  onDiscoverMore,
}) => {
  const [activeFilter, setActiveFilter] = useState<"all" | WatchlistStatus>("all");

  const filteredItems = items.filter((item) => {
    if (activeFilter === "all") return true;
    return item.status === activeFilter;
  });

  const wantCount = items.filter((i) => i.status === "want_to_watch").length;
  const watchingCount = items.filter((i) => i.status === "currently_watching").length;
  const watchedCount = items.filter((i) => i.status === "watched").length;

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Bookmark className="h-6 w-6 text-[#F27D26]" />
            <h1 className="font-['Outfit'] text-2xl font-bold tracking-tight text-white sm:text-3xl">
              My Watchlist
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Curate and organize movies you plan to watch, are currently screening, or have completed.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-900/80 p-1 text-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={`rounded-xl px-3.5 py-1.5 font-medium transition ${
              activeFilter === "all"
                ? "bg-[#F27D26] text-white font-bold shadow-md shadow-orange-950/40"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setActiveFilter("want_to_watch")}
            className={`rounded-xl px-3.5 py-1.5 font-medium transition ${
              activeFilter === "want_to_watch"
                ? "bg-[#F27D26] text-white font-bold shadow-md shadow-orange-950/40"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Want to Watch ({wantCount})
          </button>
          <button
            onClick={() => setActiveFilter("currently_watching")}
            className={`rounded-xl px-3.5 py-1.5 font-medium transition ${
              activeFilter === "currently_watching"
                ? "bg-[#F27D26] text-white font-bold shadow-md shadow-orange-950/40"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Watching ({watchingCount})
          </button>
          <button
            onClick={() => setActiveFilter("watched")}
            className={`rounded-xl px-3.5 py-1.5 font-medium transition ${
              activeFilter === "watched"
                ? "bg-[#F27D26] text-white font-bold shadow-md shadow-orange-950/40"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Watched ({watchedCount})
          </button>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-900/30 py-16 text-center backdrop-blur-sm">
          <Film className="h-12 w-12 text-[#F27D26]/40" />
          <h3 className="mt-3 font-['Outfit'] text-lg font-bold text-white">
            {activeFilter === "all" ? "Your watchlist is empty" : `No movies in "${activeFilter.replace(/_/g, " ")}"`}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-zinc-400">
            Explore personalized movie recommendations and save titles to track your cinematic journey.
          </p>
          <button
            onClick={onDiscoverMore}
            className="mt-5 rounded-xl bg-[#F27D26] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-950/50 transition hover:bg-orange-600"
          >
            Discover Movies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const movie = item.movie;
            if (!movie) return null;

            return (
              <div
                key={item._id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/70 p-3.5 transition hover:border-[#F27D26]/40 hover:shadow-2xl hover:shadow-black/80"
              >
                <div className="flex gap-3.5">
                  {/* Poster Thumbnail */}
                  <div
                    onClick={() => onSelectMovie(movie.id)}
                    className="relative aspect-[2/3] w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-zinc-950"
                  >
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Movie Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => onSelectMovie(movie.id)}
                        className="cursor-pointer font-['Outfit'] text-sm font-bold text-white transition hover:text-[#F27D26] line-clamp-2"
                      >
                        {movie.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {movie.release_date ? movie.release_date.split("-")[0] : "2024"} •{" "}
                        {movie.genres?.slice(0, 2).map((g) => g.name).join(", ")}
                      </p>
                      
                      {userRatings.get(movie.id) && (
                        <p className="mt-1 text-[11px] font-semibold text-[#F27D26]">
                          ★ Your Rating: {userRatings.get(movie.id)}/5
                        </p>
                      )}
                    </div>

                    {/* Quick Trailer Button */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => onWatchTrailer(movie.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-[#F27D26] transition hover:bg-white/10"
                      >
                        <Play className="h-3 w-3 fill-[#F27D26]" />
                        Trailer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Status Switcher & Remove */}
                <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-medium">Status:</span>
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.movieId, e.target.value as WatchlistStatus)}
                      className="rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1 text-[11px] font-medium text-white focus:outline-none focus:border-[#F27D26]"
                    >
                      <option value="want_to_watch">Want to Watch</option>
                      <option value="currently_watching">Currently Watching</option>
                      <option value="watched">Watched</option>
                    </select>
                  </div>

                  <button
                    onClick={() => onRemove(item.movieId)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
