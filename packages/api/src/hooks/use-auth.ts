import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, AuthProvider, OAuthProvider } from '@cg/shared';
import { signInWithOAuth, signInWithPassword, signOut as authSignOut, getSession, onAuthStateChange } from '../supabase/auth';

interface UseAuthReturn {
  user: UserProfile | null;
  loading: boolean;
  signIn: (provider: OAuthProvider) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then(({ data }) => {
        if (data.session?.user) {
          const u = data.session.user;
          setUser({
            id: u.id,
            email: u.email,
            display_name: u.user_metadata?.full_name ?? u.user_metadata?.name,
            avatar_url: u.user_metadata?.avatar_url,
            provider: u.app_metadata?.provider as AuthProvider | undefined,
            free_analyses_remaining: 0, // fetched separately
            created_at: u.created_at,
            updated_at: u.updated_at ?? u.created_at,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("[Auth] Failed to get session:", err);
        setLoading(false);
      });

    const { data: subscription } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      }
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (provider: OAuthProvider) => {
    await signInWithOAuth(provider);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { data, error } = await signInWithPassword(email, password);
    if (error) throw error;
    if (data.session?.user) {
      const u = data.session.user;
      setUser({
        id: u.id,
        email: u.email,
        display_name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? 'Test User',
        avatar_url: u.user_metadata?.avatar_url,
        provider: 'email',
        free_analyses_remaining: 0,
        created_at: u.created_at,
        updated_at: u.updated_at ?? u.created_at,
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  return { user, loading, signIn, signInWithEmail, signOut };
}
