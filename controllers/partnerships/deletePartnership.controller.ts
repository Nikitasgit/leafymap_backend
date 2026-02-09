import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import logger from "@/utils/logger";
import { IDeletePartnershipAction } from "@/actions/partnerships";

class DeletePartnershipController {
  constructor(private deletePartnershipAction: IDeletePartnershipAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const partnershipId = getParam(req.params, "partnershipId");
        if (!partnershipId) {
          APIResponse(res, null, "Missing partnershipId", 400);
          return;
        }
        const userId = req.decoded?.id;

        if (!userId) {
          APIResponse(res, null, "Non autorisé", 401);
          return;
        }

        await this.deletePartnershipAction.execute({ partnershipId, userId });

        APIResponse(res, null, "Partnership supprimée avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la suppression de la partnership:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        const statusCode =
          (error as Error & { statusCode?: number }).statusCode ?? 500;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default DeletePartnershipController;
