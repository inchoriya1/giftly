"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import { track } from "@/lib/analytics";
import { ensureSession, readCart } from "@/lib/session";
import type { Variant } from "@/lib/types";
import { ProductThumb } from "@/components/ProductThumb";
import { priceText } from "@/components/ui";
import { StoreFooter, StoreHeader } from "@/components/StoreChrome";

/**
 * 샘플 광고 랜딩 — 대시보드가 읽는 이벤트가 여기서 발생합니다.
 *
 * A안 「기존 상세형」 : 상품 정보 위주. 판단은 사용자에게 맡깁니다.
 * B안 「혜택 강조형」 : 할인율·후기·마감을 앞세워 결정을 돕습니다.
 *
 * 같은 상품, 같은 가격입니다. 다른 건 표현 방식뿐이라 실험으로 성립합니다.
 */
export default function DemoLanding() {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const { variant: v } = ensureSession();
    const cart = readCart();
    /* eslint-disable react-hooks/set-state-in-effect -- 클라이언트 전용 값 */
    setVariant(v);
    setCartCount(cart?.qty ?? 0);
    /* eslint-enable react-hooks/set-state-in-effect */
    track("page_view", { page_path: "/demo" });
  }, []);

  if (!variant) return <div className="min-h-dvh" />;
  const isB = variant === "B";

  function open(id: number, position: number) {
    track("view_product", { product_id: id, position });
    router.push(`/demo/product?id=${id}`);
  }

  return (
    <main className="fade-up flex min-h-dvh flex-col bg-paper">
      <StoreHeader variant={variant} cartCount={cartCount} />

      {/* 배너 */}
      <section className="px-4 pt-4">
        <div
          className="relative overflow-hidden rounded-xl px-5 py-6"
          style={{
            background: isB
              ? "linear-gradient(135deg,#8E2A20 0%,#B14536 100%)"
              : "linear-gradient(135deg,#F0E4D4 0%,#DCC5A8 100%)",
          }}
        >
          {isB ? (
            <>
              <span className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white">
                오늘 자정 마감
              </span>
              <h1 className="mt-2.5 text-[24px] leading-tight font-extrabold text-white">
                최대 32% 할인
                <br />
                매일 쓰는 것만 골랐습니다
              </h1>
              <p className="mt-2 text-[12.5px] text-white/85">
                평점 4.4 이상 · 후기 400건 이상 · 오늘 주문 시 내일 도착
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-[10.5px] tracking-[0.16em] text-[#7A5C38] uppercase">
                New Arrivals
              </p>
              <h1 className="mt-2 text-[22px] leading-tight font-bold text-[#3A2E22]">
                생활용품 기획전
              </h1>
              <p className="mt-2 text-[12.5px] text-[#6B5744]">
                주방 · 의류 · 수납 · 뷰티 6종
              </p>
            </>
          )}
        </div>
      </section>

      {/* 정렬 바 */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2.5">
        <p className="text-[12.5px] text-muted">
          전체 <strong className="text-ink">{PRODUCTS.length}</strong>개
        </p>
        <div className="flex gap-2.5 text-[12px] text-muted">
          <button type="button" className="font-bold text-ink">
            추천순
          </button>
          <span className="text-line">|</span>
          <button type="button">낮은가격</button>
          <span className="text-line">|</span>
          <button type="button">후기많은</button>
        </div>
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4">
        {PRODUCTS.map((p, i) => {
          const off = Math.round((1 - p.price / p.listPrice) * 100);
          return (
            <article key={p.id}>
              <button
                type="button"
                onClick={() => open(p.id, i + 1)}
                className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <div className="relative overflow-hidden rounded-lg">
                  <ProductThumb product={p} size={200} />
                  {isB && (
                    <span className="absolute top-2 left-2 rounded bg-brand px-1.5 py-[2px] font-mono text-[10px] font-bold text-white">
                      {off}%
                    </span>
                  )}
                  {isB && i === 0 && (
                    <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-[2px] text-[10px] font-semibold text-white">
                      BEST
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <h2 className="text-[13px] leading-snug font-semibold">{p.name}</h2>

                  {isB ? (
                    <>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="font-mono text-[13px] font-bold text-brand">
                          {off}%
                        </span>
                        <span className="font-mono text-[13.5px] font-bold">
                          {priceText(p.price)}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-muted line-through">
                        {priceText(p.listPrice)}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        ★ {p.rating}{" "}
                        <span className="text-muted/70">
                          ({p.reviewCount.toLocaleString("ko-KR")})
                        </span>
                      </p>
                      <span className="mt-1.5 inline-block rounded bg-brand-soft px-1.5 py-[1px] text-[10px] font-semibold text-brand">
                        내일 도착
                      </span>
                    </>
                  ) : (
                    <>
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted">
                        {p.tagline}
                      </p>
                      <p className="mt-1.5 font-mono text-[13.5px] font-semibold">
                        {priceText(p.price)}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        ★ {p.rating} · 후기 {p.reviewCount.toLocaleString("ko-KR")}
                      </p>
                    </>
                  )}
                </div>
              </button>
            </article>
          );
        })}
      </div>

      <StoreFooter />
    </main>
  );
}
