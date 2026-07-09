import { newCreatorSchema } from "../../validations/user.validations";
import { IUpdateUserAction } from "@/actions/users";
import { setTokenCookie } from "@/utils/jwt";
import { IUser } from "@/types/models/user";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const UpdateUserController = (updateUserAction: IUpdateUserAction): Controller =>
  createController({
    execute: async (req, res) => {
      let updateData: Partial<IUser> = req.body;
      if (req.body.userType === "creator") {
        const parsed = validateOrThrow(newCreatorSchema, req.body);
        updateData = Object.fromEntries(
          Object.entries(parsed).filter(([, v]) => v !== undefined)
        ) as Partial<IUser>;
      }

      const result = await updateUserAction.execute({
        userId: requireAuth(req).id,
        updateData,
      });

      if (result.token) {
        setTokenCookie(res, result.token);
      }
    },
    successMessage: "User updated successfully",
  });

export default UpdateUserController;
