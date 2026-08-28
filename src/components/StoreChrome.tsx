"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BRAND_NAME } from "@/data/products";
import { CATEGORIES, type Category, type Variant } from "@/lib/types";
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

   여기 있는 컨트롤은 전부 실제로 동작합니다.
   눌러도 아무 일 없는 장식 버튼은 두지 않습니다 —
   그러면 사이트가 아니라 사이트 그림이 됩니다.
   ──────────────────────────────────────────────────────────── */

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
  search,
  category,
}: {
  variant: Variant;
  cartCount?: number;
  back?: { href: string; label: string };
  title?: string;
  search?: {
    open: boolean;
    query: string;
    onToggle: () => void;
    onChange: (v: string) => void;
  };
  category?: { value: Category | "전체"; onChange: (c: Category | "전체") => void };
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (search?.open) inputRef.current?.focus();
  }, [search?.open]);

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
              onClick={() => category?.onChange("전체")}
              className="-ml-1.5 flex h-8 w-8 items-center justify-center text-ink"
            >
              <IconMenu />
            </button>
          )}

          {search?.open ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                ref={inputRef}
                value={search.query}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder="상품명으로 검색"
                className="min-w-0 flex-1 rounded-lg border border-line bg-card px-3 py-1.5 text-[13px] outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={search.onToggle}
                className="shrink-0 text-[12.5px] font-semibold text-muted"
              >
                취소
              </button>
            </div>
          ) : (
            <>
              {title ? (
                <h1 className="text-[15px] font-bold tracking-tight">{title}</h1>
              ) : (
                <Link
                  href="/demo"
                  className="text-[16px] font-extrabold tracking-tight"
                >
                  {BRAND_NAME}
                </Link>
              )}

              <div className="ml-auto flex items-center gap-0.5">
                {search && (
                  <button
                    type="button"
                    aria-label="검색"
                    onClick={search.onToggle}
                    className="flex h-8 w-8 items-center justify-center text-ink/75"
                  >
                    <IconSearch />
                  </button>
                )}
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
            </>
          )}
        </div>

        {category && (
          <nav className="flex gap-4 overflow-x-auto border-t border-line/70 px-3.5 py-2">
            {(["전체", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => category.onChange(c)}
                aria-pressed={category.value === c}
                className={`shrink-0 pb-[3px] text-[12.5px] whitespace-nowrap transition ${
                  category.value === c
                    ? "border-b-[1.5px] border-ink font-bold text-ink"
                    : "text-muted hover:text-ink"
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

/** 하단 탭 — 목록 화면에만. 상세·장바구니는 구매 바가 그 자리를 씁니다. */
export function BottomTabs({
  cartCount = 0,
  onHome,
  onCategory,
  onSearch,
  onMy,
}: {
  cartCount?: number;
  onHome: () => void;
  onCategory: () => void;
  onSearch: () => void;
  onMy: () => void;
}) {
  const tabs = [
    { icon: <IconHome />, label: "홈", onClick: onHome, active: true },
    { icon: <IconGrid />, label: "카테고리", onClick: onCategory },
    { icon: <IconSearch />, label: "검색", onClick: onSearch },
    { icon: <IconCart />, label: "장바구니", href: "/demo/cart", badge: cartCount },
    { icon: <IconUser />, label: "마이", onClick: onMy },
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
          <button key={t.label} type="button" onClick={t.onClick} className={cls}>
            {inner}
          </button>
        );
      })}
    </nav>
  );
}

/** 하단 시트 — 카테고리 선택 · 마이 */
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />
      <div className="relative mx-auto w-full max-w-[420px] rounded-t-2xl border-t border-line bg-paper pb-5">
        <div className="flex items-center justify-between px-4 py-3.5">
          <h2 className="text-[14.5px] font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[12.5px] font-semibold text-muted"
          >
            닫기
          </button>
        </div>
        <div className="px-4">{children}</div>
      </div>
    </div>
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
