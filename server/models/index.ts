import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { isConnected } from "../config/db.js";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  favoriteGenres: string[];
  favoriteActors: string[];
  favoriteDirectors: string[];
  createdAt: Date;
}

export interface IMovieInteraction {
  _id: string;
  userId: string;
  movieId: number;
  type: "view" | "watchlist" | "watched" | "search";
  createdAt: Date;
}

export interface IRating {
  _id: string;
  userId: string;
  movieId: number;
  rating: number; // 1 - 5
  createdAt: Date;
  updatedAt: Date;
}

export interface IWatchlist {
  _id: string;
  userId: string;
  movieId: number;
  status: "want_to_watch" | "currently_watching" | "watched";
  addedAt: Date;
  updatedAt: Date;
}

export interface ISearchHistory {
  _id: string;
  userId: string;
  query: string;
  createdAt: Date;
}

// -------------------------------------------------------------
// Mongoose Schemas
// -------------------------------------------------------------
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  favoriteGenres: { type: [String], default: ["Sci-Fi", "Thriller", "Drama"] },
  favoriteActors: { type: [String], default: [] },
  favoriteDirectors: { type: [String], default: ["Denis Villeneuve", "Christopher Nolan"] },
  createdAt: { type: Date, default: Date.now },
});

const MovieInteractionSchema = new Schema<IMovieInteraction>({
  userId: { type: String, required: true, index: true },
  movieId: { type: Number, required: true, index: true },
  type: { type: String, enum: ["view", "watchlist", "watched", "search"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const RatingSchema = new Schema<IRating>({
  userId: { type: String, required: true, index: true },
  movieId: { type: Number, required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
RatingSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const WatchlistSchema = new Schema<IWatchlist>({
  userId: { type: String, required: true, index: true },
  movieId: { type: Number, required: true, index: true },
  status: { type: String, enum: ["want_to_watch", "currently_watching", "watched"], default: "want_to_watch" },
  addedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
WatchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const SearchHistorySchema = new Schema<ISearchHistory>({
  userId: { type: String, required: true, index: true },
  query: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel: any = mongoose.models.User || mongoose.model("User", UserSchema);
export const MovieInteractionModel: any = mongoose.models.MovieInteraction || mongoose.model("MovieInteraction", MovieInteractionSchema);
export const RatingModel: any = mongoose.models.Rating || mongoose.model("Rating", RatingSchema);
export const WatchlistModel: any = mongoose.models.Watchlist || mongoose.model("Watchlist", WatchlistSchema);
export const SearchHistoryModel: any = mongoose.models.SearchHistory || mongoose.model("SearchHistory", SearchHistorySchema);

// -------------------------------------------------------------
// In-Memory Fallback Store & Unified DB Adapter
// -------------------------------------------------------------
const defaultPasswordHash = bcrypt.hashSync("cinesuggest123", 10);
const DEMO_USER_ID = "user_elena_default";

let memoryUsers: IUser[] = [
  {
    _id: DEMO_USER_ID,
    name: "Elena",
    email: "elena@cinesuggest.io",
    passwordHash: defaultPasswordHash,
    favoriteGenres: ["Sci-Fi", "Thriller", "Drama"],
    favoriteActors: ["Timothée Chalamet", "Cillian Murphy", "Emma Stone"],
    favoriteDirectors: ["Denis Villeneuve", "Christopher Nolan"],
    createdAt: new Date("2024-01-15T00:00:00Z"),
  }
];

let memoryInteractions: IMovieInteraction[] = [
  { _id: "int_1", userId: DEMO_USER_ID, movieId: 157336, type: "view", createdAt: new Date() },
  { _id: "int_2", userId: DEMO_USER_ID, movieId: 335984, type: "watched", createdAt: new Date() },
  { _id: "int_3", userId: DEMO_USER_ID, movieId: 329865, type: "watched", createdAt: new Date() },
  { _id: "int_4", userId: DEMO_USER_ID, movieId: 872585, type: "watched", createdAt: new Date() },
  { _id: "int_5", userId: DEMO_USER_ID, movieId: 693134, type: "view", createdAt: new Date() }
];

let memoryRatings: IRating[] = [
  { _id: "rat_1", userId: DEMO_USER_ID, movieId: 335984, rating: 5, createdAt: new Date(), updatedAt: new Date() }, // Blade Runner 2049
  { _id: "rat_2", userId: DEMO_USER_ID, movieId: 329865, rating: 5, createdAt: new Date(), updatedAt: new Date() }, // Arrival
  { _id: "rat_3", userId: DEMO_USER_ID, movieId: 157336, rating: 5, createdAt: new Date(), updatedAt: new Date() }, // Interstellar
  { _id: "rat_4", userId: DEMO_USER_ID, movieId: 872585, rating: 5, createdAt: new Date(), updatedAt: new Date() }, // Oppenheimer
  { _id: "rat_5", userId: DEMO_USER_ID, movieId: 577922, rating: 4, createdAt: new Date(), updatedAt: new Date() }, // Tenet
  { _id: "rat_6", userId: DEMO_USER_ID, movieId: 273481, rating: 4, createdAt: new Date(), updatedAt: new Date() }  // Sicario
];

let memoryWatchlist: IWatchlist[] = [
  { _id: "wl_1", userId: DEMO_USER_ID, movieId: 872585, status: "want_to_watch", addedAt: new Date("2024-02-01"), updatedAt: new Date() }, // Oppenheimer
  { _id: "wl_2", userId: DEMO_USER_ID, movieId: 496243, status: "want_to_watch", addedAt: new Date("2024-02-02"), updatedAt: new Date() }, // Parasite
  { _id: "wl_3", userId: DEMO_USER_ID, movieId: 335984, status: "want_to_watch", addedAt: new Date("2024-02-03"), updatedAt: new Date() }, // Blade Runner 2049
  { _id: "wl_4", userId: DEMO_USER_ID, movieId: 244786, status: "want_to_watch", addedAt: new Date("2024-02-04"), updatedAt: new Date() }, // Whiplash
  { _id: "wl_5", userId: DEMO_USER_ID, movieId: 693134, status: "currently_watching", addedAt: new Date("2024-02-05"), updatedAt: new Date() }, // Dune 2
  { _id: "wl_6", userId: DEMO_USER_ID, movieId: 792307, status: "currently_watching", addedAt: new Date("2024-02-06"), updatedAt: new Date() }, // Poor Things
  { _id: "wl_7", userId: DEMO_USER_ID, movieId: 157336, status: "watched", addedAt: new Date("2024-01-20"), updatedAt: new Date() }, // Interstellar
  { _id: "wl_8", userId: DEMO_USER_ID, movieId: 329865, status: "watched", addedAt: new Date("2024-01-22"), updatedAt: new Date() }, // Arrival
  { _id: "wl_9", userId: DEMO_USER_ID, movieId: 577922, status: "watched", addedAt: new Date("2024-01-25"), updatedAt: new Date() }, // Tenet
  { _id: "wl_10", userId: DEMO_USER_ID, movieId: 1124, status: "watched", addedAt: new Date("2024-01-28"), updatedAt: new Date() }, // The Prestige
  { _id: "wl_11", userId: DEMO_USER_ID, movieId: 438631, status: "want_to_watch", addedAt: new Date("2024-02-08"), updatedAt: new Date() }, // Dune 1
  { _id: "wl_12", userId: DEMO_USER_ID, movieId: 264660, status: "want_to_watch", addedAt: new Date("2024-02-09"), updatedAt: new Date() }, // Ex Machina
  { _id: "wl_13", userId: DEMO_USER_ID, movieId: 220289, status: "want_to_watch", addedAt: new Date("2024-02-10"), updatedAt: new Date() }, // Coherence
  { _id: "wl_14", userId: DEMO_USER_ID, movieId: 17431, status: "want_to_watch", addedAt: new Date("2024-02-11"), updatedAt: new Date() }   // Moon
];

let memorySearchHistory: ISearchHistory[] = [
  { _id: "sh_1", userId: DEMO_USER_ID, query: "Interstellar", createdAt: new Date(Date.now() - 3600000) },
  { _id: "sh_2", userId: DEMO_USER_ID, query: "Denis Villeneuve", createdAt: new Date(Date.now() - 7200000) },
  { _id: "sh_3", userId: DEMO_USER_ID, query: "Sci-Fi 2024", createdAt: new Date(Date.now() - 86400000) }
];

export const dbService = {
  // USER
  async findUserByEmail(email: string): Promise<IUser | null> {
    if (isConnected()) {
      return await UserModel.findOne({ email: email.toLowerCase() }).lean();
    }
    return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id: string): Promise<IUser | null> {
    if (isConnected()) {
      return await UserModel.findById(id).lean();
    }
    return memoryUsers.find(u => u._id === id) || null;
  },

  async createUser(data: { name: string; email: string; passwordHash: string; favoriteGenres?: string[]; favoriteActors?: string[]; favoriteDirectors?: string[] }): Promise<IUser> {
    if (isConnected()) {
      const user = new UserModel(data);
      const saved = await user.save();
      return saved.toObject();
    }
    const newUser: IUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      favoriteGenres: data.favoriteGenres || ["Sci-Fi", "Thriller", "Drama"],
      favoriteActors: data.favoriteActors || [],
      favoriteDirectors: data.favoriteDirectors || ["Denis Villeneuve", "Christopher Nolan"],
      createdAt: new Date(),
    };
    memoryUsers.push(newUser);
    return newUser;
  },

  async updateUserPreferences(userId: string, prefs: { favoriteGenres?: string[]; favoriteActors?: string[]; favoriteDirectors?: string[] }): Promise<IUser | null> {
    if (isConnected()) {
      return await UserModel.findByIdAndUpdate(userId, { $set: prefs }, { new: true }).lean();
    }
    const user = memoryUsers.find(u => u._id === userId);
    if (!user) return null;
    if (prefs.favoriteGenres) user.favoriteGenres = prefs.favoriteGenres;
    if (prefs.favoriteActors) user.favoriteActors = prefs.favoriteActors;
    if (prefs.favoriteDirectors) user.favoriteDirectors = prefs.favoriteDirectors;
    return user;
  },

  // WATCHLIST
  async getWatchlist(userId: string): Promise<IWatchlist[]> {
    if (isConnected()) {
      return await WatchlistModel.find({ userId }).sort({ addedAt: -1 }).lean();
    }
    return memoryWatchlist.filter(w => w.userId === userId).sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  },

  async addToWatchlist(userId: string, movieId: number, status: "want_to_watch" | "currently_watching" | "watched" = "want_to_watch"): Promise<IWatchlist> {
    if (isConnected()) {
      return await WatchlistModel.findOneAndUpdate(
        { userId, movieId },
        { $set: { status, updatedAt: new Date() }, $setOnInsert: { addedAt: new Date() } },
        { upsert: true, new: true }
      ).lean();
    }
    const existing = memoryWatchlist.find(w => w.userId === userId && w.movieId === movieId);
    if (existing) {
      existing.status = status;
      existing.updatedAt = new Date();
      return existing;
    }
    const item: IWatchlist = {
      _id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      movieId,
      status,
      addedAt: new Date(),
      updatedAt: new Date()
    };
    memoryWatchlist.push(item);
    return item;
  },

  async updateWatchlistStatus(userId: string, movieId: number, status: "want_to_watch" | "currently_watching" | "watched"): Promise<IWatchlist | null> {
    if (isConnected()) {
      return await WatchlistModel.findOneAndUpdate(
        { userId, movieId },
        { $set: { status, updatedAt: new Date() } },
        { new: true }
      ).lean();
    }
    const item = memoryWatchlist.find(w => w.userId === userId && w.movieId === movieId);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date();
    return item;
  },

  async removeFromWatchlist(userId: string, movieId: number): Promise<boolean> {
    if (isConnected()) {
      const res = await WatchlistModel.deleteOne({ userId, movieId });
      return (res.deletedCount || 0) > 0;
    }
    const initialLen = memoryWatchlist.length;
    memoryWatchlist = memoryWatchlist.filter(w => !(w.userId === userId && w.movieId === movieId));
    return memoryWatchlist.length < initialLen;
  },

  // RATINGS
  async getRatingsByUser(userId: string): Promise<IRating[]> {
    if (isConnected()) {
      return await RatingModel.find({ userId }).sort({ updatedAt: -1 }).lean();
    }
    return memoryRatings.filter(r => r.userId === userId).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },

  async getRatingForMovie(userId: string, movieId: number): Promise<IRating | null> {
    if (isConnected()) {
      return await RatingModel.findOne({ userId, movieId }).lean();
    }
    return memoryRatings.find(r => r.userId === userId && r.movieId === movieId) || null;
  },

  async setRating(userId: string, movieId: number, rating: number): Promise<IRating> {
    if (isConnected()) {
      return await RatingModel.findOneAndUpdate(
        { userId, movieId },
        { $set: { rating, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true }
      ).lean();
    }
    const existing = memoryRatings.find(r => r.userId === userId && r.movieId === movieId);
    if (existing) {
      existing.rating = rating;
      existing.updatedAt = new Date();
      return existing;
    }
    const newRating: IRating = {
      _id: `rat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      movieId,
      rating,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryRatings.push(newRating);
    return newRating;
  },

  async deleteRating(userId: string, movieId: number): Promise<boolean> {
    if (isConnected()) {
      const res = await RatingModel.deleteOne({ userId, movieId });
      return (res.deletedCount || 0) > 0;
    }
    const initialLen = memoryRatings.length;
    memoryRatings = memoryRatings.filter(r => !(r.userId === userId && r.movieId === movieId));
    return memoryRatings.length < initialLen;
  },

  // INTERACTIONS
  async recordInteraction(userId: string, movieId: number, type: "view" | "watchlist" | "watched" | "search"): Promise<IMovieInteraction> {
    if (isConnected()) {
      const item = new MovieInteractionModel({ userId, movieId, type });
      const saved = await item.save();
      return saved.toObject();
    }
    const interaction: IMovieInteraction = {
      _id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      movieId,
      type,
      createdAt: new Date()
    };
    memoryInteractions.push(interaction);
    return interaction;
  },

  async getUserInteractions(userId: string): Promise<IMovieInteraction[]> {
    if (isConnected()) {
      return await MovieInteractionModel.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();
    }
    return memoryInteractions.filter(i => i.userId === userId).slice(-100).reverse();
  },

  // SEARCH HISTORY
  async addSearchHistory(userId: string, query: string): Promise<ISearchHistory> {
    if (isConnected()) {
      const item = new SearchHistoryModel({ userId, query });
      const saved = await item.save();
      return saved.toObject();
    }
    const item: ISearchHistory = {
      _id: `sh_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      query,
      createdAt: new Date()
    };
    memorySearchHistory.unshift(item);
    if (memorySearchHistory.length > 50) memorySearchHistory.pop();
    return item;
  },

  async getSearchHistory(userId: string): Promise<ISearchHistory[]> {
    if (isConnected()) {
      return await SearchHistoryModel.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
    }
    return memorySearchHistory.filter(s => s.userId === userId).slice(0, 10);
  },

  async clearSearchHistory(userId: string): Promise<boolean> {
    if (isConnected()) {
      await SearchHistoryModel.deleteMany({ userId });
      return true;
    }
    memorySearchHistory = memorySearchHistory.filter(s => s.userId !== userId);
    return true;
  }
};
