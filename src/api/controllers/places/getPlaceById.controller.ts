import { getPlaceByIdQuerySchema } from "@src/api/dto/places/place.dto";
import type GetPlaceByIdUseCase from "@src/application/usecases/places/GetPlaceById.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetPlaceByIdController = (
  getPlaceByIdUseCase: GetPlaceByIdUseCase
): Controller =>
  createController({
    execute: (req) => {
      const { scheduleWithEvents } = validateOrThrow(
        getPlaceByIdQuerySchema,
        req.query
      );
      return getPlaceByIdUseCase.execute({
        placeId: requireObjectIdParam(req, "placeId"),
        scheduleWithEvents,
      });
    },
    successMessage: "Place fetched successfully",
  });

export default GetPlaceByIdController;
