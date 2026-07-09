import { RequestHandler, Response, NextFunction } from "express";
import { APIResponse } from "@/utils/response";
import { CustomRequest } from "@/types/custom";
import { ICommentRepository } from "@/types/repositories/comment.repository.types";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { IReviewRepository } from "@/types/repositories/review.repository.types";
import { CommentReferenceType } from "@/types/models/comment";
import { IImage } from "@/types/models/Image";
import { IReview } from "@/types/models/review";
import {
  createOwnershipMiddleware,
  getEntityOwnerId,
} from "./createOwnershipMiddleware";

class CommentsMiddleware {
  constructor(
    private commentRepository: ICommentRepository,
    private imageRepository: IImageRepository,
    private reviewRepository: IReviewRepository
  ) {}

  ownership(): RequestHandler {
    return createOwnershipMiddleware({
      paramName: "commentId",
      findById: (commentId) =>
        this.commentRepository.findById(commentId, ["author"]),
      getOwnerId: getEntityOwnerId,
      notFoundMessage: "Commentaire non trouvé",
      forbiddenMessage:
        "Vous n'êtes pas autorisé à modifier ou supprimer ce commentaire",
      invalidIdMessage: "ID de commentaire invalide",
      missingParamMessage: "Commentaire ID requis",
      validateObjectId: true,
      reqKey: "comment",
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

        let foundReference: IImage | IReview | null = null;

        switch (referenceType as CommentReferenceType) {
          case "Image": {
            const image = await this.imageRepository.findById(reference, [
              "_id",
            ]);
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
            const review = await this.reviewRepository.findById(reference, [
              "_id",
            ]);
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
      } catch {
        APIResponse(
          res,
          null,
          "Erreur lors de la vérification de la référence",
          500
        );
      }
    };
  }
}

export default CommentsMiddleware;
