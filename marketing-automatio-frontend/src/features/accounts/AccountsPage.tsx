import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import {
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Key,
  Link2,
  Shield,
  Clock,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { useConnectionsStore } from '../../store/connectionsStore';
import { useOAuth } from '../../hooks/useOAuth';
import type { Platform, Connection } from '../../types';

type BasicPlatform = 'instagram' | 'linkedin' | 'facebook';

// ── Platform metadata ─────────────────────────────────────────────────────────

const PLATFORM_META = {
  facebook: {
    name: 'Facebook',
    subtitle: 'Facebook Page',
    brandColor: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0a5dc4 100%)',
    bgLight: '#EBF5FF',
    borderColor: '#90c4fc',
    tokenHint: 'Facebook Graph API access token or Page token',
    tokenLabel: 'Access Token / Page Token',
    docsUrl: 'https://developers.facebook.com/tools/explorer/',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  linkedin: {
    name: 'LinkedIn',
    subtitle: 'LinkedIn Profile',
    brandColor: '#0A66C2',
    gradient: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
    bgLight: '#E8F3FF',
    borderColor: '#7fb9f5',
    tokenHint: 'LinkedIn API OAuth access token',
    tokenLabel: 'Access Token',
    docsUrl: 'https://www.linkedin.com/developers/',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  instagram: {
    name: 'Instagram',
    subtitle: 'Instagram Business',
    brandColor: '#E1306C',
    gradient: 'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)',
    bgLight: '#FFF0F6',
    borderColor: '#f5a3c5',
    tokenHint: 'Instagram Business API access token (via Facebook Graph API)',
    tokenLabel: 'Access Token',
    docsUrl: 'https://developers.facebook.com/docs/instagram-api/',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
} as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'connected') {
    return (
      <span
        style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Connected
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span
        style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Error
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span
        style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      >
        <Loader2 size={10} className="animate-spin" />
        Pending
      </span>
    );
  }
  return (
    <span
      style={{ background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Not connected
    </span>
  );
}

function getDaysUntilExpiry(expiresAt?: string): number | null {
  if (!expiresAt) return null;
  const now = new Date().getTime();
  const expiryTime = new Date(expiresAt).getTime();
  const days = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

// ── Connect Modal ─────────────────────────────────────────────────────────────

interface ConnectModalProps {
  platform: BasicPlatform;
  onClose: () => void;
  onOAuth: () => void;
  onManual: (email: string, token: string) => Promise<void>;
  isOAuthLoading: boolean;
  isManualLoading: boolean;
}

function ConnectModal({
  platform,
  onClose,
  onOAuth,
  onManual,
  isOAuthLoading,
  isManualLoading,
}: ConnectModalProps) {
  const meta = PLATFORM_META[platform];
  const [tab, setTab] = useState<'oauth' | 'manual'>('oauth');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [manualError, setManualError] = useState('');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    if (!token.trim()) {
      setManualError('Access token is required.');
      return;
    }
    try {
      await onManual(email.trim(), token.trim());
    } catch (err: any) {
      setManualError(err.message || 'Failed to connect. Check your token and try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: '#fff' }}
      >
        {/* Header */}
        <div
          className="p-6 text-white relative overflow-hidden"
          style={{ background: meta.gradient }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
            style={{ background: '#fff' }}
          />
          <div
            className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-10"
            style={{ background: '#fff' }}
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
                {meta.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">Connect {meta.name}</h2>
                <p className="text-sm opacity-80">{meta.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex mt-5 rounded-xl overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          >
            <button
              onClick={() => setTab('oauth')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                tab === 'oauth'
                  ? 'bg-white/25 text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Shield size={14} />
                OAuth 2.0
              </span>
            </button>
            <button
              onClick={() => setTab('manual')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                tab === 'manual'
                  ? 'bg-white/25 text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Key size={14} />
                Manual Token
              </span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {tab === 'oauth' ? (
            <div className="space-y-4">
              <div
                className="rounded-xl p-4 flex gap-3"
                style={{ background: meta.bgLight, border: `1px solid ${meta.borderColor}` }}
              >
                <Zap size={18} style={{ color: meta.brandColor }} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">
                    Recommended — Secure OAuth 2.0
                  </p>
                  <p className="text-xs text-gray-600">
                    You'll be redirected to {meta.name} to sign in and grant permissions.
                    Your password is never shared with us.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-green-500" />
                  Industry-standard OAuth 2.0 protocol
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-green-500" />
                  Tokens are encrypted and stored securely
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-green-500" />
                  Revokable at any time from {meta.name} settings
                </div>
              </div>

              <button
                id={`oauth-connect-${platform}`}
                onClick={onOAuth}
                disabled={isOAuthLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: meta.gradient }}
              >
                {isOAuthLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <div className="w-5 h-5">{meta.icon}</div>
                )}
                {isOAuthLoading ? 'Redirecting to ' + meta.name + '...' : `Continue with ${meta.name}`}
                {!isOAuthLoading && <ExternalLink size={14} className="opacity-70" />}
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div
                className="rounded-xl p-4 flex gap-3"
                style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
              >
                <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-800 font-semibold mb-0.5">For Advanced Users</p>
                  <p className="text-xs text-amber-700">
                    Enter a pre-generated API access token. Your account password is{' '}
                    <strong>never</strong> stored.
                  </p>
                </div>
              </div>

              {/* Email field */}
              <div>
                <label
                  htmlFor={`manual-email-${platform}`}
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Account Email <span className="text-gray-400 text-xs font-normal">(for display)</span>
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id={`manual-email-${platform}`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`your@email.com`}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': meta.brandColor } as React.CSSProperties}
                    onFocus={(e) => (e.target.style.borderColor = meta.brandColor)}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                  />
                </div>
              </div>

              {/* Token field */}
              <div>
                <label
                  htmlFor={`manual-token-${platform}`}
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  {meta.tokenLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Key
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id={`manual-token-${platform}`}
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your access token here"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all font-mono"
                    onFocus={(e) => (e.target.style.borderColor = meta.brandColor)}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  <ExternalLink size={11} />
                  <a
                    href={meta.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-gray-700"
                    style={{ color: meta.brandColor }}
                  >
                    Get your token from {meta.name} Developer Console
                  </a>
                </p>
              </div>

              {manualError && (
                <div className="flex items-start gap-2 rounded-xl p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {manualError}
                </div>
              )}

              <button
                id={`manual-connect-${platform}`}
                type="submit"
                disabled={isManualLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: meta.gradient }}
              >
                {isManualLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Link2 size={16} />
                )}
                {isManualLoading ? 'Connecting...' : `Connect ${meta.name}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Platform Card ─────────────────────────────────────────────────────────────

interface PlatformCardProps {
  platform: BasicPlatform;
  connection?: Connection;
  onConnect: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
  isLoading: boolean;
  isInitiating: boolean;
}

function PlatformCard({
  platform,
  connection,
  onConnect,
  onDisconnect,
  onReconnect,
  isLoading,
  isInitiating,
}: PlatformCardProps) {
  const meta = PLATFORM_META[platform];
  const isConnected = !!connection;
  const daysLeft = connection?.expiresAt ? getDaysUntilExpiry(connection.expiresAt) : null;
  const email = connection?.metadata?.email as string | undefined;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-md"
      style={{
        borderColor: isConnected ? meta.borderColor : '#e5e7eb',
        background: '#fff',
      }}
    >
      {/* Card top stripe */}
      <div
        className="h-1.5"
        style={{ background: isConnected ? meta.gradient : '#e5e7eb' }}
      />

      <div className="p-6">
        {/* Platform header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ background: meta.gradient }}
            >
              {meta.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{meta.name}</h3>
              <p className="text-xs text-gray-500">{meta.subtitle}</p>
            </div>
          </div>
          <StatusBadge status={connection?.status ?? 'disconnected'} />
        </div>

        {/* Connected account info */}
        {isConnected ? (
          <div className="space-y-4">
            {/* Account info */}
            <div
              className="rounded-xl p-4 space-y-2"
              style={{ background: meta.bgLight, border: `1px dashed ${meta.borderColor}` }}
            >
              {connection.accountName && (
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: meta.gradient }}
                  >
                    {connection.accountName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{connection.accountName}</p>
                    {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
                  </div>
                </div>
              )}

              {connection.lastSync && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={11} className="flex-shrink-0" />
                  Last sync: {new Date(connection.lastSync).toLocaleString()}
                </div>
              )}

              {daysLeft !== null && (
                <div
                  className={`flex items-center gap-2 text-xs font-medium ${
                    daysLeft < 7 ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  <Clock size={11} className="flex-shrink-0" />
                  Token expires in{' '}
                  <span className={daysLeft < 7 ? 'font-bold text-red-700' : ''}>
                    {daysLeft} days
                  </span>
                </div>
              )}
            </div>

            {/* Error message */}
            {connection.errorMessage && (
              <div className="flex items-start gap-2 rounded-xl p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                {connection.errorMessage}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                id={`reconnect-${platform}`}
                onClick={onReconnect}
                disabled={isInitiating || isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={14} className={isInitiating ? 'animate-spin' : ''} />
                {connection.status === 'error' ? 'Reconnect' : 'Refresh'}
              </button>
              <button
                id={`disconnect-${platform}`}
                onClick={onDisconnect}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          /* Not connected state */
          <div className="space-y-4">
            <div className="rounded-xl p-4 bg-gray-50 border border-gray-100 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                <XCircle size={18} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">No account connected</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Connect your {meta.name} account to start managing posts
              </p>
            </div>

            <button
              id={`connect-${platform}`}
              onClick={onConnect}
              disabled={isInitiating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              style={{ background: meta.gradient }}
            >
              {isInitiating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {isInitiating ? 'Connecting...' : `Connect ${meta.name}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export const AccountsPage = () => {
  const {
    connections,
    isLoading,
    fetchConnections,
    removeConnection,
    createConnection,
  } = useConnectionsStore();

  const { isInitiating, error: oauthError, connectPlatform, clearError } = useOAuth();

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const [modalPlatform, setModalPlatform] = useState<BasicPlatform | null>(null);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setGlobalMessage({ type, text });
    setTimeout(() => setGlobalMessage(null), 5000);
  };

  const getConnection = (platform: Platform) =>
    connections.find((c) => c.platform === platform);

  const handleOpenModal = (platform: BasicPlatform) => {
    clearError();
    setModalPlatform(platform);
  };

  const handleCloseModal = () => {
    setModalPlatform(null);
  };

  const handleOAuth = async () => {
    if (!modalPlatform) return;
    try {
      await connectPlatform(modalPlatform);
      handleCloseModal();
    } catch (err: any) {
      showMessage('error', err.message || `Failed to connect ${modalPlatform}`);
    }
  };

  const handleManual = async (email: string, token: string) => {
    if (!modalPlatform) return;
    setIsManualLoading(true);
    try {
      await createConnection({
        platform: modalPlatform,
        accessToken: token,
        accountName: email || `${PLATFORM_META[modalPlatform].name} Account`,
        metadata: { email, manualToken: true },
      });
      handleCloseModal();
      showMessage('success', `${PLATFORM_META[modalPlatform].name} account connected successfully!`);
      await fetchConnections();
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: string, platform: string) => {
    if (!confirm(`Disconnect your ${platform} account? You'll need to reconnect to use platform features.`)) return;
    try {
      await removeConnection(connectionId);
      showMessage('success', `${platform} account disconnected.`);
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to disconnect account');
    }
  };

  const handleReconnect = async (platform: BasicPlatform) => {
    clearError();
    try {
      await connectPlatform(platform);
    } catch (err: any) {
      showMessage('error', err.message || `Failed to reconnect ${platform}`);
    }
  };

  const connectedCount = connections.filter((c) => c.status === 'connected').length;

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>
      {/* ── Global toast ── */}
      {(globalMessage || oauthError) && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-start gap-3 px-5 py-3.5 rounded-xl shadow-xl max-w-sm text-sm font-medium transition-all animate-fade-in`}
          style={{
            background: oauthError || globalMessage?.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: oauthError || globalMessage?.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
            color: oauthError || globalMessage?.type === 'error' ? '#991b1b' : '#166534',
          }}
        >
          {oauthError || globalMessage?.type === 'error' ? (
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-green-600" />
          )}
          <span className="flex-1">
            {oauthError ? oauthError.message : globalMessage?.text}
          </span>
          <button
            onClick={() => { clearError(); setGlobalMessage(null); }}
            className="opacity-60 hover:opacity-100 ml-1 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Loading indicator ── */}
      {(isLoading || isInitiating) && !modalPlatform && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white shadow-lg rounded-full px-5 py-2.5 flex items-center gap-2 text-sm text-gray-600 border border-gray-100">
          <Loader2 size={15} className="animate-spin text-indigo-600" />
          {isInitiating ? 'Connecting to platform...' : 'Syncing accounts...'}
        </div>
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Connected Accounts"
          subtitle="Link your social media accounts to start publishing and managing content"
        />

        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          {/* ── Summary bar ── */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              {
                label: 'Platforms Available',
                value: '3',
                icon: <Link2 size={18} className="text-indigo-600" />,
                bg: '#eef2ff',
                border: '#c7d2fe',
              },
              {
                label: 'Connected Accounts',
                value: connectedCount.toString(),
                icon: <CheckCircle2 size={18} className="text-green-600" />,
                bg: '#f0fdf4',
                border: '#bbf7d0',
              },
              {
                label: 'Token Security',
                value: 'AES-256',
                icon: <Shield size={18} className="text-purple-600" />,
                bg: '#faf5ff',
                border: '#e9d5ff',
              },
            ].map(({ label, value, icon, bg, border }) => (
              <div
                key={label}
                className="rounded-xl p-4 flex items-center gap-4"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm"
                >
                  {icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Platform cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(['facebook', 'linkedin', 'instagram'] as BasicPlatform[]).map((platform) => {
              const connection = getConnection(platform as Platform);
              return (
                <PlatformCard
                  key={platform}
                  platform={platform}
                  connection={connection}
                  onConnect={() => handleOpenModal(platform)}
                  onDisconnect={() =>
                    connection && handleDisconnect(connection.id, PLATFORM_META[platform].name)
                  }
                  onReconnect={() => handleReconnect(platform)}
                  isLoading={isLoading}
                  isInitiating={isInitiating}
                />
              );
            })}
          </div>

          {/* ── Info banner ── */}
          <div
            className="rounded-2xl p-5 flex gap-4"
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
              border: '1px solid #c7d2fe',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                How your credentials are protected
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We use <strong>OAuth 2.0</strong> as the primary authentication method — your
                platform password is never stored. All access tokens are encrypted with{' '}
                <strong>AES-256</strong> before being saved to our database. You can revoke access
                at any time from your social platform's app settings.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* ── Connect Modal ── */}
      {modalPlatform && (
        <ConnectModal
          platform={modalPlatform}
          onClose={handleCloseModal}
          onOAuth={handleOAuth}
          onManual={handleManual}
          isOAuthLoading={isInitiating}
          isManualLoading={isManualLoading}
        />
      )}
    </div>
  );
};

export default AccountsPage;
