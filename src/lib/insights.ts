import type { Industry } from "@/data/mock/types";
import { eul, ro } from "@/lib/korean";

/* ────────────────────────────────────────────────────────────
   인사이트 엔진

   "어떤 방향으로 마케팅하면 좋을지"를 데이터에서 도출합니다.

   ⚠️ 규칙 기반입니다. LLM을 호출하지 않습니다.
      이유: 판단 근거를 화면에 그대로 보여줄 수 있어야 하기 때문입니다.
      "AI가 그렇게 말했다"는 마케터가 사장님께 할 수 있는 설명이 아닙니다.
      각 제안은 근거 수치와 계산식을 함께 노출합니다.
   ──────────────────────────────────────────────────────────── */

export type Priority = "높음" | "보통" | "참고";

export type Insight = {
  id: string;
  priority: Priority;
  /** 상대 우선순위 산정용 임팩트 점수 (0~100). 화면에는 노출하지 않습니다. */
  score: number;
  category: "예산" | "소재" | "타겟" | "랜딩" | "실험";
  title: string;
  /** 무엇을 보고 이렇게 판단했는가 */
  evidence: string;
  /** 무엇을 하라는 것인가 */
  action: string;
  /** 기대 효과 + 계산 근거. 근거 없이 숫자만 쓰지 않습니다. */
  effect?: string;
  metrics: { label: string; value: string }[];
};

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;

