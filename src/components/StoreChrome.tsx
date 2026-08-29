"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { BRAND_NAME } from "@/data/products";
import { CATEGORIES, type Category, type Variant } from "@/lib/types";
import {
  IconBack,
  IconCart,
  IconGrid,
  IconHome,
  IconSearch,
  IconUser,
} from "@/components/icons";

const WORDMARK = BRAND_NAME.replace(" ", "");

export function DemoStrip({ variant }: { variant: Variant }) {
  return (
    <div className="border-b border-line bg-brand-soft">
      <div className="store-wrap flex items-center justify-between gap-3 py-2 text-[13px]">
        <p>
          <span className="font-extrabold text-acc-ink">샘플</span>
          <span className="mx-2 text-muted">·</span>
          측정용 가상 상점입니다. 실제 판매하지 않습니다 · {variant}안{" "}
          {variant === "B" ? "혜택" : "기본"}
        </p>
        <Link href="/" className="shrink-0 font-bold text-brand">
          대시보드
        </Link>
      </div>
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

      <header className="sticky top-0 z-30 border-b border-line bg-panel/90 backdrop-blur-md">
        <div className="store-wrap flex h-14 items-center gap-3">
          {back ? (
            <Link
              href={back.href}
              aria-label={back.label}
              className="-ml-1 flex h-9 w-9 items-center justify-center"
            >
              <IconBack />
            </Link>
          ) : null}

          {search?.open ? (
            <div className="flex flex-1 items-center gap-3">
              <input
                ref={inputRef}
                value={search.query}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder="상품을 검색해보세요"
                className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-[14px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              />
              <button
                type="button"
                onClick={search.onToggle}
                className="shrink-0 text-[13px] text-muted"
              >
                취소
              </button>
            </div>
          ) : (
            <>
              {title ? (
                <h1 className="text-[16px] font-extrabold">{title}</h1>
              ) : (
                <Link href="/demo" className="text-[16px] font-extrabold text-brand">
                  {WORDMARK}
                </Link>
              )}

              {search && (
                <div className="mx-auto hidden w-full max-w-[360px] md:block">
                  <input
                    value={search.query}
                    onChange={(e) => search.onChange(e.target.value)}
                    placeholder="검색어를 입력하세요"
                    className="h-9 w-full rounded-lg border border-line bg-card px-3 text-[13px] outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  />
                </div>
              )}

              <div className="ml-auto flex items-center gap-1">
                {search && (
                  <button
                    type="button"
                    aria-label="검색"
                    onClick={search.onToggle}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-card md:hidden"
                  >
                    <IconSearch />
                  </button>
                )}
                <Link
                  href="/demo/cart"
                  aria-label={`장바구니 ${cartCount}개`}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-card"
                >
                  <IconCart />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-brand px-[4px] text-[10px] font-extrabold text-brand-ink">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </>
          )}
        </div>

        {category && (
          <nav className="store-wrap flex h-11 items-center gap-2 overflow-x-auto pb-2">
            {(["전체", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => category.onChange(c)}
                aria-pressed={category.value === c}
                className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-bold ${
                  category.value === c
                    ? "bg-brand text-brand-ink"
                    : "border border-line bg-card text-ink"
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
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-panel md:hidden">
      {tabs.map((t) => {
        const inner = (
          <>
            <span className="relative">
              {t.icon}
              {t.badge ? (
                <span className="absolute -top-1 -right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-brand px-[3px] text-[9px] font-extrabold text-brand-ink">
                  {t.badge}
                </span>
              ) : null}
            </span>
            <span className="text-[10px]">{t.label}</span>
          </>
        );
        const cls = `flex flex-1 flex-col items-center gap-[3px] py-2.5 ${
          t.active ? "font-bold text-brand" : "text-muted"
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
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <motion.div
        initial={{ y: 24 }}
        animate={{ y: 0 }}
        exit={{ y: 12 }}
        transition={{ duration: 0.18 }}
        className="relative w-full rounded-t-xl border border-line bg-panel pb-5 md:max-w-[420px] md:rounded-xl"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-[16px] font-extrabold">{title}</h2>
          <button type="button" onClick={onClose} className="text-[13px] text-muted">
            닫기
          </button>
        </div>
        <div className="px-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

export function SheetHost({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <Sheet key={title} title={title} onClose={onClose}>
          {children}
        </Sheet>
      )}
    </AnimatePresence>
  );
}

export function StoreFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="store-wrap py-10">
        <p className="text-[16px] font-extrabold text-brand">{WORDMARK}</p>
        <p className="mt-2 max-w-[36rem] text-[14px] text-muted">
          이 페이지는 마케팅 성과 대시보드의 측정 대상으로 만든 가상 상점입니다.
          상품·가격·후기·사업자 정보는 모두 가상이며 실제 거래가 발생하지 않습니다.
        </p>
        <div className="mt-5 rounded-xl border border-line bg-card p-4 text-[12px] leading-relaxed text-muted">
          <p>(주)샘플스토어 · 대표 가상인 · 사업자등록번호 000-00-00000 (가상)</p>
          <p>통신판매업신고 제0000-서울강남-0000호 · 서울특별시 강남구 (가상 주소)</p>
          <p>고객센터 0000-0000 · 평일 10:00–17:00</p>
        </div>
      </div>
    </footer>
  );
}
