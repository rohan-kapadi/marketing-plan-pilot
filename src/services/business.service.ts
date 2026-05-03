import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';
import { handleSupabaseError } from '@/utils/errors';

export type Business = Tables<'businesses'>;
export type BusinessInsert = TablesInsert<'businesses'>;
export type BusinessUpdate = TablesUpdate<'businesses'>;

// ── getBusinesses ─────────────────────────────────────────────
export async function getBusinesses(userId: string): Promise<Business[]> {
  logger.debug('businessService.getBusinesses', userId);

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(handleSupabaseError(error, 'getBusinesses'));
  return data ?? [];
}

// ── getBusinessById ───────────────────────────────────────────
export async function getBusinessById(businessId: string): Promise<Business | null> {
  logger.debug('businessService.getBusinessById', businessId);

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .maybeSingle();

  if (error) throw new Error(handleSupabaseError(error, 'getBusinessById'));
  return data;
}

// ── createBusiness ────────────────────────────────────────────
export async function createBusiness(business: BusinessInsert): Promise<Business> {
  logger.debug('businessService.createBusiness', business);

  const { data, error } = await supabase
    .from('businesses')
    .insert(business)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error, 'createBusiness'));
  return data;
}

// ── updateBusiness ────────────────────────────────────────────
export async function updateBusiness(businessId: string, updates: BusinessUpdate): Promise<Business> {
  logger.debug('businessService.updateBusiness', businessId, updates);

  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', businessId)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error, 'updateBusiness'));
  return data;
}

// ── deleteBusiness ────────────────────────────────────────────
export async function deleteBusiness(businessId: string): Promise<void> {
  logger.debug('businessService.deleteBusiness', businessId);

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', businessId);

  if (error) throw new Error(handleSupabaseError(error, 'deleteBusiness'));
}
