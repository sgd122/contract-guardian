"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Mail, Gift, LogOut, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  FadeIn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@cg/ui";
import { useAuth } from "@cg/api";
import { toast } from "sonner";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "삭제") {
      toast.error("'삭제'를 정확히 입력해주세요.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "계정 삭제에 실패했습니다.");
      }

      toast.success("계정이 삭제되었습니다.");
      setIsDeleteDialogOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(
        error instanceof Error ? error.message : "계정 삭제에 실패했습니다."
      );
    } finally {
      setIsDeleting(false);
    }
  };

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

      <FadeIn delay={0.4}>
        <Card className="mt-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              계정 삭제
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              계정을 삭제하면 모든 분석 기록, 결제 정보, 프로필 데이터가 영구적으로
              삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                  계정 삭제
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>계정을 삭제하시겠습니까?</DialogTitle>
                  <DialogDescription>
                    이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로
                    삭제됩니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="mb-2 text-sm">
                    계속하려면 아래에 <strong>삭제</strong>를 입력하세요.
                  </p>
                  <Input
                    placeholder="삭제"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    disabled={isDeleting}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setDeleteConfirmText("");
                    }}
                    disabled={isDeleting}
                  >
                    취소
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "삭제" || isDeleting}
                  >
                    {isDeleting ? "삭제 중..." : "계정 삭제"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
