import express from "express";
import errorHandler from "@src/api/http/errorHandler";
import createUserRoutes from "@src/api/routes/user.routes";
import createCategoryRoutes from "@src/api/routes/category.routes";
import createAuthRoutes from "@src/api/routes/auth.routes";
import createPlaceRoutes from "@src/api/routes/place.routes";
import createEventRoutes from "@src/api/routes/event.routes";
import createPartnershipRoutes from "@src/api/routes/partnership.routes";
import createEventInvitationRoutes from "@src/api/routes/eventInvitation.routes";
import createEventBookingRoutes from "@src/api/routes/eventBooking.routes";
import cookieParser from "cookie-parser";
import createImageRoutes from "@src/api/routes/image.routes";
import createReviewRoutes from "@src/api/routes/review.routes";
import createCommentRoutes from "@src/api/routes/comment.routes";
import createMessageRoutes from "@src/api/routes/message.routes";
import createNotificationRoutes from "@src/api/routes/notification.routes";
import createFollowRoutes from "@src/api/routes/follow.routes";
import createFavoriteRoutes from "@src/api/routes/favorite.routes";
import createProductRoutes from "@src/api/routes/product.routes";
import createAdminRoutes from "@src/api/routes/admin.routes";
import createAnnouncementRoutes from "@src/api/routes/announcement.routes";
import cors from "cors";
import helmet from "helmet";
import { cradle } from "@src/di/container";
import logger from "@src/shared/logger";
import { Request, Response, NextFunction } from "express";
import { ALLOWED_ORIGINS } from "@src/shared/constants/common";
import { configureImageUrlSigning } from "@src/api/http/imageUrlSigning";

const { rateLimiterMiddleware, imageStorage } = cradle;
configureImageUrlSigning(imageStorage);

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

app.use(
  "/api/users",
  createUserRoutes({
    usersController: cradle.usersController,
    authMiddleware: cradle.authMiddleware,
    rateLimiterMiddleware: cradle.rateLimiterMiddleware,
  })
);
app.use(
  "/api/categories",
  createCategoryRoutes({
    categoriesController: cradle.categoriesController,
  })
);
app.use(
  "/api/auth",
  createAuthRoutes({
    authController: cradle.authController,
    authMiddleware: cradle.authMiddleware,
    rateLimiterMiddleware: cradle.rateLimiterMiddleware,
  })
);
app.use(
  "/api/places",
  createPlaceRoutes({
    placesController: cradle.placesController,
    authMiddleware: cradle.authMiddleware,
    rateLimiterMiddleware: cradle.rateLimiterMiddleware,
  })
);
app.use(
  "/api/events",
  createEventRoutes({
    eventsController: cradle.eventsController,
    authMiddleware: cradle.authMiddleware,
    rateLimiterMiddleware: cradle.rateLimiterMiddleware,
  })
);
app.use(
  "/api/images",
  createImageRoutes({
    imagesController: cradle.imagesController,
    authMiddleware: cradle.authMiddleware,
    uploadMiddleware: cradle.uploadMiddleware,
    rateLimiterMiddleware: cradle.rateLimiterMiddleware,
  })
);
app.use(
  "/api/partnerships",
  createPartnershipRoutes({
    partnershipsController: cradle.partnershipsController,
    authMiddleware: cradle.authMiddleware,
  })
);
app.use(
  "/api/event-invitations",
  createEventInvitationRoutes({
    eventInvitationsController: cradle.eventInvitationsController,
    authMiddleware: cradle.authMiddleware,
  })
);
app.use(
  "/api/event-bookings",
  createEventBookingRoutes({
    eventBookingsController: cradle.eventBookingsController,
    authMiddleware: cradle.authMiddleware,
  })
);
app.use(
  "/api/reviews",
  createReviewRoutes({
    reviewsController: cradle.reviewsController,
    authMiddleware: cradle.authMiddleware,
    rateLimiterMiddleware: cradle.rateLimiterMiddleware,
  })
);
app.use(
  "/api/comments",
  createCommentRoutes({
    commentsController: cradle.commentsController,
    authMiddleware: cradle.authMiddleware,
    rateLimiterMiddleware: cradle.rateLimiterMiddleware,
  })
);
app.use(
  "/api/messages",
  createMessageRoutes({
    messagesController: cradle.messagesController,
    authMiddleware: cradle.authMiddleware,
    rateLimiterMiddleware: cradle.rateLimiterMiddleware,
  })
);
app.use(
  "/api/notifications",
  createNotificationRoutes({
    notificationsController: cradle.notificationsController,
    authMiddleware: cradle.authMiddleware,
  })
);
app.use(
  "/api/follows",
  createFollowRoutes({
    followsController: cradle.followsController,
    authMiddleware: cradle.authMiddleware,
  })
);
app.use(
  "/api/favorites",
  createFavoriteRoutes({
    favoritesController: cradle.favoritesController,
    authMiddleware: cradle.authMiddleware,
  })
);
app.use(
  "/api/products",
  createProductRoutes({
    productsController: cradle.productsController,
    authMiddleware: cradle.authMiddleware,
  })
);
app.use(
  "/api/announcements",
  createAnnouncementRoutes({
    announcementsController: cradle.announcementsController,
  })
);
app.use(
  "/api/admin",
  createAdminRoutes({
    adminMiddleware: cradle.adminMiddleware,
    authMiddleware: cradle.authMiddleware,
    adminUsersController: cradle.adminUsersController,
    adminResourcesController: cradle.adminResourcesController,
    announcementsController: cradle.announcementsController,
  })
);

app.use(errorHandler);

export default app;
