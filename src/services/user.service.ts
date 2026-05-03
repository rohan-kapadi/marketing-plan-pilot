import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';
import { handleSupabaseError } from '@/utils/errors';

export type AppUser = Tables<'users'>;
export type AppUserInsert = TablesInsert<'users'>;
export type AppUserUpdate = TablesUpdate<'users'>;

// ── getUser ───────────────────────────────────────────────────
export async function getUser(userId: string): Promise<AppUser | null> {
  logger.debug('userService.getUser', userId);

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(handleSupabaseError(error, 'getUser'));
  return data;
}

// ── updateUser ────────────────────────────────────────────────
export async function updateUser(userId: string, updates: AppUserUpdate): Promise<AppUser> {
  logger.debug('userService.updateUser', userId, updates);

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error, 'updateUser'));
  return data;
}

// ── upsertUser ────────────────────────────────────────────────
export async function upsertUser(user: AppUserInsert): Promise<AppUser> {
  logger.debug('userService.upsertUser', user.id);

  const { data, error } = await supabase
    .from('users')
    .upsert(user, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error, 'upsertUser'));
  return data;
}
