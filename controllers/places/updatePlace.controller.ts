import { updatePlaceSchema } from "../../validations/place.validations";
import { IUpdatePlaceAction } from "@/actions/places";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@/utils/controllerFactory";

const UpdatePlaceController = (
  updatePlaceAction: IUpdatePlaceAction
): Controller =>
  createController({
    execute: async (req) => {
      validateOrThrow(updatePlaceSchema, req.body);
      await updatePlaceAction.execute({
        placeId: req.placeId!,
        updateData: req.body,
      });
    },
    successMessage: "Place updated successfully",
  });

export default UpdatePlaceController;
