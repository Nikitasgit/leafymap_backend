import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { PlaceListItemReadModel } from "@src/domain/read-models/place.read-models";
import { PlaceCategoryId } from "@src/domain/value-objects/ObjectId.vo";
import { GetPlacesInput } from "@src/application/dtos/places/getPlaces.dto";

class GetPlacesUseCase {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async execute(
    params: GetPlacesInput = {}
  ): Promise<PlaceListItemReadModel[]> {
    return this.placeRepository.findList({
      placeCategoryId: params.categoryId
        ? PlaceCategoryId.from(params.categoryId)
        : undefined,
      limit: params.limit ?? 10,
    });
  }
}

export default GetPlacesUseCase;
