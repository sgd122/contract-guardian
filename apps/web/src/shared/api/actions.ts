"use server";

import type { AnalysisResult, UserProfile, Payment, AuthProvider } from "@cg/shared";
import { createClient } from "@/shared/api/supabase/server";

export async function getSession(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("free_analyses_remaining")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    display_name:
      (user.user_metadata?.full_name ?? user.user_metadata?.name) as
        | string
        | undefined,
    avatar_url: user.user_metadata?.avatar_url as string | undefined,
    provider: user.app_metadata?.provider as AuthProvider | undefined,
    free_analyses_remaining: profile?.free_analyses_remaining ?? 0,
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  };
}

export async function getAnalyses(): Promise<AnalysisResult[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("분석 목록을 불러올 수 없습니다.");

  return data ?? [];
}

export async function getAnalysis(
  id: string,
): Promise<AnalysisResult | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return data;
}

export async function getPaymentHistory(): Promise<Payment[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("결제 내역을 불러올 수 없습니다.");

  return data ?? [];
}
