import { getPlacesQuerySchema } from "../../validations/place.validations";
import { IGetPlacesAction } from "@/actions/places";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@/utils/controllerFactory";

const GetPlacesController = (getPlacesAction: IGetPlacesAction): Controller =>
  createController({
    execute: async (req) => {
      const filters = validateOrThrow(getPlacesQuerySchema, req.query);
      const places = await getPlacesAction.execute({ filters });
      return { places, categoryId: filters.categoryId };
    },
    successMessage: ({ categoryId }) =>
      categoryId
        ? "Places by category retrieved successfully"
        : "Latest places retrieved successfully",
    mapResult: ({ places }) => places,
  });

export default GetPlacesController;
