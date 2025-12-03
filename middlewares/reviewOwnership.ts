import { Response, NextFunction } from "express";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";
import Review from "../models/Review";
import { isValidObjectId } from "mongoose";

const reviewOwnership = async (
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

    const review = await Review.findById(reviewId).lean();
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

    // Store review in request for potential use in controllers/actions
    req.review = review;
    next();
  } catch (error) {
    APIResponse(res, null, "Erreur lors de la vérification de propriété", 500);
  }
};

export default reviewOwnership;
