import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, favoriteGenres?: string[]) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: { favoriteGenres?: string[]; favoriteActors?: string[]; favoriteDirectors?: string[] }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("cinesuggest_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("cinesuggest_token");
      if (storedToken) {
        try {
          const profile = await api.auth.getMe();
          setUser(profile);
        } catch (err) {
          console.warn("Stored token invalid or expired, resetting.");
          localStorage.removeItem("cinesuggest_token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login({ email, password });
    localStorage.setItem("cinesuggest_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, favoriteGenres?: string[]) => {
    const data = await api.auth.register({ name, email, password, favoriteGenres });
    localStorage.setItem("cinesuggest_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const loginAsDemo = async () => {
    await login("elena@cinesuggest.io", "cinesuggest123");
  };

  const logout = () => {
    localStorage.removeItem("cinesuggest_token");
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (prefs: { favoriteGenres?: string[]; favoriteActors?: string[]; favoriteDirectors?: string[] }) => {
    await api.auth.updatePreferences(prefs);
    if (user) {
      setUser({
        ...user,
        favoriteGenres: prefs.favoriteGenres || user.favoriteGenres,
        favoriteActors: prefs.favoriteActors || user.favoriteActors,
        favoriteDirectors: prefs.favoriteDirectors || user.favoriteDirectors,
      });
    }
  };

  const refreshProfile = async () => {
    try {
      const updated = await api.auth.getMe();
      setUser(updated);
    } catch {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
        updatePreferences,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
