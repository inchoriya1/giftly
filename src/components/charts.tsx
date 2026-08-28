"use client";

import { useState } from "react";

/* ────────────────────────────────────────────────────────────
   인라인 SVG 차트

   팔레트는 검증기(validate_palette.js)를 통과한 값만 씁니다.
   - 단일 계열 / 순차: 블루 #2a78d6
   - 퍼널 순서형 5단계: #86b6ef → #104281 (단일 색상, 명도 단조)
   - A/B 2계열: #2a78d6 · #008300 (CVD ΔE 26.5 · 일반시야 ΔE 29.0)
   차트 크롬은 눈에 띄지 않게: 그리드 #e1e0d9, 축 #c3c2b7, 라벨 #898781
   ──────────────────────────────────────────────────────────── */

const INK = "#0b0b0b";
const MUTED = "#898781";
const GRID = "#e1e0d9";
const AXIS = "#c3c2b7";
const BLUE = "#2a78d6";
const GREEN = "#008300";
const FUNNEL_RAMP = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#104281"];

function Tip({ left, top, lines }: { left: string; top: string; lines: string[] }) {
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-md bg-[#0b0b0b] px-2.5 py-1.5 text-[11px] leading-snug whitespace-nowrap text-white shadow-lg"
      style={{ left, top, transform: "translate(-50%, -115%)" }}
    >
      {lines.map((l, i) => (
        <div key={i} className={i === 0 ? "font-bold" : "opacity-80"}>
          {l}
        </div>
      ))}
    </div>
  );
}

/* ── 시계열 (단일 계열이므로 범례 없음 — 제목이 계열을 지칭) ── */

export function LineChart({
  data,
  height = 150,
  format = (n: number) => n.toLocaleString("ko-KR"),
  unit = "",
}: {
  data: { label: string; value: number }[];
  height?: number;
  format?: (n: number) => string;
  unit?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = height;
  const P = { t: 14, r: 12, b: 22, l: 44 };
  const iw = W - P.l - P.r;
  const ih = H - P.t - P.b;

  const max = Math.max(...data.map((d) => d.value)) * 1.12;
  const x = (i: number) => P.l + (i / (data.length - 1)) * iw;
  const y = (v: number) => P.t + ih - (v / max) * ih;

  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const area = `${path} L${x(data.length - 1)},${P.t + ih} L${P.l},${P.t + ih} Z`;
  const ticks = [0, max / 2, max];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={P.l - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill={MUTED}>
              {format(t)}
            </text>
          </g>
        ))}
        <path d={area} fill={BLUE} opacity="0.08" />
        <path d={path} fill="none" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) =>
          i % 7 === 0 ? (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill={MUTED}>
              {d.label}
            </text>
          ) : null,
        )}
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={P.t + ih} stroke={AXIS} strokeWidth="1" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="4.5" fill={BLUE} stroke="#fff" strokeWidth="2" />
          </>
        )}
        {data.map((d, i) => (
          <rect
            key={i}
            x={x(i) - iw / data.length / 2}
            y={P.t}
            width={iw / data.length}
            height={ih}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hover !== null && (
        <Tip
          left={`${(x(hover) / W) * 100}%`}
          top={`${(y(data[hover].value) / H) * 100}%`}
          lines={[`${format(data[hover].value)}${unit}`, data[hover].label]}
        />
      )}
    </div>
  );
}

/* ── 채널별 가로 막대 (단일 측정치 = 단일 색) ── */

