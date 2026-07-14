import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import { DeleteFavoriteInput } from "@src/application/dtos/favorites/deleteFavorite.dto";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

export interface IDeleteFavoriteUseCase {
  execute(input: DeleteFavoriteInput): Promise<void>;
}

class DeleteFavoriteUseCase implements IDeleteFavoriteUseCase {
  constructor(private readonly favoriteRepository: IFavoriteRepository) {}

  async execute(input: DeleteFavoriteInput): Promise<void> {
    const userId = UserId.from(input.userId);
    const referenceId = ReferenceId.from(input.referenceId);
    const referenceType = FavoriteReferenceType.from(input.referenceType);

    const favorite = await this.favoriteRepository.findByUserAndReference(
      userId,
      referenceId,
      referenceType
    );

    if (!favorite || !favorite.id) {
      throw new NotFoundError(
        ERROR_CODES.FAVORITE_NOT_FOUND,
        "Favorite not found"
      );
    }

    if (!favorite.belongsTo(userId)) {
      throw new ForbiddenError(
        ERROR_CODES.FAVORITE_FORBIDDEN,
        "You can only delete your own favorites"
      );
    }

    await this.favoriteRepository.delete(favorite.id);
  }
}

export default DeleteFavoriteUseCase;