export function buildInsights(ind: Industry): Insight[] {
  const out: Insight[] = [];
  const { channels, segments, funnel, ab, creatives, totals } = ind;

  /* ── 1. 채널 예산 재배분 ─────────────────────────────── */
  const byRoas = [...channels].sort((a, b) => b.roas - a.roas);
  const best = byRoas[0];
  const worst = byRoas[byRoas.length - 1];
  const gap = best.roas - worst.roas;

  if (gap > 60) {
    // 하위 채널 예산의 30%를 상위로 옮겼을 때의 단순 추정
    const move = worst.cost * 0.3;
    const gain = move * (best.roas - worst.roas) * 0.01;
    out.push({
      id: "budget-shift",
      priority: "보통",
      score: Math.min(100, gap / 2.4),
      category: "예산",
      title: `${eul(`${worst.name} 예산`)} ${ro(best.name)} 옮기세요`,
      evidence: `ROAS가 ${best.name} ${pct(best.roas, 0)} vs ${worst.name} ${pct(worst.roas, 0)}로 ${pct(gap, 0)}p 벌어져 있습니다. 같은 1만원이 ${best.name}에서 더 많은 매출을 만듭니다.`,
      action: `${worst.name} 일예산의 30%(${won(move)})를 ${best.name}으로 이관하고 2주간 유지합니다.`,
      effect: `추가 매출 약 ${won(gain)} 예상 — 이관액 ${won(move)} × ROAS 차이 ${pct(gap, 0)}p. 채널 간 성과가 선형으로 유지된다는 가정이라 실제로는 더 작을 수 있습니다.`,
      metrics: [
        { label: `${best.name} ROAS`, value: pct(best.roas, 0) },
        { label: `${worst.name} ROAS`, value: pct(worst.roas, 0) },
        { label: `${worst.name} CPA`, value: won(worst.cpa) },
      ],
    });
  }

  /* ── 2. 소재 피로도 ──────────────────────────────────── */
  const tired = [...creatives]
    .map((c) => ({ ...c, decay: (1 - c.ctrLate / c.ctrEarly) * 100 }))
    .sort((a, b) => b.decay - a.decay)[0];

  if (tired.decay > 18) {
    out.push({
      id: "creative-fatigue",
      priority: "보통",
      score: Math.min(100, tired.decay * 1.9),
      category: "소재",
      title: `「${tired.name}」 소재를 교체할 시점입니다`,
      evidence: `CTR이 초반 ${pct(tired.ctrEarly, 2)}에서 후반 ${pct(tired.ctrLate, 2)}로 ${pct(tired.decay, 0)} 떨어졌습니다. 같은 사람들에게 반복 노출되면서 반응이 식은 전형적인 패턴입니다.`,
      action: `이 소재를 내리고 신규 2종을 올립니다. 성과가 유지되는 소재는 그대로 두세요.`,
      effect: `CTR을 초반 수준으로 회복하면 같은 예산에서 클릭 약 ${Math.round(totals.clicks * (tired.decay / 100) * 0.25).toLocaleString("ko-KR")}회가 더 나옵니다. 신규 소재가 기존 초반 성과를 낸다는 가정입니다.`,
      metrics: [
        { label: "초반 CTR", value: pct(tired.ctrEarly, 2) },
        { label: "후반 CTR", value: pct(tired.ctrLate, 2) },
        { label: "하락폭", value: pct(tired.decay, 0) },
      ],
    });
  }

  /* ── 3. 타겟 세그먼트 집중 ───────────────────────────── */
  const avgCvr = totals.cvr;
  const topSeg = [...segments].sort((a, b) => b.cvr - a.cvr)[0];
  const ratio = topSeg.cvr / avgCvr;

  if (ratio > 1.3) {
    out.push({
      id: "segment-focus",
      priority: "보통",
      score: Math.min(100, (ratio - 1) * 95),
      category: "타겟",
      title: `${topSeg.age} ${topSeg.gender}에 예산을 집중하세요`,
      evidence: `이 세그먼트의 전환율이 ${pct(topSeg.cvr)}로 전체 평균 ${pct(avgCvr)}의 ${ratio.toFixed(1)}배입니다. CPA도 ${won(topSeg.cpa)}로 전체 ${won(totals.cpa)}보다 낮습니다.`,
      action: `이 세그먼트를 별도 광고세트로 분리해 예산의 40%를 배정하고, 나머지는 기존 광범위 타겟으로 유지합니다.`,
      effect: `전량을 이 세그먼트 수준으로 끌어올리면 CPA가 ${won(totals.cpa)} → ${won(topSeg.cpa)}까지 내려갑니다. 다만 모수가 줄어 실제 개선폭은 이보다 작습니다. **전체를 이 세그먼트로 좁히지 마세요** — 모수가 줄면 CPC가 오릅니다.`,
      metrics: [
        { label: "세그먼트 CVR", value: pct(topSeg.cvr) },
        { label: "전체 평균 CVR", value: pct(avgCvr) },
        { label: "세그먼트 CPA", value: won(topSeg.cpa) },
      ],
    });
  }

  /* ── 4. 퍼널 병목 ────────────────────────────────────── */
  const leak = [...funnel]
    .slice(1)
    .sort((a, b) => b.dropFromPrev - a.dropFromPrev)[0];
  const leakIdx = funnel.findIndex((f) => f.key === leak.key);
  const prevStage = funnel[leakIdx - 1];

  out.push({
    id: "funnel-leak",
    priority: "보통",
    score: Math.min(100, leak.dropFromPrev * 1.15),
    category: "랜딩",
    title: `「${prevStage.label} → ${leak.label}」 구간이 가장 많이 샙니다`,
    evidence: `이 구간에서 ${pct(leak.dropFromPrev, 0)}가 이탈합니다. ${prevStage.value.toLocaleString("ko-KR")}명 중 ${(prevStage.value - leak.value).toLocaleString("ko-KR")}명이 다음 단계로 넘어가지 않았습니다.`,
    action: `광고를 늘리기 전에 이 화면부터 고치세요. 같은 예산으로 전환을 늘리는 가장 싼 방법입니다.`,
    effect: `이탈률을 10%p만 낮춰도 전환이 약 ${Math.round(prevStage.value * 0.1 * (totals.cvr / 100) * 3).toLocaleString("ko-KR")}건 늘어납니다. 광고비 추가 없이 얻는 개선입니다.`,
    metrics: [
      { label: "이탈률", value: pct(leak.dropFromPrev, 0) },
      { label: "진입", value: prevStage.value.toLocaleString("ko-KR") },
      { label: "통과", value: leak.value.toLocaleString("ko-KR") },
    ],
  });

  /* ── 5. A/B 판정 ─────────────────────────────────────── */
  const lift = ((ab.b.rate - ab.a.rate) / ab.a.rate) * 100;
  if (ab.significant) {
    const winner = ab.b.rate > ab.a.rate ? ab.b : ab.a;
    const loser = ab.b.rate > ab.a.rate ? ab.a : ab.b;
    out.push({
      id: "ab-winner",
      priority: "보통",
      score: Math.min(100, Math.abs(lift) * 1.6 + 30),
      category: "실험",
      title: `${winner.variant}안(${winner.label})을 전면 적용하세요`,
      evidence: `전환율 ${pct(winner.rate, 2)} vs ${pct(loser.rate, 2)}, p = ${ab.pValue.toFixed(3)}로 통계적으로 유의합니다. 우연으로 보기 어렵습니다.`,
      action: `${winner.variant}안을 100%로 전환하고, 다음 실험 주제를 하나만 새로 정합니다.`,
      effect: `현재 트래픽 기준 월 전환 약 ${Math.round(((winner.rate - loser.rate) / 100) * loser.sessions).toLocaleString("ko-KR")}건 증가 예상입니다.`,
      metrics: [
        { label: "A안 전환율", value: pct(ab.a.rate, 2) },
        { label: "B안 전환율", value: pct(ab.b.rate, 2) },
        { label: "p-value", value: ab.pValue.toFixed(3) },
      ],
    });
  } else {
    out.push({
      id: "ab-inconclusive",
      priority: "참고",
      score: 12,
      category: "실험",
      title: "A/B 차이는 아직 판정할 수 없습니다",
      evidence: `전환율 차이 ${pct(Math.abs(lift), 0)}는 관측됐지만 p = ${ab.pValue.toFixed(3)}로 유의수준 0.05를 넘지 못했습니다. 이 표본에서는 우연과 구별되지 않습니다.`,
      action: `한쪽을 승자로 선언하지 마세요. 기간을 늘리거나, 더 큰 차이를 만드는 안으로 다시 설계하는 게 맞습니다.`,
      effect: `현재 안당 ${ab.a.sessions.toLocaleString("ko-KR")}세션에서는 ${pct(30)} 이상의 차이라야 검출됩니다. 그보다 작은 개선은 이 규모로 증명할 수 없습니다.`,
      metrics: [
        { label: "A안 전환율", value: pct(ab.a.rate, 2) },
        { label: "B안 전환율", value: pct(ab.b.rate, 2) },
        { label: "p-value", value: ab.pValue.toFixed(3) },
      ],
    });
  }

  /*
    우선순위는 절대 임계값이 아니라 상대 순위로 정합니다.
    임계값으로 하면 다섯 개가 전부 "높음"으로 나오는 일이 생기고,
    그러면 우선순위가 아무 정보도 주지 못합니다.
    실제로 오늘 손댈 수 있는 건 한두 개뿐입니다.
  */
  return out
    .sort((a, b) => b.score - a.score)
    .map((ins, i) => ({
      ...ins,
      priority: (ins.score < 20 ? "참고" : i === 0 ? "높음" : i <= 2 ? "보통" : "참고") as Priority,
    }));
}
