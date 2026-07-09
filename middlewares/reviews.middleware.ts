import { RequestHandler, Response, NextFunction } from "express";
import { APIResponse } from "@/utils/response";
import { CustomRequest } from "@/types/custom";
import { IReviewRepository } from "@/types/repositories/review.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { ReviewReferenceType } from "@/types/models/review";
import { IEvent, IPlace } from "@/types/models";
import { resolveOwnerId, toId } from "@/utils/mongoose";
import {
  createOwnershipMiddleware,
  getEntityOwnerId,
} from "./createOwnershipMiddleware";

class ReviewsMiddleware {
  constructor(
    private reviewRepository: IReviewRepository,
    private placeRepository: IPlaceRepository,
    private eventRepository: IEventRepository
  ) {}

  ownership(): RequestHandler {
    return createOwnershipMiddleware({
      paramName: "reviewId",
      findById: (reviewId) =>
        this.reviewRepository.findById(reviewId, ["author"]),
      getOwnerId: getEntityOwnerId,
      notFoundMessage: "Review non trouvé",
      forbiddenMessage:
        "Vous n'êtes pas autorisé à modifier ou supprimer ce review",
      invalidIdMessage: "ID de review invalide",
      missingParamMessage: "Review ID requis",
      validateObjectId: true,
      reqKey: "review",
    });
  }

  referenceOwnership(): RequestHandler {
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

        const { reference, referenceType } = req.body;

        if (!reference || !referenceType) {
          APIResponse(res, null, "reference et referenceType sont requis", 400);
          return;
        }

        let isOwner = false;
        let foundReference: IPlace | IEvent | null = null;

        switch (referenceType as ReviewReferenceType) {
          case "Place": {
            const place = await this.placeRepository.findById(reference, [
              "user",
            ]);
            if (!place) {
              APIResponse(
                res,
                null,
                `La place avec l'ID ${reference} n'existe pas`,
                404
              );
              return;
            }
            isOwner = toId(place.user) === userId;
            foundReference = place;
            break;
          }

          case "Event": {
            const event = await this.eventRepository.findById(reference, [
              "user",
              "place",
              "place.user",
            ]);
            if (!event) {
              APIResponse(
                res,
                null,
                `L'événement avec l'ID ${reference} n'existe pas`,
                404
              );
              return;
            }

            const ownerId = resolveOwnerId(event);
            if (!ownerId) {
              APIResponse(
                res,
                null,
                "Erreur lors de la vérification de propriété",
                500
              );
              return;
            }

            isOwner = ownerId === userId;
            foundReference = event;
            break;
          }

          default:
            APIResponse(res, null, "Type de référence invalide", 400);
            return;
        }

        req.reviewReferenceIsOwner = isOwner;
        req.reviewReference = foundReference;

        next();
      } catch {
        APIResponse(
          res,
          null,
          "Erreur lors de la vérification de propriété",
          500
        );
      }
    };
  }
}

export default ReviewsMiddleware;
