import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

export interface StructuredMovieQuery {
  query: string;
  genres: string[];
  keywords: string[];
  mood: string;
  similarToTitles: string[];
  suggestedTitles: string[];
  summary: string;
}

export async function parseMovieQueryWithAI(query: string): Promise<StructuredMovieQuery> {
  const ai = getAI();
  const defaultFallback: StructuredMovieQuery = {
    query,
    genres: extractGenresFromText(query),
    keywords: query.split(" ").filter(w => w.length > 3),
    mood: "atmospheric",
    similarToTitles: [],
    suggestedTitles: [],
    summary: `Search tailored for: "${query}"`
  };

  if (!ai) {
    return defaultFallback;
  }

  try {
    const prompt = `You are an expert film recommendation engine.
Analyze the following natural language user movie query:
"${query}"

Extract structured search preferences in valid JSON format only, with no markdown code fences or backticks.
Schema:
{
  "genres": ["Sci-Fi", "Mystery"],
  "keywords": ["space travel", "time dilation", "existential"],
  "mood": "mind-bending, contemplative",
  "similarToTitles": ["Interstellar", "Arrival"],
  "suggestedTitles": ["Blade Runner 2049", "2001: A Space Odyssey", "Contact"],
  "summary": "Looking for cosmic, thought-provoking sci-fi narratives with deep emotional arcs."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      query,
      genres: Array.isArray(parsed.genres) ? parsed.genres : defaultFallback.genres,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : defaultFallback.keywords,
      mood: parsed.mood || defaultFallback.mood,
      similarToTitles: Array.isArray(parsed.similarToTitles) ? parsed.similarToTitles : [],
      suggestedTitles: Array.isArray(parsed.suggestedTitles) ? parsed.suggestedTitles : [],
      summary: parsed.summary || defaultFallback.summary
    };
  } catch (err: any) {
    console.warn(`[Gemini] Natural language parsing fallback: ${err.message}`);
    return defaultFallback;
  }
}

export async function generatePersonalizedReason(movieTitle: string, userGenres: string[], referenceMovie?: string): Promise<string> {
  const ai = getAI();
  if (!ai) {
    return referenceMovie
      ? `Because you liked ${userGenres.slice(0, 2).join(" and ")} and awarded high marks to ${referenceMovie}.`
      : `Recommended for your taste in ${userGenres.slice(0, 2).join(" & ")}.`;
  }

  try {
    const prompt = `Write a single, compelling 1-2 sentence cinematic recommendation reason explaining why a user who loves ${userGenres.join(", ")} ${referenceMovie ? `and highly rated "${referenceMovie}"` : ""} should watch "${movieTitle}". Keep it punchy, film-literate, and insightful.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });
    return (response.text || "").trim();
  } catch {
    return `Because you loved ${userGenres.slice(0, 2).join(" & ")} and related cinematic masterpieces.`;
  }
}

function extractGenresFromText(text: string): string[] {
  const all = ["Sci-Fi", "Action", "Adventure", "Thriller", "Drama", "Comedy", "Mystery", "Crime", "Romance", "History", "Horror"];
  const lower = text.toLowerCase();
  return all.filter(g => lower.includes(g.toLowerCase()));
}
