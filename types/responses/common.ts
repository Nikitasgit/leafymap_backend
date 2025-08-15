// Common response types
export interface APIResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  statusCode: number;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  statusCode: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message: string;
  statusCode: number;
}
