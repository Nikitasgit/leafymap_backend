import { getPlacesQuerySchema } from "@src/api/dto/places/place.dto";
import type GetPlacesUseCase from "@src/application/usecases/places/GetPlaces.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetPlacesController = (getPlacesUseCase: GetPlacesUseCase): Controller =>
  createController({
    execute: async (req) => {
      const filters = validateOrThrow(getPlacesQuerySchema, req.query);
      const places = await getPlacesUseCase.execute(filters);
      return { places, categoryId: filters.categoryId };
    },
    successMessage: ({ categoryId }) =>
      categoryId
        ? "Places by category retrieved successfully"
        : "Latest places retrieved successfully",
    mapResult: ({ places }) => places,
  });

export default GetPlacesController;
