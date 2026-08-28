"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND_NAME, PRODUCTS } from "@/data/products";
import { track } from "@/lib/analytics";
import { ensureSession } from "@/lib/session";
import type { Variant } from "@/lib/types";
import { ProductThumb } from "@/components/ProductThumb";
import { priceText } from "@/components/ui";
import { DemoBanner } from "@/components/DemoBanner";

/**
 * 샘플 광고 랜딩 — 대시보드가 읽는 이벤트가 여기서 발생합니다.
 *
 * A안 「기존 상세형」 : 상품 정보 위주. 스펙을 나열하고 판단은 사용자에게 맡깁니다.
 * B안 「혜택 강조형」 : 할인율·후기·마감을 앞세워 결정을 돕습니다.
 *
 * 대시보드의 A/B 카드에 나오는 이름과 같은 안입니다.
 */
export default function DemoLanding() {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    const { variant: v } = ensureSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 클라이언트 전용 값
    setVariant(v);
    track("page_view", { page_path: "/demo" });
  }, []);

  function openProduct(id: number, position: number) {
    track("view_product", { product_id: id, position });
    router.push(`/demo/product?id=${id}`);
  }

  if (!variant) return <div className="min-h-dvh" />;

  const isB = variant === "B";

  return (
    <main className="fade-up flex min-h-dvh flex-col pb-8">
      <DemoBanner variant={variant} />

      {/* 히어로 */}
      <header className="px-5 pt-6 pb-5">
        <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
          {BRAND_NAME}
        </p>

        {isB ? (
          <>
            <span className="mt-2.5 inline-block rounded-full bg-brand-soft px-3 py-1.5 text-[12.5px] font-bold text-brand">
              오늘까지 최대 32% 할인
            </span>
            <h1 className="mt-3 text-[28px] leading-tight font-extrabold tracking-tight">
              사놓고 매일 쓰는 것만
              <br />
              모았습니다
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
              평점 4.5 이상 · 후기 400건 이상인 제품만 골랐습니다.
              <strong className="text-ink"> 오늘 주문하면 내일 도착합니다.</strong>
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-2.5 text-[26px] leading-tight font-bold tracking-tight">
              생활용품 기획전
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
              주방·의류·수납·뷰티 카테고리 6종을 준비했습니다. 상세 정보를 확인하고
              선택하세요.
            </p>
          </>
        )}
      </header>

      {/* 상품 목록 */}
      <div className="grid grid-cols-2 gap-3 px-5">
        {PRODUCTS.map((p, i) => {
          const off = Math.round((1 - p.price / p.listPrice) * 100);
          return (
            <article
              key={p.id}
              className="overflow-hidden rounded-xl border border-line bg-card"
            >
              <button
                type="button"
                onClick={() => openProduct(p.id, i + 1)}
                className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <div className="relative">
                  <ProductThumb product={p} size={200} />
                  {isB && (
                    <span className="absolute top-2 left-2 rounded bg-brand px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                      {off}%
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h2 className="text-[13.5px] leading-snug font-bold">{p.name}</h2>

                  {isB ? (
                    <>
                      <p className="mt-1 text-[11.5px] text-muted">
                        ★ {p.rating} · 후기 {p.reviewCount.toLocaleString("ko-KR")}
                      </p>
                      <p className="mt-1 font-mono text-[13px] font-bold text-brand">
                        {priceText(p.price)}
                        <span className="ml-1.5 font-normal text-muted line-through">
                          {priceText(p.listPrice)}
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-muted">
                        {p.tagline}
                      </p>
                      <p className="mt-1 font-mono text-[13px]">{priceText(p.price)}</p>
                    </>
                  )}
                </div>
              </button>
            </article>
          );
        })}
      </div>
    </main>
  );
}
