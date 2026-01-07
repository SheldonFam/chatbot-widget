/**
 * Shared API client configuration and utilities
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
export const API_KEY = import.meta.env.VITE_API_KEY || "34567890";

/**
 * Custom error class for service errors
 */
export class ChatServiceError extends Error {
  constructor(
    message: string,
    public originalError?: string
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}

/**
 * Build headers for API requests with Authorization header
 *
 * Supports API key authentication via Authorization header (Bearer token format).
 * The backend also accepts x-api-key header as an alternative format.
 *
 * Expected format: Authorization: Bearer <api-key>
 * Alternative format: x-api-key: <api-key>
 *
 * @param includeContentType - Whether to include Content-Type header (default: true)
 *                            Set to false for FormData uploads where browser sets Content-Type with boundary
 */
export function buildHeaders(includeContentType: boolean = true): HeadersInit {
  const headers: HeadersInit = {};

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (API_KEY) {
    headers["Authorization"] = `Bearer ${API_KEY}`;
  } else if (import.meta.env.DEV && includeContentType) {
    // Only warn in development to avoid console spam in production
    // Skip warning for file uploads
    console.warn(
      "VITE_API_KEY is not set. API requests may fail authentication. " +
        "Set VITE_API_KEY in your .env file for authenticated requests."
    );
  }

  return headers;
}

/**
 * Build headers for file upload requests (without Content-Type)
 * Browser will automatically set Content-Type with boundary for FormData
 */
export function buildFileUploadHeaders(): HeadersInit {
  return buildHeaders(false);
}
