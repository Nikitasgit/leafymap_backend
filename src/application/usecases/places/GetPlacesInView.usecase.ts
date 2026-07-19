import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { PlacesInViewClientFilters } from "@src/domain/interfaces/IPlaceRepository";
import {
  GetPlacesInViewInput,
  MAX_PLACE_IDS,
  MAX_PLACES_IN_VIEW_LIMIT,
} from "@src/application/dtos/places/getPlacesInView.dto";
import { parseJson } from "@src/shared/jsonHandlers";

const CLIENT_FILTERS_DEFAULTS: PlacesInViewClientFilters = {
  placeTypes: [],
  placeCategories: [],
};

class GetPlacesInViewUseCase {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async execute(
    params: GetPlacesInViewInput
  ): Promise<Record<string, unknown>[]> {
    const clientFilters = parseJson<PlacesInViewClientFilters>(
      params.clientFilters,
      CLIENT_FILTERS_DEFAULTS
    );

    const limit = params.ids?.length
      ? Math.min(params.limit ?? params.ids.length, MAX_PLACE_IDS)
      : Math.min(params.limit ?? 20, MAX_PLACES_IN_VIEW_LIMIT);

    return this.placeRepository.findInView({
      ne: params.ne,
      sw: params.sw,
      ids: params.ids,
      clientFilters: {
        placeTypes: clientFilters.placeTypes ?? [],
        placeCategories: clientFilters.placeCategories ?? [],
        minRating: clientFilters.minRating,
        userCategoryIds: clientFilters.userCategoryIds ?? [],
        productCategoryIds: clientFilters.productCategoryIds ?? [],
      },
      limit,
    });
  }
}

export default GetPlacesInViewUseCase;
