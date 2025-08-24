import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import errorHandler from "./utils/errorHandler";
import userRoutes from "./routes/userRoutes";
import categorieRoutes from "./routes/categorieRoutes";
import authRoutes from "./routes/authRoutes";
import placeRoutes from "./routes/placeRoutes";
import eventRoutes from "./routes/eventRoutes";
import awsRoutes from "./routes/awsRoutes";
import partnershipRoutes from "./routes/partnershipRoutes";
import cookieParser from "cookie-parser";

dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/aws", awsRoutes);
app.use("/api/partnerships", partnershipRoutes);

app.use(errorHandler);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;
