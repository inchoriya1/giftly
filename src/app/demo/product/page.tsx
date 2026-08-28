"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { findProduct } from "@/data/products";
import { track } from "@/lib/analytics";
import { addToCart, ensureSession } from "@/lib/session";
import type { Variant } from "@/lib/types";
import { ProductThumb } from "@/components/ProductThumb";
import { Button, priceText } from "@/components/ui";
import { DemoBanner } from "@/components/DemoBanner";

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

  useEffect(() => {
    const { variant: v } = ensureSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 클라이언트 전용 값
    setVariant(v);
    track("page_view", { page_path: "/demo/product" });
  }, []);

  if (!variant) return <div className="min-h-dvh" />;

  const isB = variant === "B";
  const off = Math.round((1 - product.price / product.listPrice) * 100);

  function add() {
    addToCart(product.id);
    track("add_to_cart", { product_id: product.id });
    router.push("/demo/cart");
  }

  return (
    <main className="fade-up flex min-h-dvh flex-col">
      <DemoBanner variant={variant} />

      <div className="px-5 pt-3">
        <Link href="/demo" className="text-[12.5px] font-semibold text-muted">
          ← 목록으로
        </Link>
      </div>

      <div className="mt-3 px-5">
        <ProductThumb product={product} size={380} className="rounded-xl" />
      </div>

      <div className="flex flex-col gap-3 px-5 pt-5">
        <div>
          <h1 className="text-[22px] leading-snug font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">{product.tagline}</p>
        </div>

        {isB ? (
          <div className="rounded-xl border border-brand bg-brand-soft p-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[22px] font-bold text-brand">
                {off}%
              </span>
              <span className="font-mono text-[20px] font-bold">
                {priceText(product.price)}
              </span>
              <span className="font-mono text-[14px] text-muted line-through">
                {priceText(product.listPrice)}
              </span>
            </div>
            <p className="mt-2 text-[12.5px] font-semibold text-brand">
              ★ {product.rating} · 후기 {product.reviewCount.toLocaleString("ko-KR")}건
              · 오늘 주문 시 내일 도착
            </p>
          </div>
        ) : (
          <p className="font-mono text-[20px] font-bold">{priceText(product.price)}</p>
        )}

        <dl className="rounded-xl border border-line bg-card p-4">
          <dt className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
            제품 정보
          </dt>
          <dd className="mt-2 flex flex-col gap-1.5">
            {product.features.map((f) => (
              <span key={f} className="text-[13.5px]">
                · {f}
              </span>
            ))}
          </dd>
        </dl>
      </div>

      <div className="mt-auto p-5">
        <Button onClick={add}>장바구니에 담기</Button>
      </div>
    </main>
  );
}
