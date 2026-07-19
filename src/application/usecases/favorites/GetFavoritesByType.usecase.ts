import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import {
  GetFavoritesByTypeInput,
  GetFavoritesByTypeOutput,
} from "@src/application/dtos/favorites/getFavoritesByType.dto";

class GetFavoritesByTypeUseCase {
  constructor(private readonly favoriteRepository: IFavoriteRepository) {}

  async execute(
    input: GetFavoritesByTypeInput
  ): Promise<GetFavoritesByTypeOutput> {
    const referenceIds =
      await this.favoriteRepository.findReferenceIdsByUserAndType(
        UserId.from(input.userId),
        FavoriteReferenceType.from(input.referenceType)
      );

    return { referenceIds };
  }
}

export default GetFavoritesByTypeUseCase;
