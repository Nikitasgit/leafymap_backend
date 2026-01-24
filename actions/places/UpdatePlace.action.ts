import { IPlace } from "types/models";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";

export interface IUpdatePlaceAction {
  execute(params: {
    placeId: string;
    updateData: Partial<IPlace>;
  }): Promise<void>;
}

class UpdatePlaceAction implements IUpdatePlaceAction {
  constructor(private placeRepository: IPlaceRepository) {}

  async execute({
    placeId,
    updateData,
  }: {
    placeId: string;
    updateData: Partial<IPlace>;
  }): Promise<void> {
    await this.placeRepository.updateOne(placeId, updateData);
  }
}

export default UpdatePlaceAction;
