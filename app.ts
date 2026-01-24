import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import errorHandler from "./utils/errorHandler";
import userRoutes from "./routes/user.routes";
import categorieRoutes from "./routes/categorie.routes";
import authRoutes from "./routes/auth.routes";
import placeRoutes from "./routes/place.routes";
import eventRoutes from "./routes/event.routes";
import partnershipRoutes from "./routes/partnership.routes";
import cookieParser from "cookie-parser";
import imageRoutes from "./routes/image.routes";
import reviewRoutes from "./routes/review.routes";
import commentRoutes from "./routes/comment.routes";
import messageRoutes from "./routes/message.routes";
import cors from "cors";
import helmet from "helmet";
import { RateLimiterMiddleware } from "./middlewares";

const rateLimiterMiddleware = new RateLimiterMiddleware();

dotenv.config();

connectDB();

const app = express();

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://spotlight-project.vercel.app"]
    : ["http://localhost:3001", "https://spotlight-project.vercel.app"];

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin) {
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      } else {
        return callback(new Error("Origin required in production"), false);
      }
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(helmet());

// Apply rate limiting to all API routes
// app.use("/api/", rateLimiterMiddleware.api());

app.use("/api/users", userRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/partnerships", partnershipRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler);

export default app;
