"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { ensureSession } from "@/lib/session";
import type { Variant } from "@/lib/types";
import { DemoStrip, StoreFooter } from "@/components/StoreChrome";

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
    <main className="flex min-h-dvh flex-col bg-paper">
      <DemoStrip variant={variant} />

      <div className="store-wrap max-w-[560px] py-16">
        <p className="text-[12px] text-muted">주문완료</p>
        <h1 className="mt-2 text-[24px] font-extrabold tracking-tight">
          주문이 완료되었습니다
        </h1>
        <p className="mt-2 text-[14px] text-muted">{etaText} 도착 예정</p>

        <table className="mt-10 w-full text-[13px]">
          <tbody>
            <tr className="border-y border-line">
              <th className="w-28 py-3.5 text-left font-normal text-muted">
                주문번호
              </th>
              <td className="py-3.5 tabular-nums">{orderNo}</td>
            </tr>
            <tr className="border-b border-line">
              <th className="py-3.5 text-left font-normal text-muted">결제 금액</th>
              <td className="py-3.5 font-bold tabular-nums">
                {amount.toLocaleString("ko-KR")}원
              </td>
            </tr>
            <tr className="border-b border-line">
              <th className="py-3.5 text-left font-normal text-muted">결제 수단</th>
              <td className="py-3.5">— (결제 없음)</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 border border-line p-5">
          <p className="text-[12px] text-muted">방금 기록된 이벤트</p>
          <ol className="mt-3 flex flex-col gap-2">
            {[
              ["page_view", "랜딩 진입"],
              ["view_product", "상품 조회"],
              ["add_to_cart", "장바구니"],
              ["purchase", "구매 완료"],
            ].map(([ev, ko], i) => (
              <li key={ev} className="flex items-center gap-3 text-[13px]">
                <span className="w-4 text-muted tabular-nums">{i + 1}</span>
                <span className={i === 3 ? "font-semibold" : ""}>{ev}</span>
                <span className="text-muted">{ko}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-muted">
            모든 이벤트에 variant({variant}안)와 session_id가 함께 붙습니다.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-2">
          <Link
            href="/"
            className="flex h-12 items-center justify-center rounded-xl bg-brand text-[14px] font-extrabold text-brand-ink"
          >
            대시보드에서 결과 보기
          </Link>
          <Link
            href="/demo"
            className="flex h-12 items-center justify-center text-[13px] text-muted"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </div>

      <StoreFooter />
    </main>
  );
}
