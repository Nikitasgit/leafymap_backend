import { RequestHandler, Response } from "express";
import { ISearchAdminUsersAction } from "@/actions/admin/SearchAdminUsers.action";
import { adminUserSearchSchema } from "@/validations/admin.validations";
import { APIResponse } from "@/utils/response";

class SearchAdminUsersController {
  constructor(private action: ISearchAdminUsersAction) {}

  handle(): RequestHandler {
    return async (req, res: Response): Promise<void> => {
      try {
        const { email } = adminUserSearchSchema.parse(req.query);
        const users = await this.action.execute({ email });
        APIResponse(res, { users }, "Users retrieved successfully", 200);
      } catch (error) {
        APIResponse(res, null, "Failed to search users", 400);
      }
    };
  }
}

export default SearchAdminUsersController;
