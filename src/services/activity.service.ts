import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import type { ChannelEnum, ActivityStatusEnum } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';
import { handleSupabaseError } from '@/utils/errors';

export type Activity = Tables<'activities'>;
export type ActivityInsert = TablesInsert<'activities'>;
export type ActivityUpdate = TablesUpdate<'activities'>;

export interface ActivityFilters {
  channel?: ChannelEnum;
  status?: ActivityStatusEnum;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ActivitySort {
  column: keyof Activity;
  ascending: boolean;
}

// ── getActivities ─────────────────────────────────────────────
export async function getActivities(
  planId: string,
  filters?: ActivityFilters,
  sort?: ActivitySort,
  page = 0,
  pageSize = 20
): Promise<{ data: Activity[]; count: number }> {
  logger.debug('activityService.getActivities', planId, filters);

  let query = supabase
    .from('activities')
    .select('*', { count: 'exact' })
    .eq('plan_id', planId);

  if (filters?.channel) query = query.eq('channel', filters.channel);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.dateFrom) query = query.gte('activity_date', filters.dateFrom);
  if (filters?.dateTo) query = query.lte('activity_date', filters.dateTo);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

  const col = sort?.column ?? 'activity_date';
  const asc = sort?.ascending ?? true;
  query = query.order(col as string, { ascending: asc });
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(handleSupabaseError(error, 'getActivities'));
  return { data: data ?? [], count: count ?? 0 };
}

// ── getActivityById ───────────────────────────────────────────
export async function getActivityById(id: string): Promise<Activity | null> {
  logger.debug('activityService.getActivityById', id);

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(handleSupabaseError(error, 'getActivityById'));
  return data;
}

// ── createActivity ────────────────────────────────────────────
export async function createActivity(activity: ActivityInsert): Promise<Activity> {
  logger.debug('activityService.createActivity', activity);

  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error, 'createActivity'));
  return data;
}

// ── updateActivity ────────────────────────────────────────────
export async function updateActivity(id: string, updates: ActivityUpdate): Promise<Activity> {
  logger.debug('activityService.updateActivity', id, updates);

  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error, 'updateActivity'));
  return data;
}

// ── deleteActivity ────────────────────────────────────────────
export async function deleteActivity(id: string): Promise<void> {
  logger.debug('activityService.deleteActivity', id);

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) throw new Error(handleSupabaseError(error, 'deleteActivity'));
}

// ── toggleActivityStatus ──────────────────────────────────────
export async function toggleActivityStatus(
  id: string,
  currentStatus: ActivityStatusEnum
): Promise<Activity> {
  const newStatus: ActivityStatusEnum = currentStatus === 'Planned' ? 'Completed' : 'Planned';
  return updateActivity(id, { status: newStatus });
}
