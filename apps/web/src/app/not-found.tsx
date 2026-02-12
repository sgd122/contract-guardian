import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@cg/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground/50" />
      <h1 className="mt-6 text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <div className="mt-8">
        <Button asChild className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            홈으로
          </Link>
        </Button>
      </div>
    </div>
  );
}
