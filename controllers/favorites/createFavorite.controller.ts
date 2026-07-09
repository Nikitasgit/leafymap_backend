import {
  createFavoriteSchema,
  deleteFavoriteSchema,
  findFavoritesByTypeQuerySchema,
} from "../../validations/favorite.validations";
import {
  ICreateFavoriteAction,
  IDeleteFavoriteAction,
  IFindFavoritesByUserAndTypeAction,
} from "@/actions/favorites";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateFavoriteController = (
  createFavoriteAction: ICreateFavoriteAction
): Controller =>
  createController({
    execute: (req) => {
      const { referenceId, referenceType } = validateOrThrow(
        createFavoriteSchema,
        req.body
      );
      return createFavoriteAction.execute({
        userId: requireAuth(req).id,
        referenceId,
        referenceType,
      });
    },
    successMessage: "Favori ajouté avec succès",
    successStatus: 201,
  });

export default CreateFavoriteController;
