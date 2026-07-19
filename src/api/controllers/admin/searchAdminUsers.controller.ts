import { adminUserSearchSchema } from "@src/api/dto/admin/admin.dto";
import type SearchAdminUsersUseCase from "@src/application/usecases/admin/SearchAdminUsers.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const SearchAdminUsersController = (
  searchAdminUsersUseCase: SearchAdminUsersUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { email } = validateOrThrow(adminUserSearchSchema, req.query);
      const users = await searchAdminUsersUseCase.execute({ email });
      return { users };
    },
    successMessage: "Users retrieved successfully",
  });

export default SearchAdminUsersController;
