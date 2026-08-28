"use client";

import type { Variant } from "@/lib/types";

const K_VARIANT = "smp_variant";
const K_SESSION = "smp_session_id";
const K_CART = "smp_cart";

/**
 * ⚠️ 이 함수들은 반드시 useEffect 안에서만 부르세요.
 *
 * 서버 렌더링 중에 localStorage 를 읽으면 서버와 클라이언트의 HTML이
 * 달라져 hydration 이 깨지고, A/B 배정이 뒤섞여 실험 데이터가 오염됩니다.
 */

export function ensureSession(): { variant: Variant; sessionId: string } {
  let variant = localStorage.getItem(K_VARIANT) as Variant | null;
  let sessionId = localStorage.getItem(K_SESSION);

  if (variant !== "A" && variant !== "B") {
    variant = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(K_VARIANT, variant);
  }
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(K_SESSION, sessionId);
  }
  return { variant, sessionId };
}

export function readSession(): {
  variant: Variant | null;
  sessionId: string | null;
} {
  return {
    variant: localStorage.getItem(K_VARIANT) as Variant | null,
    sessionId: localStorage.getItem(K_SESSION),
  };
}

/* ── 장바구니 (샘플이므로 상품 id 하나만 담습니다) ── */

export function addToCart(productId: number) {
  sessionStorage.setItem(K_CART, String(productId));
}

export function readCart(): number | null {
  const v = sessionStorage.getItem(K_CART);
  return v ? Number(v) : null;
}

export function clearCart() {
  sessionStorage.removeItem(K_CART);
}
