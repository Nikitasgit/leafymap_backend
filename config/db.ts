import mongoose from "mongoose";
import "dotenv/config";
import logger from "@/utils/logger";

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }
    await mongoose.connect(mongoUri);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error:", (err as Error).message);
    process.exit(1);
  }
};

export default connectDB;
