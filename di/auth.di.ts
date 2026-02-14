import { UserRepository } from "@/repositories";
import {
  RegisterAction,
  SignInAction,
  RequestPasswordResetAction,
  ResetPasswordAction,
  GoogleAuthAction,
  AcceptCguAction,
  VerifyEmailAction,
  ResendVerificationEmailAction,
} from "@/actions/auth";
import { GetUserByIdAction } from "@/actions/users";
import {
  RegisterController,
  SignInController,
  SignOutController,
  GetCurrentUserController,
  RequestPasswordResetController,
  ResetPasswordController,
  GoogleAuthController,
  AcceptCguController,
  VerifyEmailController,
  ResendVerificationEmailController,
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
const requestPasswordResetAction = new RequestPasswordResetAction(userRepository);
const resetPasswordAction = new ResetPasswordAction(userRepository);
const googleAuthAction = new GoogleAuthAction(userRepository);
const acceptCguAction = new AcceptCguAction(userRepository);
const verifyEmailAction = new VerifyEmailAction(userRepository);
const resendVerificationEmailAction = new ResendVerificationEmailAction(
  userRepository
);
const getUserByIdAction = new GetUserByIdAction(userRepository);

// Initialize controllers
export const register = new RegisterController(registerAction);
export const signIn = new SignInController(signInAction);
export const signOut = new SignOutController();
export const getCurrentUser = new GetCurrentUserController(getUserByIdAction);
export const requestPasswordReset = new RequestPasswordResetController(
  requestPasswordResetAction
);
export const resetPassword = new ResetPasswordController(resetPasswordAction);
export const googleAuth = new GoogleAuthController(googleAuthAction);
export const acceptCgu = new AcceptCguController(acceptCguAction);
export const verifyEmail = new VerifyEmailController(verifyEmailAction);
export const resendVerificationEmail = new ResendVerificationEmailController(
  resendVerificationEmailAction
);
