import type AuthMiddleware from "@src/api/middlewares/auth.middleware";
import type AdminMiddleware from "@src/api/middlewares/admin.middleware";
import type RateLimiterMiddleware from "@src/api/middlewares/rateLimiter.middleware";
import type UploadMiddleware from "@src/api/middlewares/upload.middleware";
import type BanAdminUserUseCase from "@src/application/usecases/admin/BanAdminUser.usecase";
import type GetAdminUserContentUseCase from "@src/application/usecases/admin/GetAdminUserContent.usecase";
import type GetAdminUserUseCase from "@src/application/usecases/admin/GetAdminUser.usecase";
import type RestoreAdminResourceUseCase from "@src/application/usecases/admin/RestoreAdminResource.usecase";
import type RestoreAdminUserUseCase from "@src/application/usecases/admin/RestoreAdminUser.usecase";
import type SearchAdminUsersUseCase from "@src/application/usecases/admin/SearchAdminUsers.usecase";
import type SoftDeleteAdminResourceUseCase from "@src/application/usecases/admin/SoftDeleteAdminResource.usecase";
import type SoftDeleteAdminUserUseCase from "@src/application/usecases/admin/SoftDeleteAdminUser.usecase";
import type UnbanAdminUserUseCase from "@src/application/usecases/admin/UnbanAdminUser.usecase";
import type AcceptCguUseCase from "@src/application/usecases/auth/AcceptCgu.usecase";
import type GoogleAuthUseCase from "@src/application/usecases/auth/GoogleAuth.usecase";
import type RegisterUseCase from "@src/application/usecases/auth/Register.usecase";
import type RequestPasswordResetUseCase from "@src/application/usecases/auth/RequestPasswordReset.usecase";
import type ResendVerificationEmailUseCase from "@src/application/usecases/auth/ResendVerificationEmail.usecase";
import type ResetPasswordUseCase from "@src/application/usecases/auth/ResetPassword.usecase";
import type SignInUseCase from "@src/application/usecases/auth/SignIn.usecase";
import type VerifyEmailUseCase from "@src/application/usecases/auth/VerifyEmail.usecase";
import type AdminResourcesController from "@src/api/controllers/AdminResourcesController";
import type AdminUsersController from "@src/api/controllers/AdminUsersController";
import type AuthController from "@src/api/controllers/AuthController";
import type CategoriesController from "@src/api/controllers/CategoriesController";
import type CommentsController from "@src/api/controllers/CommentsController";
import type EventBookingsController from "@src/api/controllers/EventBookingsController";
import type EventInvitationsController from "@src/api/controllers/EventInvitationsController";
import type EventsController from "@src/api/controllers/EventsController";
import type FavoritesController from "@src/api/controllers/FavoritesController";
import type FollowsController from "@src/api/controllers/FollowsController";
import type ImagesController from "@src/api/controllers/ImagesController";
import type MessagesController from "@src/api/controllers/MessagesController";
import type NotificationsController from "@src/api/controllers/NotificationsController";
import type PartnershipsController from "@src/api/controllers/PartnershipsController";
import type PlacesController from "@src/api/controllers/PlacesController";
import type ProductsController from "@src/api/controllers/ProductsController";
import type ReviewsController from "@src/api/controllers/ReviewsController";
import type UsersController from "@src/api/controllers/UsersController";
import type GetCategoriesUseCase from "@src/application/usecases/categories/GetCategories.usecase";
import type CreateCommentUseCase from "@src/application/usecases/comments/CreateComment.usecase";
import type DeleteCommentUseCase from "@src/application/usecases/comments/DeleteComment.usecase";
import type GetCommentsUseCase from "@src/application/usecases/comments/GetComments.usecase";
import type UpdateCommentUseCase from "@src/application/usecases/comments/UpdateComment.usecase";
import type CancelEventBookingUseCase from "@src/application/usecases/eventBookings/CancelEventBooking.usecase";
import type CreateEventBookingUseCase from "@src/application/usecases/eventBookings/CreateEventBooking.usecase";
import type GetEventBookingsByEventUseCase from "@src/application/usecases/eventBookings/GetEventBookingsByEvent.usecase";
import type GetMyEventBookingForEventUseCase from "@src/application/usecases/eventBookings/GetMyEventBookingForEvent.usecase";
import type GetMyEventBookingsUseCase from "@src/application/usecases/eventBookings/GetMyEventBookings.usecase";
import type UpdateEventBookingUseCase from "@src/application/usecases/eventBookings/UpdateEventBooking.usecase";
import type CreateEventInvitationsUseCase from "@src/application/usecases/eventInvitations/CreateEventInvitations.usecase";
import type GetEventInvitationsByUserIdUseCase from "@src/application/usecases/eventInvitations/GetEventInvitationsByUserId.usecase";
import type GetEventInvitationsUseCase from "@src/application/usecases/eventInvitations/GetEventInvitations.usecase";
import type UpdateEventInvitationUseCase from "@src/application/usecases/eventInvitations/UpdateEventInvitation.usecase";
import type CreateEventUseCase from "@src/application/usecases/events/CreateEvent.usecase";
import type DeleteEventUseCase from "@src/application/usecases/events/DeleteEvent.usecase";
import type GetEventByIdUseCase from "@src/application/usecases/events/GetEventById.usecase";
import type GetEventsUseCase from "@src/application/usecases/events/GetEvents.usecase";
import type GetEventsInViewUseCase from "@src/application/usecases/events/GetEventsInView.usecase";
import type UpdateEventUseCase from "@src/application/usecases/events/UpdateEvent.usecase";
import type UpdateEventLifecycleStatusUseCase from "@src/application/usecases/events/UpdateEventLifecycleStatus.usecase";
import type CreateFavoriteUseCase from "@src/application/usecases/favorites/CreateFavorite.usecase";
import type DeleteFavoriteUseCase from "@src/application/usecases/favorites/DeleteFavorite.usecase";
import type GetFavoritesByTypeUseCase from "@src/application/usecases/favorites/GetFavoritesByType.usecase";
import type CreateFollowUseCase from "@src/application/usecases/follows/CreateFollow.usecase";
import type DeleteFollowUseCase from "@src/application/usecases/follows/DeleteFollow.usecase";
import type GetFollowersUseCase from "@src/application/usecases/follows/GetFollowers.usecase";
import type GetFollowingUseCase from "@src/application/usecases/follows/GetFollowing.usecase";
import type GetOneFollowUseCase from "@src/application/usecases/follows/GetOneFollow.usecase";
import type DeleteImagesUseCase from "@src/application/usecases/images/DeleteImages.usecase";
import type GetImagesUseCase from "@src/application/usecases/images/GetImages.usecase";
import type UploadImagesUseCase from "@src/application/usecases/images/UploadImages.usecase";
import type CreateMessageUseCase from "@src/application/usecases/messages/CreateMessage.usecase";
import type DeleteMessageUseCase from "@src/application/usecases/messages/DeleteMessage.usecase";
import type GetConversationWithUserUseCase from "@src/application/usecases/messages/GetConversationWithUser.usecase";
import type GetConversationsUseCase from "@src/application/usecases/messages/GetConversations.usecase";
import type GetMessagesUseCase from "@src/application/usecases/messages/GetMessages.usecase";
import type MarkMessagesAsReadUseCase from "@src/application/usecases/messages/MarkMessagesAsRead.usecase";
import type UpdateMessageUseCase from "@src/application/usecases/messages/UpdateMessage.usecase";
import type CreateNotificationUseCase from "@src/application/usecases/notifications/CreateNotification.usecase";
import type GetCurrentUserNotificationsUseCase from "@src/application/usecases/notifications/GetCurrentUserNotifications.usecase";
import type MarkAllNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkAllNotificationsAsRead.usecase";
import type MarkNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkNotificationsAsRead.usecase";
import type CreatePartnershipUseCase from "@src/application/usecases/partnerships/CreatePartnership.usecase";
import type DeletePartnershipUseCase from "@src/application/usecases/partnerships/DeletePartnership.usecase";
import type GetPartnershipsByUserIdUseCase from "@src/application/usecases/partnerships/GetPartnershipsByUserId.usecase";
import type UpdatePartnershipsUseCase from "@src/application/usecases/partnerships/UpdatePartnerships.usecase";
import type CreatePlaceUseCase from "@src/application/usecases/places/CreatePlace.usecase";
import type DeletePlaceUseCase from "@src/application/usecases/places/DeletePlace.usecase";
import type GetPlaceByIdUseCase from "@src/application/usecases/places/GetPlaceById.usecase";
import type GetPlacesUseCase from "@src/application/usecases/places/GetPlaces.usecase";
import type GetPlacesInViewUseCase from "@src/application/usecases/places/GetPlacesInView.usecase";
import type UpdatePlaceUseCase from "@src/application/usecases/places/UpdatePlace.usecase";
import type CreateProductUseCase from "@src/application/usecases/products/CreateProduct.usecase";
import type DeleteProductUseCase from "@src/application/usecases/products/DeleteProduct.usecase";
import type GetProductByIdUseCase from "@src/application/usecases/products/GetProductById.usecase";
import type GetProductsUseCase from "@src/application/usecases/products/GetProducts.usecase";
import type UpdateProductUseCase from "@src/application/usecases/products/UpdateProduct.usecase";
import type CreateReviewUseCase from "@src/application/usecases/reviews/CreateReview.usecase";
import type DeleteReviewUseCase from "@src/application/usecases/reviews/DeleteReview.usecase";
import type GetMyReviewsUseCase from "@src/application/usecases/reviews/GetMyReviews.usecase";
import type GetReceivedReviewsUseCase from "@src/application/usecases/reviews/GetReceivedReviews.usecase";
import type GetReviewsUseCase from "@src/application/usecases/reviews/GetReviews.usecase";
import type UpdateReviewUseCase from "@src/application/usecases/reviews/UpdateReview.usecase";
import type DeleteAccountUseCase from "@src/application/usecases/users/DeleteAccount.usecase";
import type GetUserByIdUseCase from "@src/application/usecases/users/GetUserById.usecase";
import type GetUserProfileUseCase from "@src/application/usecases/users/GetUserProfile.usecase";
import type GetUsersUseCase from "@src/application/usecases/users/GetUsers.usecase";
import type UpdateUserUseCase from "@src/application/usecases/users/UpdateUser.usecase";
import type { IAuthEmailSender } from "@src/domain/interfaces/IAuthEmailSender";
import type { ICascadeDeleter } from "@src/domain/interfaces/ICascadeDeleter";
import type { ICategoryRepository } from "@src/domain/interfaces/ICategoryRepository";
import type { ICommentReferenceChecker } from "@src/domain/interfaces/ICommentReferenceChecker";
import type { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import type { IConversationRepository } from "@src/domain/interfaces/IConversationRepository";
import type { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import type { IEventInvitationNotifier } from "@src/domain/interfaces/IEventInvitationNotifier";
import type { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import type { IEventNotifier } from "@src/domain/interfaces/IEventNotifier";
import type { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import type { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import type { IFollowCounter } from "@src/domain/interfaces/IFollowCounter";
import type { IFollowNotifier } from "@src/domain/interfaces/IFollowNotifier";
import type { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import type { IGoogleIdentityVerifier } from "@src/domain/interfaces/IGoogleIdentityVerifier";
import type { IImageReferenceOwnershipChecker } from "@src/domain/interfaces/IImageReferenceOwnershipChecker";
import type { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import type { IImageStorage } from "@src/domain/interfaces/IImageStorage";
import type { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import type { IMessageRealtimePublisher } from "@src/domain/interfaces/IMessageRealtimePublisher";
import type { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";
import type { INotificationEmailSender } from "@src/domain/interfaces/INotificationEmailSender";
import type { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";
import type { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import type { IPartnershipNotifier } from "@src/domain/interfaces/IPartnershipNotifier";
import type { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import type { IPasswordHasher } from "@src/domain/interfaces/IPasswordHasher";
import type { IPlaceOwnershipChecker } from "@src/domain/interfaces/IPlaceOwnershipChecker";
import type { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import type { IProductRepository } from "@src/domain/interfaces/IProductRepository";
import type { IReviewRatingUpdater } from "@src/domain/interfaces/IReviewRatingUpdater";
import type { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import type { IReviewTargetChecker } from "@src/domain/interfaces/IReviewTargetChecker";
import type { IUnreadConversationCounter } from "@src/domain/interfaces/IUnreadConversationCounter";
import type { IUserPlaceLinker } from "@src/domain/interfaces/IUserPlaceLinker";
import type { IUserPlaceResolver } from "@src/domain/interfaces/IUserPlaceResolver";
import type { IUserRepository } from "@src/domain/interfaces/IUserRepository";

/**
 * Typed Awilix cradle. Registration names must match constructor param names
 * for CLASSIC injection (e.g. `userRepository`, `cascadeDeleter`).
 */
export interface Cradle {
  // Repositories
  categoryRepository: ICategoryRepository;
  userRepository: IUserRepository;
  placeRepository: IPlaceRepository;
  eventRepository: IEventRepository;
  messageRepository: IMessageRepository;
  conversationRepository: IConversationRepository;
  imageRepository: IImageRepository;
  partnershipRepository: IPartnershipRepository;
  eventInvitationRepository: IEventInvitationRepository;
  eventBookingRepository: IEventBookingRepository;
  notificationRepository: INotificationRepository;
  commentRepository: ICommentRepository;
  favoriteRepository: IFavoriteRepository;
  followRepository: IFollowRepository;
  reviewRepository: IReviewRepository;
  productRepository: IProductRepository;

  // Shared adapters / ports
  userPlaceLinker: IUserPlaceLinker;
  realtimePublisher: IMessageRealtimePublisher;
  unreadConversationCounter: IUnreadConversationCounter;
  notificationEmailSender: INotificationEmailSender;
  jwtTokenIssuer: IJwtTokenIssuer;
  imageStorage: IImageStorage;
  passwordHasher: IPasswordHasher;
  authEmailSender: IAuthEmailSender;
  googleIdentityVerifier: IGoogleIdentityVerifier;
  opaqueTokenFactory: IOpaqueTokenFactory;
  placeOwnershipChecker: IPlaceOwnershipChecker;
  referenceChecker: ICommentReferenceChecker;
  ownershipChecker: IImageReferenceOwnershipChecker;
  targetChecker: IReviewTargetChecker;
  ratingUpdater: IReviewRatingUpdater;
  userPlaceResolver: IUserPlaceResolver;
  followCounter: IFollowCounter;
  followNotifier: IFollowNotifier;
  eventNotifier: IEventNotifier;
  eventInvitationNotifier: IEventInvitationNotifier;
  partnershipNotifier: IPartnershipNotifier;

  // Shared use cases
  createNotificationUseCase: CreateNotificationUseCase;
  deleteImagesUseCase: DeleteImagesUseCase;
  cascadeDeleter: ICascadeDeleter;

  // Middlewares
  authMiddleware: AuthMiddleware;
  adminMiddleware: AdminMiddleware;
  rateLimiterMiddleware: RateLimiterMiddleware;
  uploadMiddleware: UploadMiddleware;

  // Admin
  searchAdminUsersUseCase: SearchAdminUsersUseCase;
  getAdminUserUseCase: GetAdminUserUseCase;
  getAdminUserContentUseCase: GetAdminUserContentUseCase;
  banAdminUserUseCase: BanAdminUserUseCase;
  unbanAdminUserUseCase: UnbanAdminUserUseCase;
  softDeleteAdminUserUseCase: SoftDeleteAdminUserUseCase;
  restoreAdminUserUseCase: RestoreAdminUserUseCase;
  softDeleteAdminResourceUseCase: SoftDeleteAdminResourceUseCase;
  restoreAdminResourceUseCase: RestoreAdminResourceUseCase;
  adminUsersController: AdminUsersController;
  adminResourcesController: AdminResourcesController;

  // Auth
  registerUseCase: RegisterUseCase;
  signInUseCase: SignInUseCase;
  googleAuthUseCase: GoogleAuthUseCase;
  verifyEmailUseCase: VerifyEmailUseCase;
  resendVerificationEmailUseCase: ResendVerificationEmailUseCase;
  requestPasswordResetUseCase: RequestPasswordResetUseCase;
  resetPasswordUseCase: ResetPasswordUseCase;
  acceptCguUseCase: AcceptCguUseCase;
  authController: AuthController;

  // Categories
  getCategoriesUseCase: GetCategoriesUseCase;
  categoriesController: CategoriesController;

  // Comments
  createCommentUseCase: CreateCommentUseCase;
  getCommentsUseCase: GetCommentsUseCase;
  updateCommentUseCase: UpdateCommentUseCase;
  deleteCommentUseCase: DeleteCommentUseCase;
  commentsController: CommentsController;

  // Event bookings
  createEventBookingUseCase: CreateEventBookingUseCase;
  updateEventBookingUseCase: UpdateEventBookingUseCase;
  cancelEventBookingUseCase: CancelEventBookingUseCase;
  getMyEventBookingsUseCase: GetMyEventBookingsUseCase;
  getMyEventBookingForEventUseCase: GetMyEventBookingForEventUseCase;
  getEventBookingsByEventUseCase: GetEventBookingsByEventUseCase;
  eventBookingsController: EventBookingsController;

  // Event invitations
  createEventInvitationsUseCase: CreateEventInvitationsUseCase;
  updateEventInvitationUseCase: UpdateEventInvitationUseCase;
  getEventInvitationsUseCase: GetEventInvitationsUseCase;
  getEventInvitationsByUserIdUseCase: GetEventInvitationsByUserIdUseCase;
  eventInvitationsController: EventInvitationsController;

  // Events
  createEventUseCase: CreateEventUseCase;
  updateEventUseCase: UpdateEventUseCase;
  deleteEventUseCase: DeleteEventUseCase;
  getEventByIdUseCase: GetEventByIdUseCase;
  getEventsUseCase: GetEventsUseCase;
  getEventsInViewUseCase: GetEventsInViewUseCase;
  updateEventLifecycleStatusUseCase: UpdateEventLifecycleStatusUseCase;
  eventsController: EventsController;

  // Favorites
  createFavoriteUseCase: CreateFavoriteUseCase;
  deleteFavoriteUseCase: DeleteFavoriteUseCase;
  getFavoritesByTypeUseCase: GetFavoritesByTypeUseCase;
  favoritesController: FavoritesController;

  // Follows
  createFollowUseCase: CreateFollowUseCase;
  deleteFollowUseCase: DeleteFollowUseCase;
  getFollowersUseCase: GetFollowersUseCase;
  getFollowingUseCase: GetFollowingUseCase;
  getOneFollowUseCase: GetOneFollowUseCase;
  followsController: FollowsController;

  // Images
  uploadImagesUseCase: UploadImagesUseCase;
  getImagesUseCase: GetImagesUseCase;
  imagesController: ImagesController;

  // Messages
  createMessageUseCase: CreateMessageUseCase;
  updateMessageUseCase: UpdateMessageUseCase;
  deleteMessageUseCase: DeleteMessageUseCase;
  getMessagesUseCase: GetMessagesUseCase;
  getConversationsUseCase: GetConversationsUseCase;
  getConversationWithUserUseCase: GetConversationWithUserUseCase;
  markMessagesAsReadUseCase: MarkMessagesAsReadUseCase;
  messagesController: MessagesController;

  // Notifications
  getCurrentUserNotificationsUseCase: GetCurrentUserNotificationsUseCase;
  markNotificationsAsReadUseCase: MarkNotificationsAsReadUseCase;
  markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase;
  notificationsController: NotificationsController;

  // Partnerships
  createPartnershipUseCase: CreatePartnershipUseCase;
  updatePartnershipsUseCase: UpdatePartnershipsUseCase;
  deletePartnershipUseCase: DeletePartnershipUseCase;
  getPartnershipsByUserIdUseCase: GetPartnershipsByUserIdUseCase;
  partnershipsController: PartnershipsController;

  // Places
  createPlaceUseCase: CreatePlaceUseCase;
  updatePlaceUseCase: UpdatePlaceUseCase;
  deletePlaceUseCase: DeletePlaceUseCase;
  getPlaceByIdUseCase: GetPlaceByIdUseCase;
  getPlacesUseCase: GetPlacesUseCase;
  getPlacesInViewUseCase: GetPlacesInViewUseCase;
  placesController: PlacesController;

  // Products
  createProductUseCase: CreateProductUseCase;
  updateProductUseCase: UpdateProductUseCase;
  deleteProductUseCase: DeleteProductUseCase;
  getProductsUseCase: GetProductsUseCase;
  getProductByIdUseCase: GetProductByIdUseCase;
  productsController: ProductsController;

  // Reviews
  createReviewUseCase: CreateReviewUseCase;
  getReviewsUseCase: GetReviewsUseCase;
  getMyReviewsUseCase: GetMyReviewsUseCase;
  getReceivedReviewsUseCase: GetReceivedReviewsUseCase;
  updateReviewUseCase: UpdateReviewUseCase;
  deleteReviewUseCase: DeleteReviewUseCase;
  reviewsController: ReviewsController;

  // Users
  getUserByIdUseCase: GetUserByIdUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;
  getUsersUseCase: GetUsersUseCase;
  updateUserUseCase: UpdateUserUseCase;
  deleteAccountUseCase: DeleteAccountUseCase;
  usersController: UsersController;
}
