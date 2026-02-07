import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IMarkAllNotificationsAsReadAction } from "@/actions/notifications/MarkAllNotificationsAsRead.action";

class MarkAllNotificationsAsReadController {
  constructor(
    private markAllNotificationsAsReadAction: IMarkAllNotificationsAsReadAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const userId = req.decoded?.id;
        if (!userId) {
          APIResponse(res, null, "Utilisateur non authentifié", 401);
          return;
        }

        const { markedCount } =
          await this.markAllNotificationsAsReadAction.execute({ userId });

        APIResponse(
          res,
          { markedCount },
          `${markedCount} notification(s) marquée(s) comme lue(s)`,
          200
        );
      } catch (error) {
        logger.error(
          "Erreur lors du marquage de toutes les notifications comme lues:",
          error
        );
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default MarkAllNotificationsAsReadController;
