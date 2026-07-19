import { Place } from "@src/domain/entities/Place.entity";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { IUserPlaceLinker } from "@src/domain/interfaces/IUserPlaceLinker";
import {
  PlaceCategoryId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PlaceLocation } from "@src/domain/value-objects/PlaceLocation.vo";
import {
  CreatePlaceInput,
  CreatePlaceOutput,
} from "@src/application/dtos/places/createPlace.dto";

class CreatePlaceUseCase {
  constructor(
    private readonly placeRepository: IPlaceRepository,
    private readonly userPlaceLinker: IUserPlaceLinker
  ) {}

  async execute(params: CreatePlaceInput): Promise<CreatePlaceOutput> {
    const userId = UserId.from(params.userId);
    await this.userPlaceLinker.assertCanCreatePlace(userId);

    const place = Place.create({
      userId,
      location: PlaceLocation.from(params.location),
      placeCategoryId: PlaceCategoryId.from(params.placeCategoryId),
      defaultSchedule: params.defaultSchedule,
      customDates: params.customDates,
    });

    const id = await this.placeRepository.save(place);
    await this.userPlaceLinker.linkPlace(userId, id);

    return { id };
  }
}

export default CreatePlaceUseCase;
