import {
  IPlaceRepository,
  PlaceFilters,
} from "../../repositories/places/IPlaceRepository";
import { IPlace } from "../../types/models/place";

export interface GetPlacesInput {
  name?: string;
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
    "name",
    "description",
    "location.label",
    "image",
    "placeCategory",
    "createdAt",
    "isCreatorPlace",
    "user",
    "placeCategory.name",
    "user._id",
    "user.description",
    "image.urls",
  ];

  constructor(private placeRepository: IPlaceRepository) {}

  async execute({
    filters,
  }: {
    filters?: GetPlacesInput;
  }): Promise<IPlace[] | Partial<IPlace>[]> {
    const queryFilters: PlaceFilters = {
      active: true,
      deleted: false,
    };

    let sortOptions: { [key: string]: 1 | -1 } = {};

    if (filters?.name && filters.name.length >= 3) {
      queryFilters.name = { $regex: filters.name, $options: "i" };
    } else if (filters?.categoryId && !filters.name) {
      queryFilters.placeCategory = filters.categoryId;
      sortOptions = { createdAt: -1 };
    } else if (!filters?.name && !filters?.categoryId) {
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
