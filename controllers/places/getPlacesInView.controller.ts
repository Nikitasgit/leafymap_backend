import {
  IGetPlacesInViewAction,
  GetPlacesInViewInput,
} from "@/actions/places";
import { MAX_IDS } from "@/actions/places/GetPlacesInView.action";
import { AppError } from "@/utils/errors";
import { Controller, createController } from "@/utils/controllerFactory";

const GetPlacesInViewController = (
  getPlacesInViewAction: IGetPlacesInViewAction
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

      if (idsParam && idsParam.length > MAX_IDS) {
        throw new AppError(`Too many ids (max ${MAX_IDS})`, 400);
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

      return getPlacesInViewAction.execute({ filters: inputFilters });
    },
    successMessage: "Places fetched successfully",
  });

export default GetPlacesInViewController;
