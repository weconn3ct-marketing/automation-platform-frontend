import { api } from './apiClient';

export interface OAuthAuthorizeResponse {
  success: boolean;
  data: {
    authUrl: string;
    state: string;
    mode: 'connect' | 'login';
  };
}

export interface OAuthInitiateOptions {
  redirectUri?: string;
  /** 'connect' = link account for posting, 'login' = social sign-in to the app */
  mode?: 'connect' | 'login';
}

export interface OAuthCallbackResponse {
  success: boolean;
  data: {
    connectionId: string;
    platform: string;
    accountName: string;
    status: string;
  };
}

export interface OAuthRefreshResponse {
  success: boolean;
  data: {
    expiresAt: string;
  };
}

/**
 * OAuth Service — Handles OAuth 2.0 flow for social platforms.
 */
export const oauthService = {
  /**
   * Initiate OAuth authorization flow.
   * @param platform  'facebook' | 'instagram' | 'linkedin'
   * @param options   mode ('connect' | 'login') and optional redirectUri
   * @returns Authorization URL and CSRF state token
   */
  initiateOAuth: async (
    platform: 'facebook' | 'instagram' | 'linkedin',
    options: OAuthInitiateOptions = {}
  ) => {
    try {
      const response = await api.post<OAuthAuthorizeResponse>(
        `/oauth/authorize/${platform}`,
        {
          mode: options.mode || 'connect',
          redirectUri: options.redirectUri,
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || `Failed to initiate ${platform} OAuth`);
    }
  },

  /**
   * Handle OAuth callback (frontend redirects here after platform authorization).
   * Backend handles the actual callback, frontend just checks status.
   */
  handleCallback: async (connectionId: string) => {
    try {
      const response = await api.get<OAuthCallbackResponse>(
        `/connections/${connectionId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to retrieve connection');
    }
  },

  /**
   * Refresh OAuth token.
   * @param connectionId  ID of the connection to refresh
   */
  refreshToken: async (connectionId: string) => {
    try {
      const response = await api.post<OAuthRefreshResponse>(
        `/oauth/refresh/${connectionId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to refresh token');
    }
  },

  /**
   * Revoke OAuth access for a connection.
   * Clears stored tokens and marks the connection as disconnected.
   * @param connectionId  ID of the connection to revoke
   */
  revokeAccess: async (connectionId: string) => {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        `/oauth/revoke/${connectionId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to revoke access');
    }
  },

  /**
   * Redirect the user's browser to the OAuth provider.
   */
  redirectToOAuth: (authUrl: string) => {
    window.location.href = authUrl;
  },

  /**
   * Check if current URL is an OAuth connection callback.
   */
  isOAuthCallback: (searchParams: URLSearchParams): { platform: string; connectionId: string } | null => {
    const connectionId = searchParams.get('connectionId');
    const platform = searchParams.get('platform');
    if (connectionId && platform) {
      return { connectionId, platform };
    }
    return null;
  },

  /**
   * Check if current URL is an OAuth error.
   */
  isOAuthError: (searchParams: URLSearchParams): { error: string; message: string } | null => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error) {
      return { error, message: message || 'Unknown OAuth error' };
    }
    return null;
  },
};
