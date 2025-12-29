import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";
import { IReviewRepository } from "../repositories/reviews/IReviewRepository";
import { IPlaceRepository } from "../repositories/places/IPlaceRepository";
import { IEventRepository } from "../repositories/events/IEventRepository";
import { ReviewReferenceType } from "../types/models/review";
import { isValidObjectId } from "mongoose";
import { IEvent, IPlace } from "../types/models";

class ReviewsMiddleware {
  constructor(
    private reviewRepository: IReviewRepository,
    private placeRepository: IPlaceRepository,
    private eventRepository: IEventRepository
  ) {}

  ownership(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const reviewId = req.params.reviewId;

        if (!reviewId) {
          APIResponse(res, null, "Review ID requis", 400);
          return;
        }

        if (!isValidObjectId(reviewId)) {
          APIResponse(res, null, "ID de review invalide", 400);
          return;
        }

        const review = await this.reviewRepository.findById(reviewId, [
          "author",
        ]);
        if (!review) {
          APIResponse(res, null, "Review non trouvé", 404);
          return;
        }

        if (review.author.toString() !== decoded.id) {
          APIResponse(
            res,
            null,
            "Vous n'êtes pas autorisé à modifier ou supprimer ce review",
            403
          );
          return;
        }

        req.review = review as any;
        next();
      } catch (error) {
        APIResponse(
          res,
          null,
          "Erreur lors de la vérification de propriété",
          500
        );
      }
    };
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
            isOwner = place.user.toString() === userId;
            foundReference = place;
            break;
          }

          case "Event": {
            const event = await this.eventRepository.findById(reference, [
              "place",
              "place.user",
            ]);
            if (!event || !event.place) {
              APIResponse(
                res,
                null,
                `L'événement avec l'ID ${reference} n'existe pas`,
                404
              );
              return;
            }
            const place = event.place as IPlace;
            if (!place.user) {
              APIResponse(
                res,
                null,
                "Erreur lors de la vérification de propriété",
                500
              );
              return;
            }
            isOwner = place.user.toString() === userId;
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
      } catch (error) {
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
