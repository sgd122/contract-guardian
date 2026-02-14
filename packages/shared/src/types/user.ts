export type OAuthProvider = 'kakao' | 'google' | 'github';
export type AuthProvider = OAuthProvider | 'email';

export interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  provider?: AuthProvider;
  free_analyses_remaining: number;
  created_at: string;
  updated_at: string;
}
