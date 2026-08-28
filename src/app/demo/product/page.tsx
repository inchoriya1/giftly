"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { findProduct, PRODUCTS } from "@/data/products";
import { track } from "@/lib/analytics";
import { addToCart, ensureSession, readCart } from "@/lib/session";
import type { Variant } from "@/lib/types";
import { ProductArt } from "@/components/ProductArt";
import { priceText } from "@/components/ui";
import { StoreHeader } from "@/components/StoreChrome";
import { IconMinus, IconPlus, IconStar } from "@/components/icons";

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <ProductDetail />
    </Suspense>
  );
}

function ProductDetail() {
  const router = useRouter();
  const params = useSearchParams();
  const product = findProduct(Number(params.get("id") ?? 1));

  const [variant, setVariant] = useState<Variant | null>(null);
  const [qty, setQty] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [tab, setTab] = useState<"info" | "review" | "ship">("info");

  useEffect(() => {
    const { variant: v } = ensureSession();
    const cart = readCart();
    /* eslint-disable react-hooks/set-state-in-effect -- 클라이언트 전용 값 */
    setVariant(v);
    setCartCount(cart?.qty ?? 0);
    /* eslint-enable react-hooks/set-state-in-effect */
    track("page_view", { page_path: "/demo/product" });
  }, []);

  if (!variant) return <div className="min-h-dvh" />;

  const isB = variant === "B";
  const off = Math.round((1 - product.price / product.listPrice) * 100);
  const total = product.price * qty;
  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  function add() {
    addToCart(product.id, qty);
    track("add_to_cart", { product_id: product.id, qty, value: total });
    router.push("/demo/cart");
  }

  return (
    <main className="fade-up flex min-h-dvh flex-col bg-paper pb-[68px]">
      <StoreHeader
        variant={variant}
        cartCount={cartCount}
        back={{ href: "/demo", label: "목록으로" }}
      />

      {/* 이미지 */}
      <ProductArt product={product} size={420} />
      <div className="flex justify-center gap-1.5 py-2.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-[5px] rounded-full transition-all ${
              i === 0 ? "w-3.5 bg-ink" : "w-[5px] bg-line"
            }`}
          />
        ))}
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-col gap-2.5 border-b border-line px-4 pb-5">
        <div>
          {isB && (
            <span className="mb-1.5 inline-block rounded bg-brand-soft px-1.5 py-[2px] text-[10.5px] font-bold text-brand">
              오늘 자정 마감
            </span>
          )}
          <h1 className="text-[19px] leading-snug font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-1 text-[13px] text-muted">{product.tagline}</p>
        </div>

        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="flex items-center gap-0.5 text-[#e0a01a]">
            {[0, 1, 2, 3, 4].map((i) => (
              <IconStar
                key={i}
                size={12}
                className={i < Math.round(product.rating) ? "" : "text-line"}
              />
            ))}
          </span>
          <span className="font-semibold text-ink">{product.rating}</span>
          <span className="text-muted">
            후기 {product.reviewCount.toLocaleString("ko-KR")}건
          </span>
        </div>

        {isB ? (
          <div>
            <p className="font-mono text-[12.5px] text-muted line-through">
              {priceText(product.listPrice)}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[22px] font-extrabold text-brand">
                {off}%
              </span>
              <span className="font-mono text-[22px] font-extrabold">
                {priceText(product.price)}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] font-semibold text-brand">
              오늘 주문 시 내일 도착 · 무료배송
            </p>
          </div>
        ) : (
          <div>
            <p className="font-mono text-[21px] font-bold">{priceText(product.price)}</p>
            <p className="mt-1 text-[12px] text-muted">
              3만원 이상 무료배송 · 평균 2~3일 소요
            </p>
          </div>
        )}

        {/* 수량 */}
        <div className="mt-1 flex items-center justify-between rounded-lg border border-line bg-card px-3 py-2.5">
          <span className="text-[13px] font-semibold">수량</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="수량 줄이기"
              className="flex h-7 w-7 items-center justify-center rounded border border-line disabled:opacity-40"
              disabled={qty <= 1}
            >
              <IconMinus />
            </button>
            <span className="w-5 text-center font-mono text-[14px] font-semibold tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(9, q + 1))}
              aria-label="수량 늘리기"
              className="flex h-7 w-7 items-center justify-center rounded border border-line"
            >
              <IconPlus />
            </button>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-line">
        {(
          [
            ["info", "상품정보"],
            ["review", `후기 ${product.reviewCount.toLocaleString("ko-KR")}`],
            ["ship", "배송·교환"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`flex-1 py-2.5 text-[12.5px] ${
              tab === k
                ? "border-b-2 border-ink font-bold text-ink"
                : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {tab === "info" && (
          <dl className="flex flex-col gap-2">
            {product.features.map((f) => (
              <div key={f} className="flex gap-2.5 text-[13px]">
                <dt className="w-[52px] shrink-0 text-muted">특징</dt>
                <dd>{f}</dd>
              </div>
            ))}
            <div className="flex gap-2.5 text-[13px]">
              <dt className="w-[52px] shrink-0 text-muted">제조국</dt>
              <dd>대한민국</dd>
            </div>
            <div className="flex gap-2.5 text-[13px]">
              <dt className="w-[52px] shrink-0 text-muted">A/S</dt>
              <dd>고객센터 1234-5678</dd>
            </div>
          </dl>
        )}

        {tab === "review" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-line bg-card p-3">
              <span className="font-mono text-[24px] font-bold">{product.rating}</span>
              <div className="flex-1">
                <p className="text-[12px] text-muted">
                  후기 {product.reviewCount.toLocaleString("ko-KR")}건
                </p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(product.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-[12px] leading-relaxed text-muted">
              후기 내용은 표시하지 않습니다. 가상 상점이라 실제 구매자가 없습니다.
            </p>
          </div>
        )}

        {tab === "ship" && (
          <ul className="flex flex-col gap-1.5 text-[13px] leading-relaxed">
            <li>· 3만원 이상 무료배송 (미만 시 3,000원)</li>
            <li>· 평균 2~3일 소요, 도서·산간 추가 1~2일</li>
            <li>· 수령 후 7일 이내 교환·반품 가능</li>
            <li className="text-muted">· 실제 배송이 발생하지 않습니다</li>
          </ul>
        )}
      </div>

      {/* 함께 본 상품 */}
      <div className="border-t border-line px-4 py-5">
        <h2 className="mb-3 text-[13.5px] font-bold">함께 본 상품</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {related.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                track("view_product", { product_id: p.id, position: 0 });
                router.push(`/demo/product?id=${p.id}`);
              }}
              className="text-left"
            >
              <ProductArt product={p} size={110} className="rounded-lg" />
              <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-snug">{p.name}</p>
              <p className="mt-0.5 font-mono text-[11.5px] font-semibold">
                {priceText(p.price)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 고정 구매 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[420px] items-center gap-2.5 border-t border-line bg-paper/95 px-4 py-2.5 backdrop-blur">
        <div className="flex-1">
          <p className="text-[10.5px] text-muted">총 {qty}개</p>
          <p className="font-mono text-[15px] font-bold">{priceText(total)}</p>
        </div>
        <button
          type="button"
          onClick={add}
          className="flex-1 rounded-lg bg-brand py-3 text-[14px] font-bold text-white active:scale-[0.985]"
        >
          장바구니 담기
        </button>
      </div>
    </main>
  );
}
