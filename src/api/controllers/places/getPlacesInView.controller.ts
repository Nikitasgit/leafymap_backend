import { MAX_PLACE_IDS } from "@src/application/dtos/places/getPlacesInView.dto";
import type GetPlacesInViewUseCase from "@src/application/usecases/places/GetPlacesInView.usecase";
import { GetPlacesInViewInput } from "@src/application/dtos/places/getPlacesInView.dto";
import { AppError } from "@src/shared/errors";
import { Controller, createController } from "@src/api/http/controllerFactory";

const GetPlacesInViewController = (
  getPlacesInViewUseCase: GetPlacesInViewUseCase
): Controller =>
  createController({
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
        throw new AppError(`Too many ids (max ${MAX_PLACE_IDS})`, 400);
      }

      const inputFilters: GetPlacesInViewInput = {
        ids: idsParam,
        clientFilters:
          typeof clientFilters === "string" ? clientFilters : undefined,
        limit: parsedLimit,
      };

      if (!idsParam?.length) {
        if (!ne || !sw || typeof ne !== "string" || typeof sw !== "string") {
          throw new AppError("Missing required coordinates", 400);
        }

        try {
          inputFilters.ne = JSON.parse(ne);
          inputFilters.sw = JSON.parse(sw);
        } catch {
          throw new AppError("Invalid coordinate format", 400);
        }
      }

      return getPlacesInViewUseCase.execute(inputFilters);
    },
    successMessage: "Places fetched successfully",
  });

export default GetPlacesInViewController;
