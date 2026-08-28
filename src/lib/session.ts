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

/* ── 장바구니 (샘플이라 한 상품만 담습니다) ── */

export type CartItem = { id: number; qty: number };

export function addToCart(id: number, qty = 1) {
  sessionStorage.setItem(K_CART, JSON.stringify({ id, qty }));
}

export function readCart(): CartItem | null {
  const raw = sessionStorage.getItem(K_CART);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as CartItem;
    return v && typeof v.id === "number" ? v : null;
  } catch {
    return null;
  }
}

export function clearCart() {
  sessionStorage.removeItem(K_CART);
}

/* ── 찜 ── */

const K_WISH = "smp_wish";

export function readWish(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(K_WISH) ?? "[]");
    return Array.isArray(v) ? (v as number[]) : [];
  } catch {
    return [];
  }
}

export function toggleWish(id: number): number[] {
  const cur = readWish();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(K_WISH, JSON.stringify(next));
  return next;
}

/** 주문번호 — 실제 주문이 아니므로 화면 표시용으로만 씁니다. */
export function makeOrderNo(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${rand}`;
}
