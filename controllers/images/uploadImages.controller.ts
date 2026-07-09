import {
  IUploadImagesAction,
  UploadImageInput,
} from "@/actions/images";
import { AppError, ForbiddenError } from "@/utils/errors";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const UploadImagesController = (
  uploadImagesAction: IUploadImagesAction
): Controller =>
  createController({
    execute: async (req) => {
      const { reference, referenceType, type } = req.body;
      const files = Array.isArray(req.files) ? req.files : req.files?.images;

      if (!files || files.length === 0) {
        throw new AppError("Aucune image fournie", 400);
      }

      if (!req.imageReferenceIsOwner) {
        throw new ForbiddenError(
          "Vous n'êtes pas autorisé à uploader des images pour cette référence"
        );
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
          userId: requireAuth(req).id,
        })
      );

      const images = await uploadImagesAction.execute({
        images: imagesInput,
      });

      return { images, count: images.length };
    },
    successMessage: "Images uploadées et créées avec succès",
  });

export default UploadImagesController;
