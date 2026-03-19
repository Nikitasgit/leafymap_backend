import { IFavoriteRepository } from "@/types/repositories/favorite.repository.types";
import { IFavorite } from "@/types/models/favorite";
import { Types } from "mongoose";

export interface ICreateFavoriteAction {
  execute(params: {
    userId: string;
    referenceId: string;
    referenceType: string;
  }): Promise<{ _id: string }>;
}

class CreateFavoriteAction implements ICreateFavoriteAction {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute({
    userId,
    referenceId,
    referenceType,
  }: {
    userId: string;
    referenceId: string;
    referenceType: string;
  }): Promise<{ _id: string }> {
    const existing = await this.favoriteRepository.findOne({
      user: new Types.ObjectId(userId),
      reference: new Types.ObjectId(referenceId),
      referenceType: referenceType as IFavorite["referenceType"],
    } as Partial<IFavorite>);

    if (existing) {
      throw new Error("This item is already in your favorites");
    }

    const favoriteId = await this.favoriteRepository.create({
      user: new Types.ObjectId(userId),
      reference: new Types.ObjectId(referenceId),
      referenceType: referenceType as IFavorite["referenceType"],
    } as Partial<IFavorite>);

    return { _id: favoriteId.toString() };
  }
}

export default CreateFavoriteAction;
