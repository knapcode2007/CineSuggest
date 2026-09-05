import mongoose from "mongoose";

let isMongoConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("[DB] No MONGODB_URI provided. Running in resilient memory-store mode.");
    return false;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log("[DB] MongoDB connected successfully via Mongoose.");
    return true;
  } catch (err: any) {
    console.warn(`[DB] MongoDB connection failed: ${err.message}. Falling back to memory-store mode.`);
    isMongoConnected = false;
    return false;
  }
}

export function isConnected(): boolean {
  return isMongoConnected;
}
