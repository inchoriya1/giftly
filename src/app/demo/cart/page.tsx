"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { findProduct } from "@/data/products";
import { track } from "@/lib/analytics";
import {
  addToCart,
  clearCart,
  ensureSession,
  makeOrderNo,
  readCart,
} from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import type { Product, Variant } from "@/lib/types";
import { ProductThumb } from "@/components/ProductThumb";
import { priceText } from "@/components/ui";
import { StoreHeader } from "@/components/StoreChrome";

const FREE_SHIP = 30000;
const SHIP_FEE = 3000;

export default function CartPage() {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { variant: v } = ensureSession();
    const cart = readCart();
    if (!cart) {
      router.replace("/demo");
      return;
    }
    /* eslint-disable react-hooks/set-state-in-effect -- 클라이언트 전용 값 */
    setVariant(v);
    setProduct(findProduct(cart.id));
    setQty(cart.qty);
    /* eslint-enable react-hooks/set-state-in-effect */
    track("page_view", { page_path: "/demo/cart" });
  }, [router]);

  if (!variant || !product) return <div className="min-h-dvh" />;

  const goods = product.price * qty;
  const discount = applied ? Math.round(goods * 0.05) : 0;
  const shipping = goods - discount >= FREE_SHIP ? 0 : SHIP_FEE;
  const total = goods - discount + shipping;
  const toFree = Math.max(0, FREE_SHIP - (goods - discount));

  function changeQty(next: number) {
    const q = Math.min(9, Math.max(1, next));
    setQty(q);
    addToCart(product!.id, q);
  }

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === "WELCOME5") {
      setApplied(true);
      setMsg("5% 할인이 적용되었습니다");
    } else {
      setMsg("사용할 수 없는 코드입니다 (예시: WELCOME5)");
    }
    setTimeout(() => setMsg(""), 2600);
  }

  async function purchase() {
    setBusy(true);
    track("purchase", { product_id: product!.id, qty, value: total });

    if (supabase) {
      const { sessionId, variant: v } = ensureSession();
      try {
        await supabase.from("sessions").insert({
          session_id: sessionId,
          variant: v,
          product_id: product!.id,
          amount: total,
          purchased: true,
        });
      } catch {
        /* 수집 실패는 무시 — 사용자 흐름이 우선입니다 */
      }
    }

    const orderNo = makeOrderNo();
    clearCart();
    router.push(`/demo/done?no=${orderNo}&amt=${total}`);
  }

  return (
    <main className="fade-up flex min-h-dvh flex-col bg-paper pb-[76px]">
      <StoreHeader
        variant={variant}
        cartCount={qty}
        back={{ href: "/demo", label: "쇼핑 계속하기" }}
      />

      <div className="px-4 pt-4">
        <h1 className="text-[17px] font-bold tracking-tight">장바구니</h1>
      </div>

      {/* 무료배송 안내 */}
      {toFree > 0 && (
        <div className="mx-4 mt-3 rounded-lg border border-line bg-card px-3 py-2.5">
          <p className="text-[12px]">
            <strong className="text-brand">{priceText(toFree)}</strong> 더 담으면
            무료배송
          </p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${Math.min(100, ((goods - discount) / FREE_SHIP) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* 품목 */}
      <div className="mt-3 border-y border-line bg-card px-4 py-3.5">
        <div className="grid grid-cols-[76px_1fr] gap-3">
          <ProductThumb product={product} size={76} className="rounded-lg" />
          <div>
            <h2 className="text-[13.5px] leading-snug font-semibold">{product.name}</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">{product.tagline}</p>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => changeQty(qty - 1)}
                  disabled={qty <= 1}
                  aria-label="수량 줄이기"
                  className="flex h-6 w-6 items-center justify-center rounded border border-line text-[14px] disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-4 text-center font-mono text-[13px] tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => changeQty(qty + 1)}
                  aria-label="수량 늘리기"
                  className="flex h-6 w-6 items-center justify-center rounded border border-line text-[14px]"
                >
                  +
                </button>
              </div>
              <span className="font-mono text-[14px] font-bold">{priceText(goods)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 쿠폰 */}
      <div className="px-4 pt-4">
        <label className="text-[12.5px] font-semibold">쿠폰 코드</label>
        <div className="mt-1.5 flex gap-2">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="WELCOME5"
            disabled={applied}
            className="min-w-0 flex-1 rounded-lg border border-line bg-card px-3 py-2.5 text-[13px] outline-none focus:border-brand disabled:opacity-60"
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={applied || !coupon.trim()}
            className="shrink-0 rounded-lg border border-ink px-4 text-[12.5px] font-bold disabled:opacity-40"
          >
            {applied ? "적용됨" : "적용"}
          </button>
        </div>
        {msg && <p className="mt-1.5 text-[11.5px] text-brand">{msg}</p>}
      </div>

      {/* 결제 요약 */}
      <div className="mt-4 px-4">
        <dl className="flex flex-col gap-2 rounded-lg border border-line bg-card p-3.5 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-muted">상품 금액</dt>
            <dd className="font-mono tabular-nums">{priceText(goods)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-brand">
              <dt>쿠폰 할인</dt>
              <dd className="font-mono tabular-nums">−{priceText(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">배송비</dt>
            <dd className="font-mono tabular-nums">
              {shipping === 0 ? "무료" : priceText(shipping)}
            </dd>
          </div>
          <div className="mt-1 flex items-baseline justify-between border-t border-line pt-2.5">
            <dt className="font-bold">결제 예정 금액</dt>
            <dd className="font-mono text-[17px] font-extrabold tabular-nums text-brand">
              {priceText(total)}
            </dd>
          </div>
        </dl>

        <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
          실제 결제가 일어나지 않습니다. 버튼을 누르면{" "}
          <span className="font-mono">purchase</span> 이벤트만 기록됩니다.
        </p>

        <Link
          href="/demo"
          className="mt-3 block py-2 text-center text-[12.5px] font-semibold text-muted"
        >
          쇼핑 계속하기
        </Link>
      </div>

      {/* 하단 고정 결제 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[420px] border-t border-line bg-paper/95 px-4 py-2.5 backdrop-blur">
        <button
          type="button"
          onClick={purchase}
          disabled={busy}
          className="w-full rounded-lg bg-brand py-3.5 text-[14.5px] font-bold text-white active:scale-[0.985] disabled:opacity-60"
        >
          {busy ? "처리 중…" : `${priceText(total)} 결제하기`}
        </button>
      </div>
    </main>
  );
}
