import { useCallback } from 'react';
import type { OAuthProvider } from '@cg/shared';
import { useAuthContext } from '../providers/AuthProvider';
import { signInWithProvider, signOut as authSignOut } from '../lib/auth';

export function useAuth() {
  const { user, session, isLoading, isAuthenticated } = useAuthContext();

  const signIn = useCallback(async (provider: OAuthProvider) => {
    return signInWithProvider(provider);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
  }, []);

  return { user, session, isLoading, isAuthenticated, signIn, signOut };
}
