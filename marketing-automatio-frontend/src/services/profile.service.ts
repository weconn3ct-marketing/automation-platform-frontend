/**
 * Profile Service
 * Wraps user profile management endpoints.
 */

import { api } from './apiClient';
import type { User, UpdateProfileInput } from '../types';

export const profileService = {
  /**
   * PATCH /api/auth/profile
   * Update authenticated user's profile fields.
   */
  updateProfile: async (input: UpdateProfileInput) => {
    const response = await api.patch<User>('/auth/profile', input);
    return response.data;
  },

  /**
   * DELETE /api/auth/account
   * Permanently delete the authenticated user's account.
   * Requires password confirmation.
   */
  deleteAccount: async (password: string) => {
    const response = await api.delete<null>('/auth/account', {
      data: { password },
    });
    return response.data;
  },
};
