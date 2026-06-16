/**
 * AuditLogPage.tsx
 * Displays the user's full activity/audit log from /api/audit
 */

import { useState } from 'react';
import { ClipboardList, RefreshCw, Loader2, AlertCircle, Shield, Link2, RefreshCcw, LogIn, LogOut, UserCog, Trash2, Rss } from 'lucide-react';
import { useAuditLogs, useAuditSummary } from '../../hooks/useAudit';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import type { AuditAction, AuditLog } from '../../types';

// ─── Action metadata ──────────────────────────────────────────────────────────

const ACTION_META: Record<AuditAction, { label: string; icon: React.ElementType; color: string }> = {
  ACCOUNT_CONNECT:         { label: 'Account Connected',     icon: Link2,       color: 'text-green-600 bg-green-50 border-green-200' },
  ACCOUNT_DISCONNECT:      { label: 'Account Disconnected',  icon: Trash2,      color: 'text-red-600 bg-red-50 border-red-200' },
  ACCOUNT_RECONNECT:       { label: 'Account Reconnected',   icon: RefreshCcw,  color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  TOKEN_REFRESH:           { label: 'Token Refreshed',       icon: RefreshCw,   color: 'text-blue-600 bg-blue-50 border-blue-200' },
  OAUTH_INITIATE:          { label: 'OAuth Started',         icon: Shield,      color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  OAUTH_CALLBACK_SUCCESS:  { label: 'OAuth Completed',       icon: Shield,      color: 'text-green-600 bg-green-50 border-green-200' },
  OAUTH_CALLBACK_ERROR:    { label: 'OAuth Failed',          icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200' },
  USER_LOGIN:              { label: 'Logged In',             icon: LogIn,       color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  USER_LOGOUT:             { label: 'Logged Out',            icon: LogOut,      color: 'text-gray-600 bg-gray-50 border-gray-200' },
  USER_SIGNUP:             { label: 'Account Created',       icon: UserCog,     color: 'text-green-600 bg-green-50 border-green-200' },
  USER_PROFILE_UPDATE:     { label: 'Profile Updated',       icon: UserCog,     color: 'text-blue-600 bg-blue-50 border-blue-200' },
  USER_ACCOUNT_DELETE:     { label: 'Account Deleted',       icon: Trash2,      color: 'text-red-600 bg-red-50 border-red-200' },
  SOCIAL_POSTS_SYNC:       { label: 'Posts Synced',          icon: Rss,         color: 'text-purple-600 bg-purple-50 border-purple-200' },
};

const PLATFORM_ICONS: Record<string, string> = {
  facebook: '👥',
  instagram: '📸',
  linkedin: '💼',
  all: '🌐',
};

function AuditBadge({ action }: { action: string }) {
  const meta = ACTION_META[action as AuditAction] ?? {
    label: action,
    icon: ClipboardList,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
  };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

function AuditRow({ log }: { log: AuditLog }) {
  const platformIcon = log.platform ? (PLATFORM_ICONS[log.platform] ?? '🌐') : null;
  const date = new Date(log.createdAt);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <AuditBadge action={log.action} />
      </td>
      <td className="py-3 px-4">
        {log.platform ? (
          <span className="flex items-center gap-1.5 text-sm text-gray-700">
            <span>{platformIcon}</span>
            <span className="capitalize">{log.platform}</span>
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">
        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        {' '}
        <span className="text-gray-400">
          {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-gray-400 font-mono truncate max-w-[120px]">
        {log.ipAddress ?? '—'}
      </td>
    </tr>
  );
}

// ─── Action filter options ────────────────────────────────────────────────────

const ACTION_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All Events' },
  { value: 'ACCOUNT_CONNECT', label: 'Connections' },
  { value: 'ACCOUNT_DISCONNECT', label: 'Disconnections' },
  { value: 'SOCIAL_POSTS_SYNC', label: 'Post Syncs' },
  { value: 'USER_LOGIN', label: 'Logins' },
  { value: 'OAUTH_CALLBACK_SUCCESS', label: 'OAuth' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AuditLogPage = () => {
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  const { logs, pagination, isLoading, error, refetch } = useAuditLogs({
    action: actionFilter || undefined,
    page,
    limit: 25,
  });

  const { summary } = useAuditSummary();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header
          title="Activity Log"
          subtitle="Complete audit trail of all account actions"
        />

        <main className="flex-1 p-8 space-y-6">

          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{summary.last30Days.connections}</p>
                <p className="text-xs text-gray-500 mt-1">Connections (30d)</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-red-500">{summary.last30Days.disconnections}</p>
                <p className="text-xs text-gray-500 mt-1">Disconnections (30d)</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{summary.last30Days.syncs}</p>
                <p className="text-xs text-gray-500 mt-1">Post Syncs (30d)</p>
              </Card>
            </div>
          )}

          {/* Filter + Refresh bar */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              {ACTION_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => { setActionFilter(f.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    actionFilter === f.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => refetch()}
              className="ml-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <AlertCircle size={16} className="flex-shrink-0 text-red-600" />
              {error}
            </div>
          )}

          {/* Table */}
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-indigo-400" />
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center">
                <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No audit events found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Platform</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <AuditRow key={log.id} log={log} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {(page - 1) * 25 + 1}–{Math.min(page * 25, pagination.total)} of {pagination.total} events
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AuditLogPage;
