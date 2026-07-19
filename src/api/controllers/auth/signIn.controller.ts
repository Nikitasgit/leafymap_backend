import { loginSchema } from "@src/api/dto/auth/auth.dto";
import type SignInUseCase from "@src/application/usecases/auth/SignIn.usecase";
import { setTokenCookie } from "@src/infrastructure/auth/jwt";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const SignInController = (signInUseCase: SignInUseCase): Controller =>
  createController({
    execute: async (req, res) => {
      const { user, token } = await signInUseCase.execute(
        validateOrThrow(loginSchema, req.body)
      );
      setTokenCookie(res, token);
      return { user };
    },
    successMessage: "Logged in",
    mapResult: ({ user }) => ({ user }),
  });

export default SignInController;
