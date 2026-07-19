import MongooseCommentRepository from "@src/infrastructure/repositories/MongooseCommentRepository";
import MongooseFavoriteRepository from "@src/infrastructure/repositories/MongooseFavoriteRepository";
import MongooseFollowRepository from "@src/infrastructure/repositories/MongooseFollowRepository";
import MongooseReviewRepository from "@src/infrastructure/repositories/MongooseReviewRepository";
import MongooseEventRepository from "@src/infrastructure/repositories/MongooseEventRepository";
import MongooseEventBookingRepository from "@src/infrastructure/repositories/MongooseEventBookingRepository";
import MongooseEventInvitationRepository from "@src/infrastructure/repositories/MongooseEventInvitationRepository";
import MongoosePartnershipRepository from "@src/infrastructure/repositories/MongoosePartnershipRepository";
import MongooseProductRepository from "@src/infrastructure/repositories/MongooseProductRepository";
import MongooseCategoryRepository from "@src/infrastructure/repositories/MongooseCategoryRepository";
import MongooseImageRepository from "@src/infrastructure/repositories/MongooseImageRepository";
import MongoosePlaceRepository from "@src/infrastructure/repositories/MongoosePlaceRepository";
import MongooseUserRepository from "@src/infrastructure/repositories/MongooseUserRepository";
import MongooseNotificationRepository from "@src/infrastructure/repositories/MongooseNotificationRepository";
import MongooseMessageRepository from "@src/infrastructure/repositories/MongooseMessageRepository";
import MongooseConversationRepository from "@src/infrastructure/repositories/MongooseConversationRepository";
import AwsImageStorageAdapter from "@src/infrastructure/adapters/AwsImageStorage.adapter";
import UserPlaceLinkerAdapter from "@src/infrastructure/adapters/UserPlaceLinker.adapter";
import MongooseUnreadConversationCounter from "@src/infrastructure/adapters/MongooseUnreadConversationCounter.adapter";
import SocketMessageRealtimePublisher from "@src/infrastructure/adapters/SocketMessageRealtimePublisher.adapter";
import DeleteImagesUseCase from "@src/application/usecases/images/DeleteImages.usecase";
import CreateNotificationUseCase from "@src/application/usecases/notifications/CreateNotification.usecase";
import CascadeDeleteUseCase from "@src/application/usecases/shared/CascadeDelete.usecase";
import NotificationEmailSenderAdapter from "@src/infrastructure/adapters/NotificationEmailSender.adapter";
import {
  AdminMiddleware,
  AuthMiddleware,
  RateLimiterMiddleware,
} from "@src/api/middlewares";

// Singleton repositories shared across all DI modules
export const mongooseCategoryRepository = new MongooseCategoryRepository();
export const mongooseUserRepository = new MongooseUserRepository();
export const mongoosePlaceRepository = new MongoosePlaceRepository();
export const mongooseEventRepository = new MongooseEventRepository();
export const mongooseMessageRepository = new MongooseMessageRepository();
export const mongooseConversationRepository =
  new MongooseConversationRepository();
export const mongooseImageRepository = new MongooseImageRepository();
export const mongoosePartnershipRepository = new MongoosePartnershipRepository();
export const mongooseEventInvitationRepository =
  new MongooseEventInvitationRepository();
export const mongooseEventBookingRepository =
  new MongooseEventBookingRepository();
export const mongooseNotificationRepository =
  new MongooseNotificationRepository();
export const mongooseCommentRepository = new MongooseCommentRepository();
export const mongooseFavoriteRepository = new MongooseFavoriteRepository();
export const mongooseFollowRepository = new MongooseFollowRepository();
export const mongooseReviewRepository = new MongooseReviewRepository();
export const mongooseProductRepository = new MongooseProductRepository();

export const userPlaceLinker = new UserPlaceLinkerAdapter(
  mongooseUserRepository
);

export const messageRealtimePublisher = new SocketMessageRealtimePublisher();

export const unreadConversationCounter = new MongooseUnreadConversationCounter(
  mongooseConversationRepository,
  mongooseMessageRepository
);

export const notificationEmailSender = new NotificationEmailSenderAdapter();
export const createNotificationUseCase = new CreateNotificationUseCase(
  mongooseNotificationRepository,
  mongooseUserRepository,
  notificationEmailSender
);

// Shared middlewares
export const authMiddleware = new AuthMiddleware(mongooseUserRepository);
export const adminMiddleware = new AdminMiddleware(mongooseUserRepository);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Shared image storage / delete use case (cascade + HTTP composition)
export const awsImageStorage = new AwsImageStorageAdapter();
export const deleteImagesUseCase = new DeleteImagesUseCase(
  mongooseImageRepository,
  awsImageStorage
);

export const cascadeDeleteUseCase = new CascadeDeleteUseCase(
  mongooseEventRepository,
  mongoosePlaceRepository,
  mongooseReviewRepository,
  mongooseCommentRepository,
  mongooseFavoriteRepository,
  mongooseEventBookingRepository,
  mongooseEventInvitationRepository,
  mongooseNotificationRepository,
  mongooseImageRepository,
  deleteImagesUseCase
);
