import { createBrowserClient } from '@supabase/ssr';
import type { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js';
import type { OAuthProvider } from '@cg/shared';
import { getSupabaseConfig } from './config';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const { url, anonKey } = getSupabaseConfig();
    _client = createBrowserClient(url, anonKey);
  }
  return _client;
}

export async function signInWithOAuth(provider: OAuthProvider) {
  const client = getClient();
  return client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${globalThis.location?.origin ?? ''}/api/auth/callback`,
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  const client = getClient();
  return client.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const client = getClient();
  return client.auth.signOut();
}

export async function getSession() {
  const client = getClient();
  return client.auth.getSession();
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  const client = getClient();
  return client.auth.onAuthStateChange(callback);
}
