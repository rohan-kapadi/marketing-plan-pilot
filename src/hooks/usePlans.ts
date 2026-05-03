import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as budgetService from '@/services/budget.service';
import type { MarketingPlanInsert, MarketingPlanUpdate } from '@/services/budget.service';
import type { ChannelEnum } from '@/integrations/supabase/types';

export const planKeys = {
  all: (businessId: string) => ['plans', businessId] as const,
  detail: (planId: string) => ['plans', 'detail', planId] as const,
  allocations: (businessId: string) => ['allocations', businessId] as const,
};

// ── usePlans ──────────────────────────────────────────────────
export function usePlans(businessId: string | undefined) {
  return useQuery({
    queryKey: planKeys.all(businessId ?? ''),
    queryFn: () => budgetService.getPlans(businessId!),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
  });
}

// ── usePlan ───────────────────────────────────────────────────
export function usePlan(planId: string | undefined) {
  return useQuery({
    queryKey: planKeys.detail(planId ?? ''),
    queryFn: () => budgetService.getPlanById(planId!),
    enabled: !!planId,
    staleTime: 1000 * 60 * 5,
  });
}

// ── useAllocations (business-level) ───────────────────────────
export function useAllocations(businessId: string | undefined) {
  return useQuery({
    queryKey: planKeys.allocations(businessId ?? ''),
    queryFn: async () => {
      const rows = await budgetService.getAllocations(businessId!);
      return {
        rows,
        percentages: budgetService.allocationsToPercentageMap(rows),
        amounts: budgetService.allocationsToAmountMap(rows),
      };
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
  });
}

// ── useCreatePlan ─────────────────────────────────────────────
export function useCreatePlan(businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarketingPlanInsert) => budgetService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(businessId) });
    },
  });
}

// ── useUpdatePlan ─────────────────────────────────────────────
export function useUpdatePlan(businessId: string, planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarketingPlanUpdate) => budgetService.updatePlan(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(businessId) });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) });
    },
  });
}

// ── useDeletePlan ─────────────────────────────────────────────
export function useDeletePlan(businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => budgetService.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(businessId) });
    },
  });
}

// ── useUpsertAllocations ──────────────────────────────────────
export function useUpsertAllocations(businessId: string, monthlyBudget: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (allocations: Partial<Record<ChannelEnum, number>>) =>
      budgetService.upsertAllocations(businessId, monthlyBudget, allocations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.allocations(businessId) });
    },
  });
}
