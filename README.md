# 🎬 CineSuggest

[![Build & Test](https://github.com/knapcode2007/CineSuggest/actions/workflows/ci.yml/badge.svg)](https://github.com/knapcode2007/CineSuggest/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

**CineSuggest** is a intelligent film discovery and personalized recommendation platform powered by algorithmic curation, user preference tracking, real-time TMDB catalog ingestion, and **Google Gemini AI** natural language query understanding.

---

## ✨ Features

- **🤖 AI-Powered Natural Language Movie Search**: Ask complex, conversational movie queries (e.g., *"mind-bending sci-fi movies about space travel and time"*) and let Gemini AI extract genres, moods, and contextual recommendations.
- **🎯 Personalized Recommendation Engine**: Multi-tiered scoring algorithm taking into account user genre affinities, director preferences, watchlist interactions, and rating history.
- **🎬 Live Catalog & Mock Fallback**: Integration with The Movie Database (TMDB) API for real-time trending, popular, top-rated, and upcoming releases, backed by an offline mock catalog fallback.
- **🛡️ Resilient Dual-Mode Database Access**: Dual-mode storage engine using MongoDB via Mongoose when available, with automatic failover to an in-memory database store when offline.
- **🔐 Secure Authentication & Profile Sync**: JWT token authentication, encrypted password hashing via bcrypt, custom watchlist management (watched, plan to watch), and rating systems.
- **🎨 Glassmorphism & Modern UI**: Built with React 19, Vite, Tailwind CSS v4, Lucide React icons, and Framer Motion animations.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 6 |
| **Styling & Motion** | Tailwind CSS v4, Motion (Framer Motion v12), Lucide Icons |
| **Backend Runtime** | Node.js, Express 4, `tsx`, `esbuild` |
| **Database & ORM** | MongoDB, Mongoose, Resilient In-Memory Fallback |
| **AI Integration** | `@google/genai` (Gemini API 3.8-Flash) |
| **External APIs** | The Movie Database (TMDB) API |

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js `18.0.0` or higher
- npm `9.0.0` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/knapcode2007/CineSuggest.git
   cd CineSuggest
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🔑 Environment Variables

| Variable | Description | Default / Required |
|---|---|---|
| `MONGODB_URI` | MongoDB connection connection string | *Optional* (Falls back to in-memory store) |
| `JWT_SECRET` | Secret key used for signing and verifying JWT tokens | `cinesuggest_super_secret_jwt_key_2026` |
| `TMDB_API_KEY` | TMDB API Key for live catalog fetching | *Optional* (Falls back to curated mock catalog) |
| `GEMINI_API_KEY` | Google Gemini API key for natural language processing | *Optional* (Falls back to heuristic parser) |
| `PORT` | HTTP server port | `3000` |

---

## 📜 NPM Scripts

- `npm run dev` — Starts the Express API server with Vite dev middleware (`tsx server.ts`).
- `npm run build` — Compiles the Vite React production bundle and bundles `server.ts` with `esbuild`.
- `npm run start` — Runs the production bundled server (`node dist/server.cjs`).
- `npm run test` — Executes the automated end-to-end API integration test runner.
- `npm run lint` — Runs TypeScript static type checking (`tsc --noEmit`).
- `npm run clean` — Cross-platform dist cleanup.

---

## 🧪 Testing

Execute the automated integration test suite:

```bash
npm run test
```

The test runner validates:
- API Health Status
- Registration, Login, and JWT Token Auth
- Trending, Popular, Top-Rated & Upcoming Movies
- Search & Detailed Metadata Queries
- Watchlist Management (Add, Get, Delete)
- User Ratings & Reviews (Add, Get, Delete)
- Recommendation Engine Calculation
- Gemini AI Query Processing

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
