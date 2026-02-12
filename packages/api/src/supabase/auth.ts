import { createClient } from '@supabase/supabase-js';
import type { OAuthProvider } from '@cg/shared';
import { getSupabaseConfig } from './config';

function getClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey);
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
  callback: (event: string, session: unknown) => void,
) {
  const client = getClient();
  return client.auth.onAuthStateChange(callback);
}
