import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetCurrentUserNotificationsAction } from "@/actions/notifications";

class GetCurrentUserNotificationsController {
  constructor(
    private getCurrentUserNotificationsAction: IGetCurrentUserNotificationsAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const notifications =
          await this.getCurrentUserNotificationsAction.execute({
            userId: decoded.id,
          });

        APIResponse(
          res,
          notifications,
          "Notifications récupérées avec succès",
          200
        );
      } catch (error) {
        logger.error(
          "Erreur lors de la récupération des notifications:",
          error
        );
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default GetCurrentUserNotificationsController;
