"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "@cg/ui";
import { cn } from "@cg/ui";

const FAQ_ITEMS = [
  {
    question: "AI 분석 결과를 법적으로 사용할 수 있나요?",
    answer:
      "아니요. 본 서비스의 AI 분석 결과는 참고용이며, 법적 효력이 없습니다. 중요한 계약 체결 시에는 반드시 법률 전문가의 자문을 받으시기 바랍니다.",
  },
  {
    question: "어떤 종류의 계약서를 분석할 수 있나요?",
    answer:
      "프리랜서 용역 계약서, 업무 위탁 계약서, NDA(비밀유지계약), 전월세 계약서 등 다양한 계약서를 분석할 수 있습니다. PDF 형식의 문서를 지원합니다.",
  },
  {
    question: "분석에 얼마나 걸리나요?",
    answer:
      "일반적으로 2~3분 내에 분석이 완료됩니다. 계약서의 분량이 많을 경우 시간이 다소 더 걸릴 수 있습니다.",
  },
  {
    question: "계약서 데이터는 안전한가요?",
    answer:
      "네. 업로드된 계약서는 암호화되어 저장되며, 분석 완료 후 90일 이내에 자동 삭제됩니다. 제3자에게 공유되지 않습니다.",
  },
  {
    question: "환불 가능한가요?",
    answer:
      "분석이 시작되기 전에는 전액 환불이 가능합니다. 분석이 시작된 이후에는 시스템 오류로 결과를 제공하지 못한 경우에만 환불해 드립니다.",
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium transition-colors hover:text-primary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {question}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden text-sm text-muted-foreground transition-all",
          open ? "max-h-96 pb-4" : "max-h-0"
        )}
      >
        {answer}
      </div>
    </div>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="py-20 scroll-mt-16">
      <div className="container max-w-3xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold">
            자주 묻는 질문
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-12">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.question} {...item} />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
