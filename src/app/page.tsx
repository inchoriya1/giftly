"use client";

import { useState } from "react";
import Link from "next/link";
import { INDUSTRIES } from "@/data/mock/generate";
import { buildInsights, type Priority } from "@/lib/insights";
import { AbBars, BarH, Funnel, Heatmap, LineChart } from "@/components/charts";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const man = (n: number) => `${(n / 10000).toFixed(0)}만원`;
const num = (n: number) => Math.round(n).toLocaleString("ko-KR");

const PRIORITY_STYLE: Record<Priority, string> = {
  높음: "bg-[#d03b3b] text-white",
  보통: "bg-[#fab219] text-[#0b0b0b]",
  참고: "bg-[#e1e0d9] text-[#52514e]",
};

export default function Dashboard() {
  const [idx, setIdx] = useState(0);
  const ind = INDUSTRIES[idx];
  const insights = buildInsights(ind);

  // 일자별 전환 추이 (채널 합산)
  const dates = [...new Set(ind.daily.map((d) => d.date))];
  const trend = dates.map((date) => ({
    label: date,
    value: ind.daily
      .filter((d) => d.date === date)
      .reduce((a, d) => a + d.conversions, 0),
  }));

  const ages = [...new Set(ind.segments.map((s) => s.age))];
  const cells = ind.segments.map((s) => ({
    row: s.age,
    col: s.gender,
    value: s.cvr,
    sub: `클릭 ${num(s.clicks)} · CPA ${won(s.cpa)}`,
  }));

  return (
    <div className="mx-auto max-w-[1120px] px-5 py-8 pb-20">
      {/* ── 헤더 ── */}
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
            마케팅 성과 대시보드
          </p>
          <h1 className="mt-1.5 text-[26px] leading-tight font-bold tracking-tight">
            이번 캠페인, 어디에 더 쓰면 좋을까요?
          </h1>
          <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
            채널·소재·타겟·랜딩 성과를 한 화면에서 보고,{" "}
            <strong className="text-ink">다음에 무엇을 할지</strong>까지 제안합니다.
            제안은 전부 규칙 기반이라 근거 수치를 함께 봅니다.
          </p>
        </div>
        <Link
          href="/demo"
          className="shrink-0 rounded-lg border border-line bg-card px-3.5 py-2 text-[12.5px] font-semibold text-brand"
        >
          측정 대상 랜딩 보기 ↗
        </Link>
      </header>

      {/* ── 샘플 데이터 고지 ── */}
      <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#fab219] bg-[#fef8e9] px-4 py-3">
        <span className="mt-px shrink-0 rounded bg-[#fab219] px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-[#0b0b0b]">
          샘플 데이터
        </span>
        <p className="text-[12.5px] leading-relaxed text-[#6b5a1f]">
          화면의 모든 수치는 <strong>대시보드 동작을 보여주기 위한 가상 데이터</strong>입니다.
          실제 광고 집행 결과가 아닙니다. 실제 계정을 연결하면 같은 화면이 실측치로 채워집니다.
        </p>
      </div>

      {/* ── 업종 선택 ── */}
      <div className="mb-6 flex flex-wrap gap-2">
        {INDUSTRIES.map((it, i) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setIdx(i)}
            className={`rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              i === idx
                ? "border-ink bg-ink text-white"
                : "border-line bg-card text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {it.name}
          </button>
        ))}
      </div>

      <p className="mb-4 font-mono text-[11px] text-muted">
        {ind.name} · {ind.productLabel} · 2026.07.20 – 08.16 (28일) · 집행{" "}
        {man(ind.totals.cost)}
      </p>

      {/* ── KPI 타일 ── */}
      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { k: "전환", v: num(ind.totals.conversions), d: ind.deltas.conversions, good: "up" },
          { k: "CPA", v: won(ind.totals.cpa), d: ind.deltas.cpa, good: "down" },
          { k: "ROAS", v: `${ind.totals.roas.toFixed(0)}%`, d: ind.deltas.roas, good: "up" },
          { k: "클릭", v: num(ind.totals.clicks), d: ind.deltas.clicks, good: "up" },
        ].map((t) => {
          const improved = t.good === "up" ? t.d > 0 : t.d < 0;
          return (
            <div key={t.k} className="rounded-xl border border-line bg-card p-4">
              <p className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
                {t.k}
              </p>
              <p className="mt-1.5 text-[24px] leading-none font-bold">{t.v}</p>
              <p
                className="mt-2 font-mono text-[11.5px] tabular-nums"
                style={{ color: improved ? "#006300" : "#d03b3b" }}
              >
                {t.d > 0 ? "▲" : "▼"} {Math.abs(t.d).toFixed(1)}%
                <span className="ml-1 text-muted">직전 14일 대비</span>
              </p>
            </div>
          );
        })}
      </section>

      {/* ── ⭐ 인사이트 ── */}
      <section className="mb-6">
        <div className="mb-3 flex items-baseline gap-2.5">
          <h2 className="text-[15px] font-bold">다음에 할 일</h2>
          <span className="text-[12px] text-muted">
            데이터에서 자동 도출 · 우선순위 순
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {insights.map((ins) => (
            <article
              key={ins.id}
              className="rounded-xl border border-line bg-card p-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold ${PRIORITY_STYLE[ins.priority]}`}
                >
                  {ins.priority}
                </span>
                <span className="rounded bg-[#f0efec] px-1.5 py-0.5 font-mono text-[9.5px] text-[#52514e]">
                  {ins.category}
                </span>
                <h3 className="text-[14.5px] font-bold">{ins.title}</h3>
              </div>

              <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
                {ins.metrics.map((m) => (
                  <span key={m.label} className="text-[12px]">
                    <span className="text-muted">{m.label} </span>
                    <span className="font-mono font-bold tabular-nums">{m.value}</span>
                  </span>
                ))}
              </div>

              <dl className="flex flex-col gap-1.5 text-[12.5px] leading-relaxed">
                <div className="grid grid-cols-[38px_1fr] gap-2.5">
                  <dt className="font-mono text-[10px] text-muted">근거</dt>
                  <dd className="text-[#52514e]">{ins.evidence}</dd>
                </div>
                <div className="grid grid-cols-[38px_1fr] gap-2.5">
                  <dt className="font-mono text-[10px] text-brand">제안</dt>
                  <dd className="font-semibold">{ins.action}</dd>
                </div>
                {ins.effect && (
                  <div className="grid grid-cols-[38px_1fr] gap-2.5">
                    <dt className="font-mono text-[10px] text-muted">기대</dt>
                    <dd className="text-[#52514e]">{ins.effect}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
      </section>

      {/* ── 차트 ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="채널별 ROAS" note="높을수록 좋습니다">
          <BarH
            data={ind.channels.map((c) => ({ label: c.name, value: c.roas }))}
            format={(v) => `${v.toFixed(0)}%`}
            highlightBest="high"
          />
        </Panel>

        <Panel title="채널별 CPA" note="낮을수록 좋습니다">
          <BarH
            data={ind.channels.map((c) => ({ label: c.name, value: c.cpa }))}
            format={won}
            highlightBest="low"
          />
        </Panel>

        <Panel title="일자별 전환 추이" note="28일 · 채널 합산" wide>
          <LineChart data={trend} format={(v) => v.toFixed(0)} unit="건" />
        </Panel>

        <Panel title="전환 퍼널" note="어디서 새는가">
          <Funnel stages={ind.funnel} />
        </Panel>

        <Panel title="세그먼트별 전환율" note="연령 × 성별">
          <Heatmap rows={ages} cols={["여성", "남성"]} cells={cells} />
        </Panel>

        <Panel title="랜딩 A/B 테스트" note="주 지표 = 세션당 전환율" wide>
          <AbBars
            a={ind.ab.a}
            b={ind.ab.b}
            significant={ind.ab.significant}
            pValue={ind.ab.pValue}
          />
          <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-muted">
            분모는 <strong className="text-ink">랜딩 진입 세션 전체</strong>입니다.
            결과 도달자 기준으로 재면 A는 출발선부터, B는 결승선부터 재는 셈이라 B가
            무조건 이깁니다.
          </p>
        </Panel>
      </div>

      {/* ── 채널 상세 표 ── */}
      <section className="mt-4 rounded-xl border border-line bg-card p-4">
        <h2 className="mb-3 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          채널 상세
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left font-mono text-[9.5px] tracking-wider text-muted uppercase">
                <th className="pb-2">채널</th>
                <th className="pb-2 text-right">예산비중</th>
                <th className="pb-2 text-right">클릭</th>
                <th className="pb-2 text-right">CTR</th>
                <th className="pb-2 text-right">전환</th>
                <th className="pb-2 text-right">CPA</th>
                <th className="pb-2 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {ind.channels.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="py-2 font-sans font-semibold">{c.name}</td>
                  <td className="py-2 text-right">{c.share.toFixed(0)}%</td>
                  <td className="py-2 text-right">{num(c.clicks)}</td>
                  <td className="py-2 text-right">{c.ctr.toFixed(2)}%</td>
                  <td className="py-2 text-right">{num(c.conversions)}</td>
                  <td className="py-2 text-right">{won(c.cpa)}</td>
                  <td className="py-2 text-right font-bold">{c.roas.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-8 border-t border-line pt-5 text-[11.5px] leading-relaxed text-muted">
        <p>
          제안은 <strong className="text-ink">규칙 기반</strong>으로 도출합니다 —
          LLM을 호출하지 않습니다. 판단 근거를 화면에 그대로 보여줄 수 있어야 하기
          때문입니다. &ldquo;AI가 그렇게 말했다&rdquo;는 사장님께 드릴 수 있는 설명이
          아닙니다.
        </p>
        <p className="mt-2 font-mono tracking-wider">
          AGM 1기 · 대전 한남대학교 · 캡스톤
        </p>
      </footer>
    </div>
  );
}

function Panel({
  title,
  note,
  wide,
  children,
}: {
  title: string;
  note?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-line bg-card p-4 ${wide ? "md:col-span-2" : ""}`}
    >
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          {title}
        </h2>
        {note && <span className="text-[11px] text-muted">{note}</span>}
      </div>
      {children}
    </section>
  );
}
