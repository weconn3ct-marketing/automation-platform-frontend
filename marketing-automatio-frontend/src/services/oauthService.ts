import { api } from './apiClient';
import type { ApiResponse } from '../types';

// ─── Inner data shapes (what lives in ApiResponse<T>.data) ───────────────────

export interface OAuthAuthorizeData {
  authUrl: string;
  state: string;
  mode: 'connect' | 'login';
}

export interface OAuthCallbackData {
  connectionId: string;
  platform: string;
  accountName: string;
  status: string;
}

export interface OAuthRefreshData {
  expiresAt: string;
}

// ─── Full response wrappers (for consumers that need the outer shape) ─────────

export type OAuthAuthorizeResponse = ApiResponse<OAuthAuthorizeData>;
export type OAuthCallbackResponse = ApiResponse<OAuthCallbackData>;
export type OAuthRefreshResponse = ApiResponse<OAuthRefreshData>;

// ─── Options ──────────────────────────────────────────────────────────────────

export interface OAuthInitiateOptions {
  redirectUri?: string;
  /** 'connect' = link account for posting, 'login' = social sign-in to the app */
  mode?: 'connect' | 'login';
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * OAuth Service — Handles OAuth 2.0 flow for social platforms.
 *
 * Note on the api helper:
 *   api.post<T>() calls apiRequest<T>() which calls axios and returns
 *   `response.data` — the parsed JSON body which is an ApiResponse<T>:
 *   { success: boolean; data: T; message?: string }
 *
 *   So api.post<T>() returns Promise<ApiResponse<T>>.
 *   To get the inner payload, access .data on the result.
 */
export const oauthService = {
  /**
   * Initiate OAuth authorization flow.
   * Returns the inner data shape { authUrl, state, mode } directly.
   */
  initiateOAuth: async (
    platform: 'facebook' | 'instagram' | 'linkedin',
    options: OAuthInitiateOptions = {}
  ): Promise<OAuthAuthorizeData> => {
    const res: ApiResponse<OAuthAuthorizeData> = await api.post<OAuthAuthorizeData>(
      `/oauth/authorize/${platform}`,
      {
        mode: options.mode || 'connect',
        redirectUri: options.redirectUri,
      }
    );
    return res.data;
  },

  /**
   * Retrieve connection status by connection ID.
   */
  handleCallback: async (connectionId: string): Promise<OAuthCallbackData> => {
    const res: ApiResponse<OAuthCallbackData> = await api.get<OAuthCallbackData>(
      `/connections/${connectionId}`
    );
    return res.data;
  },

  /**
   * Manually refresh an OAuth token.
   */
  refreshToken: async (connectionId: string): Promise<{ success: boolean; data: OAuthRefreshData }> => {
    const res: ApiResponse<OAuthRefreshData> = await api.post<OAuthRefreshData>(
      `/oauth/refresh/${connectionId}`
    );
    return { success: res.success, data: res.data };
  },

  /**
   * Revoke OAuth access — clears stored tokens, marks connection disconnected.
   */
  revokeAccess: async (connectionId: string): Promise<{ success: boolean; message: string }> => {
    const res: ApiResponse<{ message: string }> = await api.post<{ message: string }>(
      `/oauth/revoke/${connectionId}`
    );
    return { success: res.success, message: res.data?.message || 'Access revoked' };
  },

  /**
   * Redirect the user's browser to the OAuth provider authorization page.
   */
  redirectToOAuth: (authUrl: string): void => {
    window.location.href = authUrl;
  },

  /**
   * Check if current URL params represent a successful OAuth connection callback.
   */
  isOAuthCallback: (
    searchParams: URLSearchParams
  ): { platform: string; connectionId: string } | null => {
    const connectionId = searchParams.get('connectionId');
    const platform = searchParams.get('platform');
    if (connectionId && platform) {
      return { connectionId, platform };
    }
    return null;
  },

  /**
   * Check if current URL params represent an OAuth error.
   */
  isOAuthError: (
    searchParams: URLSearchParams
  ): { error: string; message: string } | null => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error) {
      return { error, message: message || 'Unknown OAuth error' };
    }
    return null;
  },
};
