import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as businessService from '@/services/business.service';
import type { BusinessInsert, BusinessUpdate } from '@/services/business.service';

export const businessKeys = {
  all: (userId: string) => ['businesses', userId] as const,
  detail: (businessId: string) => ['businesses', 'detail', businessId] as const,
};

export function useBusinesses(userId: string | undefined) {
  return useQuery({
    queryKey: businessKeys.all(userId ?? ''),
    queryFn: () => businessService.getBusinesses(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBusiness(businessId: string | undefined) {
  return useQuery({
    queryKey: businessKeys.detail(businessId ?? ''),
    queryFn: () => businessService.getBusinessById(businessId!),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateBusiness(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BusinessInsert) => businessService.createBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.all(userId) });
    },
  });
}

export function useUpdateBusiness(userId: string, businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BusinessUpdate) => businessService.updateBusiness(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.all(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.detail(businessId) });
    },
  });
}

export function useDeleteBusiness(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (businessId: string) => businessService.deleteBusiness(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.all(userId) });
    },
  });
}
