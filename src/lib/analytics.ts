"use client";

import { readSession } from "@/lib/session";

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      target: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

/**
 * 모든 이벤트에 variant 와 session_id 를 붙입니다.
 * 둘 중 하나라도 없으면 그 이벤트는 A/B 분석에서 통째로 빠지므로
 * 아예 발송하지 않습니다. (측정 설계서 2장)
 *
 * ⚠️ GA4 관리 > 맞춤 정의에서 아래를 이벤트 범위로 등록해야
 *    보고서에 보입니다. 등록 이전 데이터는 소급 적용되지 않습니다.
 *    variant / session_id / step / is_fallback / product_id
 */
export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;

  const { variant, sessionId } = readSession();
  if (!variant || !sessionId) return;

  window.gtag?.("event", event, {
    ...params,
    variant,
    session_id: sessionId,
  });

  if (process.env.NODE_ENV === "development") {
    console.log("[track]", event, { ...params, variant, session_id: sessionId });
  }
}
