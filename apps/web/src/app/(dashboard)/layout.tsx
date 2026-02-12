"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@cg/api";
import { PageTransition } from "@cg/ui";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=" + encodeURIComponent(window.location.pathname));
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <LoadingSpinner message="로딩 중..." />
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-8">
        <PageTransition pageKey="dashboard">
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
