import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as activityService from '@/services/activity.service';
import type {
  ActivityInsert,
  ActivityUpdate,
  ActivityFilters,
  ActivitySort,
} from '@/services/activity.service';

export const activityKeys = {
  all: (planId: string) => ['activities', planId] as const,
  filtered: (planId: string, filters?: ActivityFilters, sort?: ActivitySort, page?: number) =>
    ['activities', planId, { filters, sort, page }] as const,
  detail: (id: string) => ['activities', 'detail', id] as const,
};

export function useActivities(
  planId: string | undefined,
  filters?: ActivityFilters,
  sort?: ActivitySort,
  page = 0,
  pageSize = 20
) {
  return useQuery({
    queryKey: activityKeys.filtered(planId ?? '', filters, sort, page),
    queryFn: () => activityService.getActivities(planId!, filters, sort, page, pageSize),
    enabled: !!planId,
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}

export function useActivity(id: string | undefined) {
  return useQuery({
    queryKey: activityKeys.detail(id ?? ''),
    queryFn: () => activityService.getActivityById(id!),
    enabled: !!id,
  });
}

export function useCreateActivity(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ActivityInsert) => activityService.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(planId) });
    },
  });
}

export function useUpdateActivity(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActivityUpdate }) =>
      activityService.updateActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(planId) });
    },
  });
}

export function useDeleteActivity(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activityService.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(planId) });
    },
  });
}

export function useToggleActivityStatus(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Planned' | 'Completed' }) =>
      activityService.toggleActivityStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(planId) });
    },
  });
}
