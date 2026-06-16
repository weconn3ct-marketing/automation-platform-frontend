/**
 * Audit Service
 * Wraps all /api/audit endpoints.
 */

import { api } from './apiClient';
import type { AuditLog, AuditSummary, PaginatedResponse } from '../types';

export interface ListAuditLogsParams {
  action?: string;
  page?: number;
  limit?: number;
  /** Admin only: query another user's logs */
  userId?: string;
}

export const auditService = {
  /**
   * GET /api/audit
   * List audit log entries for the authenticated user (paginated).
   */
  listLogs: async (params: ListAuditLogsParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.action) searchParams.set('action', params.action);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.userId) searchParams.set('userId', params.userId);

    const query = searchParams.toString();
    const response = await api.get<PaginatedResponse<AuditLog>>(
      `/audit${query ? `?${query}` : ''}`
    );
    return response.data;
  },

  /**
   * GET /api/audit/summary
   * Dashboard summary: 30-day event counts + 10 recent activity items.
   */
  getSummary: async () => {
    const response = await api.get<AuditSummary>('/audit/summary');
    return response.data;
  },
};
