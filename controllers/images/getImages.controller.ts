import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetImagesAction } from "@/actions/images";
import {
  ImageFilters,
  ImageReferenceType,
  ImageType,
} from "@/types/repositories/image.repository.types";

class GetImagesController {
  constructor(private getImagesAction: IGetImagesAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { reference, referenceType, type, user } = req.query;

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

        const filters: ImageFilters = {
          reference,
          referenceType: referenceType as ImageReferenceType,
        };

        if (type && typeof type === "string") {
          filters.type = type as ImageType;
        }
        if (user && typeof user === "string") {
          filters.user = user;
        }

        const images = await this.getImagesAction.execute({ filters });

        APIResponse(res, { images }, "Images récupérées avec succès", 200);
      } catch (error) {
        logger.error("Erreur lors de la récupération des images:", error);
        APIResponse(
          res,
          null,
          "Erreur serveur lors de la récupération des images",
          500
        );
      }
    };
  }
}

export default GetImagesController;
