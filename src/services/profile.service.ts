import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';
import { handleSupabaseError } from '@/utils/errors';

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

// ── getProfile ────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  logger.debug('profileService.getProfile', userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    const msg = handleSupabaseError(error, 'getProfile');
    throw new Error(msg);
  }

  return data;
}

// ── updateProfile ─────────────────────────────────────────────
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile> {
  logger.debug('profileService.updateProfile', userId, updates);

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    const msg = handleSupabaseError(error, 'updateProfile');
    throw new Error(msg);
  }

  return data;
}

// ── upsertProfile ─────────────────────────────────────────────
export async function upsertProfile(profile: ProfileInsert): Promise<Profile> {
  logger.debug('profileService.upsertProfile', profile.id);

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    const msg = handleSupabaseError(error, 'upsertProfile');
    throw new Error(msg);
  }

  return data;
}
