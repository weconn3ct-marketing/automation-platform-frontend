import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Container } from '../../components/ui/Container';

interface OAuthErrorDetails {
  code: string;
  message: string;
  details?: string;
}

export const OAuthErrorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<OAuthErrorDetails | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const details = searchParams.get('details');
    const platform = searchParams.get('platform');

    if (error) {
      setErrorDetails({
        code: error,
        message: message || `Failed to connect ${platform || 'account'}`,
        details: details || undefined,
      });
    } else {
      setErrorDetails({
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred during OAuth connection',
      });
    }
  }, [searchParams]);

  const getErrorDescription = (code: string): string => {
    const descriptions: Record<string, string> = {
      INVALID_STATE: 'The security token is invalid. This may happen if you waited too long. Please try again.',
      TOKEN_EXCHANGE_FAILED:
        'Failed to exchange authorization code for access token. The app credentials may be incorrect.',
      USER_INFO_FETCH_FAILED:
        'Connected but failed to fetch account information. Please check your account settings.',
      CSRF_FAILED: 'Security validation failed. Please clear your cookies and try again.',
      RATE_LIMITED: 'Too many login attempts. Please wait a few minutes before trying again.',
      USER_DENIED: 'You denied permission. Please authorize the app to continue.',
      ACCESS_DENIED: 'You do not have permission to connect this account.',
      INVALID_PLATFORM: 'The platform is not supported or is not configured properly.',
      DATABASE_ERROR: 'Server error while saving your connection. Please try again.',
    };

    return descriptions[code] || 'An error occurred during the OAuth process.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Container maxWidth="md">
        <Card className="p-8">
          <div className="space-y-6">
            {/* Error Icon & Title */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <AlertCircle size={48} className="text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Connection Failed</h1>
              <p className="text-lg text-red-600 font-semibold">
                {errorDetails?.message || 'OAuth connection error'}
              </p>
            </div>

            {/* Error Code */}
            {errorDetails && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-mono text-red-800">
                  Error Code: <strong>{errorDetails.code}</strong>
                </p>
                <p className="text-sm text-red-700">
                  {getErrorDescription(errorDetails.code)}
                </p>
                {errorDetails.details && (
                  <p className="text-xs text-red-600 mt-2 p-2 bg-white rounded border border-red-100">
                    Details: {errorDetails.details}
                  </p>
                )}
              </div>
            )}

            {/* Troubleshooting Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Troubleshooting Tips:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Make sure you&apos;re using the correct platform credentials</li>
                <li>✓ Clear your browser cookies and try again</li>
                <li>✓ Check that OAuth is enabled in your platform settings</li>
                <li>✓ Verify redirect URI matches your platform configuration</li>
                <li>✓ If using a proxy, ensure it&apos;s configured correctly</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => navigate('/dashboard/accounts')}
                className="flex-1 bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Accounts
              </button>
              <button
                onClick={() => navigate('/dashboard/accounts')}
                className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                Try Again
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Support Link */}
            <p className="text-center text-sm text-gray-600">
              Need help?{' '}
              <a
                href="mailto:support@weconnect.com"
                className="text-indigo-600 hover:underline font-semibold"
              >
                Contact Support
              </a>
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default OAuthErrorPage;
