import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import {
  IUploadImagesAction,
  UploadImageInput,
} from "../../actions/images/UploadImagesAction";

class UploadImagesController {
  constructor(private uploadImagesAction: IUploadImagesAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { reference, referenceType, type } = req.body;
        const files = Array.isArray(req.files) ? req.files : req.files?.images;

        if (!files || files.length === 0) {
          APIResponse(res, null, "Aucune image fournie", 400);
          return;
        }

        if (!req.imageReferenceIsOwner) {
          APIResponse(
            res,
            null,
            "Vous n'êtes pas autorisé à uploader des images pour cette référence",
            403
          );
          return;
        }

        let filesToProcess = files;
        const onlyOneImageTypes = ["profile", "cover"];
        if (
          onlyOneImageTypes.includes(type) &&
          ["event", "place", "user"].includes(referenceType)
        ) {
          filesToProcess = files.slice(0, 1);
        }

        const imagesInput: UploadImageInput[] = filesToProcess.map(
          (file: Express.Multer.File) => ({
            file,
            reference,
            referenceType,
            type,
            userId: req.decoded!.id,
          })
        );

        const images = await this.uploadImagesAction.execute({
          images: imagesInput,
        });

        APIResponse(
          res,
          {
            images,
            count: images.length,
          },
          "Images uploadées et créées avec succès",
          200
        );
      } catch (error) {
        logger.error("Erreur lors de l'upload et création des images:", error);
        APIResponse(
          res,
          null,
          "Erreur serveur lors de l'upload des images",
          500
        );
      }
    };
  }
}

export default UploadImagesController;
