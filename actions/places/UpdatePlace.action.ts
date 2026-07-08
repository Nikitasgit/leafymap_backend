import { IPlace } from "types/models";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { Types } from "mongoose";

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
    const normalizedUpdate: Partial<IPlace> = { ...updateData };

    if (updateData.placeCategory) {
      normalizedUpdate.placeCategory = new Types.ObjectId(
        updateData.placeCategory as unknown as string
      );
    }

    if (updateData.placeType) {
      normalizedUpdate.placeType = (updateData.placeType as unknown as string[]).map(
        (typeId) => new Types.ObjectId(typeId)
      );
    }

    await this.placeRepository.updateOne(placeId, normalizedUpdate);
  }
}

export default UpdatePlaceAction;
