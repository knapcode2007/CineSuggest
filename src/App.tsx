import React, { useEffect, useState, useMemo, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { SpotlightHero } from "./components/SpotlightHero";
import { MovieSection } from "./components/MovieSection";
import { MovieDetailsModal } from "./components/MovieDetailsModal";
import { TrailerModal } from "./components/TrailerModal";
import { SearchModal } from "./components/SearchModal";
import { WatchlistView } from "./components/WatchlistView";
import { ProfileView } from "./components/ProfileView";
import { AuthModal } from "./components/AuthModal";
import {
  Movie,
  WatchlistItem,
  RatingItem,
  RecommendationResponse,
  WatchlistStatus,
} from "./types";
import { api } from "./services/api";
import { Sparkles, TrendingUp, Award, Compass, Heart } from "lucide-react";

function CineSuggestApp() {
  const { user } = useAuth();
  
  // Navigation
  const [currentTab, setCurrentTab] = useState<"discover" | "watchlist" | "profile">("discover");

  // Data States
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [trailerMovie, setTrailerMovie] = useState<{ id: number; title: string; trailerKey?: string } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Precomputed ID maps for quick lookup
  const watchlistIds = useMemo(() => new Set(watchlist.map((w) => w.movieId)), [watchlist]);
  const userRatingsMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of ratings) {
      map.set(r.movieId, r.rating);
    }
    return map;
  }, [ratings]);

  // Fetch initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recs, trend, top] = await Promise.all([
        api.recommendations.getRecommendations().catch(() => null),
        api.movies.getTrending().catch(() => []),
        api.movies.getTopRated().catch(() => []),
      ]);

      if (recs) setRecommendations(recs);
      if (trend) setTrending(trend);
      if (top) setTopRated(top);

      if (user) {
        const [wl, userRats] = await Promise.all([
          api.watchlist.getWatchlist().catch(() => []),
          api.ratings.getUserRatings().catch(() => []),
        ]);
        setWatchlist(wl);
        setRatings(userRats);
      } else {
        setWatchlist([]);
        setRatings([]);
      }
    } catch (err) {
      console.error("Failed to load movie catalog:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Watchlist Actions
  const handleToggleWatchlist = async (movieId: number, status: WatchlistStatus = "want_to_watch") => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      if (watchlistIds.has(movieId)) {
        await api.watchlist.remove(movieId);
        setWatchlist((prev) => prev.filter((item) => item.movieId !== movieId));
        showToast("Removed from your watchlist");
      } else {
        const newItem = await api.watchlist.add(movieId, status);
        setWatchlist((prev) => [newItem, ...prev]);
        showToast("Added to your watchlist");
      }
    } catch (err) {
      console.error("Watchlist toggle failed:", err);
    }
  };

  const handleUpdateWatchlistStatus = async (movieId: number, status: WatchlistStatus) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const updated = await api.watchlist.updateStatus(movieId, status);
      setWatchlist((prev) =>
        prev.map((item) => (item.movieId === movieId ? updated : item))
      );
      showToast(`Status updated to ${status.replace(/_/g, " ")}`);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleRemoveFromWatchlist = async (movieId: number) => {
    try {
      await api.watchlist.remove(movieId);
      setWatchlist((prev) => prev.filter((item) => item.movieId !== movieId));
      showToast("Removed from watchlist");
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  // Rating Actions
  const handleRateMovie = async (movieId: number, rating: number) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const current = userRatingsMap.get(movieId);
      if (current === rating) {
        await api.ratings.deleteRating(movieId);
        setRatings((prev) => prev.filter((r) => r.movieId !== movieId));
        showToast("Rating cleared");
      } else {
        const saved = await api.ratings.setRating(movieId, rating);
        setRatings((prev) => {
          const filtered = prev.filter((r) => r.movieId !== movieId);
          return [saved, ...filtered];
        });
        showToast(`Rated ${rating} / 5 Stars`);
      }
    } catch (err) {
      console.error("Failed to save rating:", err);
    }
  };

  // Trailer Action
  const handleWatchTrailer = async (movieId: number) => {
    try {
      const details = await api.movies.getDetails(movieId);
      setTrailerMovie({
        id: details.id,
        title: details.title,
        trailerKey: details.trailer_key,
      });
    } catch {
      setTrailerMovie({
        id: movieId,
        title: "Selected Film",
      });
    }
  };

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#080808] text-zinc-100 flex flex-col font-['Geist',sans-serif] overflow-x-hidden">
      {/* Immersive Atmospheric Ambient Glow Orbs */}
      <div className="pointer-events-none fixed top-0 right-0 -z-10 h-[550px] w-[550px] rounded-full bg-[#F27D26] opacity-[0.07] blur-[160px]" />
      <div className="pointer-events-none fixed bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#E50914] opacity-[0.04] blur-[180px]" />

      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        watchlistCount={watchlist.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: DISCOVER / RECOMMENDATIONS */}
        {currentTab === "discover" && (
          <div className="space-y-10">
            
            {/* Spotlight Hero Banner */}
            {recommendations?.spotlight && (
              <SpotlightHero
                movie={recommendations.spotlight}
                isInWatchlist={watchlistIds.has(recommendations.spotlight.movieId)}
                userRating={userRatingsMap.get(recommendations.spotlight.movieId)}
                onWatchlistToggle={handleToggleWatchlist}
                onWatchTrailer={handleWatchTrailer}
                onOpenDetails={(id) => setSelectedMovieId(id)}
                onRate={handleRateMovie}
              />
            )}

            {/* Curated Recommendations for You */}
            {recommendations && (
              <MovieSection
                title="Curated Recommendations"
                subtitle="Scored using your genre affinities, watch history, and auteur preferences"
                icon={<Sparkles className="h-5 w-5" />}
                badge="High Match"
                movies={recommendations.topRecommendations}
                watchlistIds={watchlistIds}
                userRatings={userRatingsMap}
                onSelectMovie={(id) => setSelectedMovieId(id)}
                onToggleWatchlist={handleToggleWatchlist}
                onWatchTrailer={handleWatchTrailer}
                onRate={handleRateMovie}
              />
            )}

            {/* Because You Watched Reference Movie */}
            {recommendations?.becauseYouWatched?.items?.length > 0 && (
              <MovieSection
                title={`Because You Liked ${recommendations.becauseYouWatched.referenceMovie.title}`}
                subtitle="Thematic echoes, shared narrative depth, and stylistic lineage"
                icon={<Compass className="h-5 w-5" />}
                movies={recommendations.becauseYouWatched.items}
                watchlistIds={watchlistIds}
                userRatings={userRatingsMap}
                onSelectMovie={(id) => setSelectedMovieId(id)}
                onToggleWatchlist={handleToggleWatchlist}
                onWatchTrailer={handleWatchTrailer}
                onRate={handleRateMovie}
              />
            )}

            {/* Trending Worldwide */}
            <MovieSection
              title="Trending Films"
              subtitle="What cinema audiences are discussing right now"
              icon={<TrendingUp className="h-5 w-5" />}
              movies={trending}
              watchlistIds={watchlistIds}
              userRatings={userRatingsMap}
              onSelectMovie={(id) => setSelectedMovieId(id)}
              onToggleWatchlist={handleToggleWatchlist}
              onWatchTrailer={handleWatchTrailer}
              onRate={handleRateMovie}
            />

            {/* Hidden Gems Section */}
            {recommendations?.hiddenGems && recommendations.hiddenGems.length > 0 && (
              <MovieSection
                title="Hidden Gems & Overlooked Masterpieces"
                subtitle="High surprise score indie narratives and underrated cerebral gems"
                icon={<Award className="h-5 w-5" />}
                badge="90%+ Surprise"
                movies={recommendations.hiddenGems}
                watchlistIds={watchlistIds}
                userRatings={userRatingsMap}
                onSelectMovie={(id) => setSelectedMovieId(id)}
                onToggleWatchlist={handleToggleWatchlist}
                onWatchTrailer={handleWatchTrailer}
                onRate={handleRateMovie}
              />
            )}

            {/* Top Rated of All Time */}
            <MovieSection
              title="Critically Acclaimed"
              subtitle="Timeless masterpieces with the highest global consensus"
              icon={<Heart className="h-5 w-5" />}
              movies={topRated}
              watchlistIds={watchlistIds}
              userRatings={userRatingsMap}
              onSelectMovie={(id) => setSelectedMovieId(id)}
              onToggleWatchlist={handleToggleWatchlist}
              onWatchTrailer={handleWatchTrailer}
              onRate={handleRateMovie}
            />

          </div>
        )}

        {/* TAB 2: WATCHLIST */}
        {currentTab === "watchlist" && (
          <WatchlistView
            items={watchlist}
            userRatings={userRatingsMap}
            onSelectMovie={(id) => setSelectedMovieId(id)}
            onUpdateStatus={handleUpdateWatchlistStatus}
            onRemove={handleRemoveFromWatchlist}
            onWatchTrailer={handleWatchTrailer}
            onDiscoverMore={() => setCurrentTab("discover")}
          />
        )}

        {/* TAB 3: TASTE PROFILE */}
        {currentTab === "profile" && (
          <ProfileView
            ratings={ratings}
            watchlist={watchlist}
            onSelectMovie={(id) => setSelectedMovieId(id)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onPreferencesUpdated={loadData}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 bg-[#050505] py-8 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CineSuggest. Algorithmic and AI-powered cinematic discovery platform.</p>
          <div className="flex items-center gap-4 text-zinc-400 font-medium">
            <span>Content-Based Matching</span>
            <span className="text-zinc-700">•</span>
            <span>TMDB Integration</span>
            <span className="text-zinc-700">•</span>
            <span>Gemini Intelligence</span>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-[#F27D26]/40 bg-zinc-900/90 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl shadow-black/80 backdrop-blur-md animate-fade-in">
          <Sparkles className="h-4 w-4 text-[#F27D26]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal: Movie Details */}
      {selectedMovieId !== null && (
        <MovieDetailsModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
          onWatchTrailer={handleWatchTrailer}
          onSelectSimilar={(id) => setSelectedMovieId(id)}
          onWatchlistChange={loadData}
          onRatingChange={loadData}
          userWatchlistStatus={watchlist.find((w) => w.movieId === selectedMovieId)?.status}
          userRating={userRatingsMap.get(selectedMovieId)}
        />
      )}

      {/* Modal: Trailer */}
      {trailerMovie && (
        <TrailerModal
          movieTitle={trailerMovie.title}
          trailerKey={trailerMovie.trailerKey}
          onClose={() => setTrailerMovie(null)}
        />
      )}

      {/* Modal: Search & Natural Language AI */}
      {isSearchOpen && (
        <SearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelectMovie={(id) => setSelectedMovieId(id)}
          watchlistIds={watchlistIds}
          userRatings={userRatingsMap}
          onToggleWatchlist={handleToggleWatchlist}
          onWatchTrailer={handleWatchTrailer}
          onRate={handleRateMovie}
        />
      )}

      {/* Modal: Auth */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => {
            loadData();
            showToast("Successfully signed in!");
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CineSuggestApp />
    </AuthProvider>
  );
}
