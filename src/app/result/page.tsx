"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRAND_NAME } from "@/data/products";
import { getFallback } from "@/data/fallback-messages";
import { track } from "@/lib/analytics";
import { recommend } from "@/lib/recommend";
import { ensureSession, loadAnswers, resetFlow } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import type { Answers, Scored } from "@/lib/types";
import { Button, priceText } from "@/components/ui";
import { ProductThumb } from "@/components/ProductThumb";

export default function Result() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [picks, setPicks] = useState<Scored[]>([]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [leadDone, setLeadDone] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const a = loadAnswers();
    if (!a) {
      router.replace("/");
      return;
    }

    // 답변은 sessionStorage 에만 있으므로 마운트 후에만 읽을 수 있습니다.
    /* eslint-disable react-hooks/set-state-in-effect -- 클라이언트 전용 값 */
    setAnswers(a);
    setPicks(recommend(a));

    // 먼저 사전 문구를 띄우고, LLM 이 오면 교체합니다.
    // 사용자는 빈 화면을 보지 않습니다.
    setMessage(getFallback(a.relation, a.occasion));
    /* eslint-enable react-hooks/set-state-in-effect */

    fetch("/api/generate-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { message?: string; isFallback?: boolean } | null) => {
        if (d?.message) setMessage(d.message);
        track("card_generate", { is_fallback: d?.isFallback ?? true });
      })
      .catch(() => track("card_generate", { is_fallback: true }));
  }, [router]);

  function flash(t: string) {
    setToast(t);
    setTimeout(() => setToast(""), 2200);
  }

  async function share() {
    const text = `${BRAND_NAME} — ${message}`;
    track("share_click", { channel: "web" });
    if (navigator.share) {
      try {
        await navigator.share({ title: "GIFTLY", text });
      } catch {
        /* 사용자가 취소한 경우 */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      flash("메시지를 복사했어요");
    } else {
      flash("공유를 지원하지 않는 환경이에요");
    }
  }

  function buy(p: Scored, position: number) {
    track("purchase_click", { product_id: p.id, position });
    if (p.storeUrl) window.open(p.storeUrl, "_blank", "noopener");
    else flash("스마트스토어 주소를 연결하세요");
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return flash("이메일 형식을 확인해주세요");

    if (supabase) {
      const { sessionId, variant } = ensureSession();
      const { error } = await supabase
        .from("leads")
        .insert({ session_id: sessionId, email, variant });
      if (error) return flash("잠시 후 다시 시도해주세요");
    }
    track("lead_submit");
    setLeadDone(true);
  }

  if (!answers) return <div className="min-h-dvh" />;

  return (
    <main className="fade-up relative flex min-h-dvh flex-col gap-5 p-6">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          추천 결과
        </p>
        <h1 className="mt-1.5 text-[22px] leading-snug font-bold tracking-tight">
          {answers.relation}께 드릴 선물, 이 세 가지예요
        </h1>
      </header>

      <section className="rounded-2xl border border-line bg-gradient-to-br from-[#fff8f0] to-[#f7e9dc] p-6">
        <p className="text-[17px] leading-[1.7] font-semibold">{message}</p>
        <p className="mt-2.5 font-mono text-[11px] tracking-widest text-muted">
          GIFTLY · 개인화 메시지 카드
        </p>
      </section>

      <section className="flex flex-col gap-3">
        {picks.map((p, i) => (
          <article
            key={p.id}
            className="grid grid-cols-[78px_1fr] items-center gap-3.5 rounded-xl border border-line bg-card p-3"
          >
            <ProductThumb product={p} size={78} className="rounded-lg" />
            <div>
              <h2 className="text-[15px] font-bold">
                <span className="mr-1.5 rounded bg-brand px-1.5 py-0.5 font-mono text-[10px] text-white">
                  {i + 1}
                </span>
                {p.name}
              </h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                {p.why}
                {p.matched.length > 0 && ` · ${p.matched.join("·")} 일치`}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[13px]">{priceText(p.price)}</span>
                <button
                  type="button"
                  onClick={() => buy(p, i + 1)}
                  className="rounded-lg bg-brand px-3 py-1.5 text-[12.5px] font-bold text-white"
                >
                  구매하기
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <Button variant="secondary" onClick={share}>
        메시지 카드 공유하기
      </Button>

      {!leadDone ? (
        <form
          onSubmit={submitLead}
          className="flex flex-col gap-2.5 rounded-xl border border-line bg-card p-4"
        >
          <p className="text-[13.5px] font-semibold">
            연말 할인 소식을 받아보시겠어요?
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2.5 text-[14px] outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-ink px-4 text-[13.5px] font-bold text-white"
            >
              받기
            </button>
          </div>
          <p className="text-[11px] text-muted">
            수집한 이메일은 연말 프로모션 안내에만 사용하고 캠페인 종료 후
            파기합니다.
          </p>
        </form>
      ) : (
        <p className="rounded-xl border border-line bg-card p-4 text-[13.5px] font-semibold text-brand">
          신청되었습니다. 소식 전해드릴게요.
        </p>
      )}

      <Link
        href="/"
        onClick={resetFlow}
        className="pb-2 text-center text-[13.5px] font-semibold text-muted"
      >
        다시 추천받기
      </Link>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-[13.5px] whitespace-nowrap text-white">
          {toast}
        </div>
      )}
    </main>
  );
}
