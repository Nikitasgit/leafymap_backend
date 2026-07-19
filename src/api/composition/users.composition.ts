import GetUserByIdUseCase from "@src/application/usecases/users/GetUserById.usecase";
import GetUserProfileUseCase from "@src/application/usecases/users/GetUserProfile.usecase";
import GetUsersUseCase from "@src/application/usecases/users/GetUsers.usecase";
import UpdateUserUseCase from "@src/application/usecases/users/UpdateUser.usecase";
import DeleteAccountUseCase from "@src/application/usecases/users/DeleteAccount.usecase";
import GetPlaceByIdUseCase from "@src/application/usecases/places/GetPlaceById.usecase";
import GetUserByIdController from "@src/api/controllers/users/getUserById.controller";
import GetUserProfileController from "@src/api/controllers/users/getUserProfile.controller";
import GetUsersController from "@src/api/controllers/users/getUsers.controller";
import UpdateUserController from "@src/api/controllers/users/updateUser.controller";
import DeleteAccountController from "@src/api/controllers/users/deleteAccount.controller";
import JwtTokenIssuerAdapter from "@src/infrastructure/adapters/JwtTokenIssuer.adapter";
import {
  authMiddleware,
  cascadeDeleteUseCase,
  mongooseEventBookingRepository,
  mongooseEventInvitationRepository,
  mongooseEventRepository,
  mongooseFavoriteRepository,
  mongooseFollowRepository,
  mongooseImageRepository,
  mongoosePartnershipRepository,
  mongoosePlaceRepository,
  mongooseProductRepository,
  mongooseNotificationRepository,
  mongooseUserRepository,
  rateLimiterMiddleware,
} from "@src/di/container";

const jwtTokenIssuer = new JwtTokenIssuerAdapter();

const getUserByIdUseCase = new GetUserByIdUseCase(mongooseUserRepository);
const getPlaceByIdUseCase = new GetPlaceByIdUseCase(
  mongoosePlaceRepository,
  mongooseEventRepository
);
const getUserProfileUseCase = new GetUserProfileUseCase(
  mongooseUserRepository,
  getPlaceByIdUseCase
);
const getUsersUseCase = new GetUsersUseCase(mongooseUserRepository);
const updateUserUseCase = new UpdateUserUseCase(
  mongooseUserRepository,
  jwtTokenIssuer
);
const deleteAccountUseCase = new DeleteAccountUseCase(
  mongooseUserRepository,
  mongoosePlaceRepository,
  mongooseEventRepository,
  mongoosePartnershipRepository,
  mongooseEventBookingRepository,
  mongooseEventInvitationRepository,
  mongooseFavoriteRepository,
  mongooseFollowRepository,
  mongooseProductRepository,
  mongooseNotificationRepository,
  mongooseImageRepository,
  cascadeDeleteUseCase
);

export { authMiddleware, rateLimiterMiddleware, getUserByIdUseCase };

export const getUserById = GetUserByIdController(getUserByIdUseCase);
export const getUserProfile = GetUserProfileController(getUserProfileUseCase);
export const getUsers = GetUsersController(getUsersUseCase);
export const updateUser = UpdateUserController(updateUserUseCase);
export const deleteAccount = DeleteAccountController(deleteAccountUseCase);
