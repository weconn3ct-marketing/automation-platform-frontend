/**
 * useProfile — React hook for updating user profile and deleting account.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';
import { useAuthStore } from '../store/authStore';
import type { UpdateProfileInput } from '../types';

export interface UseProfileReturn {
  isUpdating: boolean;
  isDeleting: boolean;
  updateError: string | null;
  deleteError: string | null;
  /** Update firstName, lastName, or avatar */
  updateProfile: (input: UpdateProfileInput) => Promise<boolean>;
  /** Permanently delete account. Requires password. Returns true on success. */
  deleteAccount: (password: string) => Promise<boolean>;
  clearErrors: () => void;
}

export function useProfile(): UseProfileReturn {
  const queryClient = useQueryClient();
  const { setUser, logout } = useAuthStore();

  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const clearErrors = useCallback(() => {
    setUpdateError(null);
    setDeleteError(null);
  }, []);

  // ── Update profile ────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updatedUser) => {
      // Sync updated user into auth store
      setUser(updatedUser);
      // Invalidate any query that returns user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setUpdateError(null);
    },
    onError: (err: any) => {
      setUpdateError(err.message || 'Failed to update profile');
    },
  });

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<boolean> => {
      setUpdateError(null);
      try {
        await updateMutation.mutateAsync(input);
        return true;
      } catch {
        return false;
      }
    },
    [updateMutation]
  );

  // ── Delete account ────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: profileService.deleteAccount,
    onSuccess: () => {
      // Wipe all cached data and redirect to login
      queryClient.clear();
      logout();
    },
    onError: (err: any) => {
      setDeleteError(err.message || 'Failed to delete account');
    },
  });

  const deleteAccount = useCallback(
    async (password: string): Promise<boolean> => {
      setDeleteError(null);
      try {
        await deleteMutation.mutateAsync(password);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation]
  );

  return {
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError,
    deleteError,
    updateProfile,
    deleteAccount,
    clearErrors,
  };
}
