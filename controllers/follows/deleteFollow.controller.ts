import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IDeleteFollowAction } from "@/actions/follows";
import { getParam } from "@/utils/request";

class DeleteFollowController {
  constructor(private deleteFollowAction: IDeleteFollowAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const followerId = req.decoded?.id;
        if (!followerId) {
          APIResponse(res, null, "Non autorisé", 401);
          return;
        }

        const followId = getParam(req.params, "followId");
        if (!followId) {
          APIResponse(res, null, "Follow ID is required", 400);
          return;
        }

        await this.deleteFollowAction.execute({
          followId,
          followerId,
        });

        APIResponse(res, null, "Follow supprimé avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la suppression du follow:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default DeleteFollowController;
