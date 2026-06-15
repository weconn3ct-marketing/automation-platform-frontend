/**
 * useAudit — React hook for fetching audit logs and dashboard summaries.
 */

import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/audit.service';
import type { AuditLog, AuditSummary, PaginatedResponse } from '../types';

export const auditKeys = {
  all: ['audit'] as const,
  logs: (action?: string, page?: number) => ['audit', 'logs', action ?? 'all', page ?? 1] as const,
  summary: () => ['audit', 'summary'] as const,
};

// ─── List Audit Logs ──────────────────────────────────────────────────────────

export interface UseAuditLogsOptions {
  action?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export interface UseAuditLogsReturn {
  logs: AuditLog[];
  pagination: PaginatedResponse<AuditLog>['pagination'] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}): UseAuditLogsReturn {
  const { action, page = 1, limit = 50, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: auditKeys.logs(action, page),
    queryFn: () => auditService.listLogs({ action, page, limit }),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    logs: data?.data ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    error: error ? (error as any).message || 'Failed to load audit logs' : null,
    refetch,
  };
}

// ─── Audit Summary ────────────────────────────────────────────────────────────

export interface UseAuditSummaryReturn {
  summary: AuditSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAuditSummary(enabled = true): UseAuditSummaryReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: auditKeys.summary(),
    queryFn: () => auditService.getSummary(),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    summary: data ?? null,
    isLoading,
    error: error ? (error as any).message || 'Failed to load audit summary' : null,
    refetch,
  };
}
