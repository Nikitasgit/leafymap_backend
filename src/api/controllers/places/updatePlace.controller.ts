import { updatePlaceSchema } from "@src/api/dto/places/place.dto";
import type UpdatePlaceUseCase from "@src/application/usecases/places/UpdatePlace.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const UpdatePlaceController = (
  updatePlaceUseCase: UpdatePlaceUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(updatePlaceSchema, req.body);
      await updatePlaceUseCase.execute({
        placeId: requireObjectIdParam(req, "placeId"),
        userId: requireAuth(req).id,
        location: body.location,
        placeCategoryId: body.placeCategory,
        defaultSchedule: body.defaultSchedule,
        customDates: body.customDates,
      });
    },
    successMessage: "Place updated successfully",
  });

export default UpdatePlaceController;
