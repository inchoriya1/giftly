import type {
  AbResult,
  ChannelId,
  ChannelStat,
  Creative,
  DailyRow,
  FunnelStage,
  Industry,
  IndustryId,
  Segment,
} from "./types";

/* ────────────────────────────────────────────────────────────
   샘플 데이터 생성기

   ⚠️ 전부 가상 데이터입니다. 실제 집행 결과가 아닙니다.
   화면 어디에서든 "샘플 데이터" 배지를 함께 노출해야 합니다.

   시드 고정 난수를 쓰는 이유: 새로고침할 때마다 숫자가 바뀌면
   발표 중에 대시보드가 고장난 것처럼 보입니다.
   ──────────────────────────────────────────────────────────── */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CHANNEL_NAMES: Record<ChannelId, string> = {
  meta: "메타",
  google: "구글",
  naver: "네이버",
  kakao: "카카오",
  youtube: "유튜브",
};

const CHANNELS: ChannelId[] = ["meta", "google", "naver", "kakao", "youtube"];

/** 업종별 채널 성향 — 이 값이 달라서 업종마다 다른 인사이트가 나옵니다. */
type Profile = {
  name: string;
  productLabel: string;
  seed: number;
  /** [예산비중, CTR배수, CVR배수, 객단가] */
  channel: Record<ChannelId, [number, number, number, number]>;
  fatigue: number; // 소재 피로도 (CTR 하락폭)
  topSegment: [string, "여성" | "남성"];
  funnelLeak: number; // 퍼널 병목 심도
  abLift: number; // B안 상대 성과
  aov: number; // 평균 객단가
};

const PROFILES: Record<IndustryId, Profile> = {
  fashion: {
    name: "패션 · 의류",
    productLabel: "가을 아우터 신상",
    seed: 1031,
    channel: {
      meta: [0.38, 1.0, 0.85, 1.0],
      google: [0.16, 0.8, 1.0, 1.05],
      naver: [0.14, 0.75, 1.1, 1.0],
      kakao: [0.1, 0.7, 0.8, 0.95],
      youtube: [0.22, 1.35, 1.4, 1.15],
    },
    fatigue: 0.34,
    topSegment: ["25-34", "여성"],
    funnelLeak: 0.42,
    abLift: 1.38,
    aov: 50000,
  },
  food: {
    name: "식품 · F&B",
    productLabel: "명절 선물세트",
    seed: 2087,
    channel: {
      meta: [0.3, 0.9, 0.9, 1.0],
      google: [0.14, 0.85, 1.05, 1.0],
      naver: [0.34, 1.25, 1.45, 1.1],
      kakao: [0.14, 0.95, 1.0, 0.95],
      youtube: [0.08, 0.8, 0.7, 0.9],
    },
    fatigue: 0.16,
    topSegment: ["35-44", "여성"],
    funnelLeak: 0.28,
    abLift: 1.12,
    aov: 46000,
  },
  beauty: {
    name: "뷰티 · 화장품",
    productLabel: "수분 앰플 기획전",
    seed: 3179,
    channel: {
      meta: [0.44, 1.3, 1.25, 1.05],
      google: [0.12, 0.75, 0.9, 1.0],
      naver: [0.16, 0.9, 1.15, 1.0],
      kakao: [0.08, 0.65, 0.7, 0.9],
      youtube: [0.2, 1.15, 1.2, 1.1],
    },
    fatigue: 0.41,
    topSegment: ["25-34", "여성"],
    funnelLeak: 0.35,
    abLift: 1.51,
    aov: 39000,
  },
  edu: {
    name: "교육 · 클래스",
    productLabel: "직무 부트캠프 (전환 = 상담신청)",
    seed: 4241,
    channel: {
      meta: [0.28, 0.85, 0.7, 0.95],
      google: [0.36, 1.15, 1.5, 1.2],
      naver: [0.2, 1.0, 1.2, 1.05],
      kakao: [0.08, 0.7, 0.75, 0.9],
      youtube: [0.08, 0.9, 0.85, 1.0],
    },
    fatigue: 0.11,
    topSegment: ["25-34", "남성"],
    funnelLeak: 0.55,
    abLift: 0.94,
    aov: 50000,
  },
  living: {
    name: "리빙 · 인테리어",
    productLabel: "원목 수납 가구",
    seed: 5323,
    channel: {
      meta: [0.32, 0.95, 0.95, 1.0],
      google: [0.18, 0.9, 1.1, 1.05],
      naver: [0.22, 1.05, 1.25, 1.05],
      kakao: [0.2, 0.6, 0.55, 0.85],
      youtube: [0.08, 1.1, 1.05, 1.1],
    },
    fatigue: 0.22,
    topSegment: ["35-44", "여성"],
    funnelLeak: 0.31,
    abLift: 1.22,
    aov: 60000,
  },
};

