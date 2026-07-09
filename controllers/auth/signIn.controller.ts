import { loginSchema } from "../../validations/auth.validations";
import { ISignInAction } from "@/actions/auth";
import { setTokenCookie } from "@/utils/jwt";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const SignInController = (signInAction: ISignInAction): Controller =>
  createController({
    execute: async (req, res) => {
      const { user, token } = await signInAction.execute({
        signInData: validateOrThrow(loginSchema, req.body),
      });
      setTokenCookie(res, token);
      return { user };
    },
    successMessage: "Logged in",
    mapResult: ({ user }) => ({ user }),
  });

export default SignInController;
