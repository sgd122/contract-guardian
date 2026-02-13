import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { OAuthProvider } from '@cg/shared';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithProvider(provider: OAuthProvider) {
  const redirectTo = AuthSession.makeRedirectUri({
    scheme: 'contract-guardian',
    path: 'auth/callback',
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error('OAuth URL을 받지 못했습니다.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    return null;
  }

  const url = new URL(result.url);

  // Supabase returns tokens in the fragment (hash)
  const fragment = url.hash.substring(1);
  const params = new URLSearchParams(fragment);

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    throw new Error('인증 토큰을 받지 못했습니다.');
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

  if (sessionError) {
    throw sessionError;
  }

  return sessionData.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}
