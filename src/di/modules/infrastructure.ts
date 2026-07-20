import { aliasTo, asClass, asFunction, AwilixContainer } from "awilix";
import {
  AdminMiddleware,
  AuthMiddleware,
  RateLimiterMiddleware,
} from "@src/api/middlewares";
import DeleteImagesUseCase from "@src/application/usecases/images/DeleteImages.usecase";
import CreateNotificationUseCase from "@src/application/usecases/notifications/CreateNotification.usecase";
import CascadeDeleteUseCase from "@src/application/usecases/shared/CascadeDelete.usecase";
import AwsImageStorageAdapter from "@src/infrastructure/adapters/AwsImageStorage.adapter";
import JwtTokenIssuerAdapter from "@src/infrastructure/adapters/JwtTokenIssuer.adapter";
import MongooseUnreadConversationCounter from "@src/infrastructure/adapters/MongooseUnreadConversationCounter.adapter";
import NotificationEmailSenderAdapter from "@src/infrastructure/adapters/NotificationEmailSender.adapter";
import SocketMessageRealtimePublisher from "@src/infrastructure/adapters/SocketMessageRealtimePublisher.adapter";
import UserPlaceLinkerAdapter from "@src/infrastructure/adapters/UserPlaceLinker.adapter";
import MongooseCategoryRepository from "@src/infrastructure/repositories/MongooseCategoryRepository";
import MongooseCommentRepository from "@src/infrastructure/repositories/MongooseCommentRepository";
import MongooseConversationRepository from "@src/infrastructure/repositories/MongooseConversationRepository";
import MongooseEventBookingRepository from "@src/infrastructure/repositories/MongooseEventBookingRepository";
import MongooseEventInvitationRepository from "@src/infrastructure/repositories/MongooseEventInvitationRepository";
import MongooseEventRepository from "@src/infrastructure/repositories/MongooseEventRepository";
import MongooseFavoriteRepository from "@src/infrastructure/repositories/MongooseFavoriteRepository";
import MongooseFollowRepository from "@src/infrastructure/repositories/MongooseFollowRepository";
import MongooseImageRepository from "@src/infrastructure/repositories/MongooseImageRepository";
import MongooseMessageRepository from "@src/infrastructure/repositories/MongooseMessageRepository";
import MongooseNotificationRepository from "@src/infrastructure/repositories/MongooseNotificationRepository";
import MongoosePartnershipRepository from "@src/infrastructure/repositories/MongoosePartnershipRepository";
import MongoosePlaceRepository from "@src/infrastructure/repositories/MongoosePlaceRepository";
import MongooseProductRepository from "@src/infrastructure/repositories/MongooseProductRepository";
import MongooseReviewRepository from "@src/infrastructure/repositories/MongooseReviewRepository";
import MongooseUserRepository from "@src/infrastructure/repositories/MongooseUserRepository";
import type { Cradle } from "@src/di/cradle";

export const registerInfrastructureModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    categoryRepository: asClass(MongooseCategoryRepository).singleton(),
    userRepository: asClass(MongooseUserRepository).singleton(),
    placeRepository: asClass(MongoosePlaceRepository).singleton(),
    eventRepository: asClass(MongooseEventRepository).singleton(),
    messageRepository: asClass(MongooseMessageRepository).singleton(),
    conversationRepository: asClass(MongooseConversationRepository).singleton(),
    imageRepository: asClass(MongooseImageRepository).singleton(),
    partnershipRepository: asClass(MongoosePartnershipRepository).singleton(),
    eventInvitationRepository: asClass(
      MongooseEventInvitationRepository
    ).singleton(),
    eventBookingRepository: asClass(MongooseEventBookingRepository).singleton(),
    notificationRepository: asClass(MongooseNotificationRepository).singleton(),
    commentRepository: asClass(MongooseCommentRepository).singleton(),
    favoriteRepository: asClass(MongooseFavoriteRepository).singleton(),
    followRepository: asClass(MongooseFollowRepository).singleton(),
    reviewRepository: asClass(MongooseReviewRepository).singleton(),
    productRepository: asClass(MongooseProductRepository).singleton(),

    userPlaceLinker: asClass(UserPlaceLinkerAdapter).singleton(),
    realtimePublisher: asClass(SocketMessageRealtimePublisher).singleton(),
    unreadConversationCounter: asClass(
      MongooseUnreadConversationCounter
    ).singleton(),
    notificationEmailSender: asClass(NotificationEmailSenderAdapter).singleton(),
    jwtTokenIssuer: asClass(JwtTokenIssuerAdapter).singleton(),

    // Avoid CLASSIC resolving optional `awsService` constructor param
    imageStorage: asFunction(() => new AwsImageStorageAdapter()).singleton(),

    notificationCreator: asClass(CreateNotificationUseCase).singleton(),
    createNotificationUseCase: aliasTo("notificationCreator"),
    deleteImagesUseCase: asClass(DeleteImagesUseCase).singleton(),
    cascadeDeleter: asClass(CascadeDeleteUseCase).singleton(),

    authMiddleware: asClass(AuthMiddleware).singleton(),
    adminMiddleware: asClass(AdminMiddleware).singleton(),
    rateLimiterMiddleware: asClass(RateLimiterMiddleware).singleton(),
  });
};
