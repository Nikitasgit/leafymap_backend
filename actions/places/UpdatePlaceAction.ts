import { IPlace } from "types/models";
import { IPlaceRepository } from "../../repositories/places/IPlaceRepository";
import { IUserRepository } from "../../repositories/users/IUserRepository";

export interface IUpdatePlaceAction {
  execute(params: {
    placeId: string;
    updateData: Partial<IPlace>;
    userId: string;
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
  }: {
    placeId: string;
    updateData: Partial<IPlace>;
    userId: string;
  }): Promise<void> {
    await this.placeRepository.updateOne(placeId, updateData);
  }
}

export default UpdatePlaceAction;
