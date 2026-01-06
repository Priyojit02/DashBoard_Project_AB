// ============================================
// API Client - HTTP Request Handler
// ============================================
// Uses Azure AD token directly (no JWT)

import { API_BASE_URL, API_CONFIG } from './api-config';
import { getAccessToken } from './auth-service';

// Custom error class
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public detail: string,
    public errorCode?: string
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

// Request options type
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, any>): string {
  const url = new URL(endpoint, API_BASE_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

// Main API client function
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    params,
    headers = {},
    requiresAuth = true,
  } = options;

  // Build request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add Azure AD token directly if required (no JWT needed!)
  if (requiresAuth) {
    const token = await getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Build URL
  const url = buildUrl(endpoint, params);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorDetail = 'An error occurred';
      let errorCode: string | undefined;

      if (isJson) {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
        errorCode = errorData.error_code;
      }

      throw new ApiError(response.status, errorDetail, errorCode);
    }

    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    if (isJson) {
      return await response.json();
    }

    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error'
    );
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>, requiresAuth = true) =>
    apiClient<T>(endpoint, { method: 'GET', params, requiresAuth }),

  post: <T>(endpoint: string, body?: any, requiresAuth = true) =>
    apiClient<T>(endpoint, { method: 'POST', body, requiresAuth }),

  put: <T>(endpoint: string, body?: any, requiresAuth = true) =>
    apiClient<T>(endpoint, { method: 'PUT', body, requiresAuth }),

  patch: <T>(endpoint: string, body?: any, requiresAuth = true) =>
    apiClient<T>(endpoint, { method: 'PATCH', body, requiresAuth }),

  delete: <T>(endpoint: string, requiresAuth = true) =>
    apiClient<T>(endpoint, { method: 'DELETE', requiresAuth }),
};

export default api;
