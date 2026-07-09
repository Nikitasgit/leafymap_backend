import { IDeleteImagesAction } from "@/actions/images";
import { Controller, createController } from "@/utils/controllerFactory";

const DeleteImagesController = (
  deleteImagesAction: IDeleteImagesAction
): Controller =>
  createController({
    execute: async (req) => {
      await deleteImagesAction.execute({
        imageIds: req.images!,
      });
    },
    successMessage: "Images supprimées avec succès",
  });

export default DeleteImagesController;
