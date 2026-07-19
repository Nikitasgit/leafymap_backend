import { googleAuthSchema } from "@src/api/dto/auth/auth.dto";
import type GoogleAuthUseCase from "@src/application/usecases/auth/GoogleAuth.usecase";
import { setTokenCookie } from "@src/infrastructure/auth/jwt";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GoogleAuthController = (
  googleAuthUseCase: GoogleAuthUseCase
): Controller =>
  createController({
    execute: async (req, res) => {
      const { id_token } = validateOrThrow(googleAuthSchema, req.body);
      const { user, token, mergedUnverifiedAccount } =
        await googleAuthUseCase.execute({ idToken: id_token });
      setTokenCookie(res, token);
      return { user, mergedUnverifiedAccount: !!mergedUnverifiedAccount };
    },
    successMessage: "Logged in",
  });

export default GoogleAuthController;
