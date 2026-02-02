import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
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
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized - Clear auth and redirect to login
    if (error.response?.status === 401) {
      authStorage.clearAuth();
      window.location.href = '/login';
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
