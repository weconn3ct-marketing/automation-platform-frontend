import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface OAuthErrorDetails {
  code: string;
  message: string;
  description?: string;
  platform: string;
}

const PLATFORM_DISPLAY: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
};

const ERROR_DESCRIPTIONS: Record<string, string> = {
  invalid_state: 'The security token is invalid. This may happen if you waited too long. Please try again.',
  token_exchange_failed: 'Failed to exchange authorization code for an access token. The app credentials may be incorrect.',
  user_info_failed: 'Connected but failed to fetch account information. Please check your account settings.',
  social_login_failed: 'Social login could not be completed. Please try again.',
  internal_error: 'A server error occurred. Please try again in a few moments.',
  invalid_request: 'Invalid OAuth request. Missing required parameters.',
  access_denied: 'You denied permission. Please authorize the app to continue.',
  INVALID_STATE: 'The security token is invalid or expired. Please try again.',
  TOKEN_EXCHANGE_FAILED: 'Failed to exchange authorization code for an access token.',
  USER_INFO_FETCH_FAILED: 'Could not fetch account information from the platform.',
  CSRF_FAILED: 'Security validation failed. Please clear your cookies and try again.',
  RATE_LIMITED: 'Too many login attempts. Please wait a few minutes before trying again.',
  USER_DENIED: 'You denied permission. Please authorize the app to continue.',
  ACCESS_DENIED: 'You do not have permission to connect this account.',
  INVALID_PLATFORM: 'The platform is not supported or not configured properly.',
  DATABASE_ERROR: 'Server error while saving your connection. Please try again.',
};

export const OAuthErrorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<OAuthErrorDetails | null>(null);

  useEffect(() => {
    const error = searchParams.get('error') || 'UNKNOWN_ERROR';
    // Backend sends 'error_description' param
    const errorDescription =
      searchParams.get('error_description') ||
      searchParams.get('message') ||
      null;
    const platform = searchParams.get('platform') || 'account';

    setErrorDetails({
      code: error,
      message: errorDescription || `Failed to connect ${PLATFORM_DISPLAY[platform] || platform}`,
      description: errorDescription || undefined,
      platform,
    });
  }, [searchParams]);

  const getHumanDescription = (code: string): string => {
    return ERROR_DESCRIPTIONS[code] || 'An error occurred during the OAuth process. Please try again.';
  };

  const platformName = PLATFORM_DISPLAY[errorDetails?.platform || ''] || errorDetails?.platform || 'Account';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #450a0a 40%, #0f172a 100%)',
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="space-y-6">
          {/* Error icon and title */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)' }}
              >
                <AlertCircle size={36} className="text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Connection Failed</h1>
            <p className="text-red-300 text-sm font-medium">
              {errorDetails?.message || `Failed to connect ${platformName}`}
            </p>
          </div>

          {/* Error details */}
          {errorDetails && (
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <p className="text-xs font-mono text-red-300">
                Error: <span className="font-bold">{errorDetails.code}</span>
              </p>
              <p className="text-sm text-red-200">
                {getHumanDescription(errorDetails.code)}
              </p>
            </div>
          )}

          {/* Troubleshooting tips */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <h3 className="font-semibold text-indigo-200 mb-2 text-sm">Troubleshooting Tips:</h3>
            <ul className="text-xs text-indigo-200/80 space-y-1.5">
              <li>✓ Ensure you're using the correct platform credentials</li>
              <li>✓ Clear your browser cookies and try again</li>
              <li>✓ Check that OAuth is enabled in your platform developer settings</li>
              <li>✓ Verify the redirect URI matches your platform configuration</li>
              <li>✓ Make sure you've granted all required permissions</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              id="oauth-error-back"
              onClick={() => navigate('/dashboard/accounts')}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold text-sm transition hover:bg-white/10 flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Back to Accounts
            </button>
            <button
              id="oauth-error-retry"
              onClick={() => navigate('/dashboard/accounts')}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Try Again
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Support */}
          <p className="text-center text-xs text-slate-400">
            Need help?{' '}
            <a
              href="mailto:support@weconnect.com"
              className="text-indigo-400 hover:underline font-semibold"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthErrorPage;
