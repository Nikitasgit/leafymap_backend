import {
  CategoryRepository,
  UserRepository,
  PlaceRepository,
  MessageRepository,
  ConversationRepository,
  ImageRepository,
  PartnershipRepository,
  EventInvitationRepository,
  NotificationRepository,
  ProductRepository,
} from "@/repositories";
import MongooseCommentRepository from "@src/infrastructure/repositories/MongooseCommentRepository";
import MongooseFavoriteRepository from "@src/infrastructure/repositories/MongooseFavoriteRepository";
import MongooseFollowRepository from "@src/infrastructure/repositories/MongooseFollowRepository";
import MongooseReviewRepository from "@src/infrastructure/repositories/MongooseReviewRepository";
import MongooseEventRepository from "@src/infrastructure/repositories/MongooseEventRepository";
import MongooseEventBookingRepository from "@src/infrastructure/repositories/MongooseEventBookingRepository";
import { DeleteImagesAction } from "@/actions/images";
import CascadeDeleteService from "@/services/cascadeDeleteService";
import { AuthMiddleware, RateLimiterMiddleware } from "@/middlewares";

// Singleton repositories shared across all DI modules
export const categoryRepository = new CategoryRepository();
export const userRepository = new UserRepository();
export const placeRepository = new PlaceRepository();
export const mongooseEventRepository = new MongooseEventRepository();
export const messageRepository = new MessageRepository();
export const conversationRepository = new ConversationRepository();
export const imageRepository = new ImageRepository();
export const partnershipRepository = new PartnershipRepository();
export const eventInvitationRepository = new EventInvitationRepository();
export const mongooseEventBookingRepository =
  new MongooseEventBookingRepository();
export const notificationRepository = new NotificationRepository();
export const mongooseCommentRepository = new MongooseCommentRepository();
export const mongooseFavoriteRepository = new MongooseFavoriteRepository();
export const mongooseFollowRepository = new MongooseFollowRepository();
export const mongooseReviewRepository = new MongooseReviewRepository();
export const productRepository = new ProductRepository();

// Shared middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Shared actions/services
export const deleteImagesAction = new DeleteImagesAction(imageRepository);

export const cascadeDeleteService = new CascadeDeleteService(
  mongooseEventRepository,
  placeRepository,
  mongooseReviewRepository,
  mongooseCommentRepository,
  mongooseFavoriteRepository,
  mongooseEventBookingRepository,
  eventInvitationRepository,
  notificationRepository,
  imageRepository,
  deleteImagesAction
);
