import { Response, NextFunction } from "express";
import Place from "../models/Place";
import Event from "../models/Event";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";

const imageUploadAuthorization = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reference, referenceType } = req.body;

    const userId = req.decoded?.id;

    if (!reference || !referenceType) {
      APIResponse(res, null, "Référence et type de référence requis", 400);
      return;
    }

    let isAuthorized = false;

    switch (referenceType) {
      case "Place":
        const place = await Place.findById(reference);
        if (!place) {
          APIResponse(res, null, "Lieu non trouvé", 404);
          return;
        }
        isAuthorized = place.user.toString() === userId;
        break;

      case "Event":
        const event = await Event.findById(reference).populate("place");
        if (!event) {
          APIResponse(res, null, "Événement non trouvé", 404);
          return;
        }
        isAuthorized = (event.place as any).user.toString() === userId;
        break;

      case "User":
        isAuthorized = reference === userId;
        break;

      case "Comment":
        //  const comment = await Comment.findById(reference);
        // if (!comment) {
        //   APIResponse(res, null, "Commentaire non trouvé", 404);
        //   return;
        //  }
        //  isAuthorized = comment.author.toString() === userId;
        APIResponse(
          res,
          null,
          "Type de référence 'comment' non encore implémenté",
          400
        );
        return;

      case "Review":
        // const review = await Review.findById(reference);
        // if (!review) {
        //   APIResponse(res, null, "Avis non trouvé", 404);
        //   return;
        // }
        // isAuthorized = review.user.toString() === userId;
        APIResponse(
          res,
          null,
          "Type de référence 'review' non encore implémenté",
          400
        );
        return;

      default:
        APIResponse(res, null, "Type de référence non valide", 400);
        return;
    }

    if (!isAuthorized) {
      APIResponse(res, null, "Accès non autorisé", 403);
      return;
    }

    next();
  } catch (error) {
    APIResponse(
      res,
      null,
      "Erreur serveur lors de la vérification des autorisations",
      500
    );
  }
};

export default imageUploadAuthorization;
