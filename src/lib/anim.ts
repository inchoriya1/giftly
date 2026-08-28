"use client";

/* ────────────────────────────────────────────────────────────
   애니메이션 공용 설정

   두 라이브러리를 역할로 나눠 씁니다. 섞어 쓰면 같은 요소를
   양쪽에서 건드려 충돌합니다.

   Motion   — 컴포넌트 마운트·언마운트, 카드 순차 등장, 탭 전환
   anime.js — 숫자 카운트업, SVG 선 그리기, 막대 채우기

   대시보드는 읽는 화면입니다. 움직임이 숫자 읽는 걸 방해하면
   그 애니메이션은 실패입니다. 짧게(0.4~0.7초), 한 번만, 끝나면 정지.
   ──────────────────────────────────────────────────────────── */

export const DUR = {
  fast: 0.28,
  base: 0.42,
  slow: 0.7,
} as const;

/** 부드럽게 감속 — 데이터가 "자리를 잡는" 느낌 */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** 사용자가 모션 최소화를 켰는지. SSR 안전하게 false 로 시작합니다. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 지금 애니메이션을 재생해도 되는가.
 *
 * ⚠️ 백그라운드 탭에서는 requestAnimationFrame 이 멈춥니다.
 *    "0에서 시작해 목표까지 굴린다"는 방식은 그 상태에서 0에 영원히 갇힙니다.
 *    애니메이션은 장식이어야지 값의 출처가 되면 안 됩니다.
 *    재생할 수 없으면 최종값을 즉시 확정합니다.
 */
export function canAnimate(): boolean {
  if (typeof document === "undefined") return false;
  if (prefersReducedMotion()) return false;
  return document.visibilityState === "visible";
}

/* ── Motion variants ───────────────────────────────────────── */

export const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
};

/** 자식들을 순차로 등장시킵니다. 목록이 "쌓이는" 느낌. */
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/** 업종 탭 전환 — 아래에서 살짝 올라오며 교체 */
export const swapPanel = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.fast, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: "linear" as const } },
};
