import {
  CategoryRepository,
  UserRepository,
  PlaceRepository,
  EventRepository,
  MessageRepository,
  ConversationRepository,
  ImageRepository,
  PartnershipRepository,
  EventInvitationRepository,
  EventBookingRepository,
  NotificationRepository,
  ProductRepository,
} from "@/repositories";
import MongooseCommentRepository from "@src/infrastructure/repositories/MongooseCommentRepository";
import MongooseFavoriteRepository from "@src/infrastructure/repositories/MongooseFavoriteRepository";
import MongooseFollowRepository from "@src/infrastructure/repositories/MongooseFollowRepository";
import MongooseReviewRepository from "@src/infrastructure/repositories/MongooseReviewRepository";
import { DeleteImagesAction } from "@/actions/images";
import CascadeDeleteService from "@/services/cascadeDeleteService";
import { AuthMiddleware, RateLimiterMiddleware } from "@/middlewares";

// Singleton repositories shared across all DI modules
export const categoryRepository = new CategoryRepository();
export const userRepository = new UserRepository();
export const placeRepository = new PlaceRepository();
export const eventRepository = new EventRepository();
export const messageRepository = new MessageRepository();
export const conversationRepository = new ConversationRepository();
export const imageRepository = new ImageRepository();
export const partnershipRepository = new PartnershipRepository();
export const eventInvitationRepository = new EventInvitationRepository();
export const eventBookingRepository = new EventBookingRepository();
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
  eventRepository,
  placeRepository,
  mongooseReviewRepository,
  mongooseCommentRepository,
  mongooseFavoriteRepository,
  eventBookingRepository,
  eventInvitationRepository,
  notificationRepository,
  imageRepository,
  deleteImagesAction
);
