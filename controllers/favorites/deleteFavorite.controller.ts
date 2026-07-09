import { deleteFavoriteSchema } from "../../validations/favorite.validations";
import { IDeleteFavoriteAction } from "@/actions/favorites";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const DeleteFavoriteController = (
  deleteFavoriteAction: IDeleteFavoriteAction
): Controller =>
  createController({
    execute: async (req) => {
      const { referenceId, referenceType } = validateOrThrow(
        deleteFavoriteSchema,
        req.body
      );
      await deleteFavoriteAction.execute({
        userId: requireAuth(req).id,
        referenceId,
        referenceType,
      });
    },
    successMessage: "Favori supprimé avec succès",
  });

export default DeleteFavoriteController;
