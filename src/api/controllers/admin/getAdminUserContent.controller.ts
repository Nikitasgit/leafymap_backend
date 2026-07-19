import type GetAdminUserContentUseCase from "@src/application/usecases/admin/GetAdminUserContent.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetAdminUserContentController = (
  getAdminUserContentUseCase: GetAdminUserContentUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const content = await getAdminUserContentUseCase.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { content };
    },
    successMessage: "User content retrieved successfully",
  });

export default GetAdminUserContentController;
