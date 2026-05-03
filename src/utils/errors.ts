import type { AuthError } from '@supabase/supabase-js';
import { logger } from './logger';

// Supabase Postgres error codes → human-readable messages
const PG_ERROR_MESSAGES: Record<string, string> = {
  '23505': 'A record with this value already exists.',
  '23503': 'This record references a value that does not exist.',
  '23514': 'The value does not meet the required constraints.',
  '42501': 'You do not have permission to perform this action.',
  'PGRST116': 'No records found.',
  'PGRST204': 'Column does not exist.',
};

// Supabase Auth error codes → human-readable messages
// These come from the `code` field on AuthError / AuthApiError objects
const AUTH_CODE_MESSAGES: Record<string, string> = {
  'email_address_invalid':
    'This email address is not accepted. Please use a personal email (e.g. yourname@gmail.com). Role-based prefixes like "admin", "root", or "noreply" are blocked by the auth provider.',
  'email_address_not_authorized':
    'This email domain is not authorized. Please use a different email address.',
  'invalid_credentials': 'Invalid email or password.',
  'email_not_confirmed':
    'Please check your inbox and confirm your email before signing in.',
  'user_already_exists': 'An account with this email already exists. Try signing in.',
  'weak_password': 'Password is too weak. Use at least 6 characters.',
  'over_email_send_rate_limit':
    'Email send limit reached (Supabase free tier: 2 emails/hour per project). To fix: go to Supabase Dashboard → Authentication → Email → turn OFF "Confirm email". You can then sign up without email verification.',
  'over_request_rate_limit':
    'Too many requests to the auth server. Please wait a moment and try again.',
  'session_not_found': 'Your session has expired. Please sign in again.',
  'flow_state_expired': 'The sign-in link has expired. Please request a new one.',
};

export function handleSupabaseError(
  error: AuthError | Error | unknown,
  context?: string
): string {
  const ctx = context ? `[${context}] ` : '';

  if (!error) return 'An unknown error occurred.';

  if (typeof error !== 'object' || error === null) {
    logger.error(`${ctx}Unknown error`, error);
    return 'An unexpected error occurred. Please try again.';
  }

  const e = error as Record<string, unknown>;

  // ── Supabase AuthApiError: has both `code` and `message` ──
  if ('code' in e && typeof e.code === 'string') {
    const code = e.code as string;
    const message = (e.message as string) ?? '';

    // Auth error code takes priority
    if (AUTH_CODE_MESSAGES[code]) {
      logger.error(`${ctx}Supabase Auth error [${code}]`, message);
      return AUTH_CODE_MESSAGES[code];
    }

    // Postgres error code
    if (PG_ERROR_MESSAGES[code]) {
      logger.error(`${ctx}Supabase DB error [${code}]`, message);
      return PG_ERROR_MESSAGES[code];
    }

    // Fallback: try to map the message string
    logger.error(`${ctx}Supabase error [${code}]`, message);
    return mapAuthMessageString(message) || message || 'An error occurred. Please try again.';
  }

  // ── Plain Error with only `message` ──
  if ('message' in e && typeof e.message === 'string') {
    logger.error(`${ctx}Error`, e.message);
    return mapAuthMessageString(e.message) || e.message;
  }

  logger.error(`${ctx}Unknown error`, error);
  return 'An unexpected error occurred. Please try again.';
}

/** Heuristic mapping for Auth error messages when no error code is present */
function mapAuthMessageString(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'Invalid email or password.';
  if (m.includes('email not confirmed'))
    return 'Please check your inbox and confirm your email before signing in.';
  if (m.includes('user already registered') || m.includes('user_already_exists'))
    return 'An account with this email already exists. Try signing in.';
  if (m.includes('password should be at least') || m.includes('weak_password'))
    return 'Password must be at least 6 characters.';
  if (m.includes('rate limit'))
    return 'Too many attempts. Please wait a moment and try again.';
  if (m.includes('network'))
    return 'Network error. Please check your connection.';
  if (m.includes('email_address_invalid') || m.includes('email address') && m.includes('invalid'))
    return AUTH_CODE_MESSAGES['email_address_invalid'];
  return '';
}
