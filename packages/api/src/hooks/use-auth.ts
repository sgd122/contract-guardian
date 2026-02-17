import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfile, AuthProvider, OAuthProvider } from '@cg/shared';
import type { User } from '@supabase/supabase-js';
import { signInWithOAuth, signInWithPassword, signOut as authSignOut, getSession, onAuthStateChange } from '../supabase/auth';
import { getSupabaseConfig } from '../supabase/config';
import { createBrowserClient } from '@supabase/ssr';
import { queryKeys } from '../query-keys';

interface UseAuthReturn {
  user: UserProfile | null;
  loading: boolean;
  signIn: (provider: OAuthProvider) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!supabaseClient) {
    const config = getSupabaseConfig();
    supabaseClient = createBrowserClient(config.url, config.anonKey);
  }
  return supabaseClient;
}

async function fetchProfile(userId: string): Promise<{ free_analyses_remaining: number }> {
  try {
    const client = getBrowserClient();
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
  u: User,
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

async function fetchSessionWithProfile(): Promise<UserProfile | null> {
  const { data, error } = await getSession();
  if (error || !data.session?.user) return null;

  const u = data.session.user;
  const profile = await fetchProfile(u.id);
  return buildUserProfile(u, profile.free_analyses_remaining);
}

export function useAuth(): UseAuthReturn {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading: loading } = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: fetchSessionWithProfile,
    staleTime: 60 * 1000, // 1min
    gcTime: 10 * 60 * 1000,
  });

  // Auth state listener with proper cleanup — one per mounted useAuth instance
  const listenerRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || listenerRef.current) return;
    listenerRef.current = true;

    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (!session) {
        queryClient.setQueryData(queryKeys.auth.session, null);
        queryClient.removeQueries({ queryKey: queryKeys.analyses.all });
        return;
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    });

    return () => {
      subscription.unsubscribe();
      listenerRef.current = false;
    };
  }, [queryClient]);

  const signIn = useCallback(async (provider: OAuthProvider) => {
    await signInWithOAuth(provider);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await signInWithPassword(email, password);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await authSignOut();
    queryClient.setQueryData(queryKeys.auth.session, null);
    // Clear all user-scoped cached data immediately
    queryClient.removeQueries({ queryKey: queryKeys.analyses.all });
  }, [queryClient]);

  return { user, loading, signIn, signInWithEmail, signOut };
}
