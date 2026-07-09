import { findFavoritesByTypeQuerySchema } from "../../validations/favorite.validations";
import { IFindFavoritesByUserAndTypeAction } from "@/actions/favorites";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const FindFavoritesByTypeController = (
  findFavoritesByUserAndTypeAction: IFindFavoritesByUserAndTypeAction
): Controller =>
  createController({
    execute: async (req) => {
      const { referenceType } = validateOrThrow(
        findFavoritesByTypeQuerySchema,
        req.query
      );
      const ids = await findFavoritesByUserAndTypeAction.execute({
        userId: requireAuth(req).id,
        referenceType,
      });
      return { ids };
    },
    successMessage: "Favoris récupérés avec succès",
  });

export default FindFavoritesByTypeController;
