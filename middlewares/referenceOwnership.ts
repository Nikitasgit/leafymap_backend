import { Response, NextFunction } from "express";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";
import Place from "../models/Place";
import Event from "../models/Event";
import { ReviewReferenceType } from "../types/models/review";

const referenceOwnership = ({ shouldBeOwner }: { shouldBeOwner: boolean }) => {
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
      // TODO: remplacer par une fonction utile
      switch (referenceType as ReviewReferenceType) {
        case "Place": {
          const place = await Place.findById(reference).select("user").lean();
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
          break;
        }

        case "Event": {
          const event = await Event.findById(reference)
            .populate("place", "user")
            .lean();
          if (!event || !event.place) {
            APIResponse(
              res,
              null,
              `L'événement avec l'ID ${reference} n'existe pas`,
              404
            );
            return;
          }
          isOwner = (event.place as any).user.toString() === userId;
          break;
        }

        case "User": {
          isOwner = reference === userId;
          break;
        }

        default:
          APIResponse(res, null, "Type de référence invalide", 400);
          return;
      }

      if (shouldBeOwner) {
        if (!isOwner) {
          APIResponse(
            res,
            null,
            "Vous n'êtes pas autorisé à effectuer cette action",
            403
          );
          return;
        }
      } else {
        if (isOwner) {
          APIResponse(
            res,
            null,
            "Vous ne pouvez pas effectuer cette action sur votre propre entité",
            403
          );
          return;
        }
      }

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
};

export default referenceOwnership;
