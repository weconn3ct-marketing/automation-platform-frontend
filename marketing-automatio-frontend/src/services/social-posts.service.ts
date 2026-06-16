/**
 * Social Posts Service
 * Wraps all /api/social-posts endpoints.
 */

import { api } from './apiClient';
import type { SocialPost, SyncResponse, PaginatedResponse } from '../types';

export interface ListSocialPostsParams {
  platform?: 'facebook' | 'instagram' | 'linkedin';
  page?: number;
  limit?: number;
}

export const socialPostsService = {
  /**
   * GET /api/social-posts
   * List all cached social posts (all platforms or filtered by platform).
   */
  listPosts: async (params: ListSocialPostsParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.platform) searchParams.set('platform', params.platform);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const response = await api.get<PaginatedResponse<SocialPost>>(
      `/social-posts${query ? `?${query}` : ''}`
    );
    return response.data;
  },

  /**
   * GET /api/social-posts/:platform
   * List cached posts for a specific platform.
   */
  listPostsByPlatform: async (
    platform: 'facebook' | 'instagram' | 'linkedin',
    params: { page?: number; limit?: number } = {}
  ) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const response = await api.get<PaginatedResponse<SocialPost>>(
      `/social-posts/${platform}${query ? `?${query}` : ''}`
    );
    return response.data;
  },

  /**
   * GET /api/social-posts/item/:id
   * Get a single cached social post.
   */
  getPost: async (id: string) => {
    const response = await api.get<SocialPost>(`/social-posts/item/${id}`);
    return response.data;
  },

  /**
   * POST /api/social-posts/sync
   * Sync posts from all (or a specific) connected platform.
   */
  sync: async (platform?: 'facebook' | 'instagram' | 'linkedin') => {
    const response = await api.post<SyncResponse>('/social-posts/sync', platform ? { platform } : {});
    return response.data;
  },

  /**
   * POST /api/social-posts/sync/:platform
   * Sync posts from a specific platform.
   */
  syncPlatform: async (platform: 'facebook' | 'instagram' | 'linkedin') => {
    const response = await api.post<SyncResponse>(`/social-posts/sync/${platform}`);
    return response.data;
  },

  /**
   * DELETE /api/social-posts/cache
   * Clear cached posts (all platforms or a specific one).
   */
  clearCache: async (platform?: 'facebook' | 'instagram' | 'linkedin') => {
    const query = platform ? `?platform=${platform}` : '';
    const response = await api.delete<{ deletedCount: number }>(`/social-posts/cache${query}`);
    return response.data;
  },
};
