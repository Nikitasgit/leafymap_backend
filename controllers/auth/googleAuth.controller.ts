import { googleAuthSchema } from "../../validations/auth.validations";
import { IGoogleAuthAction } from "@/actions/auth";
import { setTokenCookie } from "@/utils/jwt";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const GoogleAuthController = (googleAuthAction: IGoogleAuthAction): Controller =>
  createController({
    execute: async (req, res) => {
      const { id_token } = validateOrThrow(googleAuthSchema, req.body);
      const { user, token, mergedUnverifiedAccount } =
        await googleAuthAction.execute({
          googleAuthData: { idToken: id_token },
        });
      setTokenCookie(res, token);
      return { user, mergedUnverifiedAccount: !!mergedUnverifiedAccount };
    },
    successMessage: "Logged in",
  });

export default GoogleAuthController;
