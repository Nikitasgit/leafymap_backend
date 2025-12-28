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
    "name",
    "description",
    "location",
    "phone",
    "email",
    "website",
    "active",
    "deleted",
    "isCreatorPlace",
    "rating",
    "followers",
    "placeCategory",
    "placeType",
    "defaultSchedule",
    "customDates",
    "placeCategory.name",
    "image.urls",
    "user.description",
    "user.creatorCategories",
    "user.creatorCategories.name",
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

    // For creator places, override place description with user's description
    if (
      place.isCreatorPlace &&
      typeof place.user === "object" &&
      "description" in place.user
    ) {
      place.description = place.user.description;
    }

    return place;
  }
}

export default GetPlaceByIdAction;
