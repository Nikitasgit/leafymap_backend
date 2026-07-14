import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import {
  FindFavoritesByTypeInput,
  FindFavoritesByTypeOutput,
} from "@src/application/dtos/favorites/findFavoritesByType.dto";

export interface IFindFavoritesByUserAndTypeUseCase {
  execute(input: FindFavoritesByTypeInput): Promise<FindFavoritesByTypeOutput>;
}

class FindFavoritesByUserAndTypeUseCase
  implements IFindFavoritesByUserAndTypeUseCase
{
  constructor(private readonly favoriteRepository: IFavoriteRepository) {}

  async execute(
    input: FindFavoritesByTypeInput
  ): Promise<FindFavoritesByTypeOutput> {
    const referenceIds =
      await this.favoriteRepository.findReferenceIdsByUserAndType(
        UserId.from(input.userId),
        FavoriteReferenceType.from(input.referenceType)
      );

    return { referenceIds };
  }
}

export default FindFavoritesByUserAndTypeUseCase;
