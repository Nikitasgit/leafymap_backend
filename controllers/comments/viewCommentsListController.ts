import { Response, NextFunction } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IViewCommentsListAction } from "../../actions/comments/ViewCommentsListAction";

const ViewCommentsListController = (
  viewCommentsListAction: IViewCommentsListAction
) => {
  return async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { reference, referenceType, author } = req.query;

      const filters: any = {};
      if (reference && typeof reference === "string") {
        filters.reference = reference;
      }
      if (referenceType && typeof referenceType === "string") {
        filters.referenceType = referenceType;
      }
      if (author && typeof author === "string") {
        filters.author = author;
      }

      const comments = await viewCommentsListAction.execute({ filters });

      APIResponse(res, { comments }, "Commentaires récupérés avec succès", 200);
    } catch (error) {
      logger.error("Erreur lors de la récupération des commentaires:", error);
      APIResponse(res, null, "Erreur serveur", 500);
    }
  };
};

export default ViewCommentsListController;
