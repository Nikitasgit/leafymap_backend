import { IGetAdminUserContentAction } from "@/actions/admin/GetAdminUserContent.action";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetAdminUserContentController = (
  action: IGetAdminUserContentAction
): Controller =>
  createController({
    execute: async (req) => {
      const content = await action.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { content };
    },
    successMessage: "User content retrieved successfully",
  });

export default GetAdminUserContentController;
