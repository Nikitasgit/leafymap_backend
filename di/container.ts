import {
  CategoryRepository,
  UserRepository,
  PlaceRepository,
  EventRepository,
  CommentRepository,
  MessageRepository,
  ConversationRepository,
  ImageRepository,
  PartnershipRepository,
  EventInvitationRepository,
  EventBookingRepository,
  ReviewRepository,
  NotificationRepository,
  FollowRepository,
  ProductRepository,
} from "@/repositories";
import MongooseFavoriteRepository from "@src/infrastructure/repositories/MongooseFavoriteRepository";
import LegacyFavoriteRepositoryAdapter from "@src/infrastructure/repositories/LegacyFavoriteRepositoryAdapter";
import { DeleteImagesAction } from "@/actions/images";
import CascadeDeleteService from "@/services/cascadeDeleteService";
import { AuthMiddleware, RateLimiterMiddleware } from "@/middlewares";

// Singleton repositories shared across all DI modules
export const categoryRepository = new CategoryRepository();
export const userRepository = new UserRepository();
export const placeRepository = new PlaceRepository();
export const eventRepository = new EventRepository();
export const commentRepository = new CommentRepository();
export const messageRepository = new MessageRepository();
export const conversationRepository = new ConversationRepository();
export const imageRepository = new ImageRepository();
export const partnershipRepository = new PartnershipRepository();
export const eventInvitationRepository = new EventInvitationRepository();
export const eventBookingRepository = new EventBookingRepository();
export const reviewRepository = new ReviewRepository();
export const notificationRepository = new NotificationRepository();
export const followRepository = new FollowRepository();
export const mongooseFavoriteRepository = new MongooseFavoriteRepository();
export const favoriteRepository = new LegacyFavoriteRepositoryAdapter(
  mongooseFavoriteRepository
);
export const productRepository = new ProductRepository();

// Shared middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Shared actions/services
export const deleteImagesAction = new DeleteImagesAction(imageRepository);

export const cascadeDeleteService = new CascadeDeleteService(
  eventRepository,
  placeRepository,
  reviewRepository,
  commentRepository,
  favoriteRepository,
  eventBookingRepository,
  eventInvitationRepository,
  notificationRepository,
  imageRepository,
  deleteImagesAction
);
