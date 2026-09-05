import { Response } from "express";
import bcrypt from "bcryptjs";
import { dbService } from "../models/index.js";
import { AuthRequest, generateToken } from "../middleware/auth.js";

export const authController = {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, password, favoriteGenres, favoriteDirectors } = req.body;

      if (!name || typeof name !== "string" || name.trim().length < 2) {
        res.status(400).json({ success: false, message: "Please provide a valid name (at least 2 characters)." });
        return;
      }

      if (!email || typeof email !== "string" || !email.includes("@")) {
        res.status(400).json({ success: false, message: "Please provide a valid email address." });
        return;
      }

      if (!password || typeof password !== "string" || password.length < 6) {
        res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
        return;
      }

      const existingUser = await dbService.findUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ success: false, message: "An account with this email address already exists." });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await dbService.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        favoriteGenres: Array.isArray(favoriteGenres) ? favoriteGenres : ["Sci-Fi", "Thriller", "Drama"],
        favoriteDirectors: Array.isArray(favoriteDirectors) ? favoriteDirectors : ["Denis Villeneuve", "Christopher Nolan"]
      });

      const token = generateToken({
        userId: newUser._id,
        email: newUser.email,
        name: newUser.name
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            favoriteGenres: newUser.favoriteGenres,
            favoriteActors: newUser.favoriteActors,
            favoriteDirectors: newUser.favoriteDirectors,
            createdAt: newUser.createdAt
          },
          token
        }
      });
    } catch (err: any) {
      console.error("[Auth] Registration error:", err);
      res.status(500).json({ success: false, message: "Registration failed. Please try again." });
    }
  },

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: "Please enter both email and password." });
        return;
      }

      const user = await dbService.findUserByEmail(email);
      if (!user) {
        res.status(401).json({ success: false, message: "Invalid email or password." });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: "Invalid email or password." });
        return;
      }

      const token = generateToken({
        userId: user._id,
        email: user.email,
        name: user.name
      });

      res.json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            favoriteGenres: user.favoriteGenres,
            favoriteActors: user.favoriteActors,
            favoriteDirectors: user.favoriteDirectors,
            createdAt: user.createdAt
          },
          token
        }
      });
    } catch (err: any) {
      console.error("[Auth] Login error:", err);
      res.status(500).json({ success: false, message: "Login failed. Please try again." });
    }
  },

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const user = await dbService.findUserById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      const ratings = await dbService.getRatingsByUser(userId);
      const watchlist = await dbService.getWatchlist(userId);

      res.json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            favoriteGenres: user.favoriteGenres,
            favoriteActors: user.favoriteActors,
            favoriteDirectors: user.favoriteDirectors,
            createdAt: user.createdAt,
            stats: {
              ratedCount: ratings.length,
              watchlistCount: watchlist.length,
              watchedCount: watchlist.filter(w => w.status === "watched").length
            }
          }
        }
      });
    } catch (err: any) {
      console.error("[Auth] getMe error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch user profile." });
    }
  },

  async getPreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const user = await dbService.findUserById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      res.json({
        success: true,
        data: {
          favoriteGenres: user.favoriteGenres,
          favoriteActors: user.favoriteActors,
          favoriteDirectors: user.favoriteDirectors
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to fetch preferences." });
    }
  },

  async updatePreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const { favoriteGenres, favoriteActors, favoriteDirectors } = req.body;
      const updated = await dbService.updateUserPreferences(userId, {
        favoriteGenres,
        favoriteActors,
        favoriteDirectors
      });

      if (!updated) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      res.json({
        success: true,
        data: {
          favoriteGenres: updated.favoriteGenres,
          favoriteActors: updated.favoriteActors,
          favoriteDirectors: updated.favoriteDirectors
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to update preferences." });
    }
  }
};
