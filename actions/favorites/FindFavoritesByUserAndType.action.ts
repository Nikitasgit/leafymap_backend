import { IFavoriteRepository } from "@/types/repositories/favorite.repository.types";

export interface IFindFavoritesByUserAndTypeAction {
  execute(params: {
    userId: string;
    referenceType: string;
  }): Promise<string[]>;
}

class FindFavoritesByUserAndTypeAction
  implements IFindFavoritesByUserAndTypeAction
{
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute({
    userId,
    referenceType,
  }: {
    userId: string;
    referenceType: string;
  }): Promise<string[]> {
    const favorites = await this.favoriteRepository.findAll({
      filters: {
        user: userId,
        referenceType,
      },
      project: ["reference"],
    });

    return (favorites as { reference: { toString: () => string } }[]).map((f) =>
      f.reference.toString()
    );
  }
}

export default FindFavoritesByUserAndTypeAction;
