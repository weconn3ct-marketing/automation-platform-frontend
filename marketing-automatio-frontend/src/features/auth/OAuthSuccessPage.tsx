import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import type { Connection } from '../../types';
import { oauthService } from '../../services/oauthService';

const PLATFORM_DISPLAY: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
};

export const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      const callback = oauthService.isOAuthCallback(searchParams);
      const errorCallback = oauthService.isOAuthError(searchParams);

      if (errorCallback) {
        setError(errorCallback.message);
        setIsLoading(false);
        return;
      }

      if (!callback) {
        setError('Invalid OAuth callback: missing connection details');
        setIsLoading(false);
        return;
      }

      const accountName =
        searchParams.get('accountName') ||
        `${PLATFORM_DISPLAY[callback.platform] || callback.platform} Account`;

      setConnection({
        id: callback.connectionId,
        platform: callback.platform as Connection['platform'],
        status: 'connected',
        accountName,
      });

      const redirectTimer = window.setTimeout(() => {
        navigate('/dashboard/accounts', { replace: true });
      }, 3000);

      setIsLoading(false);

      return () => window.clearTimeout(redirectTimer);
    };

    const cleanup = handleCallback();
    return cleanup;
  }, [searchParams, navigate]);

  const platformName =
    PLATFORM_DISPLAY[searchParams.get('platform') || ''] ||
    searchParams.get('platform') ||
    'Social';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 40%, #0f172a 100%)',
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 text-center shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {isLoading ? (
          <div className="space-y-5">
            <div className="flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.2)', border: '2px solid rgba(99,102,241,0.4)' }}
              >
                <Loader2 size={36} className="text-indigo-400 animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Completing Connection...</h1>
            <p className="text-slate-400 text-sm">
              Please wait while we finalize your {platformName} connection
            </p>
          </div>
        ) : error ? (
          <div className="space-y-5">
            <div className="flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)' }}
              >
                <AlertCircle size={36} className="text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Connection Failed</h1>
            <p className="text-red-300 text-sm">{error}</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate('/dashboard/accounts')}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold text-sm transition hover:bg-white/10"
              >
                Back to Accounts
              </button>
              <button
                onClick={() => navigate('/dashboard/accounts')}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                Try Again
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : connection ? (
          <div className="space-y-5">
            {/* Animated success icon */}
            <div className="flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(34,197,94,0.15)',
                  border: '2px solid rgba(34,197,94,0.4)',
                  animation: 'pulse 2s infinite',
                }}
              >
                <CheckCircle2 size={36} className="text-green-400" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Connected Successfully!
              </h1>
              <p className="text-slate-300 text-sm">
                Your{' '}
                <span className="font-semibold text-white">{platformName}</span> account{' '}
                <span className="font-semibold text-green-400">{connection.accountName}</span>{' '}
                has been connected.
              </p>
            </div>

            {/* Feature highlights */}
            <div
              className="rounded-2xl p-4 text-left space-y-2"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              {[
                '✓ OAuth token secured and encrypted',
                `✓ You can now publish to ${platformName}`,
                '✓ Token auto-refresh is enabled',
              ].map((item) => (
                <p key={item} className="text-sm text-green-300">{item}</p>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
              Redirecting to accounts in a few seconds...
            </div>

            <button
              onClick={() => navigate('/dashboard/accounts', { replace: true })}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Go to Accounts
              <ArrowRight size={14} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OAuthSuccessPage;
