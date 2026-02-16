"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  Input,
  FadeIn,
} from "@cg/ui";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";
import { FaqSection } from "@/widgets/landing";

export function HelpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement backend endpoint for contact form
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-16">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold">문의하기</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                궁금하신 점이 있으시면 언제든지 문의해 주세요
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="mx-auto mt-12 max-w-2xl p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    이름
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="홍길동"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    이메일
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="example@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    제목
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="문의 제목을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    내용
                  </label>
                  <textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="문의 내용을 상세히 입력해 주세요"
                    rows={8}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "전송 중..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      문의하기
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  또는 이메일로 직접 문의하세요:{" "}
                  <a
                    href="mailto:support@contract-guardian.kr"
                    className="font-medium text-primary hover:underline"
                  >
                    support@contract-guardian.kr
                  </a>
                </p>
              </div>
            </Card>
          </FadeIn>
        </div>

        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
