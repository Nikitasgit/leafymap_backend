import { Response, NextFunction } from "express";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";
import Image from "../models/Image";
import Review from "../models/Review";
import { CommentReferenceType } from "../types/models/comment";
import { IImage } from "../types/models/Image";
import { IReview } from "../types/models/review";

const commentReferenceOwnership = async (
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

    let foundReference: IImage | IReview | null = null;

    switch (referenceType as CommentReferenceType) {
      case "Image": {
        const image = await Image.findById(reference).lean();
        if (!image) {
          APIResponse(
            res,
            null,
            `L'image avec l'ID ${reference} n'existe pas`,
            404
          );
          return;
        }
        foundReference = image as unknown as IImage;
        break;
      }

      case "Review": {
        const review = await Review.findById(reference).lean();
        if (!review) {
          APIResponse(
            res,
            null,
            `La review avec l'ID ${reference} n'existe pas`,
            404
          );
          return;
        }
        foundReference = review as unknown as IReview;
        break;
      }

      case "Comment": {
        APIResponse(
          res,
          null,
          "Type de référence Comment non supporté pour le moment",
          400
        );
        return;
      }

      default:
        APIResponse(res, null, "Type de référence invalide", 400);
        return;
    }

    req.commentReference = foundReference;
    next();
  } catch (error) {
    APIResponse(
      res,
      null,
      "Erreur lors de la vérification de la référence",
      500
    );
  }
};

export default commentReferenceOwnership;
