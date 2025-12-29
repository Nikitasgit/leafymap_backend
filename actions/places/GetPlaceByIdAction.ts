import { IPlaceRepository } from "../../repositories/places/IPlaceRepository";
import { IPlace } from "../../types/models/place";

export interface IGetPlaceByIdAction {
  execute(params: {
    placeId: string;
    project?: (keyof IPlace | string)[];
  }): Promise<IPlace>;
}

class GetPlaceByIdAction implements IGetPlaceByIdAction {
  private readonly defaultProject: (keyof IPlace | string)[] = [
    "_id",
    "location",
    "rating",
    "placeCategory",
    "placeType",
    "defaultSchedule",
    "customDates",
    "placeCategory.name",
    "user",
    "user.description",
    "user.userCategories",
    "user.userCategories.name",
    "createdAt",
    "updatedAt",
  ];

  constructor(private placeRepository: IPlaceRepository) {}

  async execute({
    placeId,
    project,
  }: {
    placeId: string;
    project?: (keyof IPlace | string)[];
  }): Promise<IPlace> {
    const place = await this.placeRepository.findById(
      placeId,
      project || this.defaultProject
    );

    if (!place) {
      throw new Error("Place not found");
    }

    return place;
  }
}

export default GetPlaceByIdAction;
