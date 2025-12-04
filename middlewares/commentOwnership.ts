import { Response, NextFunction } from "express";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";
import { isValidObjectId } from "mongoose";
import Comment from "../models/Comment"; // Direct Mongoose model import

const commentOwnership = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decoded = req.decoded!;
    const commentId = req.params.commentId;

    if (!commentId) {
      APIResponse(res, null, "Commentaire ID requis", 400);
      return;
    }

    if (!isValidObjectId(commentId)) {
      APIResponse(res, null, "ID de commentaire invalide", 400);
      return;
    }

    const comment = await Comment.findById(commentId); // Direct Mongoose call
    if (!comment) {
      APIResponse(res, null, "Commentaire non trouvé", 404);
      return;
    }

    if (comment.author.toString() !== decoded.id) {
      APIResponse(
        res,
        null,
        "Vous n'êtes pas autorisé à modifier ou supprimer ce commentaire",
        403
      );
      return;
    }

    // Store comment in request for potential use in controllers/actions
    req.comment = comment;
    next();
  } catch (error) {
    APIResponse(res, null, "Erreur lors de la vérification de propriété", 500);
  }
};

export default commentOwnership;
