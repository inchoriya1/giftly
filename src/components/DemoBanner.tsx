"use client";

import Link from "next/link";
import type { Variant } from "@/lib/types";

/**
 * 이 페이지가 실제 쇼핑몰이 아니라는 걸 계속 알려줍니다.
 * 발표 중에 심사위원이 열어볼 수 있으므로, 실제 판매처럼 보이면 안 됩니다.
 */
export function DemoBanner({ variant }: { variant: Variant }) {
  return (
    <div className="flex items-center gap-2 border-b border-line bg-[#fef8e9] px-4 py-2">
      <span className="shrink-0 rounded bg-[#fab219] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#0b0b0b]">
        샘플
      </span>
      <p className="flex-1 text-[11px] leading-snug text-[#6b5a1f]">
        측정용 가상 페이지입니다. 실제 판매하지 않습니다 ·{" "}
        <span className="font-mono font-bold">
          {variant}안 {variant === "B" ? "혜택 강조형" : "기존 상세형"}
        </span>
      </p>
      <Link
        href="/"
        className="shrink-0 text-[11px] font-semibold text-brand underline underline-offset-2"
      >
        대시보드
      </Link>
    </div>
  );
}
