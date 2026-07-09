import {
  getPlaceByIdQuerySchema,
} from "../../validations/place.validations";
import { IGetPlaceByIdAction } from "@/actions/places";
import {
  Controller,
  createController,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const GetPlaceByIdController = (
  getPlaceByIdAction: IGetPlaceByIdAction
): Controller =>
  createController({
    execute: (req) => {
      const { scheduleWithEvents } = validateOrThrow(
        getPlaceByIdQuerySchema,
        req.query
      );
      return getPlaceByIdAction.execute({
        placeId: requireObjectIdParam(req, "placeId"),
        scheduleWithEvents,
      });
    },
    successMessage: "Place fetched successfully",
  });

export default GetPlaceByIdController;
