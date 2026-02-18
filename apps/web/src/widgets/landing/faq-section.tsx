"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "@cg/ui";
import { cn } from "@cg/ui";
import { FAQ_ITEMS } from "./faq-data";

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
