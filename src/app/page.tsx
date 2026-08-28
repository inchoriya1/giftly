"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BRAND_NAME, PRODUCTS } from "@/data/products";
import { track } from "@/lib/analytics";
import { ensureSession } from "@/lib/session";
import type { Variant } from "@/lib/types";
import { LinkButton, Placeholder, priceText } from "@/components/ui";

export default function Landing() {
  // ⚠️ null 로 시작합니다. 서버에서는 variant 를 알 수 없으므로
  //    확정 전에는 스켈레톤을 보여줘야 hydration 이 깨지지 않습니다.
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    const { variant: v } = ensureSession();
    // A/B 배정은 브라우저에만 있는 값(localStorage)이라 마운트 후에만 알 수 있습니다.
    // 서버에서 읽으면 hydration 이 깨지면서 배정이 뒤섞여 실험이 오염됩니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 클라이언트 전용 값
    setVariant(v);
    track("page_view", { page_path: "/" });
  }, []);

  if (!variant) return <Skeleton />;

  return variant === "B" ? <VersionB /> : <VersionA />;
}

function Skeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="aspect-square w-full bg-line/60" />
      <div className="flex flex-col gap-3 p-6">
        <div className="h-6 w-2/3 rounded bg-line/60" />
        <div className="h-6 w-1/2 rounded bg-line/60" />
      </div>
    </div>
  );
}

/* ────────────── Version A · 대조군 : 상품 나열 ────────────── */

function VersionA() {
  return (
    <main className="fade-up flex min-h-dvh flex-col">
      <header className="px-6 pt-8 pb-5">
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          {BRAND_NAME}
        </p>
        <h1 className="mt-2 text-[27px] leading-tight font-extrabold tracking-tight">
          받는 분이 기억하는
          <br />
          연말 선물
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          정성껏 만든 선물 세트를 준비했습니다.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 px-6">
        {PRODUCTS.slice(0, 6).map((p) => (
          <article
            key={p.id}
            className="overflow-hidden rounded-xl border border-line bg-card"
          >
            {p.image ? (
              <Image
                src={p.image}
                alt={p.name}
                width={200}
                height={200}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <Placeholder className="aspect-square w-full" />
            )}
            <div className="p-3">
              <h2 className="text-[13.5px] leading-snug font-bold">{p.name}</h2>
              <p className="mt-1 font-mono text-[12.5px]">{priceText(p.price)}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-auto p-6">
        <LinkButton
          href="/quiz"
          onClick={() => track("quiz_start", { from: "landing_a" })}
        >
          구매하기
        </LinkButton>
      </div>
    </main>
  );
}

/* ────────────── Version B · 실험군 : 퀴즈 우선 ────────────── */

function VersionB() {
  return (
    <main className="fade-up flex min-h-dvh flex-col">
      <Placeholder label="HERO 1:1" className="aspect-square w-full" />

      <div className="flex flex-col gap-3.5 px-6 pt-6">
        <span className="self-start rounded-full bg-brand-soft px-3 py-1.5 text-[12.5px] font-bold text-brand">
          ⏱ 90초면 끝납니다
        </span>
        <h1 className="text-[30px] leading-tight font-extrabold tracking-tight">
          올해 연말 선물,
          <br />
          아직 안 정하셨죠?
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          받는 분과의 관계, 예산, 취향만 알려주시면 딱 맞는 선물 3가지를
          골라드립니다. 회원가입 없이 바로 시작하세요.
        </p>
      </div>

      <div className="mt-auto p-6">
        <LinkButton
          href="/quiz"
          onClick={() => track("quiz_start", { from: "landing_b" })}
        >
          90초 만에 선물 찾기
        </LinkButton>
      </div>
    </main>
  );
}
