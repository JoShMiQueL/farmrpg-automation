// Standardized API response model
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
}

// Common error codes
export enum ErrorCode {
  NO_BAIT = "NO_BAIT",
  UPSTREAM_ERROR = "UPSTREAM_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
}
