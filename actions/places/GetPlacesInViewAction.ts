import {
  IPlaceRepository,
  PlaceFilters,
} from "../../repositories/places/IPlaceRepository";
import { IPlace, PlaceType } from "../../types/models/place";
import { parseJson } from "../../utils/jsonHandlers";

export interface GetPlacesInViewInput {
  ne: string;
  sw: string;
  filters?: string;
  limit?: number;
}

export interface IGetPlacesInViewAction {
  execute(params: {
    filters: GetPlacesInViewInput;
  }): Promise<IPlace[] | Partial<IPlace>[]>;
}

class GetPlacesInViewAction implements IGetPlacesInViewAction {
  private readonly project: (keyof IPlace | string)[] = [
    "location",
    "placeCategory",
    "placeCategory.name",
    "isCreatorPlace",
    "name",
  ];

  constructor(private placeRepository: IPlaceRepository) {}

  async execute({
    filters,
  }: {
    filters: GetPlacesInViewInput;
  }): Promise<IPlace[] | Partial<IPlace>[]> {
    let bounds;
    try {
      bounds = {
        ne: JSON.parse(filters.ne),
        sw: JSON.parse(filters.sw),
      };
    } catch (error) {
      throw new Error("Invalid coordinate format");
    }

    const maxLimit = 100;
    const queryLimit = Math.min(filters.limit || 20, maxLimit);

    const { placeType, placeCategories } = parseJson(filters.filters, {
      placeType: "all",
      placeCategories: [],
    });

    const placeFilters: PlaceFilters = {
      location: {
        $geoWithin: {
          $box: [bounds.sw, bounds.ne],
        },
      },
      active: true,
    };

    // Filter by place type; "art-craft" is a special case that includes both "art" and "craft"
    if (placeType && placeType !== "all") {
      if (placeType === "art-craft") {
        placeFilters.placeType = { $in: ["art", "craft"] as PlaceType[] };
      } else {
        placeFilters.placeType = placeType as PlaceType;
      }
    }

    if (placeCategories && placeCategories.length > 0) {
      placeFilters.placeCategory = { $in: placeCategories };
    }

    const places = await this.placeRepository.findAll({
      filters: placeFilters,
      project: this.project,
      limit: queryLimit,
    });

    return places;
  }
}

export default GetPlacesInViewAction;
