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
import { ProductArt } from "@/components/ProductArt";
import { priceText } from "@/components/ui";
import { StoreFooter, StoreHeader } from "@/components/StoreChrome";
import { IconMinus, IconPlus } from "@/components/icons";

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
    /* GA4 는 transaction_id 로 중복 주문을 제거합니다.
       주문번호를 먼저 만들어 이벤트와 완료 화면이 같은 값을 쓰게 합니다. */
    const orderNo = makeOrderNo();
    track("purchase", {
      transaction_id: orderNo,
      product_id: product!.id,
      qty,
      value: total,
      items: [
        {
          item_id: String(product!.id),
          item_name: product!.name,
          price: product!.price,
          quantity: qty,
        },
      ],
    });

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

    clearCart();
    router.push(`/demo/done?no=${orderNo}&amt=${total}`);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      <StoreHeader
        variant={variant}
        cartCount={qty}
        back={{ href: "/demo", label: "쇼핑 계속하기" }}
        title="장바구니"
      />

      <div className="store-wrap grid gap-10 py-8 lg:grid-cols-[1fr_320px]">
        <div>
          {toFree > 0 && (
            <p className="mb-4 text-[13px]">
              <span className="font-bold">{priceText(toFree)}</span> 더 담으면
              무료배송
            </p>
          )}

          <div className="flex gap-5 border-y border-line py-5">
            <div className="h-[88px] w-[88px] shrink-0 bg-studio">
              <ProductArt product={product} size={88} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted">{product.brand}</p>
              <h2 className="mt-0.5 text-[14px]">{product.name}</h2>
              <p className="mt-4 text-[15px] font-bold tabular-nums">
                {priceText(goods)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeQty(qty - 1)}
                  disabled={qty <= 1}
                  aria-label="수량 줄이기"
                  className="flex h-7 w-7 items-center justify-center border border-line disabled:opacity-40"
                >
                  <IconMinus size={14} />
                </button>
                <span className="w-6 text-center text-[13px] tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => changeQty(qty + 1)}
                  aria-label="수량 늘리기"
                  className="flex h-7 w-7 items-center justify-center border border-line"
                >
                  <IconPlus size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="text-[13px] font-bold">쿠폰</label>
            <div className="mt-2 flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="쿠폰 코드"
                disabled={applied}
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 text-[13px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={applied || !coupon.trim()}
                className="h-11 shrink-0 rounded-xl border border-line bg-card px-4 text-[13px] font-extrabold disabled:opacity-40"
              >
                {applied ? "적용됨" : "적용"}
              </button>
            </div>
            {msg && <p className="mt-2 text-[12px] text-sale">{msg}</p>}
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-line bg-panel p-5 lg:sticky lg:top-[88px]">
          <h2 className="text-[14px] font-bold">결제 금액</h2>
          <dl className="mt-4 flex flex-col gap-2.5 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted">상품 금액</dt>
              <dd className="tabular-nums">{priceText(goods)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sale">
                <dt>쿠폰 할인</dt>
                <dd className="tabular-nums">−{priceText(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">배송비</dt>
              <dd className="tabular-nums">
                {shipping === 0 ? "무료" : priceText(shipping)}
              </dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-bold">결제 예정</dt>
              <dd className="text-[18px] font-extrabold tabular-nums">
                {priceText(total)}
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            실제 결제가 일어나지 않습니다. 버튼을 누르면 purchase 이벤트만
            기록됩니다.
          </p>

          <button
            type="button"
            onClick={purchase}
            disabled={busy}
            className="mt-5 h-12 w-full rounded-xl bg-brand text-[14px] font-extrabold text-brand-ink disabled:opacity-60"
          >
            {busy ? "처리 중…" : `${priceText(total)} 결제하기`}
          </button>
          <Link href="/demo" className="mt-3 block text-center text-[13px] text-muted">
            쇼핑 계속하기
          </Link>
        </aside>
      </div>

      <StoreFooter />
    </main>
  );
}
