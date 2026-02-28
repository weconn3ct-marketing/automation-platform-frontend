import { api } from './apiClient';
import type { DashboardMetrics, AnalyticsData } from '../types';

export interface PostAnalyticsResponse {
  postId: string;
  byPlatform: Array<{
    id: string;
    postId: string;
    platform: string;
    views: number;
    likes: number;
    shares: number;
    comments: number;
    impressions: number;
    clickThroughRate: number;
    recordedAt: string;
  }>;
  totals: AnalyticsData & { clickThroughRate: number };
}

/**
 * Fetch aggregated dashboard metrics for the current user
 */
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await api.get<DashboardMetrics>('/analytics/dashboard');
  return response.data;
}

/**
 * Fetch per-platform analytics for a specific post
 */
export async function fetchPostAnalytics(postId: string): Promise<PostAnalyticsResponse> {
  const response = await api.get<PostAnalyticsResponse>(`/analytics/posts/${postId}`);
  return response.data;
}