const TOTAL_BUDGET = 4_800_000; // 28일 총 집행액(가상)
const DAYS = 28;

const AGES = ["18-24", "25-34", "35-44", "45-54", "55+"];
const AGE_WEIGHT = [0.14, 0.34, 0.27, 0.16, 0.09];

function buildIndustry(id: IndustryId): Industry {
  const p = PROFILES[id];
  const rnd = mulberry32(p.seed);
  const daily: DailyRow[] = [];

  const start = new Date(2026, 6, 20); // 2026-07-20 부터 28일

  for (let d = 0; d < DAYS; d++) {
    const date = new Date(start.getTime() + d * 86400000);
    const label = `${date.getMonth() + 1}/${date.getDate()}`;
    const dow = date.getDay();
    // 주말에 소비재는 오르고 B2B성(교육)은 내려갑니다
    const dowFactor =
      dow === 0 || dow === 6 ? (id === "edu" ? 0.82 : 1.16) : 1.0;
    // 후반부로 갈수록 소재가 낡습니다
    const fatigueFactor = 1 - p.fatigue * (d / DAYS);

    for (const ch of CHANNELS) {
      const [share, ctrM, cvrM, aovM] = p.channel[ch];
      const cost = (TOTAL_BUDGET / DAYS) * share * (0.9 + rnd() * 0.2);
      // 요일 효과는 경쟁 강도(CPC)와 전환 의향(CVR) 양쪽에 걸립니다
      const cpc =
        (420 / dowFactor) * (0.85 + rnd() * 0.3) * (ch === "google" ? 1.25 : 1);
      const clicks = Math.round(cost / cpc);
      const ctr = 0.012 * ctrM * fatigueFactor * (0.9 + rnd() * 0.2);
      const impressions = Math.round(clicks / ctr);
      const cvr = 0.031 * cvrM * dowFactor * (0.88 + rnd() * 0.24);
      const conversions = Math.round(clicks * cvr);
      const revenue = Math.round(conversions * p.aov * aovM * (0.9 + rnd() * 0.2));

      daily.push({
        date: label,
        channel: ch,
        impressions,
        clicks,
        conversions,
        cost: Math.round(cost),
        revenue,
      });
    }
  }

  // 채널 집계
  const channels: ChannelStat[] = CHANNELS.map((ch) => {
    const rows = daily.filter((r) => r.channel === ch);
    const sum = (k: keyof DailyRow) =>
      rows.reduce((a, r) => a + (r[k] as number), 0);
    const impressions = sum("impressions");
    const clicks = sum("clicks");
    const conversions = sum("conversions");
    const cost = sum("cost");
    const revenue = sum("revenue");
    return {
      id: ch,
      name: CHANNEL_NAMES[ch],
      impressions,
      clicks,
      conversions,
      cost,
      revenue,
      ctr: (clicks / impressions) * 100,
      cvr: (conversions / clicks) * 100,
      cpc: cost / clicks,
      cpa: cost / conversions,
      roas: (revenue / cost) * 100,
      share: 0,
    };
  });
  const totalCost = channels.reduce((a, c) => a + c.cost, 0);
  channels.forEach((c) => (c.share = (c.cost / totalCost) * 100));

  // 세그먼트
  const segments: Segment[] = [];
  const [topAge, topGender] = p.topSegment;
  for (let i = 0; i < AGES.length; i++) {
    for (const gender of ["여성", "남성"] as const) {
      const isTop = AGES[i] === topAge && gender === topGender;
      const base = AGE_WEIGHT[i] * (gender === "여성" ? 0.58 : 0.42);
      const clicks = Math.round(
        channels.reduce((a, c) => a + c.clicks, 0) * base * (0.9 + rnd() * 0.2),
      );
      const cvr = 0.031 * (isTop ? 1.85 : 0.72 + rnd() * 0.5);
      const conversions = Math.round(clicks * cvr);
      const cost = Math.round(totalCost * base * (0.9 + rnd() * 0.2));
      segments.push({
        age: AGES[i],
        gender,
        clicks,
        conversions,
        cost,
        cvr: cvr * 100,
        cpa: conversions ? cost / conversions : 0,
      });
    }
  }

  // 퍼널
  const totalClicks = channels.reduce((a, c) => a + c.clicks, 0);
  const totalConv = channels.reduce((a, c) => a + c.conversions, 0);
  const stageRates = [1, 0.71, 1 - p.funnelLeak, 0.62, 0.55];
  const labels = [
    "광고 클릭",
    "랜딩 진입",
    "상품 조회",
    "장바구니",
    "구매 완료",
  ];
  let prev = totalClicks;
  const funnel: FunnelStage[] = labels.map((label, i) => {
    const value =
      i === 0
        ? totalClicks
        : i === labels.length - 1
          ? totalConv
          : Math.round(prev * stageRates[i]);
    const dropFromPrev = i === 0 ? 0 : ((prev - value) / prev) * 100;
    prev = value;
    return { key: `s${i}`, label, value, dropFromPrev };
  });

  // A/B
  const sessionsA = Math.round(totalClicks * 0.5);
  const sessionsB = totalClicks - sessionsA;
  const rateA = 0.031 * 100;
  const rateB = rateA * p.abLift;
  const convA = Math.round((sessionsA * rateA) / 100);
  const convB = Math.round((sessionsB * rateB) / 100);
  const a: AbResult = {
    variant: "A",
    label: "기존 상세형",
    sessions: sessionsA,
    conversions: convA,
    rate: (convA / sessionsA) * 100,
  };
  const b: AbResult = {
    variant: "B",
    label: "혜택 강조형",
    sessions: sessionsB,
    conversions: convB,
    rate: (convB / sessionsB) * 100,
  };
  const pValue = chiSquareP(convA, sessionsA - convA, convB, sessionsB - convB);

  // 소재
  const creatives: Creative[] = [
    { id: "C1", name: "상황 컷 A", type: "이미지" },
    { id: "C2", name: "제품 클로즈업", type: "이미지" },
    { id: "C3", name: "리뷰 인용형", type: "이미지" },
    { id: "C4", name: "15초 숏폼", type: "영상" },
  ].map((c, i) => {
    const early = 1.2 * (1 + (i === 3 ? 0.5 : 0.1 * i)) * (0.9 + rnd() * 0.2);
    const decay = i === 0 ? p.fatigue * 1.4 : p.fatigue * (0.5 + rnd() * 0.6);
    const clicks = Math.round(totalClicks * (0.34 - i * 0.06));
    return {
      ...c,
      type: c.type as "이미지" | "영상",
      ctrEarly: early,
      ctrLate: early * (1 - decay),
      clicks,
      conversions: Math.round(clicks * 0.031 * (0.8 + rnd() * 0.5)),
    };
  });

  const impressions = channels.reduce((a, c) => a + c.impressions, 0);
  const revenue = channels.reduce((a, c) => a + c.revenue, 0);

  // 직전 동일기간 대비 (전반 14일 vs 후반 14일)
  const half = (from: number, to: number, k: keyof DailyRow) =>
    daily
      .slice(from * CHANNELS.length, to * CHANNELS.length)
      .reduce((s, r) => s + (r[k] as number), 0);
  const c1 = half(0, 14, "clicks");
  const c2 = half(14, 28, "clicks");
  const v1 = half(0, 14, "conversions");
  const v2 = half(14, 28, "conversions");
  const k1 = half(0, 14, "cost");
  const k2 = half(14, 28, "cost");
  const r1 = half(0, 14, "revenue");
  const r2 = half(14, 28, "revenue");

  return {
    id,
    name: p.name,
    productLabel: p.productLabel,
    daily,
    channels,
    segments,
    funnel,
    ab: { a, b, pValue, significant: pValue < 0.05 },
    creatives,
    totals: {
      impressions,
      clicks: totalClicks,
      conversions: totalConv,
      cost: totalCost,
      revenue,
      ctr: (totalClicks / impressions) * 100,
      cvr: (totalConv / totalClicks) * 100,
      cpa: totalCost / totalConv,
      roas: (revenue / totalCost) * 100,
    },
    deltas: {
      clicks: ((c2 - c1) / c1) * 100,
      conversions: ((v2 - v1) / v1) * 100,
      cpa: (k2 / v2 / (k1 / v1) - 1) * 100,
      roas: (r2 / k2 / (r1 / k1) - 1) * 100,
    },
  };
}

