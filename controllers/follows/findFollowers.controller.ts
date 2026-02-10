import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IFindFollowersAction } from "@/actions/follows";
import { getParam } from "@/utils/request";

class FindFollowersController {
  constructor(private findFollowersAction: IFindFollowersAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const userId = getParam(req.params, "userId");
        if (!userId) {
          APIResponse(res, null, "User ID is required", 400);
          return;
        }

        const followers = await this.findFollowersAction.execute({ userId });

        APIResponse(res, { followers }, "Followers récupérés avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la récupération des followers:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default FindFollowersController;
