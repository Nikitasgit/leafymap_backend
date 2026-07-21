import { RequestHandler } from "express";
import {
  getPlaceByIdQuerySchema,
  getPlacesInViewQuerySchema,
  getPlacesQuerySchema,
  newPlaceSchema,
  updatePlaceSchema,
} from "@src/api/dto/places/place.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CreatePlaceUseCase from "@src/application/usecases/places/CreatePlace.usecase";
import type DeletePlaceUseCase from "@src/application/usecases/places/DeletePlace.usecase";
import type GetPlaceByIdUseCase from "@src/application/usecases/places/GetPlaceById.usecase";
import type GetPlacesUseCase from "@src/application/usecases/places/GetPlaces.usecase";
import type GetPlacesInViewUseCase from "@src/application/usecases/places/GetPlacesInView.usecase";
import type UpdatePlaceUseCase from "@src/application/usecases/places/UpdatePlace.usecase";
import { ForbiddenError } from "@src/shared/errors";

class PlacesController extends BaseHttpController {
  constructor(
    private readonly createPlaceUseCase: CreatePlaceUseCase,
    private readonly getPlacesUseCase: GetPlacesUseCase,
    private readonly getPlaceByIdUseCase: GetPlaceByIdUseCase,
    private readonly getPlacesInViewUseCase: GetPlacesInViewUseCase,
    private readonly updatePlaceUseCase: UpdatePlaceUseCase,
    private readonly deletePlaceUseCase: DeletePlaceUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const decoded = requireAuth(req);
        if (decoded.userType !== "creator") {
          throw new ForbiddenError("Only creators can create places");
        }
        const body = validateOrThrow(newPlaceSchema, req.body);
        return this.createPlaceUseCase.execute({
          userId: decoded.id,
          location: body.location,
          placeCategoryId: body.placeCategory,
          defaultSchedule: body.defaultSchedule,
          customDates: body.customDates,
        });
      },
      successMessage: "Place created successfully",
      successStatus: 201,
      mapResult: (result) => ({ id: result.id }),
    });
  }

  list(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const filters = validateOrThrow(getPlacesQuerySchema, req.query);
        const places = await this.getPlacesUseCase.execute(filters);
        return { places, categoryId: filters.categoryId };
      },
      successMessage: ({ categoryId }) =>
        categoryId
          ? "Places by category retrieved successfully"
          : "Latest places retrieved successfully",
      mapResult: ({ places }) => places,
    });
  }

  getById(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const { scheduleWithEvents } = validateOrThrow(
          getPlaceByIdQuerySchema,
          req.query
        );
        return this.getPlaceByIdUseCase.execute({
          placeId: requireObjectIdParam(req, "placeId"),
          scheduleWithEvents,
        });
      },
      successMessage: "Place fetched successfully",
    });
  }

  getInView(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getPlacesInViewUseCase.execute(
          validateOrThrow(getPlacesInViewQuerySchema, req.query)
        ),
      successMessage: "Places fetched successfully",
    });
  }

  update(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const body = validateOrThrow(updatePlaceSchema, req.body);
        await this.updatePlaceUseCase.execute({
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
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.deletePlaceUseCase.execute({
          placeId: requireObjectIdParam(req, "placeId"),
          userId: requireAuth(req).id,
        });
      },
      successMessage: "Place and associated events deleted successfully",
    });
  }
}

export default PlacesController;
