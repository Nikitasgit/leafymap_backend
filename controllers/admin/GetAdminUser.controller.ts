import { IGetAdminUserAction } from "@/actions/admin/GetAdminUser.action";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetAdminUserController = (action: IGetAdminUserAction): Controller =>
  createController({
    execute: async (req) => {
      const user = await action.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { user };
    },
    successMessage: "User retrieved successfully",
  });

export default GetAdminUserController;
