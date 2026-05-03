import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileService from '@/services/profile.service';
import type { ProfileUpdate } from '@/services/profile.service';

// ── Query Keys ────────────────────────────────────────────────
export const profileKeys = {
  detail: (userId: string) => ['profile', userId] as const,
};

// ── useProfile ────────────────────────────────────────────────
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId ?? ''),
    queryFn: () => profileService.getProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 min — profile data rarely changes
  });
}

// ── useUpdateProfile ──────────────────────────────────────────
export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: ProfileUpdate) =>
      profileService.updateProfile(userId, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.detail(userId), updated);
    },
  });
}
