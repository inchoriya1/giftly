"use client";

import Link from "next/link";
import { BRAND_NAME } from "@/data/products";
import type { Variant } from "@/lib/types";

/* ────────────────────────────────────────────────────────────
   상점 크롬 — 헤더 + 카테고리 바

   실제 커머스처럼 보이되, 실제 판매로 오인되면 안 됩니다.
   그래서 최상단에 계속 「샘플」 띠를 답니다.
   ──────────────────────────────────────────────────────────── */

const CATEGORIES = ["전체", "주방", "의류", "수납", "뷰티", "디지털", "운동"];

export function DemoStrip({ variant }: { variant: Variant }) {
  return (
    <div className="flex items-center gap-2 bg-[#2b2622] px-3.5 py-[7px] text-white">
      <span className="rounded-[3px] bg-[#e0a01a] px-1.5 py-[1px] font-mono text-[9px] font-bold text-[#2b2622]">
        샘플
      </span>
      <p className="flex-1 text-[10.5px] leading-snug text-white/70">
        측정용 가상 페이지 · 실제 판매하지 않습니다
      </p>
      <span className="font-mono text-[10px] text-white/50">
        {variant}안 {variant === "B" ? "혜택 강조형" : "기존 상세형"}
      </span>
      <Link
        href="/"
        className="text-[10.5px] font-semibold text-white/80 underline underline-offset-2"
      >
        대시보드
      </Link>
    </div>
  );
}

export function StoreHeader({
  variant,
  cartCount = 0,
  back,
}: {
  variant: Variant;
  cartCount?: number;
  back?: { href: string; label: string };
}) {
  return (
    <>
      <DemoStrip variant={variant} />

      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="flex h-[46px] items-center gap-2.5 px-4">
          {back ? (
            <Link
              href={back.href}
              aria-label={back.label}
              className="-ml-1 flex h-7 w-7 items-center justify-center text-[17px] text-ink"
            >
              ‹
            </Link>
          ) : (
            <button
              type="button"
              aria-label="메뉴"
              className="-ml-1 flex h-7 w-7 flex-col items-center justify-center gap-[3px]"
            >
              <span className="block h-[1.5px] w-[15px] bg-ink" />
              <span className="block h-[1.5px] w-[15px] bg-ink" />
              <span className="block h-[1.5px] w-[15px] bg-ink" />
            </button>
          )}

          <Link href="/demo" className="text-[15px] font-extrabold tracking-tight">
            {BRAND_NAME}
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-label="검색"
              className="flex h-7 w-7 items-center justify-center text-[15px] text-ink/70"
            >
              ⌕
            </button>
            <Link
              href="/demo/cart"
              aria-label="장바구니"
              className="relative flex h-7 w-7 items-center justify-center text-[15px] text-ink/70"
            >
              ⌂
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-brand px-[3px] font-mono text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav className="flex gap-4 overflow-x-auto border-t border-line/70 px-4 py-2">
          {CATEGORIES.map((c, i) => (
            <button
              key={c}
              type="button"
              className={`shrink-0 pb-[3px] text-[12.5px] whitespace-nowrap ${
                i === 0
                  ? "border-b-[1.5px] border-ink font-bold text-ink"
                  : "text-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </nav>
      </header>
    </>
  );
}

export function StoreFooter() {
  return (
    <footer className="mt-8 border-t border-line px-4 py-5">
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        <span>회사소개</span>
        <span>이용약관</span>
        <span className="font-semibold text-ink/70">개인정보처리방침</span>
        <span>고객센터</span>
      </div>
      <p className="mt-2.5 text-[10.5px] leading-relaxed text-muted/80">
        이 페이지는 마케팅 성과 대시보드의 측정 대상으로 만든 가상 상점입니다.
        <br />
        상품·가격·후기는 모두 가상이며 실제 거래가 발생하지 않습니다.
      </p>
    </footer>
  );
}
