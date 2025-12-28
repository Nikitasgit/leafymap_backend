import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";
import { IPlaceRepository } from "../repositories/places/IPlaceRepository";

class PlacesMiddleware {
  constructor(private placeRepository: IPlaceRepository) {}

  ownership(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const placeId = req.params.placeId;

        if (!placeId) {
          APIResponse(res, null, "Place ID is required", 400);
          return;
        }

        const place = await this.placeRepository.findById(placeId, ["user"]);
        if (!place) {
          APIResponse(res, null, "Place not found", 404);
          return;
        }

        if (place.user.toString() !== decoded.id) {
          APIResponse(
            res,
            null,
            "You don't have permission to update this place",
            403
          );
          return;
        }

        req.placeId = placeId;
        next();
      } catch (error) {
        APIResponse(res, null, "Failed to verify place ownership", 500);
      }
    };
  }
}

export default PlacesMiddleware;
