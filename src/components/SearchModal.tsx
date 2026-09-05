import React, { useState, useEffect } from "react";
import { Search, X, Sparkles, History, Trash2, ArrowRight } from "lucide-react";
import { Movie, AIQueryResponse, SearchHistoryItem } from "../types";
import { api } from "../services/api";
import { MovieCard } from "./MovieCard";

interface SearchModalProps {
  onClose: () => void;
  onSelectMovie: (movieId: number) => void;
  watchlistIds: Set<number>;
  userRatings: Map<number, number>;
  onToggleWatchlist: (movieId: number) => void;
  onWatchTrailer: (movieId: number) => void;
  onRate: (movieId: number, rating: number) => void;
}

const GENRE_TAGS = ["Sci-Fi", "Thriller", "Drama", "Action", "Mystery", "Adventure", "Crime", "Comedy"];

const AI_SUGGESTIONS = [
  "I want a mind-bending sci-fi movie like Interstellar",
  "Dark psychological thrillers with unexpected twists",
  "Atmospheric cosmic exploration with existential dread",
  "Groundbreaking neo-noir with stunning cinematography"
];

export const SearchModal: React.FC<SearchModalProps> = ({
  onClose,
  onSelectMovie,
  watchlistIds,
  userRatings,
  onToggleWatchlist,
  onWatchTrailer,
  onRate,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isAiMode, setIsAiMode] = useState<boolean>(false);
  const [aiData, setAiData] = useState<AIQueryResponse["structured"] | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load search history on mount
  useEffect(() => {
    api.movies.getSearchHistory().then(setSearchHistory).catch(() => {});
  }, []);

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Execute standard search with debounce
  useEffect(() => {
    if (isAiMode) return;
    const clean = query.trim();
    if (!clean) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const movies = await api.movies.search(clean);
        setResults(movies);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isAiMode]);

  // Execute AI query
  const handleRunAiQuery = async (searchPrompt: string) => {
    setQuery(searchPrompt);
    setIsAiMode(true);
    setIsLoading(true);
    try {
      const data = await api.ai.queryMovie(searchPrompt);
      setAiData(data.structured);
      setResults(data.movies);
    } catch (err) {
      console.error("AI query error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.movies.clearSearchHistory();
      setSearchHistory([]);
    } catch {
      // Ignored
    }
  };

  const handleSelectGenre = async (genre: string) => {
    setIsAiMode(false);
    setAiData(null);
    setQuery(genre);
    setIsLoading(true);
    try {
      const movies = await api.movies.getByGenre(genre);
      setResults(movies);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-xl overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black">
        
        {/* Search Header */}
        <div className="flex items-center border-b border-white/10 px-4 py-3.5 sm:px-6">
          <Search className="h-5 w-5 text-[#F27D26] shrink-0" />
          <input
            id="movie-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (isAiMode && !e.target.value) {
                setIsAiMode(false);
                setAiData(null);
              }
            }}
            placeholder="Search titles, directors, genres, or ask natural language movie questions..."
            autoFocus
            className="ml-3 w-full bg-transparent text-sm font-medium text-white placeholder-zinc-500 focus:outline-none sm:text-base"
          />

          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setAiData(null);
                setIsAiMode(false);
              }}
              className="mr-2 rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            id="close-search-modal-btn"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* AI Mode Banner or Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-zinc-900/60 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-[#F27D26]" />
            <span>AI Natural Language Search</span>
          </div>

          {query.trim().length > 3 && !isAiMode && (
            <button
              onClick={() => handleRunAiQuery(query)}
              className="flex items-center gap-1.5 rounded-xl bg-[#F27D26] px-3.5 py-1 text-xs font-bold text-white shadow-lg shadow-orange-950/40 transition hover:bg-orange-600 active:scale-95"
            >
              <Sparkles className="h-3 w-3" />
              Analyze with Gemini AI
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* AI Structured breakdown if present */}
          {aiData && (
            <div className="rounded-2xl border border-[#F27D26]/30 bg-zinc-900/90 p-4 space-y-2.5 shadow-lg shadow-black/40">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#F27D26]">
                  <Sparkles className="h-4 w-4" />
                  Gemini Film Understanding
                </span>
                <span className="rounded-full border border-white/10 bg-zinc-950 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-200">
                  Mood: {aiData.mood}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{aiData.summary}</p>
              
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {aiData.genres.map((g) => (
                  <span key={g} className="rounded-full border border-[#F27D26]/20 bg-[#F27D26]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#F27D26]">
                    #{g}
                  </span>
                ))}
                {aiData.keywords.slice(0, 4).map((k) => (
                  <span key={k} className="rounded-full border border-white/10 bg-zinc-950 px-2.5 py-0.5 text-[10px] text-zinc-400">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick AI Prompts if no query */}
          {!query && (
            <div className="space-y-4">
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Sparkles className="h-3.5 w-3.5 text-[#F27D26]" />
                  Try Natural Language Discovery
                </h4>
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {AI_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleRunAiQuery(suggestion)}
                      className="group flex items-center justify-between rounded-2xl border border-white/5 bg-zinc-900/70 p-3.5 text-left text-xs text-zinc-200 transition hover:border-[#F27D26]/40 hover:bg-zinc-800/80"
                    >
                      <span className="line-clamp-2 pr-2">"{suggestion}"</span>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-[#F27D26] shrink-0 transition" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Pills */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Explore by Genre
                </h4>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {GENRE_TAGS.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleSelectGenre(genre)}
                      className="rounded-full border border-white/10 bg-zinc-900 px-3.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-[#F27D26]/40 hover:bg-zinc-800 hover:text-white"
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      <History className="h-3.5 w-3.5" />
                      Recent Searches
                    </h4>
                    <button
                      onClick={handleClearHistory}
                      className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {searchHistory.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => {
                          setQuery(item.query);
                        }}
                        className="rounded-full border border-white/5 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        {item.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#F27D26] border-t-transparent" />
                <span className="text-xs text-zinc-400">Searching cinematic database...</span>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Matches ({results.length})
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {results.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isInWatchlist={watchlistIds.has(movie.id)}
                    userRating={userRatings.get(movie.id)}
                    onSelect={(id) => {
                      onClose();
                      onSelectMovie(id);
                    }}
                    onToggleWatchlist={onToggleWatchlist}
                    onWatchTrailer={onWatchTrailer}
                    onRate={onRate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && query && results.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-white">No movies found for "{query}"</p>
              <p className="mt-1 text-xs text-zinc-400">
                Try adjusting your search keywords, or try our AI natural language discovery.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
