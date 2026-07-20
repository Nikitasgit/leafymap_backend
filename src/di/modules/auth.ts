import { asClass, AwilixContainer } from "awilix";
import AuthController from "@src/api/controllers/AuthController";
import AcceptCguUseCase from "@src/application/usecases/auth/AcceptCgu.usecase";
import GoogleAuthUseCase from "@src/application/usecases/auth/GoogleAuth.usecase";
import RegisterUseCase from "@src/application/usecases/auth/Register.usecase";
import RequestPasswordResetUseCase from "@src/application/usecases/auth/RequestPasswordReset.usecase";
import ResendVerificationEmailUseCase from "@src/application/usecases/auth/ResendVerificationEmail.usecase";
import ResetPasswordUseCase from "@src/application/usecases/auth/ResetPassword.usecase";
import SignInUseCase from "@src/application/usecases/auth/SignIn.usecase";
import VerifyEmailUseCase from "@src/application/usecases/auth/VerifyEmail.usecase";
import AuthEmailSenderAdapter from "@src/infrastructure/adapters/AuthEmailSender.adapter";
import BcryptPasswordHasherAdapter from "@src/infrastructure/adapters/BcryptPasswordHasher.adapter";
import GoogleIdentityVerifierAdapter from "@src/infrastructure/adapters/GoogleIdentityVerifier.adapter";
import OpaqueTokenFactoryAdapter from "@src/infrastructure/adapters/OpaqueTokenFactory.adapter";
import type { Cradle } from "@src/di/cradle";

export const registerAuthModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    passwordHasher: asClass(BcryptPasswordHasherAdapter).singleton(),
    authEmailSender: asClass(AuthEmailSenderAdapter).singleton(),
    googleIdentityVerifier: asClass(GoogleIdentityVerifierAdapter).singleton(),
    opaqueTokenFactory: asClass(OpaqueTokenFactoryAdapter).singleton(),

    registerUseCase: asClass(RegisterUseCase).singleton(),
    signInUseCase: asClass(SignInUseCase).singleton(),
    googleAuthUseCase: asClass(GoogleAuthUseCase).singleton(),
    verifyEmailUseCase: asClass(VerifyEmailUseCase).singleton(),
    resendVerificationEmailUseCase: asClass(
      ResendVerificationEmailUseCase
    ).singleton(),
    requestPasswordResetUseCase: asClass(
      RequestPasswordResetUseCase
    ).singleton(),
    resetPasswordUseCase: asClass(ResetPasswordUseCase).singleton(),
    acceptCguUseCase: asClass(AcceptCguUseCase).singleton(),

    authController: asClass(AuthController).singleton(),
  });
};
