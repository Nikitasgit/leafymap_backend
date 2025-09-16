import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import errorHandler from "./utils/errorHandler";
import userRoutes from "./routes/userRoutes";
import categorieRoutes from "./routes/categorieRoutes";
import authRoutes from "./routes/authRoutes";
import placeRoutes from "./routes/placeRoutes";
import eventRoutes from "./routes/eventRoutes";
import partnershipRoutes from "./routes/partnershipRoutes";
import cookieParser from "cookie-parser";
import imageRoutes from "./routes/imageRoutes";
import cors from "cors";
import xss from "xss-clean";
import helmet from "helmet";

dotenv.config();

connectDB();

const app = express();

const allowedOrigins = [
  "https://spotlight-project.vercel.app",
  "https://api.server.innovastay.fr",
];

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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(xss());

app.use("/api/users", userRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/images", imageRoutes);
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
