import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { handleSupabaseError } from '@/utils/errors';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// ── signUp ────────────────────────────────────────────────────
export async function signUp({ email, password, fullName, companyName }: SignUpData) {
  logger.info('authService.signUp', email);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName ?? null,
      },
    },
  });

  if (error) {
    const msg = handleSupabaseError(error, 'signUp');
    throw new Error(msg);
  }

  logger.info('signUp success', data.user?.id);
  return data;
}

// ── signIn ────────────────────────────────────────────────────
export async function signIn({ email, password }: SignInData) {
  logger.info('authService.signIn', email);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const msg = handleSupabaseError(error, 'signIn');
    throw new Error(msg);
  }

  logger.info('signIn success', data.user?.id);
  return data;
}

// ── signOut ───────────────────────────────────────────────────
export async function signOut() {
  logger.info('authService.signOut');

  const { error } = await supabase.auth.signOut();

  if (error) {
    const msg = handleSupabaseError(error, 'signOut');
    throw new Error(msg);
  }
}

// ── getSession ────────────────────────────────────────────────
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    logger.warn('getSession error', error);
    return null;
  }

  return data.session;
}

// ── getCurrentUser ────────────────────────────────────────────
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

// ── onAuthStateChange ─────────────────────────────────────────
export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]
) {
  return supabase.auth.onAuthStateChange(callback);
}

// ── resetPassword ─────────────────────────────────────────────
export async function resetPassword(email: string) {
  logger.info('authService.resetPassword', email);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    const msg = handleSupabaseError(error, 'resetPassword');
    throw new Error(msg);
  }
}
