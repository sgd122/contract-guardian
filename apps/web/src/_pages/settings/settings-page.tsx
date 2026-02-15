"use client";

import Image from "next/image";
import { User, Mail, Gift, LogOut } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  FadeIn,
} from "@cg/ui";
import { useAuth } from "@cg/api";

export function SettingsPage() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <FadeIn>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          계정 정보를 확인하고 관리하세요
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">프로필</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.display_name ?? "프로필"}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h3 className="font-medium">
                  {user.display_name ?? "사용자"}
                </h3>
                {user.email && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </p>
                )}
                {user.provider && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {user.provider === "kakao" ? "카카오" : "Google"} 로그인
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="h-4 w-4" />
              무료 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">무료 분석 남은 횟수</p>
                <p className="text-xs text-muted-foreground">
                  가입 시 1건의 무료 분석이 제공됩니다
                </p>
              </div>
              <span className="text-2xl font-bold text-primary">
                {user.free_analyses_remaining}건
              </span>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
