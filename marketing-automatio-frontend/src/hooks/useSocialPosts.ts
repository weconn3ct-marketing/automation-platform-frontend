/**
 * useSocialPosts — React hook for fetching and syncing social posts from connected platforms.
 *
 * Uses TanStack Query for caching + background refetch.
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialPostsService } from '../services/social-posts.service';
import type { SocialPost, SyncResult, PaginatedResponse } from '../types';

type SocialPlatform = 'facebook' | 'instagram' | 'linkedin';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const socialPostsKeys = {
  all: ['social-posts'] as const,
  list: (platform?: string) => ['social-posts', 'list', platform ?? 'all'] as const,
  detail: (id: string) => ['social-posts', 'detail', id] as const,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseSocialPostsOptions {
  platform?: SocialPlatform;
  page?: number;
  limit?: number;
  /** Set to false to disable auto-fetch (e.g. on a tab that's not active) */
  enabled?: boolean;
}

export interface UseSocialPostsReturn {
  posts: SocialPost[];
  pagination: PaginatedResponse<SocialPost>['pagination'] | null;
  isLoading: boolean;
  isSyncing: boolean;
  syncResults: SyncResult[] | null;
  totalSynced: number | null;
  error: string | null;
  syncError: string | null;
  /** Re-fetch cached posts from DB */
  refetch: () => void;
  /** Trigger a fresh sync from the connected platform(s) */
  syncPosts: (platform?: SocialPlatform) => Promise<void>;
  /** Clear the cached posts for a platform */
  clearCache: (platform?: SocialPlatform) => Promise<void>;
}

export function useSocialPosts(options: UseSocialPostsOptions = {}): UseSocialPostsReturn {
  const { platform, page = 1, limit = 20, enabled = true } = options;
  const queryClient = useQueryClient();

  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [totalSynced, setTotalSynced] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // ── Fetch cached posts ────────────────────────────────────────────────────

  const {
    data,
    isLoading,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: socialPostsKeys.list(platform),
    queryFn: () =>
      platform
        ? socialPostsService.listPostsByPlatform(platform, { page, limit })
        : socialPostsService.listPosts({ page, limit }),
    enabled,
    staleTime: 2 * 60 * 1000, // consider fresh for 2 min
    retry: 1,
  });

  // ── Sync from platform(s) ─────────────────────────────────────────────────

  const syncMutation = useMutation({
    mutationFn: (p?: SocialPlatform) => socialPostsService.sync(p),
    onSuccess: (result) => {
      setSyncResults(result.results);
      setTotalSynced(result.totalSynced);
      setSyncError(null);
      // Invalidate all post list caches so they refetch fresh
      queryClient.invalidateQueries({ queryKey: socialPostsKeys.all });
    },
    onError: (err: any) => {
      setSyncError(err.message || 'Sync failed');
    },
  });

  const syncPosts = useCallback(
    async (p?: SocialPlatform) => {
      setSyncResults(null);
      setTotalSynced(null);
      setSyncError(null);
      await syncMutation.mutateAsync(p);
    },
    [syncMutation]
  );

  // ── Clear cache ───────────────────────────────────────────────────────────

  const clearCacheMutation = useMutation({
    mutationFn: (p?: SocialPlatform) => socialPostsService.clearCache(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialPostsKeys.all });
    },
  });

  const clearCache = useCallback(
    async (p?: SocialPlatform) => {
      await clearCacheMutation.mutateAsync(p);
    },
    [clearCacheMutation]
  );

  return {
    posts: data?.data ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    isSyncing: syncMutation.isPending,
    syncResults,
    totalSynced,
    error: fetchError ? (fetchError as any).message || 'Failed to load posts' : null,
    syncError,
    refetch,
    syncPosts,
    clearCache,
  };
}
