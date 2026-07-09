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
export const register = RegisterController(registerAction);
export const signIn = SignInController(signInAction);
export const signOut = SignOutController();
export const getCurrentUser = GetCurrentUserController(getUserByIdAction);
export const requestPasswordReset = RequestPasswordResetController(
  requestPasswordResetAction
);
export const resetPassword = ResetPasswordController(resetPasswordAction);
export const googleAuth = GoogleAuthController(googleAuthAction);
export const acceptCgu = AcceptCguController(acceptCguAction);
export const verifyEmail = VerifyEmailController(verifyEmailAction);
export const resendVerificationEmail = ResendVerificationEmailController(
  resendVerificationEmailAction
);