export function BarH({
  data,
  format,
  highlightBest = "high",
}: {
  data: { label: string; value: number; sub?: string }[];
  format: (n: number) => string;
  /** 좋은 방향 — ROAS는 high, CPA는 low */
  highlightBest?: "high" | "low";
}) {
  const max = Math.max(...data.map((d) => d.value));
  const bestVal =
    highlightBest === "high" ? max : Math.min(...data.map((d) => d.value));

  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => {
        const isBest = d.value === bestVal;
        return (
          <div key={d.label} className="grid grid-cols-[54px_1fr_auto] items-center gap-2.5">
            <span className="truncate text-[12px] font-semibold">{d.label}</span>
            <div className="h-5 overflow-hidden rounded-[4px] bg-[#f0efec]">
              <div
                className="h-full rounded-[4px]"
                style={{
                  width: `${Math.max((d.value / max) * 100, 2)}%`,
                  background: isBest ? BLUE : "#9ec5f4",
                }}
              />
            </div>
            <span
              className="w-[74px] text-right font-mono text-[12px] tabular-nums"
              style={{ color: isBest ? INK : "#52514e", fontWeight: isBest ? 700 : 400 }}
            >
              {format(d.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── 퍼널 (순서형 램프) ── */

export function Funnel({
  stages,
}: {
  stages: { label: string; value: number; dropFromPrev: number }[];
}) {
  const max = stages[0].value;
  const worst = Math.max(...stages.slice(1).map((s) => s.dropFromPrev));

  return (
    <div className="flex flex-col gap-1.5">
      {stages.map((s, i) => {
        const isWorst = i > 0 && s.dropFromPrev === worst;
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[12px] font-semibold">{s.label}</span>
              <span className="font-mono text-[12px] tabular-nums">
                {s.value.toLocaleString("ko-KR")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 flex-1 rounded-[4px] bg-[#f0efec]">
                <div
                  className="h-full rounded-[4px]"
                  style={{
                    width: `${(s.value / max) * 100}%`,
                    background: FUNNEL_RAMP[i],
                  }}
                />
              </div>
              {i > 0 && (
                <span
                  className="w-[52px] text-right font-mono text-[11px] tabular-nums"
                  style={{ color: isWorst ? "#d03b3b" : MUTED, fontWeight: isWorst ? 700 : 400 }}
                >
                  −{s.dropFromPrev.toFixed(0)}%
                </span>
              )}
              {i === 0 && <span className="w-[52px]" />}
            </div>
          </div>
        );
      })}
      <p className="mt-1 text-[11px] text-[#898781]">
        오른쪽 숫자는 직전 단계 대비 이탈률입니다. 빨간 값이 최대 병목입니다.
      </p>
    </div>
  );
}

/* ── 세그먼트 히트맵 (순차 램프) ── */

export function Heatmap({
  rows,
  cols,
  cells,
}: {
  rows: string[];
  cols: string[];
  cells: { row: string; col: string; value: number; sub: string }[];
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...cells.map((c) => c.value));
  const min = Math.min(...cells.map((c) => c.value));
  const shade = (v: number) => {
    const t = (v - min) / (max - min || 1);
    // 순차 블루 100→650 사이를 보간
    const stops = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#104281"];
    return stops[Math.min(stops.length - 1, Math.round(t * (stops.length - 1)))];
  };

  return (
    <div className="relative">
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `46px repeat(${cols.length}, 1fr)` }}
      >
        <div />
        {cols.map((c) => (
          <div key={c} className="pb-1 text-center text-[11px] font-semibold">
            {c}
          </div>
        ))}
        {rows.map((r) => (
          <div key={r} className="contents">
            <div className="flex items-center font-mono text-[11px] text-[#52514e]">{r}</div>
            {cols.map((c) => {
              const cell = cells.find((x) => x.row === r && x.col === c);
              if (!cell) return <div key={c} />;
              const dark = cell.value > (max + min) / 2;
              const key = `${r}|${c}`;
              return (
                <div
                  key={c}
                  onMouseEnter={() => setHover(key)}
                  onMouseLeave={() => setHover(null)}
                  className="flex h-9 cursor-default items-center justify-center rounded-[4px] font-mono text-[11px] tabular-nums"
                  style={{
                    background: shade(cell.value),
                    color: dark ? "#fff" : "#0b0b0b",
                    outline: hover === key ? `2px solid ${INK}` : "none",
                    outlineOffset: "-2px",
                  }}
                  title={`${r} ${c} · 전환율 ${cell.value.toFixed(1)}% · ${cell.sub}`}
                >
                  {cell.value.toFixed(1)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-[#898781]">
        칸의 숫자는 전환율(%)입니다. 진할수록 높습니다.
      </p>
    </div>
  );
}

/* ── A/B 비교 (2계열 — 범례 + 직접 라벨) ── */

export function AbBars({
  a,
  b,
  significant,
  pValue,
}: {
  a: { label: string; rate: number; sessions: number; conversions: number };
  b: { label: string; rate: number; sessions: number; conversions: number };
  significant: boolean;
  pValue: number;
}) {
  const max = Math.max(a.rate, b.rate) * 1.25;
  const items = [
    { key: "A", color: BLUE, ...a },
    { key: "B", color: GREEN, ...b },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4">
        {items.map((it) => (
          <span key={it.key} className="flex items-center gap-1.5 text-[11.5px]">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[2px]"
              style={{ background: it.color }}
            />
            {it.key}안 · {it.label}
          </span>
        ))}
      </div>

      <div className="flex items-end gap-4" style={{ height: 116 }}>
        {items.map((it) => (
          <div key={it.key} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="font-mono text-[15px] font-bold tabular-nums">
              {it.rate.toFixed(2)}%
            </span>
            <div
              className="w-full rounded-t-[4px]"
              style={{
                height: `${(it.rate / max) * 84}px`,
                background: it.color,
                minHeight: 6,
              }}
            />
            <span className="font-mono text-[11px] text-[#52514e] tabular-nums">
              {it.conversions.toLocaleString("ko-KR")} / {it.sessions.toLocaleString("ko-KR")}
            </span>
          </div>
        ))}
      </div>

      <div
        className="rounded-lg px-3 py-2 text-[11.5px] leading-relaxed"
        style={{
          background: significant ? "#e8f4e8" : "#f0efec",
          color: significant ? "#0b5f0b" : "#52514e",
        }}
      >
        {significant ? (
          <>
            <strong>유의미한 차이입니다</strong> (p = {pValue.toFixed(3)} &lt; 0.05).
            우연으로 보기 어렵습니다.
          </>
        ) : (
          <>
            <strong>아직 판정할 수 없습니다</strong> (p = {pValue.toFixed(3)} ≥ 0.05).
            이 표본에서는 우연과 구별되지 않습니다.
          </>
        )}
      </div>
    </div>
  );
}
