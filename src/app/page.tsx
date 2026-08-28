"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  INDUSTRIES,
  RANGES,
  sliceIndustry,
  type RangeDays,
} from "@/data/mock/generate";
import { buildInsights, type Priority } from "@/lib/insights";
import { AbBars, BarH, Funnel, Heatmap, LineChart } from "@/components/charts";
import { CountUp } from "@/components/CountUp";
import { AppShell, Panel, Section, Segmented, Select } from "@/components/AppShell";
import { fadeUp, staggerParent } from "@/lib/anim";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const num = (n: number) => Math.round(n).toLocaleString("ko-KR");
const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;

const PRIORITY: Record<Priority, { chip: string; dot: string }> = {
  높음: { chip: "bg-[#fdeceb] text-[#b3261e]", dot: "bg-[#b3261e]" },
  보통: { chip: "bg-[#fef6e6] text-[#8a5b00]", dot: "bg-[#e0a01a]" },
  참고: { chip: "bg-edge-2 text-txt-2", dot: "bg-txt-3" },
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
      {/* ── 데모 모드 고지 ── */}
      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-[#f0d99a] bg-[#fdf8ec] px-3 py-2">
        <span className="rounded bg-[#e0a01a] px-1.5 py-[2px] font-mono text-[9.5px] font-bold text-white">
          DEMO
        </span>
        <p className="text-[11.5px] text-[#7a5f14]">
          모든 수치는 <strong>가상 데이터</strong>입니다. 실제 집행 결과가 아니며,
          광고 계정을 연결하면 같은 화면이 실측치로 채워집니다.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── 개요 ── */}
        <Section
          id="overview"
          title="개요"
          note={`${ind.name} · ${ind.productLabel}`}
          right={
            <span className="font-mono text-[11px] text-txt-3 tabular-nums">
              {period} · 집행 {won(ind.totals.cost)}
            </span>
          }
        >
          <motion.div
            className="grid grid-cols-2 divide-edge overflow-hidden rounded-md border border-edge bg-panel sm:grid-cols-3 sm:divide-x lg:grid-cols-6"
            variants={staggerParent}
            initial="hidden"
            animate="show"
          >
            {[
              { k: "노출", n: ind.totals.impressions, fmt: num },
              { k: "클릭", n: ind.totals.clicks, fmt: num, d: ind.deltas.clicks, up: true },
              { k: "CTR", n: ind.totals.ctr, fmt: (v: number) => pct(v, 2) },
              {
                k: "전환",
                n: ind.totals.conversions,
                fmt: num,
                d: ind.deltas.conversions,
                up: true,
              },
              { k: "CPA", n: ind.totals.cpa, fmt: won, d: ind.deltas.cpa, up: false },
              {
                k: "ROAS",
                n: ind.totals.roas,
                fmt: (v: number) => pct(v, 0),
                d: ind.deltas.roas,
                up: true,
              },
            ].map((m) => {
              const good = m.d === undefined ? null : m.up ? m.d > 0 : m.d < 0;
              return (
                <motion.div
                  key={m.k}
                  variants={fadeUp}
                  className="border-b border-edge px-3.5 py-3 last:border-b-0 sm:border-b-0"
                >
                  <p className="font-mono text-[9.5px] tracking-[0.12em] text-txt-3 uppercase">
                    {m.k}
                  </p>
                  <p className="mt-1 text-[19px] leading-none font-semibold tracking-tight">
                    <CountUp value={m.n} format={m.fmt} />
                  </p>
                  {m.d !== undefined ? (
                    <p
                      className="mt-1.5 font-mono text-[10.5px] tabular-nums"
                      style={{ color: good ? "#096b25" : "#b3261e" }}
                    >
                      {m.d > 0 ? "▲" : "▼"} {Math.abs(m.d).toFixed(1)}%
                    </p>
                  ) : (
                    <p className="mt-1.5 font-mono text-[10.5px] text-txt-3">—</p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-3">
            <Panel title="일자별 전환" note={`${days}일 · 채널 합산`}>
              <LineChart data={trend} format={(v) => v.toFixed(0)} unit="건" />
            </Panel>
          </div>
        </Section>

        {/* ── 추천 액션 ── */}
        <Section
          id="actions"
          title="추천 액션"
          note="데이터에서 도출 · 우선순위 순"
          right={
            <span className="text-[11px] text-txt-3">
              맨 위 하나만 실행해도 됩니다
            </span>
          }
        >
          <motion.div
            key={`${ind.id}-${days}`}
            className="overflow-hidden rounded-md border border-edge bg-panel"
            variants={staggerParent}
            initial="hidden"
            animate="show"
          >
            {insights.map((ins) => (
              <motion.article
                key={ins.id}
                variants={fadeUp}
                className="border-b border-edge-2 px-3.5 py-3 last:border-b-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-[2px] font-mono text-[9.5px] font-bold ${PRIORITY[ins.priority].chip}`}
                  >
                    {ins.priority}
                  </span>
                  <span className="font-mono text-[9.5px] tracking-wider text-txt-3 uppercase">
                    {ins.category}
                  </span>
                  <h3 className="text-[13.5px] font-semibold">{ins.title}</h3>
                  <div className="ml-auto flex flex-wrap gap-x-4 gap-y-1">
                    {ins.metrics.map((m) => (
                      <span key={m.label} className="text-[11px] whitespace-nowrap">
                        <span className="text-txt-3">{m.label} </span>
                        <span className="font-mono font-semibold tabular-nums">
                          {m.value}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <dl className="mt-2 grid gap-x-3 gap-y-1 text-[12px] leading-relaxed sm:grid-cols-[32px_1fr]">
                  <dt className="font-mono text-[9.5px] text-txt-3 sm:pt-[3px]">근거</dt>
                  <dd className="text-txt-2">{ins.evidence}</dd>
                  <dt className="font-mono text-[9.5px] text-acc sm:pt-[3px]">제안</dt>
                  <dd className="font-medium">{ins.action}</dd>
                  {ins.effect && (
                    <>
                      <dt className="font-mono text-[9.5px] text-txt-3 sm:pt-[3px]">
                        기대
                      </dt>
                      <dd className="text-txt-2">{ins.effect}</dd>
                    </>
                  )}
                </dl>
              </motion.article>
            ))}
          </motion.div>
        </Section>

        {/* ── 채널 ── */}
        <Section id="channels" title="채널" note="효율이 좋은 곳으로 예산을 옮깁니다">
          <div className="grid gap-3 lg:grid-cols-2">
            <Panel title="ROAS" note="1만원 쓰면 얼마 벌어오나">
              <BarH
                data={ind.channels.map((c) => ({ label: c.name, value: c.roas }))}
                format={(v) => `${v.toFixed(0)}%`}
                highlightBest="high"
              />
            </Panel>
            <Panel title="CPA" note="전환 하나에 얼마 드나">
              <BarH
                data={ind.channels.map((c) => ({ label: c.name, value: c.cpa }))}
                format={won}
                highlightBest="low"
              />
            </Panel>
          </div>

          <div className="mt-3 overflow-x-auto rounded-md border border-edge bg-panel">
            <table className="w-full min-w-[680px] text-[12px]">
              <thead>
                <tr className="border-b border-edge text-left font-mono text-[9.5px] tracking-wider text-txt-3 uppercase">
                  <th className="px-3.5 py-2 font-medium">채널</th>
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
              <tbody className="font-mono tabular-nums">
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
        <Section id="funnel" title="퍼널" note="어디서 사람이 빠지나">
          <Panel>
            <Funnel stages={ind.funnel} />
            <p className="mt-3 border-t border-edge-2 pt-3 text-[11px] leading-relaxed text-txt-3">
              이 숫자는 실제 페이지에서 발생한 이벤트로 채워집니다. 좌측{" "}
              <span className="font-medium text-txt-2">샘플 랜딩</span>에 측정 코드가
              심어져 있습니다.
            </p>
          </Panel>
        </Section>

        {/* ── 세그먼트 ── */}
        <Section id="segments" title="세그먼트" note="누가 제일 잘 사나">
          <Panel title="전환율" note="연령 × 성별">
            <Heatmap rows={ages} cols={["여성", "남성"]} cells={cells} />
          </Panel>
        </Section>

        {/* ── 실험 ── */}
        <Section id="experiment" title="실험" note="랜딩 A/B">
          <Panel title="세션당 전환율" note="주 지표 · 단 하나">
            <AbBars
              a={ind.ab.a}
              b={ind.ab.b}
              significant={ind.ab.significant}
              pValue={ind.ab.pValue}
            />
            <p className="mt-3 border-t border-edge-2 pt-3 text-[11px] leading-relaxed text-txt-3">
              분모는 <strong className="text-txt-2">랜딩 진입 세션 전체</strong>입니다.
              결과 도달자 기준으로 재면 A는 출발선부터, B는 결승선부터 재는 셈이라 B가
              무조건 이깁니다. 기간을 좁히면 표본이 줄어 유의성이 사라질 수 있습니다 —
              위 기간 선택기를 7일로 바꿔보세요.
            </p>
          </Panel>
        </Section>

        <footer className="border-t border-edge pt-4 pb-2 text-[11px] leading-relaxed text-txt-3">
          <p>
            추천 액션은 <strong className="text-txt-2">규칙 기반</strong>으로
            도출합니다 — LLM을 호출하지 않습니다. 판단 근거를 화면에 그대로 보여줄 수
            있어야 하기 때문입니다.
          </p>
          <p className="mt-1.5 font-mono tracking-wide">
            AGM 1기 · 대전 한남대학교 · 캡스톤
          </p>
        </footer>
      </div>
    </AppShell>
  );
}
