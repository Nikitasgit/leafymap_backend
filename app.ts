import express from "express";
import errorHandler from "./utils/errorHandler";
import userRoutes from "./routes/user.routes";
import categorieRoutes from "./routes/categorie.routes";
import authRoutes from "./routes/auth.routes";
import placeRoutes from "./routes/place.routes";
import eventRoutes from "@src/api/routes/event.routes";
import partnershipRoutes from "./routes/partnership.routes";
import eventInvitationRoutes from "./routes/eventInvitation.routes";
import eventBookingRoutes from "@src/api/routes/eventBooking.routes";
import cookieParser from "cookie-parser";
import imageRoutes from "./routes/image.routes";
import reviewRoutes from "@src/api/routes/review.routes";
import commentRoutes from "@src/api/routes/comment.routes";
import messageRoutes from "./routes/message.routes";
import notificationRoutes from "./routes/notification.routes";
import followRoutes from "@src/api/routes/follow.routes";
import favoriteRoutes from "@src/api/routes/favorite.routes";
import productRoutes from "./routes/product.routes";
import adminRoutes from "./routes/admin.routes";
import cors from "cors";
import helmet from "helmet";
import { RateLimiterMiddleware } from "./middlewares";
import logger from "./utils/logger";
import { Request, Response, NextFunction } from "express";
import { ALLOWED_ORIGINS } from "./utils/constants/common";

const rateLimiterMiddleware = new RateLimiterMiddleware();

const app = express();

const allowedOrigins = ALLOWED_ORIGINS;

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) {
      return callback(null, true);
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

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const method = req.method;
  const url = req.originalUrl || req.url;

  logger.info(`${method} ${url}`);
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    logger.info(`${method} ${url} - ${statusCode} - ${duration}ms`);
  });

  next();
});

// Apply rate limiting to all API routes
app.use("/api/", rateLimiterMiddleware.api());

app.use("/api/users", userRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/partnerships", partnershipRoutes);
app.use("/api/event-invitations", eventInvitationRoutes);
app.use("/api/event-bookings", eventBookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;
