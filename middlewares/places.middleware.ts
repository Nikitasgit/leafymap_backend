import { RequestHandler } from "express";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import {
  createOwnershipMiddleware,
  getEntityOwnerId,
} from "./createOwnershipMiddleware";

class PlacesMiddleware {
  constructor(private placeRepository: IPlaceRepository) {}

  ownership(): RequestHandler {
    return createOwnershipMiddleware({
      paramName: "placeId",
      findById: (placeId) => this.placeRepository.findById(placeId, ["user"]),
      getOwnerId: getEntityOwnerId,
      notFoundMessage: "Place not found",
      forbiddenMessage: "You don't have permission to update this place",
      missingParamMessage: "Place ID is required",
      paramReqKey: "placeId",
    });
  }
}

export default PlacesMiddleware;
