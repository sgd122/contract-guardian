import Link from "next/link";
import { Shield } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/about", label: "서비스 소개" },
  { href: "/pricing", label: "가격 정책" },
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">계약서 지킴이</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} 계약서 지킴이. All rights
            reserved.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            본 서비스는 AI 기반 참고 자료를 제공하며, 법률 자문을 대체하지
            않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
