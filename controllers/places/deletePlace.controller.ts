import { IDeletePlaceAction } from "@/actions/places";
import { Controller, createController } from "@/utils/controllerFactory";

const DeletePlaceController = (
  deletePlaceAction: IDeletePlaceAction
): Controller =>
  createController({
    execute: async (req) => {
      await deletePlaceAction.execute({ placeId: req.placeId! });
    },
    successMessage: "Place and associated events deleted successfully",
  });

export default DeletePlaceController;
