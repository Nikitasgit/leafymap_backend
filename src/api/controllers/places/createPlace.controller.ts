import { newPlaceSchema } from "@src/api/dto/places/place.dto";
import type CreatePlaceUseCase from "@src/application/usecases/places/CreatePlace.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import { ForbiddenError } from "@src/shared/errors";

const CreatePlaceController = (
  createPlaceUseCase: CreatePlaceUseCase
): Controller =>
  createController({
    execute: (req) => {
      const decoded = requireAuth(req);
      if (decoded.userType !== "creator") {
        throw new ForbiddenError("Only creators can create places");
      }
      const body = validateOrThrow(newPlaceSchema, req.body);
      return createPlaceUseCase.execute({
        userId: decoded.id,
        location: body.location,
        placeCategoryId: body.placeCategory,
        defaultSchedule: body.defaultSchedule,
        customDates: body.customDates,
      });
    },
    successMessage: "Place created successfully",
    successStatus: 201,
    mapResult: (result) => ({ _id: result.id }),
  });

export default CreatePlaceController;
