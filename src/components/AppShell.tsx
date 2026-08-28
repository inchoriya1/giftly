"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/* ────────────────────────────────────────────────────────────
   앱 셸 — 좌측 레일 + 상단 바

   분석 도구는 랜딩페이지가 아닙니다. 매일 여는 작업 화면이라
   내비게이션이 항상 같은 자리에 있고, 콘텐츠는 밀도가 높습니다.

   레일 항목은 전부 실제로 동작합니다. 없는 화면으로 가는
   가짜 메뉴는 넣지 않습니다.
   ──────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: "overview", label: "개요" },
  { id: "actions", label: "추천 액션" },
  { id: "channels", label: "채널" },
  { id: "funnel", label: "퍼널" },
  { id: "segments", label: "세그먼트" },
  { id: "experiment", label: "실험" },
];

export function AppShell({
  active,
  onNavigate,
  toolbar,
  children,
}: {
  active: string;
  onNavigate: (id: string) => void;
  toolbar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-app text-txt">
      {/* ── 좌측 레일 ── */}
      <aside className="fixed inset-y-0 left-0 hidden w-[196px] flex-col border-r border-black/10 bg-rail lg:flex">
        <div className="flex h-[52px] items-center gap-2 border-b border-white/8 px-4">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded bg-white/95 font-mono text-[11px] font-bold text-rail">
            M
          </span>
          <span className="text-[13px] font-semibold text-rail-on">
            마케팅 대시보드
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
          <p className="px-2 pt-1 pb-2 font-mono text-[9.5px] tracking-[0.14em] text-white/35 uppercase">
            분석
          </p>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onNavigate(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              className={`rounded px-2 py-[7px] text-left text-[12.5px] transition ${
                active === s.id
                  ? "bg-white/10 font-semibold text-rail-on"
                  : "text-rail-ink hover:bg-white/5 hover:text-rail-on"
              }`}
            >
              {s.label}
            </button>
          ))}

          <div className="my-3 border-t border-white/8" />
          <p className="px-2 pb-2 font-mono text-[9.5px] tracking-[0.14em] text-white/35 uppercase">
            데이터 소스
          </p>
          <Link
            href="/demo"
            className="rounded px-2 py-[7px] text-[12.5px] text-rail-ink transition hover:bg-white/5 hover:text-rail-on"
          >
            샘플 랜딩 ↗
          </Link>
          <Link
            href="/admin"
            className="rounded px-2 py-[7px] text-[12.5px] text-rail-ink transition hover:bg-white/5 hover:text-rail-on"
          >
            수집 원본 ↗
          </Link>
        </nav>

        <div className="border-t border-white/8 px-3 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fab219]" />
            <span className="font-mono text-[10px] tracking-wide text-white/60">
              DEMO MODE
            </span>
          </div>
          <p className="mt-1 text-[10.5px] leading-snug text-white/35">
            가상 데이터로 동작 중
          </p>
        </div>
      </aside>

      {/* ── 본문 ── */}
      <div className="lg:pl-[196px]">
        <header className="sticky top-0 z-20 border-b border-edge bg-panel/95 backdrop-blur">
          <div className="flex h-[52px] items-center gap-3 px-4 lg:px-6">
            <span className="text-[13px] font-semibold lg:hidden">
              마케팅 대시보드
            </span>
            <h1 className="hidden text-[13.5px] font-semibold lg:block">
              {SECTIONS.find((s) => s.id === active)?.label ?? "개요"}
            </h1>
            <div className="ml-auto flex items-center gap-2">{toolbar}</div>
          </div>
        </header>

        <main className="px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}

/* ── 툴바 조각 ── */

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      className="flex items-center rounded-md border border-edge bg-panel p-[2px]"
      role="group"
      aria-label={label}
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-[4px] px-2.5 py-[5px] font-mono text-[11.5px] transition ${
            value === o.value
              ? "bg-txt text-white"
              : "text-txt-2 hover:bg-edge-2"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Select<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <label className="relative flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none rounded-md border border-edge bg-panel py-[6px] pr-7 pl-2.5 text-[12.5px] font-medium text-txt outline-none focus-visible:border-acc"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-[9px] text-txt-3">
        ▼
      </span>
    </label>
  );
}

/* ── 섹션 · 패널 ── */

export function Section({
  id,
  title,
  note,
  right,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[68px]">
      <div className="mb-2.5 flex items-baseline gap-2.5 border-b border-edge pb-2">
        <h2 className="text-[13px] font-semibold">{title}</h2>
        {note && <span className="text-[11.5px] text-txt-3">{note}</span>}
        {right && <div className="ml-auto">{right}</div>}
      </div>
      {children}
    </section>
  );
}

export function Panel({
  title,
  note,
  className = "",
  children,
}: {
  title?: string;
  note?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-md border border-edge bg-panel ${className}`}>
      {title && (
        <div className="flex items-baseline gap-2 border-b border-edge-2 px-3.5 py-2.5">
          <h3 className="font-mono text-[10px] tracking-[0.12em] text-txt-2 uppercase">
            {title}
          </h3>
          {note && <span className="text-[11px] text-txt-3">{note}</span>}
        </div>
      )}
      <div className="p-3.5">{children}</div>
    </div>
  );
}
