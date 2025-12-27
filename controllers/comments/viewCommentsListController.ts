import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IViewCommentsListAction } from "../../actions/comments/ViewCommentsListAction";
import { CommentFilters } from "../../repositories/comments/ICommentRepository";
import { CommentReferenceType } from "../../types/models/comment";

class ViewCommentsListController {
  constructor(private viewCommentsListAction: IViewCommentsListAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { reference, referenceType, author } = req.query;
        if (!reference || typeof reference !== "string") {
          APIResponse(res, null, "Le paramètre 'reference' est requis", 400);
          return;
        }

        if (!referenceType || typeof referenceType !== "string") {
          APIResponse(
            res,
            null,
            "Le paramètre 'referenceType' est requis",
            400
          );
          return;
        }
        const filters: CommentFilters = {};
        if (reference && typeof reference === "string") {
          filters.reference = reference;
        }
        if (referenceType && typeof referenceType === "string") {
          filters.referenceType = referenceType as CommentReferenceType;
        }
        if (author && typeof author === "string") {
          filters.author = author;
        }

        const comments = await this.viewCommentsListAction.execute({ filters });

        APIResponse(
          res,
          { comments },
          "Commentaires récupérés avec succès",
          200
        );
      } catch (error) {
        logger.error("Erreur lors de la récupération des commentaires:", error);
        APIResponse(res, null, "Erreur serveur", 500);
      }
    };
  }
}

export default ViewCommentsListController;
