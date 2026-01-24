import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IDeleteImagesAction } from "@/actions/images";

class DeleteImagesController {
  constructor(private deleteImagesAction: IDeleteImagesAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        await this.deleteImagesAction.execute({
          imageIds: req.images!,
        });

        APIResponse(res, null, "Images supprimées avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la suppression des images:", error);
        APIResponse(
          res,
          null,
          "Erreur serveur lors de la suppression des images",
          500
        );
      }
    };
  }
}

export default DeleteImagesController;
