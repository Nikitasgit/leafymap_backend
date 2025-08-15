// Common request types
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface SearchQuery {
  search?: string;
  q?: string;
}

export interface FilterQuery {
  category?: string;
  placeType?: string;
  status?: string;
  active?: string;
  userId?: string;
}

export interface LocationQuery {
  lat?: string;
  lng?: string;
  radius?: string;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}
