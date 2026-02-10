import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IFindFollowingAction } from "@/actions/follows";
import { getParam } from "@/utils/request";

class FindFollowingController {
  constructor(private findFollowingAction: IFindFollowingAction) {}

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

        const following = await this.findFollowingAction.execute({ userId });

        APIResponse(res, { following }, "Following récupérés avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la récupération des following:", error);
        const message =
          error instanceof Error ? error.message : "Erreur serveur";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default FindFollowingController;
