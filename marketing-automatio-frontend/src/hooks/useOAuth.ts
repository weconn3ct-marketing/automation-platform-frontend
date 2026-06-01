import { useState, useCallback } from 'react';
import { oauthService } from '../services/oauthService';
import { useConnectionsStore } from '../store/connectionsStore';

export interface OAuthError {
  code: string;
  message: string;
}

export interface UseOAuthReturn {
  isInitiating: boolean;
  isRefreshing: boolean;
  error: OAuthError | null;
  connectPlatform: (platform: 'facebook' | 'instagram' | 'linkedin') => Promise<void>;
  refreshConnection: (connectionId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for OAuth flow management
 */
export const useOAuth = (): UseOAuthReturn => {
  const [isInitiating, setIsInitiating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<OAuthError | null>(null);
  const { fetchConnections } = useConnectionsStore();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const connectPlatform = useCallback(
    async (platform: 'facebook' | 'instagram' | 'linkedin') => {
      setIsInitiating(true);
      setError(null);

      try {
        const response = await oauthService.initiateOAuth(platform);

        if (response.success && response.data.authUrl) {
          // Redirect to OAuth provider
          oauthService.redirectToOAuth(response.data.authUrl);
        } else {
          setError({
            code: 'INVALID_RESPONSE',
            message: 'Invalid OAuth response from server',
          });
        }
      } catch (err: any) {
        setError({
          code: 'INITIATION_ERROR',
          message: err.message || `Failed to connect to ${platform}`,
        });
      } finally {
        setIsInitiating(false);
      }
    },
    []
  );

  const refreshConnection = useCallback(
    async (connectionId: string) => {
      setIsRefreshing(true);
      setError(null);

      try {
        const response = await oauthService.refreshToken(connectionId);

        if (response.success) {
          // Refresh connections list
          await fetchConnections();
        } else {
          setError({
            code: 'REFRESH_ERROR',
            message: 'Failed to refresh token',
          });
        }
      } catch (err: any) {
        setError({
          code: 'REFRESH_ERROR',
          message: err.message || 'Failed to refresh connection',
        });
      } finally {
        setIsRefreshing(false);
      }
    },
    [fetchConnections]
  );

  return {
    isInitiating,
    isRefreshing,
    error,
    connectPlatform,
    refreshConnection,
    clearError,
  };
};
