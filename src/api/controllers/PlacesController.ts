import { RequestHandler } from "express";
import {
  getPlaceByIdQuerySchema,
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
import { MAX_PLACE_IDS } from "@src/application/dtos/places/getPlacesInView.dto";
import { GetPlacesInViewInput } from "@src/application/dtos/places/getPlacesInView.dto";
import type CreatePlaceUseCase from "@src/application/usecases/places/CreatePlace.usecase";
import type DeletePlaceUseCase from "@src/application/usecases/places/DeletePlace.usecase";
import type GetPlaceByIdUseCase from "@src/application/usecases/places/GetPlaceById.usecase";
import type GetPlacesUseCase from "@src/application/usecases/places/GetPlaces.usecase";
import type GetPlacesInViewUseCase from "@src/application/usecases/places/GetPlacesInView.usecase";
import type UpdatePlaceUseCase from "@src/application/usecases/places/UpdatePlace.usecase";
import { ERROR_CODES, ForbiddenError, ValidationError } from "@src/shared/errors";

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
      execute: async (req) => {
        const { ne, sw, ids, filters: clientFilters, limit } = req.query;

        const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;

        const idsParam =
          typeof ids === "string" && ids.trim()
            ? ids
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean)
            : undefined;

        if (idsParam && idsParam.length > MAX_PLACE_IDS) {
          throw new ValidationError(
            { ids: `Too many ids (max ${MAX_PLACE_IDS})` },
            ERROR_CODES.VALIDATION_ERROR,
            `Too many ids (max ${MAX_PLACE_IDS})`
          );
        }

        const inputFilters: GetPlacesInViewInput = {
          ids: idsParam,
          clientFilters:
            typeof clientFilters === "string" ? clientFilters : undefined,
          limit: parsedLimit,
        };

        if (!idsParam?.length) {
          if (!ne || !sw || typeof ne !== "string" || typeof sw !== "string") {
            throw new ValidationError(
              { coordinates: "Missing required coordinates" },
              ERROR_CODES.VALIDATION_ERROR,
              "Missing required coordinates"
            );
          }

          try {
            inputFilters.ne = JSON.parse(ne);
            inputFilters.sw = JSON.parse(sw);
          } catch {
            throw new ValidationError(
              { coordinates: "Invalid coordinate format" },
              ERROR_CODES.VALIDATION_ERROR,
              "Invalid coordinate format"
            );
          }
        }

        return this.getPlacesInViewUseCase.execute(inputFilters);
      },
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
