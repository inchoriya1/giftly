"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { findProduct } from "@/data/products";
import { track } from "@/lib/analytics";
import { clearCart, ensureSession, readCart } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import type { Product, Variant } from "@/lib/types";
import { ProductThumb } from "@/components/ProductThumb";
import { Button, priceText } from "@/components/ui";
import { DemoBanner } from "@/components/DemoBanner";

export default function CartPage() {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { variant: v } = ensureSession();
    const id = readCart();
    if (!id) {
      router.replace("/demo");
      return;
    }
    /* eslint-disable react-hooks/set-state-in-effect -- 클라이언트 전용 값 */
    setVariant(v);
    setProduct(findProduct(id));
    /* eslint-enable react-hooks/set-state-in-effect */
    track("page_view", { page_path: "/demo/cart" });
  }, [router]);

  if (!variant || !product) return <div className="min-h-dvh" />;

  const shipping = product.price >= 30000 ? 0 : 3000;
  const total = product.price + shipping;

  async function purchase() {
    if (!product) return;
    setBusy(true);
    track("purchase", { product_id: product.id, value: total });

    if (supabase) {
      const { sessionId, variant: v } = ensureSession();
      try {
        await supabase.from("sessions").insert({
          session_id: sessionId,
          variant: v,
          product_id: product.id,
          amount: total,
          purchased: true,
        });
      } catch {
        /* 수집 실패는 무시 — 사용자 흐름이 우선입니다 */
      }
    }
    clearCart();
    router.push("/demo/done");
  }

  return (
    <main className="fade-up flex min-h-dvh flex-col">
      <DemoBanner variant={variant} />

      <div className="px-5 pt-5">
        <h1 className="text-[22px] font-bold tracking-tight">장바구니</h1>
      </div>

      <div className="mt-4 px-5">
        <article className="grid grid-cols-[86px_1fr] items-center gap-3.5 rounded-xl border border-line bg-card p-3">
          <ProductThumb product={product} size={86} className="rounded-lg" />
          <div>
            <h2 className="text-[14.5px] font-bold">{product.name}</h2>
            <p className="mt-0.5 text-[12px] text-muted">수량 1개</p>
            <p className="mt-1.5 font-mono text-[14px] font-bold">
              {priceText(product.price)}
            </p>
          </div>
        </article>

        <dl className="mt-4 flex flex-col gap-2 rounded-xl border border-line bg-card p-4 text-[13.5px]">
          <div className="flex justify-between">
            <dt className="text-muted">상품 금액</dt>
            <dd className="font-mono tabular-nums">{priceText(product.price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">배송비</dt>
            <dd className="font-mono tabular-nums">
              {shipping === 0 ? "무료" : priceText(shipping)}
            </dd>
          </div>
          <div className="mt-1 flex justify-between border-t border-line pt-2.5">
            <dt className="font-bold">결제 예정 금액</dt>
            <dd className="font-mono text-[16px] font-bold tabular-nums text-brand">
              {priceText(total)}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
          실제 결제가 일어나지 않습니다. 버튼을 누르면 구매 완료 이벤트만
          기록됩니다.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2 p-5">
        <Button onClick={purchase} disabled={busy}>
          {busy ? "처리 중…" : `${priceText(total)} 결제하기`}
        </Button>
        <Link
          href="/demo"
          className="py-2 text-center text-[13px] font-semibold text-muted"
        >
          계속 둘러보기
        </Link>
      </div>
    </main>
  );
}
