import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";
import { isValidObjectId } from "mongoose";
import { ICommentRepository } from "../repositories/comments/ICommentRepository";
import { IImageRepository } from "../repositories/images/IImageRepository";
import { IReviewRepository } from "../repositories/reviews/IReviewRepository";
import { CommentReferenceType } from "../types/models/comment";
import { IImage } from "../types/models/Image";
import { IReview } from "../types/models/review";

class CommentsMiddleware {
  constructor(
    private commentRepository: ICommentRepository,
    private imageRepository: IImageRepository,
    private reviewRepository: IReviewRepository
  ) {}

  ownership(): RequestHandler {
    return async (
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

        const comment = await this.commentRepository.findById(commentId, [
          "author",
        ]);
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

        req.comment = comment as any;
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
      } catch (error) {
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
