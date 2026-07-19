import type DeletePlaceUseCase from "@src/application/usecases/places/DeletePlace.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const DeletePlaceController = (
  deletePlaceUseCase: DeletePlaceUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await deletePlaceUseCase.execute({
        placeId: requireObjectIdParam(req, "placeId"),
        userId: requireAuth(req).id,
      });
    },
    successMessage: "Place and associated events deleted successfully",
  });

export default DeletePlaceController;
