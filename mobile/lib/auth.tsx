import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';

type AuthContextValue = {
  session: Session | null;
  isReady: boolean;
  isConfigured: boolean;
  error: string | null;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function authErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Impossibile completare l\'operazione.';
}

async function exchangeDeepLink(url: string) {
  if (!supabase) return;
  const parsed = Linking.parse(url);
  const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(!supabase);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    let mounted = true;
    const authListener = client.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });

    async function bootstrap() {
      try {
        const [{ data }, initialUrl] = await Promise.all([client.auth.getSession(), Linking.getInitialURL()]);
        if (initialUrl) await exchangeDeepLink(initialUrl);
        let nextSession = data.session;
        if (!nextSession) {
          const anonymous = await client.auth.signInAnonymously();
          nextSession = anonymous.data.session;
        }
        if (mounted) setSession(nextSession);
      } catch (caught) {
        if (mounted) setError(authErrorMessage(caught));
      } finally {
        if (mounted) setIsReady(true);
      }
    }

    const urlSubscription = Linking.addEventListener('url', ({ url }) => {
      exchangeDeepLink(url).catch((caught) => {
        if (mounted) setError(authErrorMessage(caught));
      });
    });
    void bootstrap();

    return () => {
      mounted = false;
      urlSubscription.remove();
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isReady,
    isConfigured: Boolean(supabase),
    error,
    async signInWithEmail(email) {
      if (!supabase) return { error: 'Supabase non è configurato per questo ambiente.' };
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        return { error: 'Inserisci un indirizzo email valido.' };
      }
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: Linking.createURL('auth/callback'),
        },
      });
      return { error: signInError?.message ?? null };
    },
    async signOut() {
      if (supabase) await supabase.auth.signOut();
    },
  }), [error, isReady, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return value;
}
