import { IGetUserProfileAction } from "@/actions/users/GetUserProfile.action";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetUserProfileController = (
  getUserProfileAction: IGetUserProfileAction
): Controller =>
  createController({
    execute: (req) =>
      getUserProfileAction.execute({
        userId: requireObjectIdParam(req, "userId"),
      }),
    successMessage: "User profile fetched successfully",
  });

export default GetUserProfileController;
