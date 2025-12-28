import { IPlace } from "types/models";
import { IPlaceRepository } from "../../repositories/places/IPlaceRepository";
import { IUserRepository } from "../../repositories/users/IUserRepository";

export interface IUpdatePlaceAction {
  execute(params: {
    placeId: string;
    updateData: Partial<IPlace>;
    userId: string;
    userType: "creator" | "organizer";
  }): Promise<void>;
}

class UpdatePlaceAction implements IUpdatePlaceAction {
  constructor(
    private placeRepository: IPlaceRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    placeId,
    updateData,
    userId,
    userType,
  }: {
    placeId: string;
    updateData: Partial<IPlace>;
    userId: string;
    userType: "creator" | "organizer";
  }): Promise<void> {
    if (userType === "creator") {
      const user = await this.userRepository.findOne({ _id: userId }, [
        "creatorName",
      ]);

      if (!user) {
        throw new Error("User not found");
      }

      updateData.isCreatorPlace = true;
      updateData.name = user.creatorName || updateData.name || "";
    }

    await this.placeRepository.updateOne(placeId, updateData);
  }
}

export default UpdatePlaceAction;
