import { newPlaceSchema } from "../../validations/place.validations";
import { ICreatePlaceAction } from "@/actions/places";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";
import { ForbiddenError } from "@/utils/errors";

const CreatePlaceController = (
  createPlaceAction: ICreatePlaceAction
): Controller =>
  createController({
    execute: (req) => {
      const decoded = requireAuth(req);
      if (decoded.userType !== "creator") {
        throw new ForbiddenError("Only creators can create places");
      }
      return createPlaceAction.execute({
        placeData: validateOrThrow(newPlaceSchema, req.body),
        userId: decoded.id,
      });
    },
    successMessage: "Place created successfully",
    successStatus: 201,
  });

export default CreatePlaceController;
