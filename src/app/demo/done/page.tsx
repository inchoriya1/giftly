"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { ensureSession } from "@/lib/session";
import type { Variant } from "@/lib/types";
import { DemoStrip } from "@/components/StoreChrome";

export default function DonePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <OrderDone />
    </Suspense>
  );
}

function OrderDone() {
  const params = useSearchParams();
  const orderNo = params.get("no") ?? "—";
  const amount = Number(params.get("amt") ?? 0);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [etaText, setEtaText] = useState("");

  useEffect(() => {
    const { variant: v } = ensureSession();
    // 배송 예정일은 현재 시각에 의존하므로 렌더 중에 계산하지 않습니다.
    const eta = new Date(Date.now() + 86400000);
    const dow = ["일", "월", "화", "수", "목", "금", "토"][eta.getDay()];
    /* eslint-disable react-hooks/set-state-in-effect -- 클라이언트 전용 값 */
    setVariant(v);
    setEtaText(`${eta.getMonth() + 1}월 ${eta.getDate()}일 (${dow})`);
    /* eslint-enable react-hooks/set-state-in-effect */
    track("page_view", { page_path: "/demo/done" });
  }, []);

  if (!variant) return <div className="min-h-dvh" />;

  return (
    <main className="fade-up flex min-h-dvh flex-col bg-paper">
      <DemoStrip variant={variant} />

      <div className="flex flex-col items-center gap-3 px-6 pt-10 pb-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-[26px] text-white">
          ✓
        </div>
        <h1 className="text-[20px] font-bold tracking-tight">주문이 완료되었습니다</h1>
        <p className="text-[13px] text-muted">
          <span className="font-mono">{etaText}</span> 도착 예정
        </p>
      </div>

      {/* 주문 요약 */}
      <div className="mx-4 rounded-lg border border-line bg-card">
        <dl className="flex flex-col gap-2.5 p-4 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-muted">주문번호</dt>
            <dd className="font-mono tabular-nums">{orderNo}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">결제 금액</dt>
            <dd className="font-mono font-bold tabular-nums">
              {amount.toLocaleString("ko-KR")}원
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">결제 수단</dt>
            <dd>— (결제 없음)</dd>
          </div>
        </dl>
      </div>

      {/* 측정 결과 */}
      <div className="mx-4 mt-4 rounded-lg border border-line bg-card p-4">
        <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          방금 기록된 이벤트
        </p>
        <ol className="mt-2 flex flex-col gap-1.5">
          {[
            ["page_view", "랜딩 진입"],
            ["view_product", "상품 조회"],
            ["add_to_cart", "장바구니"],
            ["purchase", "구매 완료"],
          ].map(([ev, ko], i) => (
            <li key={ev} className="flex items-center gap-2.5 text-[12.5px]">
              <span className="font-mono text-[10px] text-muted tabular-nums">
                {i + 1}
              </span>
              <span
                className={`font-mono ${i === 3 ? "font-bold text-brand" : ""}`}
              >
                {ev}
              </span>
              <span className="text-muted">{ko}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 border-t border-line pt-2.5 text-[11px] leading-relaxed text-muted">
          모든 이벤트에 <span className="font-mono">variant</span>({variant}안)와{" "}
          <span className="font-mono">session_id</span>가 함께 붙습니다. 대시보드의
          퍼널 차트가 이 4단계를 그립니다.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2 px-4 pb-8">
        <Link
          href="/"
          className="rounded-lg bg-brand py-3.5 text-center text-[14px] font-bold text-white"
        >
          대시보드에서 결과 보기
        </Link>
        <Link
          href="/demo"
          className="py-2 text-center text-[12.5px] font-semibold text-muted"
        >
          처음부터 다시 보기
        </Link>
      </div>
    </main>
  );
}
