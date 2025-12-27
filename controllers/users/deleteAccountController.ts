import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IDeleteAccountAction } from "../../actions/users/DeleteAccountAction";

class DeleteAccountController {
  constructor(private deleteAccountAction: IDeleteAccountAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        await this.deleteAccountAction.execute({
          userId: decoded.id,
        });

        res.clearCookie("token");
        APIResponse(
          res,
          null,
          "Account and all associated data deleted successfully",
          200
        );
      } catch (error) {
        logger.error("Error deleting account:", error);
        const message = error instanceof Error ? error.message : "Server error";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default DeleteAccountController;
