import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { ICreateFollowAction } from "@/actions/follows";
import { createFollowSchema } from "../../validations/follow.validations";
import { validateData } from "@/utils/validation";

class CreateFollowController {
  constructor(private createFollowAction: ICreateFollowAction) {}

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

        const errors = validateData(createFollowSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Données invalides", 400);
          return;
        }

        const { followingId } = createFollowSchema.parse(req.body);

        const follow = await this.createFollowAction.execute({
          followerId,
          followingId,
        });

        APIResponse(res, follow, "Follow créé avec succès", 201);
      } catch (error) {
        logger.error("Erreur lors de la création du follow:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        const statusCode =
          error instanceof Error && "statusCode" in error
            ? (error.statusCode as number)
            : 500;
        APIResponse(res, null, message, statusCode);
      }
    };
  }
}

export default CreateFollowController;
