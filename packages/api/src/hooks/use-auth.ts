import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfile, OAuthProvider } from '@cg/shared';
import { signInWithOAuth, signInWithPassword, signOut as authSignOut, onAuthStateChange } from '../supabase/auth';
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

interface UseAuthOptions {
  queryFn: () => Promise<UserProfile | null>;
}

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!supabaseClient) {
    const config = getSupabaseConfig();
    supabaseClient = createBrowserClient(config.url, config.anonKey);
  }
  return supabaseClient;
}

export function useAuth(options: UseAuthOptions): UseAuthReturn {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading: loading } = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: options.queryFn,
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
