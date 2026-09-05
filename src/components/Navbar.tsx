import React from "react";
import { Film, Search, Bookmark, User as UserIcon, Sparkles, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  currentTab: "discover" | "watchlist" | "profile";
  onSelectTab: (tab: "discover" | "watchlist" | "profile") => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  watchlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenAuth,
  watchlistCount,
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080808]/85 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            id="brand-logo-btn"
            onClick={() => onSelectTab("discover")}
            className="group flex items-center gap-3 text-left transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F27D26] to-[#E50914] shadow-lg shadow-orange-950/40">
              <Film className="h-5 w-5 text-white transition-transform group-hover:scale-105" />
            </div>
            <div>
              <span className="font-['Outfit'] text-lg font-extrabold tracking-tight text-white sm:text-xl">
                Cine<span className="text-[#F27D26]">Suggest</span>
              </span>
              <span className="ml-2 hidden rounded-full border border-[#F27D26]/30 bg-[#F27D26]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#F27D26] sm:inline-block">
                Immersive
              </span>
            </div>
          </button>

          {/* Nav Links */}
          <nav className="hidden items-center gap-1.5 md:flex">
            <button
              id="nav-discover-btn"
              onClick={() => onSelectTab("discover")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                currentTab === "discover"
                  ? "bg-white/10 text-white shadow-sm border border-white/10"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#F27D26]" />
              Discover
            </button>

            <button
              id="nav-watchlist-btn"
              onClick={() => onSelectTab("watchlist")}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                currentTab === "watchlist"
                  ? "bg-white/10 text-white shadow-sm border border-white/10"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5 text-[#F27D26]" />
              Watchlist
              {watchlistCount > 0 && (
                <span className="ml-1 rounded-full bg-[#F27D26]/20 border border-[#F27D26]/30 px-1.5 py-0.2 text-[10px] font-bold text-[#F27D26]">
                  {watchlistCount}
                </span>
              )}
            </button>

            <button
              id="nav-profile-btn"
              onClick={() => onSelectTab("profile")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                currentTab === "profile"
                  ? "bg-white/10 text-white shadow-sm border border-white/10"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <UserIcon className="h-3.5 w-3.5 text-[#F27D26]" />
              Taste Profile
            </button>
          </nav>
        </div>

        {/* Right Section: Search & Auth */}
        <div className="flex items-center gap-3">
          {/* Search Trigger Button */}
          <button
            id="search-trigger-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 rounded-full border border-white/10 bg-zinc-900/70 px-4 py-2 text-xs text-zinc-400 transition hover:border-[#F27D26]/40 hover:bg-zinc-800/80 hover:text-white sm:w-64"
          >
            <Search className="h-3.5 w-3.5 text-[#F27D26]" />
            <span className="truncate">Search movies or AI prompt...</span>
            <kbd className="ml-auto hidden rounded border border-white/10 bg-black/40 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 sm:inline-block">
              /
            </kbd>
          </button>

          {/* User Profile or Sign In */}
          {user ? (
            <button
              id="user-profile-header-btn"
              onClick={() => onSelectTab("profile")}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 py-1 pl-1 pr-3.5 text-xs text-white transition hover:border-[#F27D26]/40 hover:bg-zinc-800"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#F27D26] to-[#E50914] text-xs font-bold text-white shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden font-medium sm:inline">{user.name}</span>
            </button>
          ) : (
            <button
              id="header-sign-in-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-full bg-[#F27D26] px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-orange-950/40 transition hover:bg-orange-600 active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="flex border-t border-white/5 bg-[#080808]/95 backdrop-blur-xl px-2 py-2 md:hidden">
        <button
          onClick={() => onSelectTab("discover")}
          className={`flex flex-1 flex-col items-center gap-1 py-1 text-xs font-medium ${
            currentTab === "discover" ? "text-[#F27D26]" : "text-zinc-400"
          }`}
        >
          <Sparkles className="h-5 w-5" />
          Discover
        </button>
        <button
          onClick={() => onSelectTab("watchlist")}
          className={`relative flex flex-1 flex-col items-center gap-1 py-1 text-xs font-medium ${
            currentTab === "watchlist" ? "text-[#F27D26]" : "text-zinc-400"
          }`}
        >
          <Bookmark className="h-5 w-5" />
          Watchlist
          {watchlistCount > 0 && (
            <span className="absolute top-0.5 right-6 flex h-4 w-4 items-center justify-center rounded-full bg-[#F27D26] text-[9px] font-bold text-white">
              {watchlistCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onSelectTab("profile")}
          className={`flex flex-1 flex-col items-center gap-1 py-1 text-xs font-medium ${
            currentTab === "profile" ? "text-[#F27D26]" : "text-zinc-400"
          }`}
        >
          <UserIcon className="h-5 w-5" />
          Profile
        </button>
      </div>
    </header>
  );
};
