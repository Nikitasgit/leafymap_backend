import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IMarkNotificationsAsReadAction } from "@/actions/notifications";
import { NotificationActionType } from "@/types/models/notification";

interface MarkNotificationsAsReadBody {
  action?: string;
}

class MarkNotificationsAsReadController {
  constructor(
    private markNotificationsAsReadAction: IMarkNotificationsAsReadAction
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

        const { action } = (req.body as MarkNotificationsAsReadBody) || {};
        if (!action || typeof action !== "string") {
          APIResponse(
            res,
            null,
            "action est requis (ex: partnership_invitation)",
            400
          );
          return;
        }

        const { markedCount } =
          await this.markNotificationsAsReadAction.execute({
            action: action as NotificationActionType,
            userId,
          });

        APIResponse(
          res,
          { markedCount },
          `${markedCount} notification(s) marquée(s) comme lue(s)`,
          200
        );
      } catch (error) {
        logger.error(
          "Erreur lors du marquage des notifications comme lues:",
          error
        );
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default MarkNotificationsAsReadController;
