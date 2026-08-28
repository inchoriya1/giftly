"use client";

import type { Answers, Variant } from "@/lib/types";

const K_VARIANT = "giftly_variant";
const K_SESSION = "giftly_session_id";
const K_ANSWERS = "giftly_answers";

/**
 * ⚠️ 이 함수들은 반드시 useEffect 안에서만 부르세요.
 *
 * 서버 렌더링 중에 localStorage 를 읽으면 서버와 클라이언트의 HTML이
 * 달라져 hydration 이 깨지고, A/B 배정이 뒤섞여 실험 데이터가 오염됩니다.
 * (측정 설계서 4-3)
 */

export function ensureSession(): { variant: Variant; sessionId: string } {
  let variant = localStorage.getItem(K_VARIANT) as Variant | null;
  let sessionId = localStorage.getItem(K_SESSION);

  if (!variant || (variant !== "A" && variant !== "B")) {
    variant = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(K_VARIANT, variant);
  }
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(K_SESSION, sessionId);
  }
  return { variant, sessionId };
}

export function readSession(): { variant: Variant | null; sessionId: string | null } {
  return {
    variant: localStorage.getItem(K_VARIANT) as Variant | null,
    sessionId: localStorage.getItem(K_SESSION),
  };
}

export function saveAnswers(answers: Answers) {
  sessionStorage.setItem(K_ANSWERS, JSON.stringify(answers));
}

export function loadAnswers(): Answers | null {
  const raw = sessionStorage.getItem(K_ANSWERS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Answers;
  } catch {
    return null;
  }
}

export function resetFlow() {
  sessionStorage.removeItem(K_ANSWERS);
}
