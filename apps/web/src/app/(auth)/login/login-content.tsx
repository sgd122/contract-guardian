"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@cg/ui";
import { useAuth } from "@cg/api";
import { toast } from "sonner";

const isDev = process.env.NODE_ENV === "development";

export default function LoginContent() {
  const { user, loading, signIn, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("test1234");
  const [testLoading, setTestLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "auth_failed") {
      toast.error("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  }, [error]);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect);
    }
  }, [user, loading, router, redirect]);

  const handleKakaoLogin = async () => {
    try {
      await signIn("kakao");
    } catch {
      toast.error("카카오 로그인에 실패했습니다.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google");
    } catch {
      toast.error("구글 로그인에 실패했습니다.");
    }
  };

  const handleTestLogin = async () => {
    setTestLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace(redirect);
    } catch {
      toast.error("테스트 로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">계약서 지킴이</span>
          </Link>
          <CardTitle className="text-lg">
            로그인하고 계약서를 분석하세요
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleKakaoLogin}
            className="w-full gap-3 text-sm font-medium"
            style={{
              backgroundColor: "#FEE500",
              color: "#3C1E1E",
            }}
            variant="ghost"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="#3C1E1E"
            >
              <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.726 1.8 5.117 4.508 6.476-.199.744-.72 2.696-.826 3.112-.13.512.188.505.395.367.163-.108 2.593-1.76 3.647-2.476.738.11 1.497.167 2.276.167 5.523 0 10-3.463 10-7.646S17.523 3 12 3" />
            </svg>
            카카오로 시작하기
          </Button>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full gap-3 text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 시작하기
          </Button>

          {isDev && (
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">
                    개발 테스트 로그인
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={handleTestLogin}
                  disabled={testLoading}
                  variant="outline"
                  className="w-full border-dashed border-orange-400 text-orange-600 hover:bg-orange-50"
                >
                  {testLoading ? "로그인 중..." : "테스트 계정으로 로그인"}
                </Button>
              </div>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground">
            로그인 시{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              이용약관
            </Link>
            과{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              개인정보처리방침
            </Link>
            에 동의합니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
