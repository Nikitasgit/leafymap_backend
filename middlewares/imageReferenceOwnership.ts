import { Response, NextFunction } from "express";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";
import Place from "../models/Place";
import Event from "../models/Event";
import { ImageReferenceType } from "../repositories/images/IImageRepository";
import { IEvent, IPlace } from "../types/models";

const imageReferenceOwnership = async (
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

    switch (referenceType as ImageReferenceType) {
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
        foundReference = place;
        break;
      }

      case "Event": {
        const event = await Event.findById(reference)
          .populate("place")
          .select("place.user")
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
        isOwner = (event.place as IPlace).user.toString() === userId;
        foundReference = event;
        break;
      }

      case "User": {
        isOwner = reference === userId;
        foundReference = null;
        break;
      }

      case "Comment":
      case "Review": {
        APIResponse(
          res,
          null,
          `Type de référence '${referenceType}' non encore implémenté`,
          400
        );
        return;
      }

      default:
        APIResponse(res, null, "Type de référence invalide", 400);
        return;
    }

    req.imageReferenceIsOwner = isOwner;
    req.imageReference = foundReference;

    next();
  } catch (error) {
    APIResponse(res, null, "Erreur lors de la vérification de propriété", 500);
  }
};

export default imageReferenceOwnership;
