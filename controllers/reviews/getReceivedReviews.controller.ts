import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import {
  IGetReviewsAction,
  DEFAULT_REVIEWS_PROJECT,
} from "@/actions/reviews";
import { IUserRepository } from "@/types/repositories/user.repository.types";

function getPlaceIdFromUser(user: { place?: unknown } | null): string | null {
  if (!user?.place) return null;
  const place = user.place;
  if (typeof place === "string") return place;
  if (typeof place === "object" && place !== null && "_id" in place) {
    return String((place as { _id: unknown })._id);
  }
  return null;
}

class GetReceivedReviewsController {
  constructor(
    private getReviewsAction: IGetReviewsAction,
    private userRepository: IUserRepository
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
          APIResponse(res, null, "Non autorisé", 401);
          return;
        }

        const user = await this.userRepository.findById(userId, ["_id", "place"]);
        const placeId = user ? getPlaceIdFromUser(user) : null;

        if (!placeId) {
          APIResponse(res, { reviews: [] }, "Aucun lieu associé à votre compte", 200);
          return;
        }

        const reviews = await this.getReviewsAction.execute({
          filters: { reference: placeId, referenceType: "Place" },
          project: DEFAULT_REVIEWS_PROJECT,
        });

        APIResponse(res, { reviews }, "Avis reçus récupérés avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la récupération des avis reçus:", error);
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default GetReceivedReviewsController;
