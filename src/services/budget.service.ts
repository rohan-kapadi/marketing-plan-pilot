import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import type { ChannelEnum } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';
import { handleSupabaseError } from '@/utils/errors';

export type MarketingPlan = Tables<'marketing_plans'>;
export type MarketingPlanInsert = TablesInsert<'marketing_plans'>;
export type MarketingPlanUpdate = TablesUpdate<'marketing_plans'>;

export type BudgetAllocation = Tables<'budget_allocations'>;
export type BudgetAllocationInsert = TablesInsert<'budget_allocations'>;

// ── getPlans ──────────────────────────────────────────────────
export async function getPlans(businessId: string): Promise<MarketingPlan[]> {
  logger.debug('budgetService.getPlans', businessId);

  const { data, error } = await supabase
    .from('marketing_plans')
    .select('*')
    .eq('business_id', businessId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) throw new Error(handleSupabaseError(error, 'getPlans'));
  return data ?? [];
}

// ── getPlanById ───────────────────────────────────────────────
export async function getPlanById(planId: string): Promise<MarketingPlan | null> {
  logger.debug('budgetService.getPlanById', planId);

  const { data, error } = await supabase
    .from('marketing_plans')
    .select('*')
    .eq('id', planId)
    .maybeSingle();

  if (error) throw new Error(handleSupabaseError(error, 'getPlanById'));
  return data;
}

// ── createPlan ────────────────────────────────────────────────
export async function createPlan(plan: MarketingPlanInsert): Promise<MarketingPlan> {
  logger.debug('budgetService.createPlan', plan);

  const { data, error } = await supabase
    .from('marketing_plans')
    .insert(plan)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error, 'createPlan'));
  return data;
}

// ── updatePlan ────────────────────────────────────────────────
export async function updatePlan(planId: string, updates: MarketingPlanUpdate): Promise<MarketingPlan> {
  logger.debug('budgetService.updatePlan', planId, updates);

  const { data, error } = await supabase
    .from('marketing_plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error, 'updatePlan'));
  return data;
}

// ── deletePlan ────────────────────────────────────────────────
export async function deletePlan(planId: string): Promise<void> {
  logger.debug('budgetService.deletePlan', planId);

  const { error } = await supabase
    .from('marketing_plans')
    .delete()
    .eq('id', planId);

  if (error) throw new Error(handleSupabaseError(error, 'deletePlan'));
}

// ── getAllocations (by business_id) ───────────────────────────
export async function getAllocations(businessId: string): Promise<BudgetAllocation[]> {
  logger.debug('budgetService.getAllocations', businessId);

  const { data, error } = await supabase
    .from('budget_allocations')
    .select('*')
    .eq('business_id', businessId);

  if (error) throw new Error(handleSupabaseError(error, 'getAllocations'));
  return data ?? [];
}

// ── upsertAllocations ─────────────────────────────────────────
// Upserts channel allocations for a business.
// percentages should sum to 100; allocated_amount = percentage * monthly_budget / 100
export async function upsertAllocations(
  businessId: string,
  monthlyBudget: number,
  allocations: Partial<Record<ChannelEnum, number>> // channel → percentage
): Promise<BudgetAllocation[]> {
  logger.debug('budgetService.upsertAllocations', businessId, allocations);

  const rows: BudgetAllocationInsert[] = Object.entries(allocations).map(
    ([channel, pct]) => ({
      business_id: businessId,
      channel: channel as ChannelEnum,
      percentage: pct ?? 0,
      allocated_amount: Math.round(((pct ?? 0) / 100) * monthlyBudget * 100) / 100,
    })
  );

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from('budget_allocations')
    .upsert(rows, { onConflict: 'business_id,channel' })
    .select();

  if (error) throw new Error(handleSupabaseError(error, 'upsertAllocations'));
  return data ?? [];
}

// ── allocationsToPercentageMap ────────────────────────────────
export function allocationsToPercentageMap(
  rows: BudgetAllocation[]
): Partial<Record<ChannelEnum, number>> {
  return Object.fromEntries(rows.map((r) => [r.channel, r.percentage]));
}

// ── allocationsToAmountMap ────────────────────────────────────
export function allocationsToAmountMap(
  rows: BudgetAllocation[]
): Partial<Record<ChannelEnum, number>> {
  return Object.fromEntries(rows.map((r) => [r.channel, r.allocated_amount]));
}

// ── planMonthLabel ────────────────────────────────────────────
export function planMonthLabel(plan: MarketingPlan): string {
  const date = new Date(plan.year, plan.month - 1, 1);
  return date.toLocaleString('en', { month: 'long', year: 'numeric' });
}
