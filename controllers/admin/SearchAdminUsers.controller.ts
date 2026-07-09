import { ISearchAdminUsersAction } from "@/actions/admin/SearchAdminUsers.action";
import { adminUserSearchSchema } from "@/validations/admin.validations";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const SearchAdminUsersController = (
  action: ISearchAdminUsersAction
): Controller =>
  createController({
    execute: async (req) => {
      const { email } = validateOrThrow(adminUserSearchSchema, req.query);
      const users = await action.execute({ email });
      return { users };
    },
    successMessage: "Users retrieved successfully",
  });

export default SearchAdminUsersController;
