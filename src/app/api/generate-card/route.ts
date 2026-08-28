import { NextResponse } from "next/server";
import { z } from "zod";
import { getFallback } from "@/data/fallback-messages";
import type { Occasion, Relation } from "@/lib/types";

const Body = z.object({
  relation: z.enum(["거래처", "부모님", "동료", "친구"]),
  budget: z.enum(["1", "3", "5"]),
  taste: z.enum(["전통", "모던", "달콤", "담백"]),
  occasion: z.enum(["연말", "감사", "기념"]),
});

const MODEL = "claude-haiku-4-5-20251001";
const TIMEOUT_MS = 3000;

/**
 * 개인화 메시지 카드 — LLM 을 쓰는 유일한 지점입니다.
 *
 * 3초 안에 응답이 없으면 사전 작성 문구로 대체합니다.
 * 광고 트래픽이 몰려도 사용자는 기다리지 않습니다. (기획서 3-4)
 */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { relation, budget, taste, occasion } = parsed.data;
  const fallback = getFallback(relation as Relation, occasion as Occasion);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ message: fallback, isFallback: true });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: [
              "선물에 동봉할 짧은 메시지 카드 문구를 한국어로 한 문장에서 두 문장으로 써줘.",
              `받는 사람: ${relation}`,
              `상황: ${occasion}`,
              `받는 분 취향: ${taste}`,
              `예산대: ${budget}`,
              "",
              "조건:",
              "- 과장되거나 광고 같은 표현을 쓰지 마.",
              "- 이모지를 쓰지 마.",
              "- 따옴표나 설명 없이 문구만 출력해.",
            ].join("\n"),
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic ${res.status}`);

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();

    if (!text) throw new Error("빈 응답");

    return NextResponse.json({ message: text, isFallback: false });
  } catch {
    // 타임아웃·네트워크·API 오류 전부 여기로 옵니다.
    // 사용자는 차이를 느끼지 못합니다 — 그게 설계 의도입니다.
    return NextResponse.json({ message: fallback, isFallback: true });
  } finally {
    clearTimeout(timer);
  }
}
