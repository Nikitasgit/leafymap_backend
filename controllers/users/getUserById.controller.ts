import { IGetUserByIdAction } from "@/actions/users";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetUserByIdController = (
  getUserByIdAction: IGetUserByIdAction
): Controller =>
  createController({
    execute: async (req) => {
      const user = await getUserByIdAction.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { user };
    },
    successMessage: "User fetched successfully",
  });

export default GetUserByIdController;
