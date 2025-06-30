/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  message?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Query parameters for API requests
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  sort_by?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
  // Payment specific filters
  company_id?: string;
  status?: string;
  method?: string;
  date_from?: string;
  date_to?: string;
  // User specific filters
  role?: string;
  // Plan specific filters
  billing_cycle?: string;
}

/**
 * Common database row structure
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Error response structure
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}