import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, AuthProvider, OAuthProvider } from '@cg/shared';
import { signInWithOAuth, signInWithPassword, signOut as authSignOut, getSession, onAuthStateChange } from '../supabase/auth';
import { getSupabaseConfig } from '../supabase/config';
import { createBrowserClient } from '@supabase/ssr';

interface UseAuthReturn {
  user: UserProfile | null;
  loading: boolean;
  signIn: (provider: OAuthProvider) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

async function fetchProfile(userId: string): Promise<{ free_analyses_remaining: number }> {
  try {
    const config = getSupabaseConfig();
    const client = createBrowserClient(config.url, config.anonKey);
    const { data } = await client
      .from('profiles')
      .select('free_analyses_remaining')
      .eq('id', userId)
      .single();
    return { free_analyses_remaining: data?.free_analyses_remaining ?? 0 };
  } catch {
    return { free_analyses_remaining: 0 };
  }
}

function buildUserProfile(
  u: { id: string; email?: string; created_at: string; updated_at?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> },
  freeRemaining: number,
  provider?: AuthProvider,
): UserProfile {
  return {
    id: u.id,
    email: u.email,
    display_name: (u.user_metadata?.full_name ?? u.user_metadata?.name) as string | undefined,
    avatar_url: u.user_metadata?.avatar_url as string | undefined,
    provider: provider ?? u.app_metadata?.provider as AuthProvider | undefined,
    free_analyses_remaining: freeRemaining,
    created_at: u.created_at,
    updated_at: u.updated_at ?? u.created_at,
  };
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session check — set user immediately, fetch profile in background
    getSession()
      .then(({ data }) => {
        if (data.session?.user) {
          const u = data.session.user;
          // Show user immediately with default profile
          setUser(buildUserProfile(u, 0));
          setLoading(false);
          // Enrich with profile data in background
          fetchProfile(u.id).then(profile => {
            setUser(buildUserProfile(u, profile.free_analyses_remaining));
          });
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });

    // 2. Listen for subsequent auth changes (OAuth callback, sign out, token refresh)
    const { data: subscription } = onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      const u = session.user as { id: string; email?: string; created_at: string; updated_at?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> };
      if (u) {
        setUser(buildUserProfile(u, 0));
        setLoading(false);
        fetchProfile(u.id).then(profile => {
          setUser(buildUserProfile(u, profile.free_analyses_remaining));
        });
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
      const profile = await fetchProfile(u.id);
      setUser(buildUserProfile(u, profile.free_analyses_remaining, 'email'));
    }
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  return { user, loading, signIn, signInWithEmail, signOut };
}
