import { UserRepository } from "@/repositories";
import { RegisterAction, SignInAction } from "@/actions/auth";
import { GetUserByIdAction } from "@/actions/users";
import {
  RegisterController,
  SignInController,
  SignOutController,
  GetCurrentUserController,
} from "@/controllers/auth";
import { AuthMiddleware, RateLimiterMiddleware } from "@/middlewares";

// Initialize repositories
const userRepository = new UserRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const registerAction = new RegisterAction(userRepository);
const signInAction = new SignInAction(userRepository);
const getUserByIdAction = new GetUserByIdAction(userRepository);

// Initialize controllers
export const register = new RegisterController(registerAction);
export const signIn = new SignInController(signInAction);
export const signOut = new SignOutController();
export const getCurrentUser = new GetCurrentUserController(getUserByIdAction);
