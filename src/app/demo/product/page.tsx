"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { findProduct, PRODUCTS } from "@/data/products";
import { track } from "@/lib/analytics";
import { addToCart, ensureSession, readCart, readWish, toggleWish } from "@/lib/session";
import type { Variant } from "@/lib/types";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { priceText } from "@/components/ui";
import { StoreFooter, StoreHeader } from "@/components/StoreChrome";
import { IconHeart, IconMinus, IconPlus, IconStar } from "@/components/icons";

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
  const id = Number(params.get("id") ?? 1);
  const product = findProduct(id);

  const [variant, setVariant] = useState<Variant | null>(null);
  const [qty, setQty] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [tab, setTab] = useState<"info" | "review" | "ship">("info");
  const [view, setView] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const { variant: v } = ensureSession();
    const cart = readCart();
    /* eslint-disable react-hooks/set-state-in-effect -- 클라이언트 전용 값 */
    setVariant(v);
    setCartCount(cart?.qty ?? 0);
    setLiked(readWish().includes(id));
    /* eslint-enable react-hooks/set-state-in-effect */
    track("page_view", { page_path: "/demo/product" });
  }, [id]);

  if (!variant) return <div className="min-h-dvh" />;

  const isB = variant === "B";
  const off = Math.round((1 - product.price / product.listPrice) * 100);
  const total = product.price * qty;
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).concat(PRODUCTS.filter((p) => p.id !== product.id));
  const relatedUnique = related.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
  ).slice(0, 4);

  function add() {
    addToCart(product.id, qty);
    track("add_to_cart", {
      product_id: product.id,
      qty,
      value: total,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          price: product.price,
          quantity: qty,
        },
      ],
    });
    router.push("/demo/cart");
  }

  const buyPanel = (
    <>
      <p className="text-[12px] text-muted">{product.brand}</p>
      <h1 className="mt-1 text-[22px] leading-snug font-bold tracking-tight">
        {product.name}
      </h1>
      <p className="mt-1 text-[13px] text-muted">{product.tagline}</p>

      <div className="mt-3 flex items-center gap-1.5 text-[12px]">
        <span className="flex items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <IconStar
              key={i}
              size={12}
              className={i < Math.round(product.rating) ? "text-ink" : "text-line"}
            />
          ))}
        </span>
        <span className="font-semibold">{product.rating}</span>
        <span className="text-muted">
          후기 {product.reviewCount.toLocaleString("ko-KR")}
        </span>
      </div>

      {isB ? (
        <div className="mt-5">
          <p className="text-[13px] text-muted line-through tabular-nums">
            {priceText(product.listPrice)}
          </p>
          <p className="mt-0.5 text-[26px] font-extrabold tabular-nums">
            <span className="mr-2 text-sale">{off}%</span>
            {priceText(product.price)}
          </p>
          <p className="mt-2 text-[13px] font-semibold text-sale">
            오늘 주문 시 내일 도착 · 무료배송
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-[26px] font-extrabold tabular-nums">
            {priceText(product.price)}
          </p>
          <p className="mt-2 text-[13px] text-muted">
            3만원 이상 무료배송 · 평균 2~3일 소요
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3">
        <span className="text-[13px]">수량</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="수량 줄이기"
            className="flex h-7 w-7 items-center justify-center border border-line disabled:opacity-40"
            disabled={qty <= 1}
          >
            <IconMinus />
          </button>
          <span className="w-5 text-center text-[14px] tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(9, q + 1))}
            aria-label="수량 늘리기"
            className="flex h-7 w-7 items-center justify-center border border-line"
          >
            <IconPlus />
          </button>
        </div>
      </div>

      <div className="mt-4 hidden items-center gap-2 md:flex">
        <button
          type="button"
          onClick={() => setLiked(toggleWish(product.id).includes(product.id))}
          aria-label={liked ? "찜 해제" : "찜하기"}
          className={`flex h-12 w-12 items-center justify-center border border-line ${
            liked ? "text-ink" : "text-muted"
          }`}
        >
          <IconHeart size={20} filled={liked} />
        </button>
        <button
          type="button"
          onClick={add}
          className="h-12 flex-1 rounded-xl bg-brand text-[14px] font-extrabold text-brand-ink"
        >
          장바구니 담기
        </button>
      </div>
    </>
  );

  return (
    <main className="flex min-h-dvh flex-col bg-paper pb-[72px] md:pb-0">
      <StoreHeader
        variant={variant}
        cartCount={cartCount}
        back={{ href: "/demo", label: "목록으로" }}
      />

      <div className="store-wrap grid gap-10 py-6 md:grid-cols-2 md:py-12">
        <div>
          <div className="overflow-hidden rounded-xl border border-line bg-studio">
            <ProductArt product={product} size={560} view={view} />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setView(i)}
                aria-label={`이미지 ${i + 1}번`}
                aria-pressed={view === i}
                className={`overflow-hidden rounded-xl bg-studio ${
                  view === i ? "outline-2 outline-offset-2 outline-brand" : "border border-line"
                }`}
              >
                <ProductArt product={product} size={120} view={i} />
              </button>
            ))}
          </div>
        </div>

        <div className="md:sticky md:top-[88px] md:self-start">{buyPanel}</div>
      </div>

      <div className="store-wrap flex flex-wrap gap-2 py-4">
        {(
          [
            ["info", "상품정보"],
            ["review", `후기 ${product.reviewCount.toLocaleString("ko-KR")}`],
            ["ship", "배송/교환"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-bold ${
              tab === k ? "bg-brand text-brand-ink" : "border border-line bg-card text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="store-wrap max-w-[720px] py-8">
        {tab === "info" && (
          <table className="w-full text-[13px]">
            <tbody>
              {product.features.map((f) => (
                <tr key={f} className="border-b border-line">
                  <th className="w-28 py-3 text-left font-normal text-muted">특징</th>
                  <td className="py-3">{f}</td>
                </tr>
              ))}
              <tr className="border-b border-line">
                <th className="py-3 text-left font-normal text-muted">제조국</th>
                <td className="py-3">대한민국</td>
              </tr>
              <tr className="border-b border-line">
                <th className="py-3 text-left font-normal text-muted">A/S</th>
                <td className="py-3">고객센터 0000-0000 (가상)</td>
              </tr>
            </tbody>
          </table>
        )}

        {tab === "review" && (
          <div>
            <p className="text-[32px] font-extrabold tabular-nums">{product.rating}</p>
            <p className="mt-1 text-[13px] text-muted">
              후기 {product.reviewCount.toLocaleString("ko-KR")}건
            </p>
            <p className="mt-6 text-[13px] leading-relaxed text-muted">
              후기 본문은 표시하지 않습니다. 가상 상점이라 실제 구매자가 없습니다.
            </p>
          </div>
        )}

        {tab === "ship" && (
          <ul className="flex flex-col gap-2 text-[13px] leading-relaxed">
            <li>3만원 이상 무료배송 (미만 시 3,000원)</li>
            <li>평균 2~3일 소요, 도서·산간 추가 1~2일</li>
            <li>수령 후 7일 이내 교환·반품 가능</li>
            <li className="text-muted">실제 배송이 발생하지 않습니다</li>
          </ul>
        )}
      </div>

      <div className="store-wrap border-t border-line py-12">
        <h2 className="mb-6 text-[16px] font-bold">함께 본 상품</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
          {relatedUnique.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              variant={variant}
              onOpen={() => {
                track("view_product", { product_id: p.id, position: 0 });
                router.push(`/demo/product?id=${p.id}`);
              }}
            />
          ))}
        </div>
      </div>

      <StoreFooter />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel md:hidden">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setLiked(toggleWish(product.id).includes(product.id))}
            aria-label={liked ? "찜 해제" : "찜하기"}
            className={`flex h-12 w-12 shrink-0 items-center justify-center border border-line ${
              liked ? "text-ink" : "text-muted"
            }`}
          >
            <IconHeart size={20} filled={liked} />
          </button>
          <button
            type="button"
            onClick={add}
            className="h-12 flex-1 rounded-xl bg-brand text-[14px] font-extrabold text-brand-ink"
          >
            {priceText(total)} 담기
          </button>
        </div>
      </div>
    </main>
  );
}
