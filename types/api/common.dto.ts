// Common API types shared across different entities
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

export interface Location {
  type: "Point";
  coordinates: [number, number];
  label: string;
  id: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
