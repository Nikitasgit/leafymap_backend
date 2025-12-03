import { Response, NextFunction } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IViewMessagesListAction } from "../../actions/messages/ViewMessagesListAction";

const ViewMessagesListController = (
  viewMessagesListAction: IViewMessagesListAction
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

      const messages = await viewMessagesListAction.execute({ filters });

      APIResponse(res, { messages }, "Messages récupérés avec succès", 200);
    } catch (error) {
      logger.error("Erreur lors de la récupération des messages:", error);
      APIResponse(res, null, "Erreur serveur", 500);
    }
  };
};

export default ViewMessagesListController;
