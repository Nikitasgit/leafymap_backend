import { RequestHandler } from "express";
import {
  acceptCguSchema,
  googleAuthSchema,
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resendVerificationEmailSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@src/api/dto/auth/auth.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type AcceptCguUseCase from "@src/application/usecases/auth/AcceptCgu.usecase";
import type GoogleAuthUseCase from "@src/application/usecases/auth/GoogleAuth.usecase";
import type RegisterUseCase from "@src/application/usecases/auth/Register.usecase";
import type RequestPasswordResetUseCase from "@src/application/usecases/auth/RequestPasswordReset.usecase";
import type ResendVerificationEmailUseCase from "@src/application/usecases/auth/ResendVerificationEmail.usecase";
import type ResetPasswordUseCase from "@src/application/usecases/auth/ResetPassword.usecase";
import type SignInUseCase from "@src/application/usecases/auth/SignIn.usecase";
import type VerifyEmailUseCase from "@src/application/usecases/auth/VerifyEmail.usecase";
import type GetUserByIdUseCase from "@src/application/usecases/users/GetUserById.usecase";
import { setTokenCookie } from "@src/api/http/cookies";

class AuthController extends BaseHttpController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly googleAuthUseCase: GoogleAuthUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationEmailUseCase: ResendVerificationEmailUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly acceptCguUseCase: AcceptCguUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase
  ) {
    super();
  }

  register(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.registerUseCase.execute(
          validateOrThrow(registerSchema, req.body)
        );
      },
      successMessage: "User registered",
      successStatus: 201,
    });
  }

  signIn(): RequestHandler {
    return this.handler({
      execute: async (req, res) => {
        const { user, token } = await this.signInUseCase.execute(
          validateOrThrow(loginSchema, req.body)
        );
        setTokenCookie(res, token);
        return { user };
      },
      successMessage: "Logged in",
      mapResult: ({ user }) => ({ user }),
    });
  }

  signOut(): RequestHandler {
    return this.handler({
      execute: async (_req, res) => {
        res
          .clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          })
          .clearCookie("userType", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          });
      },
      successMessage: "Logged out",
    });
  }

  getCurrentUser(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const user = await this.getUserByIdUseCase.execute({
          userId: requireAuth(req).id,
          view: "current",
        });
        return { user };
      },
      successMessage: "User retrieved successfully",
    });
  }

  googleAuth(): RequestHandler {
    return this.handler({
      execute: async (req, res) => {
        const { id_token } = validateOrThrow(googleAuthSchema, req.body);
        const { user, token, mergedUnverifiedAccount } =
          await this.googleAuthUseCase.execute({ idToken: id_token });
        setTokenCookie(res, token);
        return { user, mergedUnverifiedAccount: !!mergedUnverifiedAccount };
      },
      successMessage: "Logged in",
    });
  }

  acceptCgu(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { emailNotifications } = validateOrThrow(
          acceptCguSchema,
          req.body ?? {}
        );
        await this.acceptCguUseCase.execute({
          userId: requireAuth(req).id,
          emailNotifications,
        });
      },
      successMessage: "CGU accepted",
    });
  }

  verifyEmail(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.verifyEmailUseCase.execute(
          validateOrThrow(verifyEmailSchema, req.query)
        );
      },
      successMessage: "Email vérifié avec succès.",
    });
  }

  resendVerificationEmail(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.resendVerificationEmailUseCase.execute(
          validateOrThrow(resendVerificationEmailSchema, req.body)
        );
      },
      successMessage:
        "Si ce compte existe, un nouveau lien de vérification a été envoyé.",
    });
  }

  requestPasswordReset(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.requestPasswordResetUseCase.execute(
          validateOrThrow(requestPasswordResetSchema, req.body)
        );
      },
      successMessage:
        "Si cet email existe dans notre système, un lien de réinitialisation vous a été envoyé.",
    });
  }

  resetPassword(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.resetPasswordUseCase.execute(
          validateOrThrow(resetPasswordSchema, req.body)
        );
      },
      successMessage: "Votre mot de passe a été réinitialisé avec succès.",
    });
  }
}

export default AuthController;
