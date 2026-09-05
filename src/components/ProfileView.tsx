import React, { useState } from "react";
import { User, Star, Film, Bookmark, Sparkles, Check, LogOut, Clapperboard, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { RatingItem, WatchlistItem } from "../types";

const ALL_GENRES = [
  "Sci-Fi",
  "Thriller",
  "Drama",
  "Action",
  "Mystery",
  "Crime",
  "Adventure",
  "Fantasy",
  "Horror",
  "Romance",
  "Comedy",
  "Animation"
];

const ALL_DIRECTORS = [
  "Denis Villeneuve",
  "Christopher Nolan",
  "David Fincher",
  "Ridley Scott",
  "Quentin Tarantino",
  "Bong Joon-ho",
  "Stanley Kubrick",
  "Greta Gerwig"
];

interface ProfileViewProps {
  ratings: RatingItem[];
  watchlist: WatchlistItem[];
  onSelectMovie: (movieId: number) => void;
  onOpenAuth: () => void;
  onPreferencesUpdated?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  ratings,
  watchlist,
  onSelectMovie,
  onOpenAuth,
  onPreferencesUpdated,
}) => {
  const { user, logout, updatePreferences } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/50 py-16 text-center backdrop-blur-md">
        <User className="h-12 w-12 text-[#F27D26]" />
        <h2 className="mt-3 font-['Outfit'] text-xl font-bold text-white">
          Sign In to Access Your Taste Profile
        </h2>
        <p className="mt-1 max-w-sm text-xs text-zinc-400">
          Track your ratings, organize your watchlist, and train your personalized movie recommendation algorithm.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-5 rounded-xl bg-[#F27D26] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-950/50 transition hover:bg-orange-600 active:scale-95"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const selectedGenres = new Set(user.favoriteGenres || ["Sci-Fi", "Thriller", "Drama"]);
  const selectedDirectors = new Set(user.favoriteDirectors || ["Denis Villeneuve", "Christopher Nolan"]);

  const handleToggleGenre = async (genre: string) => {
    const updated = new Set(selectedGenres);
    if (updated.has(genre)) {
      if (updated.size > 1) updated.delete(genre);
    } else {
      updated.add(genre);
    }

    try {
      setIsSaving(true);
      await updatePreferences({ favoriteGenres: Array.from(updated) });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      onPreferencesUpdated?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDirector = async (director: string) => {
    const updated = new Set(selectedDirectors);
    if (updated.has(director)) {
      if (updated.size > 1) updated.delete(director);
    } else {
      updated.add(director);
    }

    try {
      setIsSaving(true);
      await updatePreferences({ favoriteDirectors: Array.from(updated) });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      onPreferencesUpdated?.();
    } finally {
      setIsSaving(false);
    }
  };

  const watchedCount = watchlist.filter((w) => w.status === "watched").length;
  const avgRating = ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-8">
      
      {/* Profile Header */}
      <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-900/90 to-zinc-950/90 p-6 sm:p-8 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between shadow-xl shadow-black/60">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F27D26] to-[#E50914] font-['Outfit'] text-2xl font-bold text-white shadow-xl shadow-orange-950/40">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-['Outfit'] text-2xl font-bold text-white sm:text-3xl">
              {user.name}
            </h1>
            <p className="text-xs text-zinc-400">{user.email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded-full border border-[#F27D26]/30 bg-[#F27D26]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F27D26]">
                CineSuggest Cinephile
              </span>
              <span className="text-[11px] text-zinc-400">
                Member since {new Date(user.createdAt).getFullYear() || 2024}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log Out
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/5 bg-zinc-900/70 p-4 text-center">
          <div className="flex justify-center text-[#F27D26]">
            <Star className="h-5 w-5" />
          </div>
          <span className="mt-2 block font-['Outfit'] text-2xl font-bold text-white">
            {ratings.length}
          </span>
          <span className="text-[11px] text-zinc-400">Movies Rated</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-zinc-900/70 p-4 text-center">
          <div className="flex justify-center text-[#F27D26]">
            <Bookmark className="h-5 w-5" />
          </div>
          <span className="mt-2 block font-['Outfit'] text-2xl font-bold text-white">
            {watchlist.length}
          </span>
          <span className="text-[11px] text-zinc-400">In Watchlist</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-zinc-900/70 p-4 text-center">
          <div className="flex justify-center text-[#F27D26]">
            <Film className="h-5 w-5" />
          </div>
          <span className="mt-2 block font-['Outfit'] text-2xl font-bold text-white">
            {watchedCount}
          </span>
          <span className="text-[11px] text-zinc-400">Completed Screener</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-zinc-900/70 p-4 text-center">
          <div className="flex justify-center text-[#F27D26]">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="mt-2 block font-['Outfit'] text-2xl font-bold text-white">
            {avgRating} <span className="text-xs text-zinc-400">/ 5</span>
          </span>
          <span className="text-[11px] text-zinc-400">Avg Score Given</span>
        </div>
      </div>

      {/* Taste Preferences Editor */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl shadow-black/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-['Outfit'] text-lg font-bold text-white sm:text-xl">
              Taste Preferences & Recommendation Tuning
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Select your favorite genres and visionary directors to immediately refine CineSuggest's algorithmic curation.
            </p>
          </div>
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-semibold text-[#F27D26]">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>

        {/* Genre Selectors */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Favorite Genres
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {ALL_GENRES.map((genre) => {
              const isSelected = selectedGenres.has(genre);
              return (
                <button
                  key={genre}
                  onClick={() => handleToggleGenre(genre)}
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? "border-[#F27D26] bg-[#F27D26] text-white font-bold shadow-lg shadow-orange-950/40"
                      : "border-white/10 bg-zinc-950/80 text-zinc-300 hover:border-[#F27D26]/40 hover:text-white"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Director Selectors */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Preferred Auteurs & Directors
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {ALL_DIRECTORS.map((director) => {
              const isSelected = selectedDirectors.has(director);
              return (
                <button
                  key={director}
                  onClick={() => handleToggleDirector(director)}
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? "border-[#F27D26] bg-[#F27D26] text-white font-bold shadow-lg shadow-orange-950/40"
                      : "border-white/10 bg-zinc-950/80 text-zinc-300 hover:border-[#F27D26]/40 hover:text-white"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  {director}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ratings and Viewing History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-['Outfit'] text-lg font-bold text-white sm:text-xl">
              Movie Rating History
            </h2>
            <p className="text-xs text-zinc-400">
              Your ratings actively feed CineSuggest's content-similarity matrix.
            </p>
          </div>
          <span className="text-xs text-[#F27D26] font-semibold">{ratings.length} Movies</span>
        </div>

        {ratings.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-8 text-center text-xs text-zinc-400">
            You haven't rated any movies yet. Explore titles to give them 1–5 stars!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ratings.map((r) => {
              const movie = r.movie;
              if (!movie) return null;

              return (
                <div
                  key={r._id}
                  onClick={() => onSelectMovie(movie.id)}
                  className="group flex cursor-pointer items-center gap-3.5 rounded-2xl border border-white/5 bg-zinc-900/70 p-3.5 transition hover:border-[#F27D26]/40 hover:bg-zinc-800/80 hover:shadow-xl shadow-black/80"
                >
                  <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-950">
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <h4 className="truncate font-['Outfit'] text-sm font-bold text-white group-hover:text-[#F27D26]">
                      {movie.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      {movie.release_date ? movie.release_date.split("-")[0] : "2024"}
                    </p>
                    
                    <div className="mt-1.5 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            r.rating >= star
                              ? "fill-[#F27D26] text-[#F27D26]"
                              : "text-zinc-700"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-white">{r.rating}/5</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
