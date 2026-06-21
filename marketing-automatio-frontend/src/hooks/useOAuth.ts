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
  isRevoking: boolean;
  error: OAuthError | null;
  connectPlatform: (platform: 'facebook' | 'instagram' | 'linkedin') => Promise<void>;
  loginWithSocial: (platform: 'facebook' | 'linkedin') => Promise<void>;
  refreshConnection: (connectionId: string) => Promise<void>;
  revokeAccess: (connectionId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for OAuth flow management.
 * Handles both account-connection mode and social-login mode.
 */
export const useOAuth = (): UseOAuthReturn => {
  const [isInitiating, setIsInitiating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<OAuthError | null>(null);
  const { fetchConnections } = useConnectionsStore();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Connect a social media account for posting (mode = 'connect').
   */
  const connectPlatform = useCallback(
    async (platform: 'facebook' | 'instagram' | 'linkedin') => {
      setIsInitiating(true);
      setError(null);

      try {
        const response = await oauthService.initiateOAuth(platform, {
          mode: 'connect',
        });

        if (response.authUrl) {
          oauthService.redirectToOAuth(response.authUrl);
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

  /**
   * Log in to WeConnect using a social identity (mode = 'login').
   * Redirects user to the social platform's login page.
   */
  const loginWithSocial = useCallback(
    async (platform: 'facebook' | 'linkedin') => {
      setIsInitiating(true);
      setError(null);

      try {
        const response = await oauthService.initiateOAuth(platform, {
          mode: 'login',
        });

        if (response.authUrl) {
          oauthService.redirectToOAuth(response.authUrl);
        } else {
          setError({
            code: 'INVALID_RESPONSE',
            message: 'Invalid OAuth response from server',
          });
        }
      } catch (err: any) {
        setError({
          code: 'SOCIAL_LOGIN_ERROR',
          message: err.message || `Failed to initiate ${platform} login`,
        });
      } finally {
        setIsInitiating(false);
      }
    },
    []
  );

  /**
   * Manually refresh a connection's OAuth token.
   */
  const refreshConnection = useCallback(
    async (connectionId: string) => {
      setIsRefreshing(true);
      setError(null);

      try {
        const response = await oauthService.refreshToken(connectionId);
        if (response.success) {
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

  /**
   * Revoke OAuth access for a connection.
   * Clears stored tokens server-side and refreshes the connections list.
   */
  const revokeAccess = useCallback(
    async (connectionId: string) => {
      setIsRevoking(true);
      setError(null);

      try {
        await oauthService.revokeAccess(connectionId);
        await fetchConnections();
      } catch (err: any) {
        setError({
          code: 'REVOKE_ERROR',
          message: err.message || 'Failed to revoke access',
        });
        throw err;
      } finally {
        setIsRevoking(false);
      }
    },
    [fetchConnections]
  );

  return {
    isInitiating,
    isRefreshing,
    isRevoking,
    error,
    connectPlatform,
    loginWithSocial,
    refreshConnection,
    revokeAccess,
    clearError,
  };
};
