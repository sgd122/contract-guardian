export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  // Next.js: NEXT_PUBLIC_*, Expo: EXPO_PUBLIC_*
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    '';

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    '';

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in root .env.',
    );
  }

  return { url, anonKey };
}
