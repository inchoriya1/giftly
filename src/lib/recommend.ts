import { PRODUCTS } from "@/data/products";
import type { Answers, Scored } from "@/lib/types";

/**
 * 규칙 기반 추천 — LLM을 호출하지 않습니다.
 *
 * 이유: 결과 화면에서 매번 LLM을 부르면 비용이 들고, 느리고,
 * 광고 트래픽이 몰리면 터집니다. 추천은 규칙으로 계산하고
 * 개인화 메시지 카드에만 LLM을 씁니다. (기획서 3-4)
 *
 * 가중치: 취향 3 > 관계 2 = 예산 2
 * 취향이 가장 높은 이유는 선물 만족도를 가장 크게 가르기 때문입니다.
 */
const WEIGHT = { taste: 3, relation: 2, budget: 2 } as const;

export function recommend(answers: Answers, limit = 3): Scored[] {
  return PRODUCTS.map((product) => {
    let score = 0;
    const matched: string[] = [];

    if (product.taste.includes(answers.taste)) {
      score += WEIGHT.taste;
      matched.push("취향");
    }
    if (product.relation.includes(answers.relation)) {
      score += WEIGHT.relation;
      matched.push("관계");
    }
    if (product.budget.includes(answers.budget)) {
      score += WEIGHT.budget;
      matched.push("예산");
    }

    return { ...product, score, matched };
  })
    .sort((a, b) => b.score - a.score || a.id - b.id)
    .slice(0, limit);
}
