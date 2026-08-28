"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/data/questions";
import { track } from "@/lib/analytics";
import { recommend } from "@/lib/recommend";
import { ensureSession, saveAnswers } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import type { Answers } from "@/lib/types";
import { Button } from "@/components/ui";

/** 모듈 스코프 — 컴포넌트 안에서 Date.now() 를 부르면 렌더 순수성 규칙에 걸립니다. */
function elapsedSeconds(from: number) {
  return Math.round((Date.now() - from) / 1000);
}

export default function Quiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const answers = useRef<Partial<Answers>>({});
  const startedAt = useRef(0);

  useEffect(() => {
    // 랜딩을 거치지 않고 /quiz 로 바로 들어온 경우에도 세션을 보장합니다.
    ensureSession();
    startedAt.current = Date.now();
  }, []);

  const q = QUESTIONS[step];
  const progress = (step / QUESTIONS.length) * 100;

  async function choose(value: string) {
    answers.current[q.key] = value as never;
    track("quiz_step", { step: step + 1, answer: value });

    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
      return;
    }

    const complete = answers.current as Answers;
    const picks = recommend(complete);

    saveAnswers(complete);
    track("quiz_complete", { duration_sec: elapsedSeconds(startedAt.current) });

    // 수집이 실패해도 사용자 흐름은 막지 않습니다.
    if (supabase) {
      const { sessionId, variant } = ensureSession();
      try {
        await supabase.from("quiz_responses").insert({
          session_id: sessionId,
          variant,
          relation: complete.relation,
          budget: complete.budget,
          taste: complete.taste,
          occasion: complete.occasion,
          recommended: picks.map((p) => ({ id: p.id, score: p.score })),
          completed: true,
        });
      } catch {
        /* 수집 실패는 무시 — 사용자 경험이 우선입니다 */
      }
    }

    router.push("/result");
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="h-[3px] bg-line">
        <div
          className="h-full bg-brand transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div key={step} className="fade-up flex flex-1 flex-col p-6">
        <p className="font-mono text-[12px] tracking-[0.12em] text-brand">
          QUESTION {step + 1} / {QUESTIONS.length}
        </p>
        <h1 className="mt-2 text-[22px] leading-snug font-bold tracking-tight">
          {q.title}
        </h1>

        <div className="mt-6 flex flex-col gap-2.5">
          {q.options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => choose(o.value)}
              className="rounded-xl border-[1.5px] border-line bg-card p-4 text-left text-base font-semibold transition hover:translate-x-0.5 hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {o.label}
              {o.hint && (
                <span className="mt-0.5 block text-[13px] font-medium text-muted">
                  {o.hint}
                </span>
              )}
            </button>
          ))}
        </div>

        {step > 0 && (
          <Button
            variant="ghost"
            className="mt-5"
            onClick={() => setStep(step - 1)}
          >
            ← 이전으로
          </Button>
        )}
      </div>
    </main>
  );
}
