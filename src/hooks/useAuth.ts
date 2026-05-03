import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import * as authService from '@/services/auth.service';
import { logger } from '@/utils/logger';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Reactive hook that tracks Supabase auth state across the app.
 * Subscribe to real-time session changes via onAuthStateChange.
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session synchronously
    authService.getSession().then((s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      logger.debug('useAuth: initial session', s?.user?.id ?? 'none');
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        logger.debug('useAuth: auth state change', _event, s?.user?.id ?? 'none');
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}
