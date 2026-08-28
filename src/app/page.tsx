"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { INDUSTRIES } from "@/data/mock/generate";
import { buildInsights, type Priority } from "@/lib/insights";
import { AbBars, BarH, Funnel, Heatmap, LineChart } from "@/components/charts";
import { CountUp } from "@/components/CountUp";
import { fadeUp, staggerParent } from "@/lib/anim";

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
      {/* ── 무엇을 하는 곳인가 ── */}
      <header className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
          마케팅 성과 대시보드
        </p>
        <h1 className="mt-2 max-w-[20ch] text-[30px] leading-[1.2] font-bold tracking-tight md:max-w-none">
          광고를 돌렸는데,
          <br className="md:hidden" /> 다음엔 어디에 더 쓰면 될까요?
        </h1>
        <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed">
          광고 관리자는 <strong>숫자를 보여줍니다.</strong> 이 대시보드는 그 숫자를 읽고{" "}
          <strong className="text-brand">무엇을 할지 제안합니다.</strong> 예산을 어디로
          옮길지, 소재를 갈아야 할 때인지, 실험 결과를 믿어도 되는지까지요.
        </p>
      </header>

      {/* ── 읽는 법 ── */}
      <section className="mb-6 rounded-xl border border-line bg-card p-5">
        <h2 className="mb-3 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          이렇게 보세요
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            [
              "업종을 고릅니다",
              "아래 탭에서 하나를 누르세요. 업종마다 채널 성향이 달라 제안도 달라집니다.",
            ],
            [
              "「다음에 할 일」을 읽습니다",
              "우선순위 순으로 정렬돼 있습니다. 맨 위 하나만 실행해도 됩니다.",
            ],
            [
              "근거와 가정을 확인합니다",
              "제안마다 어떤 수치를 보고 판단했는지, 어떤 전제인지 함께 적혀 있습니다.",
            ],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-[13.5px] font-bold">{t}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 샘플 데이터 고지 ── */}
      <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-[#fab219] bg-[#fef8e9] px-4 py-3">
        <span className="mt-px shrink-0 rounded bg-[#fab219] px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-[#0b0b0b]">
          샘플 데이터
        </span>
        <p className="text-[12.5px] leading-relaxed text-[#6b5a1f]">
          아래 수치는 <strong>대시보드가 어떻게 작동하는지 보여주기 위한 가상 데이터</strong>입니다.
          실제 광고 집행 결과가 아닙니다. 광고 계정을 연결하면 같은 화면이 실제 수치로 채워집니다.
        </p>
      </div>

      {/* ── 업종 선택 ── */}
      <div className="mb-4">
        <p className="mb-2 text-[13px] font-semibold">
          업종을 골라 보세요{" "}
          <span className="font-normal text-muted">— 제안이 어떻게 달라지는지 보입니다</span>
        </p>
        <div className="flex flex-wrap gap-2">
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
      </div>

      <p className="mb-5 font-mono text-[11px] text-muted">
        지금 보는 것 — {ind.name} · {ind.productLabel} · 2026.07.20 – 08.16 (28일) · 집행{" "}
        {man(ind.totals.cost)}
      </p>

      {/* ── KPI 타일 ── */}
      <motion.section
        className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4"
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {[
          { k: "전환", n: ind.totals.conversions, fmt: num, d: ind.deltas.conversions, good: "up" },
          { k: "CPA", n: ind.totals.cpa, fmt: won, d: ind.deltas.cpa, good: "down" },
          {
            k: "ROAS",
            n: ind.totals.roas,
            fmt: (v: number) => `${Math.round(v)}%`,
            d: ind.deltas.roas,
            good: "up",
          },
          { k: "클릭", n: ind.totals.clicks, fmt: num, d: ind.deltas.clicks, good: "up" },
        ].map((t) => {
          const improved = t.good === "up" ? t.d > 0 : t.d < 0;
          return (
            <motion.div
              key={t.k}
              variants={fadeUp}
              className="rounded-xl border border-line bg-card p-4"
            >
              <p className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
                {t.k}
              </p>
              <p className="mt-1.5 text-[24px] leading-none font-bold">
                <CountUp value={t.n} format={t.fmt} />
              </p>
              <p
                className="mt-2 font-mono text-[11.5px] tabular-nums"
                style={{ color: improved ? "#006300" : "#d03b3b" }}
              >
                {t.d > 0 ? "▲" : "▼"} {Math.abs(t.d).toFixed(1)}%
                <span className="ml-1 text-muted">직전 14일 대비</span>
              </p>
            </motion.div>
          );
        })}
      </motion.section>

      {/* ── ⭐ 인사이트 ── */}
      <section className="mb-6">
        <div className="mb-1 flex items-baseline gap-2.5">
          <h2 className="text-[17px] font-bold">다음에 할 일</h2>
          <span className="text-[12px] text-muted">우선순위 순 · 위에서부터</span>
        </div>
        <p className="mb-3 max-w-[62ch] text-[12.5px] leading-relaxed text-muted">
          아래 수치를 규칙에 넣어 자동으로 뽑은 제안입니다.{" "}
          <strong className="text-ink">맨 위 하나만 실행해도 됩니다</strong> — 한 번에 다
          바꾸면 무엇이 효과가 있었는지 알 수 없습니다.
        </p>
        <motion.div
          key={ind.id}
          className="flex flex-col gap-3"
          variants={staggerParent}
          initial="hidden"
          animate="show"
        >
          {insights.map((ins) => (
            <motion.article
              key={ins.id}
              variants={fadeUp}
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
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ── 차트 ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="채널별 ROAS" note="1만원 쓰면 얼마 벌어오나">
          <BarH
            data={ind.channels.map((c) => ({ label: c.name, value: c.roas }))}
            format={(v) => `${v.toFixed(0)}%`}
            highlightBest="high"
          />
        </Panel>

        <Panel title="채널별 CPA" note="전환 하나에 얼마 드나">
          <BarH
            data={ind.channels.map((c) => ({ label: c.name, value: c.cpa }))}
            format={won}
            highlightBest="low"
          />
        </Panel>

        <Panel title="일자별 전환 추이" note="성과가 오르고 있나 · 28일" wide>
          <LineChart data={trend} format={(v) => v.toFixed(0)} unit="건" />
        </Panel>

        <Panel title="전환 퍼널" note="어디서 사람이 빠지나">
          <Funnel stages={ind.funnel} />
          <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-muted">
            이 숫자는 실제 페이지에서 발생한 이벤트로 채워집니다. 저희가 만든{" "}
            <Link href="/demo" className="font-semibold text-brand underline underline-offset-2">
              샘플 광고 페이지
            </Link>
            에 측정 코드가 심어져 있습니다.
          </p>
        </Panel>

        <Panel title="세그먼트별 전환율" note="누가 제일 잘 사나">
          <Heatmap rows={ages} cols={["여성", "남성"]} cells={cells} />
        </Panel>

        <Panel title="랜딩 A/B 테스트" note="어느 화면이 더 나은가" wide>
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
