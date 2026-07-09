import {
  userRepository,
  placeRepository,
  eventRepository,
  partnershipRepository,
  eventBookingRepository,
  eventInvitationRepository,
  favoriteRepository,
  notificationRepository,
  imageRepository,
  cascadeDeleteService,
  authMiddleware as sharedAuthMiddleware,
  rateLimiterMiddleware as sharedRateLimiterMiddleware,
} from "./container";
import {
  GetUserByIdAction,
  GetUserProfileAction,
  GetUsersAction,
  UpdateUserAction,
  DeleteAccountAction,
} from "@/actions/users";
import { GetPlaceByIdAction } from "@/actions/places";
import {
  GetUserByIdController,
  GetUserProfileController,
  GetUsersController,
  UpdateUserController,
  DeleteAccountController,
} from "@/controllers/users";

// Middlewares
export const authMiddleware = sharedAuthMiddleware;
export const rateLimiterMiddleware = sharedRateLimiterMiddleware;

// Actions
const getUserByIdAction = new GetUserByIdAction(userRepository);
const getPlaceByIdAction = new GetPlaceByIdAction(
  placeRepository,
  eventRepository
);
const getUserProfileAction = new GetUserProfileAction(
  userRepository,
  getPlaceByIdAction
);
const getUsersAction = new GetUsersAction(userRepository);
const updateUserAction = new UpdateUserAction(userRepository);
const deleteAccountAction = new DeleteAccountAction(
  userRepository,
  placeRepository,
  eventRepository,
  partnershipRepository,
  eventBookingRepository,
  eventInvitationRepository,
  favoriteRepository,
  notificationRepository,
  imageRepository,
  cascadeDeleteService
);

// Controllers
export const getUserById = GetUserByIdController(getUserByIdAction);
export const getUserProfile = GetUserProfileController(getUserProfileAction);
export const getUsers = GetUsersController(getUsersAction);
export const updateUser = UpdateUserController(updateUserAction);
export const deleteAccount = DeleteAccountController(deleteAccountAction);
