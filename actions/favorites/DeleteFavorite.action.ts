import { IFavoriteRepository } from "@/types/repositories/favorite.repository.types";
import { IFavorite } from "@/types/models/favorite";
import { Types } from "mongoose";

export interface IDeleteFavoriteAction {
  execute(params: {
    userId: string;
    referenceId: string;
    referenceType: string;
  }): Promise<void>;
}

class DeleteFavoriteAction implements IDeleteFavoriteAction {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute({
    userId,
    referenceId,
    referenceType,
  }: {
    userId: string;
    referenceId: string;
    referenceType: string;
  }): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      user: new Types.ObjectId(userId),
      reference: new Types.ObjectId(referenceId),
      referenceType: referenceType as IFavorite["referenceType"],
    } as Partial<IFavorite>);

    if (!favorite) {
      throw new Error("Favorite not found");
    }

    if (favorite.user.toString() !== userId) {
      throw new Error("You can only delete your own favorites");
    }

    await this.favoriteRepository.deleteOne(favorite._id.toString());
  }
}

export default DeleteFavoriteAction;
