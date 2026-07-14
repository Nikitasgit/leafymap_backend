import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import { Favorite } from "@src/domain/entities/Favorite.entity";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import {
  CreateFavoriteInput,
  CreateFavoriteOutput,
} from "@src/application/dtos/favorites/createFavorite.dto";
import { ConflictError, ERROR_CODES } from "@src/shared/errors";

export interface ICreateFavoriteUseCase {
  execute(input: CreateFavoriteInput): Promise<CreateFavoriteOutput>;
}

class CreateFavoriteUseCase implements ICreateFavoriteUseCase {
  constructor(private readonly favoriteRepository: IFavoriteRepository) {}

  async execute(input: CreateFavoriteInput): Promise<CreateFavoriteOutput> {
    const userId = UserId.from(input.userId);
    const referenceId = ReferenceId.from(input.referenceId);
    const referenceType = FavoriteReferenceType.from(input.referenceType);

    const existing = await this.favoriteRepository.findByUserAndReference(
      userId,
      referenceId,
      referenceType
    );

    if (existing) {
      throw new ConflictError(
        ERROR_CODES.FAVORITE_ALREADY_EXISTS,
        "This item is already in your favorites"
      );
    }

    const favorite = Favorite.create({
      userId,
      referenceId,
      referenceType,
    });

    const id = await this.favoriteRepository.save(favorite);

    return { id };
  }
}

export default CreateFavoriteUseCase;
