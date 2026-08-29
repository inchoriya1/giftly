"use client";

import { readSession } from "@/lib/session";

type Primitive = string | number | boolean;
/** items 는 GA4 전자상거래 보고서용 배열이라 원시값만으로는 표현이 안 됩니다. */
type Params = Record<
  string,
  Primitive | Primitive[] | Record<string, Primitive>[]
>;

/** GA4 예약 이벤트에서 value 는 currency 와 짝이어야 매출로 집계됩니다. */
const CURRENCY = "KRW";

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
 *    variant / session_id / product_id / position / qty / category
 */
export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;

  const { variant, sessionId } = readSession();
  if (!variant || !sessionId) return;

  const payload: Params = { ...params, variant, session_id: sessionId };

  /**
   * GA4 는 page_location 에서 페이지 경로를 만듭니다.
   * page_path 는 구 UA 이름이라, 그것만 보내면 기본 「페이지 경로」
   * 보고서가 비고 맞춤 측정기준으로만 조회됩니다.
   */
  if (event === "page_view") {
    payload.page_location = window.location.href;
    payload.page_title = document.title;
  }

  /**
   * purchase 같은 예약 이벤트는 value 만 보내면 수익이 집계되지 않습니다.
   * 통화가 명시되지 않은 금액은 GA4 가 매출로 세지 않습니다.
   */
  if (typeof payload.value === "number" && payload.currency === undefined) {
    payload.currency = CURRENCY;
  }

  window.gtag?.("event", event, payload);

  if (process.env.NODE_ENV === "development") {
    console.log("[track]", event, payload);
  }
}