/* ────────────────────────────────────────────────────────────
   기간 슬라이스

   상단 기간 선택기가 실제로 다시 계산합니다. 눌러도 안 바뀌는
   컨트롤이 화면에서 가장 가짜처럼 보입니다.

   기간을 좁히면 표본이 줄어 A/B 유의성이 사라지는 것까지
   그대로 재현됩니다 — 실무에서 매일 겪는 일입니다.

   주의: 세그먼트·소재는 일자별 원천이 없어 비율을 유지한 채
   물량만 기간에 비례해 조정합니다. 전환율 같은 비율 지표는
   기간이 짧아져도 크게 흔들리지 않는다는 가정입니다.
   ──────────────────────────────────────────────────────────── */

export const RANGES = [7, 14, 28] as const;
export type RangeDays = (typeof RANGES)[number];

export function sliceIndustry(full: Industry, days: RangeDays): Industry {
  if (days >= DAYS) return full;

  const allDates = [...new Set(full.daily.map((d) => d.date))];
  const keep = allDates.slice(-days);
  const daily = full.daily.filter((d) => keep.includes(d.date));

  const sumOf = (rows: DailyRow[], k: keyof DailyRow) =>
    rows.reduce((a, r) => a + (r[k] as number), 0);

  const channels: ChannelStat[] = CHANNELS.map((ch) => {
    const rows = daily.filter((r) => r.channel === ch);
    const impressions = sumOf(rows, "impressions");
    const clicks = sumOf(rows, "clicks");
    const conversions = sumOf(rows, "conversions");
    const cost = sumOf(rows, "cost");
    const revenue = sumOf(rows, "revenue");
    return {
      id: ch,
      name: CHANNEL_NAMES[ch],
      impressions,
      clicks,
      conversions,
      cost,
      revenue,
      ctr: impressions ? (clicks / impressions) * 100 : 0,
      cvr: clicks ? (conversions / clicks) * 100 : 0,
      cpc: clicks ? cost / clicks : 0,
      cpa: conversions ? cost / conversions : 0,
      roas: cost ? (revenue / cost) * 100 : 0,
      share: 0,
    };
  });

  const totalCost = channels.reduce((a, c) => a + c.cost, 0);
  channels.forEach((c) => (c.share = totalCost ? (c.cost / totalCost) * 100 : 0));

  const totalClicks = channels.reduce((a, c) => a + c.clicks, 0);
  const totalConv = channels.reduce((a, c) => a + c.conversions, 0);
  const impressions = channels.reduce((a, c) => a + c.impressions, 0);
  const revenue = channels.reduce((a, c) => a + c.revenue, 0);

  // 물량 비례 축소 (비율은 유지)
  const scale = full.totals.clicks ? totalClicks / full.totals.clicks : 1;
  const segments: Segment[] = full.segments.map((s) => ({
    ...s,
    clicks: Math.round(s.clicks * scale),
    conversions: Math.round(s.conversions * scale),
    cost: Math.round(s.cost * scale),
  }));
  const creatives: Creative[] = full.creatives.map((c) => ({
    ...c,
    clicks: Math.round(c.clicks * scale),
    conversions: Math.round(c.conversions * scale),
  }));

  const funnel: FunnelStage[] = full.funnel.map((f, i) => ({
    ...f,
    value:
      i === 0
        ? totalClicks
        : i === full.funnel.length - 1
          ? totalConv
          : Math.round(f.value * scale),
  }));

  // A/B — 비율은 유지하고 세션만 줄입니다. 표본이 줄면 p값이 커집니다.
  const sessionsA = Math.round(totalClicks * 0.5);
  const sessionsB = totalClicks - sessionsA;
  const convA = Math.round((sessionsA * full.ab.a.rate) / 100);
  const convB = Math.round((sessionsB * full.ab.b.rate) / 100);
  const pValue = chiSquareP(convA, sessionsA - convA, convB, sessionsB - convB);

  // 직전 동일 기간 대비
  const prevRows = full.daily.filter((d) =>
    allDates.slice(-days * 2, -days).includes(d.date),
  );
  const cur = (k: keyof DailyRow) => sumOf(daily, k);
  const prv = (k: keyof DailyRow) => sumOf(prevRows, k);
  const safe = (a: number, b: number) => (b ? (a / b - 1) * 100 : 0);

  return {
    ...full,
    daily,
    channels,
    segments,
    creatives,
    funnel,
    ab: {
      a: {
        ...full.ab.a,
        sessions: sessionsA,
        conversions: convA,
        rate: sessionsA ? (convA / sessionsA) * 100 : 0,
      },
      b: {
        ...full.ab.b,
        sessions: sessionsB,
        conversions: convB,
        rate: sessionsB ? (convB / sessionsB) * 100 : 0,
      },
      pValue,
      significant: pValue < 0.05,
    },
    totals: {
      impressions,
      clicks: totalClicks,
      conversions: totalConv,
      cost: totalCost,
      revenue,
      ctr: impressions ? (totalClicks / impressions) * 100 : 0,
      cvr: totalClicks ? (totalConv / totalClicks) * 100 : 0,
      cpa: totalConv ? totalCost / totalConv : 0,
      roas: totalCost ? (revenue / totalCost) * 100 : 0,
    },
    deltas: {
      clicks: safe(cur("clicks"), prv("clicks")),
      conversions: safe(cur("conversions"), prv("conversions")),
      cpa: safe(
        cur("cost") / (cur("conversions") || 1),
        prv("cost") / (prv("conversions") || 1),
      ),
      roas: safe(
        cur("revenue") / (cur("cost") || 1),
        prv("revenue") / (prv("cost") || 1),
      ),
    },
  };
}

/** 2×2 카이제곱 → p값 근사. 측정 설계서의 판정 규칙과 같은 방식입니다. */
export function chiSquareP(a: number, b: number, c: number, d: number): number {
  const n = a + b + c + d;
  if (!n) return 1;
  const num = Math.abs(a * d - b * c) - n / 2;
  if (num <= 0) return 1;
  const chi = (n * num * num) / ((a + b) * (c + d) * (a + c) * (b + d));
  // 자유도 1: p = erfc(sqrt(chi/2))
  return erfc(Math.sqrt(chi / 2));
}

function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + z / 2);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 +
                            t *
                              (-1.13520398 +
                                t *
                                  (1.48851587 +
                                    t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
}

export const INDUSTRIES: Industry[] = (
  ["fashion", "food", "beauty", "edu", "living"] as IndustryId[]
).map(buildIndustry);

export function getIndustry(id: string | undefined): Industry {
  return INDUSTRIES.find((i) => i.id === id) ?? INDUSTRIES[0];
}

export { CHANNEL_NAMES };
