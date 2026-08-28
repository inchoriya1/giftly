"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { ensureSession } from "@/lib/session";
import type { Variant } from "@/lib/types";
import { DemoBanner } from "@/components/DemoBanner";

export default function DonePage() {
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    const { variant: v } = ensureSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 클라이언트 전용 값
    setVariant(v);
    track("page_view", { page_path: "/demo/done" });
  }, []);

  if (!variant) return <div className="min-h-dvh" />;

  return (
    <main className="fade-up flex min-h-dvh flex-col">
      <DemoBanner variant={variant} />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-[26px] text-white">
          ✓
        </div>
        <h1 className="text-[22px] font-bold tracking-tight">주문이 완료되었습니다</h1>
        <p className="max-w-[30ch] text-[14px] leading-relaxed text-muted">
          여기까지가 대시보드의 퍼널 마지막 단계입니다. 방금 흐름이{" "}
          <strong className="text-ink">랜딩 진입 → 상품 조회 → 장바구니 → 구매 완료</strong>{" "}
          4단계로 기록되었습니다.
        </p>

        <div className="mt-2 w-full max-w-[300px] rounded-xl border border-line bg-card p-4 text-left">
          <p className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
            방금 발생한 이벤트
          </p>
          <ul className="mt-2 flex flex-col gap-1 font-mono text-[11.5px]">
            <li>page_view</li>
            <li>view_product</li>
            <li>add_to_cart</li>
            <li className="font-bold text-brand">purchase</li>
          </ul>
          <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
            모든 이벤트에 <span className="font-mono">variant</span>와{" "}
            <span className="font-mono">session_id</span>가 함께 붙습니다.
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <Link
            href="/"
            className="rounded-lg bg-brand px-5 py-3 text-[14px] font-bold text-white"
          >
            대시보드로 돌아가기
          </Link>
          <Link href="/demo" className="py-1.5 text-[13px] font-semibold text-muted">
            처음부터 다시 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
