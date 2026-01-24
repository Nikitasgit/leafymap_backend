import {
  IPlaceRepository,
  PlaceFilters,
} from "@/types/repositories/place.repository.types";
import { IPlace } from "@/types/models/place";

export interface GetPlacesInput {
  categoryId?: string;
  limit?: number;
}

export interface IGetPlacesAction {
  execute(params: {
    filters?: GetPlacesInput;
  }): Promise<IPlace[] | Partial<IPlace>[]>;
}

class GetPlacesAction implements IGetPlacesAction {
  private readonly project: (keyof IPlace | string)[] = [
    "_id",
    "location",
    "rating",
    "placeCategory",
    "placeType",
    "defaultSchedule",
    "customDates",
    "placeCategory.name",
    "user",
    "user._id",
    "user.username",
    "user.description",
    "createdAt",
    "updatedAt",
  ];

  constructor(private placeRepository: IPlaceRepository) {}

  async execute({
    filters,
  }: {
    filters?: GetPlacesInput;
  }): Promise<IPlace[] | Partial<IPlace>[]> {
    const queryFilters: PlaceFilters = {};

    let sortOptions: { [key: string]: 1 | -1 } = {};

    if (filters?.categoryId) {
      queryFilters.placeCategory = filters.categoryId;
      sortOptions = { createdAt: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const places = await this.placeRepository.findAll({
      filters: queryFilters,
      project: this.project,
      limit: filters?.limit || 10,
      sort: Object.keys(sortOptions).length > 0 ? sortOptions : undefined,
    });

    return places;
  }
}

export default GetPlacesAction;
