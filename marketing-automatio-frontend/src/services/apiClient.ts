import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../lib/constants';
import { authStorage } from '../lib/storage';
import type { ApiError, ApiResponse } from '../types';

/**
 * Axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track whether a refresh is in progress to avoid parallel refresh calls
let isRefreshing = false;

// Queue of requests waiting for token refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle token refresh on 401, then format errors globally
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url ?? '';
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/refresh');

    // Attempt token refresh on 401, but only once per request
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      const refreshToken = localStorage.getItem('refresh_token');

      // No refresh token stored — clear auth and redirect immediately
      if (!refreshToken) {
        authStorage.clearAuth();
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use a plain axios call to avoid the interceptor re-running on this request
        const response = await axios.post<ApiResponse<{ token: string; refreshToken: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

        authStorage.setToken(newToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStorage.clearAuth();
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Format error for consistent handling
    const apiError: ApiError = {
      success: false,
      error: error.response?.data?.error || error.message || 'An error occurred',
      message: error.response?.data?.message || 'Something went wrong',
      statusCode: error.response?.status || 500,
    };

    return Promise.reject(apiError);
  }
);

/**
 * Generic API request wrapper
 */
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
}

/**
 * HTTP method helpers
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

export default apiClient;
