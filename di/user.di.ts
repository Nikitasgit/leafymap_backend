import {
  UserRepository,
  PlaceRepository,
  EventRepository,
  PartnershipRepository,
} from "@/repositories";
import {
  GetUserByIdAction,
  GetUsersAction,
  UpdateUserAction,
  DeleteAccountAction,
} from "@/actions/users";
import {
  GetUserByIdController,
  GetUsersController,
  UpdateUserController,
  DeleteAccountController,
} from "@/controllers/users";
import { AuthMiddleware, RateLimiterMiddleware } from "@/middlewares";

// Initialize repositories
const userRepository = new UserRepository();
const placeRepository = new PlaceRepository();
const eventRepository = new EventRepository();
const partnershipRepository = new PartnershipRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const getUserByIdAction = new GetUserByIdAction(userRepository);
const getUsersAction = new GetUsersAction(userRepository);
const updateUserAction = new UpdateUserAction(userRepository);
const deleteAccountAction = new DeleteAccountAction(
  userRepository,
  placeRepository,
  eventRepository,
  partnershipRepository
);

// Initialize controllers
export const getUserById = new GetUserByIdController(getUserByIdAction);
export const getUsers = new GetUsersController(getUsersAction);
export const updateUser = new UpdateUserController(updateUserAction);
export const deleteAccount = new DeleteAccountController(deleteAccountAction);
