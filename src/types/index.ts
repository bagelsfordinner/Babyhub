// Re-export all types for easy importing
export * from './auth';
export * from './media';
export * from './timeline';
export * from './help';
export * from './vault';
export * from './comments';

// Common utility types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta?: PaginationMeta;
}