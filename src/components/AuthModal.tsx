import React, { useState } from "react";
import { X, Film, LogIn, UserPlus, Sparkles, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const { login, register, loginAsDemo } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginAsDemo();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError("Failed to log in as demo user.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black">
        
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F27D26] to-[#E50914] shadow-xl shadow-orange-950/40">
            <Film className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-['Outfit'] text-2xl font-bold text-white pt-2">
            {tab === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-xs text-zinc-400">
            {tab === "login"
              ? "Sign in to access your customized movie recommendations"
              : "Join CineSuggest to curate your watchlist and discover films"}
          </p>
        </div>

        {/* Demo Login CTA */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleDemo}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#F27D26]/40 bg-[#F27D26]/10 py-2.5 text-xs font-bold text-[#F27D26] shadow-sm transition hover:bg-[#F27D26]/20 active:scale-98"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#F27D26]" />
            1-Click Demo Login (Elena Rostova)
          </button>
        </div>

        <div className="my-4 flex items-center">
          <div className="flex-1 border-t border-white/10" />
          <span className="px-3 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">or</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-white/10 bg-zinc-900 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 transition ${
              tab === "login"
                ? "bg-[#F27D26] text-white font-bold shadow-md shadow-orange-950/40"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 transition ${
              tab === "register"
                ? "bg-[#F27D26] text-white font-bold shadow-md shadow-orange-950/40"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {tab === "register" && (
            <div>
              <label className="block text-xs font-medium text-zinc-300">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Rostova"
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#F27D26] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@cinesuggest.io"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#F27D26] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#F27D26] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F27D26] py-2.5 text-xs font-bold text-white shadow-xl shadow-orange-950/50 transition hover:bg-orange-600 active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : tab === "login" ? (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create Free Account
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
