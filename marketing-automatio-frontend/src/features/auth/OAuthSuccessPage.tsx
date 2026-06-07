import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Container } from '../../components/ui/Container';
import type { Connection } from '../../types';
import { oauthService } from '../../services/oauthService';

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

      setConnection({
        id: callback.connectionId,
        platform: callback.platform as Connection['platform'],
        status: 'connected',
        accountName: searchParams.get('accountName') || `${callback.platform} account`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Container maxWidth="md">
        <Card className="p-8 text-center">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 size={48} className="text-indigo-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Completing Connection...
              </h1>
              <p className="text-gray-600">
                Please wait while we finalize your social media connection
              </p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <AlertCircle size={48} className="text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Connection Failed
              </h1>
              <p className="text-red-600 mb-6">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dashboard/accounts')}
                  className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Accounts
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : connection ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 size={48} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Connection Successful!
              </h1>
              <p className="text-gray-600 mb-4">
                Your {connection.platform} account <strong>{connection.accountName}</strong> has been
                connected successfully.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ OAuth token secured and stored
                </p>
                <p className="text-sm text-green-800">
                  ✓ You can now post to {connection.platform}
                </p>
                <p className="text-sm text-green-800">
                  ✓ Auto-redirecting to accounts dashboard...
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Redirecting in a few seconds...
              </p>
            </div>
          ) : null}
        </Card>
      </Container>
    </div>
  );
};

export default OAuthSuccessPage;
