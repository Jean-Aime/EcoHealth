import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AdminState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'signed-out' }
  | { status: 'no-access'; email: string }
  | { status: 'ready'; email: string };

async function resolveAdmin(session: Session | null): Promise<AdminState> {
  if (!supabase) return { status: 'unavailable' };
  if (!session) return { status: 'signed-out' };

  const email = session.user.email ?? '';
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) return { status: 'unavailable' };
  return data ? { status: 'ready', email } : { status: 'no-access', email };
}

export function useAdminSession() {
  const [state, setState] = useState<AdminState>({ status: 'loading' });

  useEffect(() => {
    if (!supabase) {
      setState({ status: 'unavailable' });
      return;
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setState(await resolveAdmin(session));
      })();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'The sign-in service is not connected for this website.';

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return null;
    if (error.status === undefined || error.status === 0) {
      return 'We could not reach the sign-in service. Check your connection and try again.';
    }
    return 'That email and password do not match a staff account.';
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return { state, signIn, signOut };
}
