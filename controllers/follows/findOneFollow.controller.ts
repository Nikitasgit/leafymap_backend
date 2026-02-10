import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IFindOneFollowAction } from "@/actions/follows";

class FindOneFollowController {
  constructor(private findOneFollowAction: IFindOneFollowAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { follower, following } = req.query;

        if (!follower || !following) {
          APIResponse(
            res,
            null,
            "follower and following query parameters are required",
            400
          );
          return;
        }

        const follow = await this.findOneFollowAction.execute({
          followerId: follower as string,
          followingId: following as string,
        });

        APIResponse(
          res,
          { follow: follow ? { _id: follow._id.toString() } : null },
          "Follow vérifié avec succès",
          200
        );
      } catch (error) {
        logger.error("Erreur lors de la vérification du follow:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default FindOneFollowController;
