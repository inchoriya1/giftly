"use client";

import { useEffect, useRef } from "react";
import { animate, utils } from "animejs";
import { canAnimate } from "@/lib/anim";

/**
 * 숫자 카운트업 — anime.js
 *
 * 값이 바뀔 때마다 이전 값에서 새 값으로 굴러갑니다.
 * 업종 탭을 바꾸면 KPI가 갈아끼워지는 게 눈에 보입니다.
 *
 * ⚠️ 재생할 수 없는 상황(백그라운드 탭·모션 최소화)에서는 최종값을 즉시 씁니다.
 *    안전 타이머도 함께 걸어, 어떤 이유로든 애니메이션이 끝나지 않아도
 *    숫자가 0에 갇히지 않게 합니다.
 *
 * DOM textContent 를 직접 쓰므로 React 리렌더를 유발하지 않습니다.
 */
export function CountUp({
  value,
  format = (n: number) => Math.round(n).toLocaleString("ko-KR"),
  duration = 900,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const settle = () => {
      current.current = value;
      el.textContent = format(value);
    };

    if (!canAnimate()) {
      settle();
      return;
    }

    const state = { n: current.current };
    const anim = animate(state, {
      n: value,
      duration,
      ease: "outExpo",
      onUpdate: () => {
        el.textContent = format(state.n);
      },
      onComplete: settle,
    });

    // 애니메이션이 어떤 이유로든 끝나지 않아도 값은 반드시 확정됩니다.
    const guard = setTimeout(settle, duration + 400);

    return () => {
      clearTimeout(guard);
      anim.pause();
      utils.remove(state);
    };
  }, [value, duration, format]);

  // 서버 렌더링과 JS 미실행 상황에서도 진짜 값이 보입니다.
  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
