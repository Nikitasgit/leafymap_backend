export const MAX_PLACE_IDS = 500;
export const MAX_PLACES_IN_VIEW_LIMIT = 100;

export interface GetPlacesInViewInput {
  ne?: number[];
  sw?: number[];
  ids?: string[];
  clientFilters?: string;
  limit?: number;
}
