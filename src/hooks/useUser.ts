import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userService from '@/services/user.service';
import type { AppUserUpdate } from '@/services/user.service';

export const userKeys = {
  detail: (userId: string) => ['user', userId] as const,
};

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(userId ?? ''),
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: AppUserUpdate) => userService.updateUser(userId, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(userKeys.detail(userId), updated);
    },
  });
}
