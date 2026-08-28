"use client";

import Link from "next/link";
import { BRAND_NAME } from "@/data/products";
import type { Variant } from "@/lib/types";
import {
  IconBack,
  IconCart,
  IconGrid,
  IconHome,
  IconMenu,
  IconSearch,
  IconUser,
} from "@/components/icons";

/* ────────────────────────────────────────────────────────────
   상점 크롬

   실제 커머스처럼 보이되, 실제 판매로 오인되면 안 됩니다.
   진짜처럼 만들수록 최상단 「샘플」 띠가 더 중요해집니다.
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
        {variant}안 {variant === "B" ? "혜택" : "기본"}
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
  title,
}: {
  variant: Variant;
  cartCount?: number;
  back?: { href: string; label: string };
  title?: string;
}) {
  return (
    <>
      <DemoStrip variant={variant} />

      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="flex h-[48px] items-center gap-2 px-3.5">
          {back ? (
            <Link
              href={back.href}
              aria-label={back.label}
              className="-ml-1.5 flex h-8 w-8 items-center justify-center text-ink"
            >
              <IconBack />
            </Link>
          ) : (
            <button
              type="button"
              aria-label="메뉴"
              className="-ml-1.5 flex h-8 w-8 items-center justify-center text-ink"
            >
              <IconMenu />
            </button>
          )}

          {title ? (
            <h1 className="text-[15px] font-bold tracking-tight">{title}</h1>
          ) : (
            <Link href="/demo" className="text-[16px] font-extrabold tracking-tight">
              {BRAND_NAME}
            </Link>
          )}

          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              aria-label="검색"
              className="flex h-8 w-8 items-center justify-center text-ink/75"
            >
              <IconSearch />
            </button>
            <Link
              href="/demo/cart"
              aria-label={`장바구니 ${cartCount}개`}
              className="relative flex h-8 w-8 items-center justify-center text-ink/75"
            >
              <IconCart />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-brand px-[3.5px] font-mono text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {!back && (
          <nav className="flex gap-4 overflow-x-auto border-t border-line/70 px-3.5 py-2">
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
        )}
      </header>
    </>
  );
}

/** 하단 탭 — 목록 화면에만 답니다. 상세·장바구니는 구매 바가 대신합니다. */
export function BottomTabs({ cartCount = 0 }: { cartCount?: number }) {
  const tabs = [
    { icon: <IconHome />, label: "홈", active: true, href: "/demo" },
    { icon: <IconGrid />, label: "카테고리" },
    { icon: <IconSearch />, label: "검색" },
    { icon: <IconCart />, label: "장바구니", href: "/demo/cart", badge: cartCount },
    { icon: <IconUser />, label: "마이" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[420px] border-t border-line bg-paper/97 backdrop-blur">
      {tabs.map((t) => {
        const inner = (
          <>
            <span className="relative">
              {t.icon}
              {t.badge ? (
                <span className="absolute -top-1 -right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-brand px-[3px] font-mono text-[8.5px] font-bold text-white">
                  {t.badge}
                </span>
              ) : null}
            </span>
            <span className="text-[10px]">{t.label}</span>
          </>
        );
        const cls = `flex flex-1 flex-col items-center gap-[3px] py-2 ${
          t.active ? "font-semibold text-ink" : "text-muted"
        }`;
        return t.href ? (
          <Link key={t.label} href={t.href} className={cls}>
            {inner}
          </Link>
        ) : (
          <button key={t.label} type="button" className={cls}>
            {inner}
          </button>
        );
      })}
    </nav>
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
