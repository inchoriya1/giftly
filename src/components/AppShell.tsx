"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/* ────────────────────────────────────────────────────────────
   말랑펫 랜딩과 같은 상단 고정 네비.
   레일 대신 한 줄로 섹션을 오갑니다.
   ──────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: "overview", label: "개요" },
  { id: "actions", label: "추천" },
  { id: "channels", label: "채널" },
  { id: "funnel", label: "퍼널" },
  { id: "segments", label: "세그먼트" },
  { id: "experiment", label: "실험" },
];

export function AppShell({
  page = "dash",
  active,
  onNavigate,
  toolbar,
  children,
}: {
  page?: "dash" | "admin";
  active?: string;
  onNavigate?: (id: string) => void;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <nav className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-panel/90 px-4 py-2.5 backdrop-blur-md">
        <Link href="/" className="text-[16px] font-extrabold text-brand">
          Giftly
        </Link>
        <div className="hidden items-center gap-3 md:flex">
          {SECTIONS.map((s) => {
            const isOn = page === "dash" && active === s.id;
            const cls = `text-[14px] ${isOn ? "font-bold text-ink" : "text-muted hover:text-ink"}`;
            return page === "dash" && onNavigate ? (
              <button
                key={s.id}
                type="button"
                onClick={() => onNavigate(s.id)}
                aria-current={isOn ? "true" : undefined}
                className={cls}
              >
                {s.label}
              </button>
            ) : (
              <Link key={s.id} href={`/#${s.id}`} className={cls}>
                {s.label}
              </Link>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {toolbar}
          <Link
            href="/demo"
            className="rounded-lg border border-line bg-card px-2.5 py-1 text-[13px] text-ink"
          >
            샘플 랜딩
          </Link>
          <Link
            href="/admin"
            className={`rounded-lg border px-2.5 py-1 text-[13px] ${
              page === "admin"
                ? "border-brand bg-brand-soft font-bold text-acc-ink"
                : "border-line bg-card text-ink"
            }`}
          >
            수집 원본
          </Link>
        </div>
      </nav>

      <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 md:hidden">
        {SECTIONS.map((s) => {
          const isOn = page === "dash" && active === s.id;
          const cls = `shrink-0 rounded-full px-3 py-1 text-[13px] font-bold ${
            isOn ? "bg-brand text-brand-ink" : "border border-line bg-card text-ink"
          }`;
          return page === "dash" && onNavigate ? (
            <button key={s.id} type="button" onClick={() => onNavigate(s.id)} className={cls}>
              {s.label}
            </button>
          ) : (
            <Link key={s.id} href={`/#${s.id}`} className={cls}>
              {s.label}
            </Link>
          );
        })}
      </div>

      <main className="mx-auto max-w-[1120px] px-4 pb-16">{children}</main>
    </div>
  );
}

export function Tag({
  children,
  plain = false,
}: {
  children: ReactNode;
  plain?: boolean;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-bold ${
        plain
          ? "border border-line text-muted"
          : "bg-brand-soft text-acc-ink"
      }`}
    >
      {children}
    </span>
  );
}

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
    <div className="flex flex-wrap gap-1" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-full px-3 py-1 text-[13px] font-bold ${
            value === o.value
              ? "bg-brand text-brand-ink"
              : "border border-line bg-card text-ink"
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
    <label className="flex items-center gap-2">
      <span className="text-[13px] text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-8 rounded-lg border border-line bg-card px-2 text-[13px] text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Section({
  id,
  n,
  title,
  note,
  right,
  children,
}: {
  id: string;
  n?: string;
  title: string;
  note?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[72px]">
      <h2 className="mt-10 mb-3 flex flex-wrap items-center gap-2 border-b border-line pb-2 text-[18px] font-bold">
        {n && <span className="text-brand">{n}</span>}
        {title}
        {note && <span className="text-[14px] font-medium text-muted">{note}</span>}
        {right && <div className="ml-auto font-medium">{right}</div>}
      </h2>
      {children}
    </section>
  );
}

export function Panel({
  title,
  note,
  well = false,
  className = "",
  children,
}: {
  title?: string;
  note?: string;
  /** 차트처럼 밝은 배경이 필요한 내용 */
  well?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-panel ${className}`}>
      {title && (
        <div className="flex items-center gap-2 border-b border-line bg-card px-3.5 py-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
          <h3 className="text-[13px] font-bold">{title}</h3>
          {note && (
            <span className="ml-auto text-[12px] font-medium text-muted">{note}</span>
          )}
        </div>
      )}
      <div className={well ? "bg-sheet p-4 text-sheet-ink" : "p-4"}>{children}</div>
    </div>
  );
}

export function Notice({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-2 flex gap-3 rounded-xl border border-dashed border-line bg-card px-4 py-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-extrabold text-acc-ink">
        i
      </span>
      <div className="text-[14px] leading-relaxed text-muted">
        <span className="mr-2 font-bold text-acc-ink">{label}</span>
        {children}
      </div>
    </div>
  );
}
