import AcceptCguUseCase from "@src/application/usecases/auth/AcceptCgu.usecase";
import GoogleAuthUseCase from "@src/application/usecases/auth/GoogleAuth.usecase";
import RegisterUseCase from "@src/application/usecases/auth/Register.usecase";
import RequestPasswordResetUseCase from "@src/application/usecases/auth/RequestPasswordReset.usecase";
import ResendVerificationEmailUseCase from "@src/application/usecases/auth/ResendVerificationEmail.usecase";
import ResetPasswordUseCase from "@src/application/usecases/auth/ResetPassword.usecase";
import SignInUseCase from "@src/application/usecases/auth/SignIn.usecase";
import VerifyEmailUseCase from "@src/application/usecases/auth/VerifyEmail.usecase";
import AcceptCguController from "@src/api/controllers/auth/acceptCgu.controller";
import GetCurrentUserController from "@src/api/controllers/auth/getCurrentUser.controller";
import GoogleAuthController from "@src/api/controllers/auth/googleAuth.controller";
import RegisterController from "@src/api/controllers/auth/register.controller";
import RequestPasswordResetController from "@src/api/controllers/auth/requestPasswordReset.controller";
import ResendVerificationEmailController from "@src/api/controllers/auth/resendVerificationEmail.controller";
import ResetPasswordController from "@src/api/controllers/auth/resetPassword.controller";
import SignInController from "@src/api/controllers/auth/signIn.controller";
import SignOutController from "@src/api/controllers/auth/signOut.controller";
import VerifyEmailController from "@src/api/controllers/auth/verifyEmail.controller";
import BcryptPasswordHasherAdapter from "@src/infrastructure/adapters/BcryptPasswordHasher.adapter";
import GoogleIdentityVerifierAdapter from "@src/infrastructure/adapters/GoogleIdentityVerifier.adapter";
import JwtTokenIssuerAdapter from "@src/infrastructure/adapters/JwtTokenIssuer.adapter";
import AuthEmailSenderAdapter from "@src/infrastructure/adapters/AuthEmailSender.adapter";
import OpaqueTokenFactoryAdapter from "@src/infrastructure/adapters/OpaqueTokenFactory.adapter";
import { getUserByIdUseCase } from "@src/api/composition/users.composition";
import {
  authMiddleware,
  mongooseUserRepository,
  rateLimiterMiddleware,
} from "@src/di/container";

const passwordHasher = new BcryptPasswordHasherAdapter();
const authEmailSender = new AuthEmailSenderAdapter();
const jwtTokenIssuer = new JwtTokenIssuerAdapter();
const googleIdentityVerifier = new GoogleIdentityVerifierAdapter();
const opaqueTokenFactory = new OpaqueTokenFactoryAdapter();

const registerUseCase = new RegisterUseCase(
  mongooseUserRepository,
  passwordHasher,
  opaqueTokenFactory,
  authEmailSender
);
const signInUseCase = new SignInUseCase(
  mongooseUserRepository,
  passwordHasher,
  jwtTokenIssuer
);
const googleAuthUseCase = new GoogleAuthUseCase(
  mongooseUserRepository,
  googleIdentityVerifier,
  passwordHasher,
  jwtTokenIssuer
);
const verifyEmailUseCase = new VerifyEmailUseCase(
  mongooseUserRepository,
  opaqueTokenFactory
);
const resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
  mongooseUserRepository,
  opaqueTokenFactory,
  authEmailSender
);
const requestPasswordResetUseCase = new RequestPasswordResetUseCase(
  mongooseUserRepository,
  opaqueTokenFactory,
  authEmailSender
);
const resetPasswordUseCase = new ResetPasswordUseCase(
  mongooseUserRepository,
  opaqueTokenFactory,
  passwordHasher
);
const acceptCguUseCase = new AcceptCguUseCase(mongooseUserRepository);

export { authMiddleware, rateLimiterMiddleware };

export const register = RegisterController(registerUseCase);
export const signIn = SignInController(signInUseCase);
export const signOut = SignOutController();
export const getCurrentUser = GetCurrentUserController(getUserByIdUseCase);
export const googleAuth = GoogleAuthController(googleAuthUseCase);
export const acceptCgu = AcceptCguController(acceptCguUseCase);
export const verifyEmail = VerifyEmailController(verifyEmailUseCase);
export const resendVerificationEmail = ResendVerificationEmailController(
  resendVerificationEmailUseCase
);
export const requestPasswordReset = RequestPasswordResetController(
  requestPasswordResetUseCase
);
export const resetPassword = ResetPasswordController(resetPasswordUseCase);
