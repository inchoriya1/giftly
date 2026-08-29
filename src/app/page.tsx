"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  INDUSTRIES,
  RANGES,
  sliceIndustry,
  type RangeDays,
} from "@/data/mock/generate";
import { buildInsights, type Priority } from "@/lib/insights";
import { AbBars, BarH, Funnel, Heatmap, LineChart } from "@/components/charts";
import { CountUp } from "@/components/CountUp";
import { AppShell, Notice, Panel, Section, Segmented, Select, Tag } from "@/components/AppShell";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const num = (n: number) => Math.round(n).toLocaleString("ko-KR");
const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;

const PRIORITY: Record<Priority, string> = {
  높음: "bg-neg-soft text-neg",
  보통: "bg-warn-soft text-warn",
  참고: "bg-edge-2 text-txt-2",
};

export default function Dashboard() {
  const [industryId, setIndustryId] = useState(INDUSTRIES[0].id);
  const [days, setDays] = useState<RangeDays>(28);
  const [active, setActive] = useState("overview");
  const scrolling = useRef(false);

  const full = INDUSTRIES.find((i) => i.id === industryId) ?? INDUSTRIES[0];
  const ind = useMemo(() => sliceIndustry(full, days), [full, days]);
  const insights = useMemo(() => buildInsights(ind), [ind]);

  const trend = useMemo(() => {
    const dates = [...new Set(ind.daily.map((d) => d.date))];
    return dates.map((date) => ({
      label: date,
      value: ind.daily
        .filter((d) => d.date === date)
        .reduce((a, d) => a + d.conversions, 0),
    }));
  }, [ind]);

  const ages = [...new Set(ind.segments.map((s) => s.age))];
  const cells = ind.segments.map((s) => ({
    row: s.age,
    col: s.gender,
    value: s.cvr,
    sub: `클릭 ${num(s.clicks)} · CPA ${won(s.cpa)}`,
  }));

  // 스크롤 위치에 따라 레일 활성 항목 갱신
  useEffect(() => {
    const ids = ["overview", "actions", "channels", "funnel", "segments", "experiment"];
    const obs = new IntersectionObserver(
      (entries) => {
        if (scrolling.current) return;
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-60px 0px -70% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  function goto(id: string) {
    setActive(id);
    scrolling.current = true;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => (scrolling.current = false), 700);
  }

  const period = `${ind.daily[0]?.date ?? ""} – ${ind.daily.at(-1)?.date ?? ""}`;

  return (
    <AppShell
      active={active}
      onNavigate={goto}
      toolbar={
        <>
          <Select
            label="업종"
            value={industryId}
            onChange={(v) => setIndustryId(v as typeof industryId)}
            options={INDUSTRIES.map((i) => ({ value: i.id, label: i.name }))}
          />
          <Segmented
            label="기간"
            value={days}
            onChange={setDays}
            options={RANGES.map((d) => ({ value: d, label: `${d}일` }))}
          />
        </>
      }
    >
      <header className="fade-up py-10 text-center">
        <div className="mb-3 flex flex-wrap justify-center gap-1.5">
          <Tag>샘플 데이터</Tag>
          <Tag plain>
            {ind.name} · {ind.productLabel}
          </Tag>
        </div>
        <h1 className="text-[2.15rem] leading-[1.28] font-bold text-balance">
          다음에 예산을 <span className="text-brand">어디에 쓸지</span>
        </h1>
        <p className="mx-auto mt-2 max-w-[33rem] text-muted">
          채널·소재·타겟을 한 화면에서 보고, 규칙으로 다음 액션까지 적어 둡니다.
          LLM을 부르지 않습니다 — 근거를 그대로 보여 줘야 하기 때문입니다.
        </p>
      </header>

      <Notice label="샘플 데이터">
        모든 수치는 <strong className="text-ink">가상 데이터</strong>입니다.
        실제 집행 결과가 아니며, 광고 계정을 연결하면 같은 화면이 실측치로
        채워집니다.
      </Notice>

      <div>
        <Section
          id="overview"
          n="①"
          title="한눈에"
          note={`${period} · 집행 ${won(ind.totals.cost)}`}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                { label: "노출", n: ind.totals.impressions, fmt: num },
                {
                  label: "클릭",
                  n: ind.totals.clicks,
                  fmt: num,
                  d: ind.deltas.clicks,
                  up: true,
                },
                { label: "CTR", n: ind.totals.ctr, fmt: (v: number) => pct(v, 2) },
                {
                  label: "전환",
                  n: ind.totals.conversions,
                  fmt: num,
                  d: ind.deltas.conversions,
                  up: true,
                },
                {
                  label: "CPA",
                  n: ind.totals.cpa,
                  fmt: won,
                  d: ind.deltas.cpa,
                  up: false,
                },
                {
                  label: "ROAS",
                  n: ind.totals.roas,
                  fmt: (v: number) => pct(v, 0),
                  d: ind.deltas.roas,
                  up: true,
                },
              ] as const
            ).map((m) => {
              const has = "d" in m && m.d !== undefined;
              /* 소수 첫째 자리까지만 보여주므로, 그 아래는 「변동 없음」으로 봅니다.
                 이 처리가 없으면 0.0% 가 ▼ 빨강으로 나옵니다. */
              const flat = has && Math.abs(m.d) < 0.05;
              const good = has && !flat && (m.up ? m.d > 0 : m.d < 0);
              return (
                <div
                  key={m.label}
                  className="rounded-xl border border-line bg-card px-4 py-3"
                >
                  <p className="text-[12px] text-txt-2">
                    {m.label}
                    {"up" in m && m.up === false && (
                      <span className="ml-1 text-txt-3">(낮을수록 좋음)</span>
                    )}
                  </p>
                  <p className="mt-1.5 text-[26px] leading-none tabular-nums">
                    <CountUp value={m.n} format={m.fmt} />
                  </p>
                  {has ? (
                    <p
                      className={`mt-2 text-[12px] tabular-nums ${
                        flat ? "text-txt-3" : good ? "text-pos" : "text-neg"
                      }`}
                    >
                      {flat ? "—" : m.d > 0 ? "▲" : "▼"}{" "}
                      {Math.abs(m.d).toFixed(1)}%
                      <span className="ml-1">
                        {flat ? "변동 없음" : good ? "개선" : "악화"}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-2 text-[12px] text-txt-3">이전 기간 대비 —</p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-2 text-[12px] leading-relaxed text-txt-3">
            색은 <strong className="font-semibold text-txt-2">오르내림이 아니라
            좋고 나쁨</strong>을 나타냅니다. 그래서 CPA는 ▼(하락)가 초록이고,
            전환은 ▼가 빨강입니다. 화살표는 방향, 색은 평가입니다.
          </p>

          <div className="mt-3">
            <Panel title="일자별 전환" note={`${days}일 · 채널 합산`} well>
              <LineChart data={trend} format={(v) => v.toFixed(0)} unit="건" />
            </Panel>
          </div>
        </Section>

        {/* ── 추천 액션 — 네이버 광고 인사이트 목록 ── */}
        <Section
          id="actions"
          n="②"
          title="다음에 할 일"
          note="맨 위 하나만 실행해도 됩니다"
        >
          <div
            key={`${ind.id}-${days}`}
            className="overflow-hidden rounded-xl border border-line bg-panel"
          >
            <div className="flex items-center gap-2 border-b border-line bg-card px-3.5 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              <p className="text-[13px] font-bold">최적화 제안</p>
              <p className="ml-auto text-[12px] font-medium text-muted">
                {insights.length}건
              </p>
            </div>
            {insights.map((ins, i) => (
              <article
                key={ins.id}
                className={`flex gap-3 border-b border-line px-4 py-4 last:border-b-0 ${
                  i === 0 ? "bg-brand-soft" : ""
                }`}
              >
                <div className="flex w-[52px] shrink-0 flex-col gap-1">
                  <span
                    className={`inline-flex w-fit rounded px-1.5 py-0.5 text-[11px] font-medium ${PRIORITY[ins.priority]}`}
                  >
                    {ins.priority}
                  </span>
                  <span className="text-[11px] text-acc">{ins.category}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-medium">{ins.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed">{ins.action}</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-txt-2">
                    {ins.evidence}
                  </p>
                  {ins.effect && (
                    <p className="mt-1 text-[12px] leading-relaxed text-txt-3">
                      {ins.effect}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {ins.metrics.map((m) => (
                      <span key={m.label} className="text-[12px] whitespace-nowrap">
                        <span className="text-txt-3">{m.label} </span>
                        <span className="tabular-nums">{m.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* ── 채널 ── */}
        <Section id="channels" n="③" title="채널" note="효율이 좋은 곳으로 예산을 옮깁니다">
          <div className="grid gap-3 lg:grid-cols-2">
            <Panel title="ROAS" note="1만원 쓰면 얼마 벌어오나" well>
              <BarH
                data={ind.channels.map((c) => ({ label: c.name, value: c.roas }))}
                format={(v) => `${v.toFixed(0)}%`}
                highlightBest="high"
              />
            </Panel>
            <Panel title="CPA" note="전환 하나에 얼마 드나" well>
              <BarH
                data={ind.channels.map((c) => ({ label: c.name, value: c.cpa }))}
                format={won}
                highlightBest="low"
              />
            </Panel>
          </div>

          <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-panel">
            <table className="w-full min-w-[680px] text-[13px]">
              <thead>
                <tr className="border-b border-edge text-left text-[12px] text-txt-3">
                  <th className="px-4 py-2.5 font-medium">채널</th>
                  <th className="px-3.5 py-2 text-right font-medium">비중</th>
                  <th className="px-3.5 py-2 text-right font-medium">노출</th>
                  <th className="px-3.5 py-2 text-right font-medium">클릭</th>
                  <th className="px-3.5 py-2 text-right font-medium">CTR</th>
                  <th className="px-3.5 py-2 text-right font-medium">전환</th>
                  <th className="px-3.5 py-2 text-right font-medium">CVR</th>
                  <th className="px-3.5 py-2 text-right font-medium">CPA</th>
                  <th className="px-3.5 py-2 text-right font-medium">ROAS</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {[...ind.channels]
                  .sort((a, b) => b.roas - a.roas)
                  .map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-edge-2 last:border-b-0 hover:bg-edge-2/50"
                    >
                      <td className="px-3.5 py-[9px] font-sans font-medium">{c.name}</td>
                      <td className="px-3.5 py-[9px] text-right text-txt-2">
                        {c.share.toFixed(0)}%
                      </td>
                      <td className="px-3.5 py-[9px] text-right text-txt-2">
                        {num(c.impressions)}
                      </td>
                      <td className="px-3.5 py-[9px] text-right">{num(c.clicks)}</td>
                      <td className="px-3.5 py-[9px] text-right text-txt-2">
                        {pct(c.ctr, 2)}
                      </td>
                      <td className="px-3.5 py-[9px] text-right">{num(c.conversions)}</td>
                      <td className="px-3.5 py-[9px] text-right text-txt-2">
                        {pct(c.cvr, 2)}
                      </td>
                      <td className="px-3.5 py-[9px] text-right">{won(c.cpa)}</td>
                      <td className="px-3.5 py-[9px] text-right font-semibold">
                        {pct(c.roas, 0)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── 퍼널 ── */}
        <Section id="funnel" n="④" title="퍼널" note="어디서 사람이 빠지나">
          <Panel title="경로" note="샘플 랜딩에서 측정" well>
            <Funnel stages={ind.funnel} />
            <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-sheet-muted">
              이 숫자는 실제 페이지에서 발생한 이벤트로 채워집니다. 위{" "}
              <span className="font-bold">샘플 랜딩</span>에 측정 코드가 심어져
              있습니다.
            </p>
          </Panel>
        </Section>

        <Section id="segments" n="⑤" title="세그먼트" note="누가 제일 잘 사나">
          <Panel title="전환율" note="연령 × 성별" well>
            <Heatmap rows={ages} cols={["여성", "남성"]} cells={cells} />
          </Panel>
        </Section>

        <Section id="experiment" n="⑥" title="실험" note="랜딩 A/B">
          <Panel title="세션당 전환율" note="주 지표 · 단 하나" well>
            <AbBars
              a={ind.ab.a}
              b={ind.ab.b}
              significant={ind.ab.significant}
              pValue={ind.ab.pValue}
            />
            <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-sheet-muted">
              분모는 <strong>랜딩 진입 세션 전체</strong>입니다. 결과 도달자 기준으로
              재면 A는 출발선부터, B는 결승선부터 재는 셈이라 B가 무조건 이깁니다.
              기간을 좁히면 표본이 줄어 유의성이 사라질 수 있습니다 — 위 기간을 7일로
              바꿔보세요.
            </p>
          </Panel>
        </Section>

        <footer className="mt-10 border-t border-line pt-5 pb-3 text-[13px] leading-relaxed text-muted">
          <p>
            추천 액션은 <strong className="text-ink">규칙 기반</strong>으로 도출합니다.
            판단 근거를 화면에 그대로 보여줄 수 있어야 하기 때문입니다.
          </p>
          <p className="mt-1.5">AGM 1기 · 대전 한남대학교 · 캡스톤</p>
        </footer>
      </div>
    </AppShell>
  );
}
