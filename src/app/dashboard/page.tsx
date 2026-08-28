import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/* ────────────────────────────────────────────────────────────
   마케팅 대시보드
   설계값과 실측값을 절대 섞지 않습니다. 수집 전이면 "미수집"으로
   표시하고, 추정치를 채워 넣지 않습니다.
   ──────────────────────────────────────────────────────────── */

type Counts = { total: number; done: number; leads: number; byVariant: Record<string, number> };

async function loadCounts(): Promise<Counts | null> {
  try {
    const db = createAdminClient();
    const [q, l] = await Promise.all([
      db.from("quiz_responses").select("variant, completed"),
      db.from("leads").select("id", { count: "exact", head: true }),
    ]);
    if (q.error) return null;
    const rows = (q.data ?? []) as { variant: string; completed: boolean }[];
    return {
      total: rows.length,
      done: rows.filter((r) => r.completed).length,
      leads: l.count ?? 0,
      byVariant: rows.reduce<Record<string, number>>((a, r) => {
        a[r.variant] = (a[r.variant] ?? 0) + 1;
        return a;
      }, {}),
    };
  } catch {
    return null;
  }
}

const FUNNEL = [
  { event: "page_view", label: "랜딩 진입", note: "모든 비율의 분모" },
  { event: "quiz_start", label: "퀴즈 시작", note: "랜딩이 설득했는가" },
  { event: "quiz_step", label: "문항 응답 ×4", note: "이탈 지점 추적" },
  { event: "quiz_complete", label: "퀴즈 완주", note: "완주율" },
  { event: "card_generate", label: "카드 생성", note: "LLM 실패율 포함" },
  { event: "share_click", label: "공유", note: "바이럴 계수" },
  { event: "lead_submit", label: "이메일 제출", note: "리타겟팅 자산" },
  { event: "purchase_click", label: "구매 클릭", note: "주 전환 지표" },
];

const MDE = [
  { n: 150, from: 10, to: 22 },
  { n: 200, from: 10, to: 20, current: true },
  { n: 400, from: 10, to: 17 },
  { n: 1000, from: 10, to: 14 },
];

function Tag({ kind }: { kind: "design" | "measured" | "pending" }) {
  const map = {
    design: { t: "설계값", c: "bg-brand-soft text-brand" },
    measured: { t: "실측", c: "bg-ink text-white" },
    pending: { t: "미수집", c: "bg-line text-muted" },
  } as const;
  return (
    <span
      className={`rounded px-1.5 py-0.5 font-mono text-[9.5px] tracking-wider ${map[kind].c}`}
    >
      {map[kind].t}
    </span>
  );
}

function Card({
  title,
  tag,
  children,
}: {
  title: string;
  tag?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          {title}
        </h2>
        {tag}
      </div>
      {children}
    </section>
  );
}

export default async function Dashboard() {
  const c = await loadCounts();
  const live = c !== null && c.total > 0;
  const val = (n: number) => (live ? n.toLocaleString("ko-KR") : "—");

  return (
    <main className="flex min-h-dvh flex-col gap-4 p-5 pb-12">
      <header>
        <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
          GIFTLY · 캠페인 대시보드
        </p>
        <h1 className="mt-1.5 text-[21px] leading-snug font-bold tracking-tight">
          측정 설계와 현재 상태
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          설계값과 실측값을 구분해 표시합니다. 수집 전 지표는 추정치를 넣지 않고
          <strong className="text-ink"> 미수집</strong>으로 둡니다.
        </p>
      </header>

      {/* 캠페인 상태 */}
      <Card title="캠페인 상태">
        <div className="grid grid-cols-2 gap-3">
          {[
            ["서비스 배포", "완료", true],
            ["계측 설계", "완료", true],
            ["광고 집행", "미집행", false],
            ["A/B 판정", "대기", false],
          ].map(([k, v, ok]) => (
            <div key={k as string} className="flex flex-col gap-0.5">
              <span className="text-[11.5px] text-muted">{k as string}</span>
              <span
                className={`text-[15px] font-bold ${ok ? "text-brand" : "text-muted"}`}
              >
                {v as string}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 퍼널 */}
      <Card
        title="전환 퍼널 · GA4 이벤트 8종"
        tag={<Tag kind={live ? "measured" : "pending"} />}
      >
        <ol className="flex flex-col gap-1.5">
          {FUNNEL.map((f, i) => (
            <li
              key={f.event}
              className="grid grid-cols-[16px_1fr_auto] items-center gap-2.5"
            >
              <span className="font-mono text-[10px] text-muted tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">{f.label}</p>
                <p className="truncate font-mono text-[10px] text-muted">
                  {f.event} · {f.note}
                </p>
              </div>
              <span className="font-mono text-[13px] font-bold tabular-nums">
                {f.event === "page_view"
                  ? val(c?.total ?? 0)
                  : f.event === "quiz_complete"
                    ? val(c?.done ?? 0)
                    : f.event === "lead_submit"
                      ? val(c?.leads ?? 0)
                      : "—"}
              </span>
            </li>
          ))}
        </ol>
        {!live && (
          <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-muted">
            광고를 집행하지 않아 수집된 트래픽이 없습니다. 이벤트는 전부 구현되어
            있고, GA4 맞춤 측정기준만 등록하면 즉시 기록됩니다.
          </p>
        )}
      </Card>

      {/* A/B 설계 */}
      <Card title="A/B 실험 설계" tag={<Tag kind="design" />}>
        <div className="grid grid-cols-2 gap-3 text-[12.5px]">
          <div className="rounded-lg border border-line p-3">
            <p className="font-mono text-[10px] text-muted">VERSION A · 대조군</p>
            <p className="mt-1 font-bold">상품 6종 그리드</p>
            <p className="mt-1 text-muted">CTA “구매하기”</p>
          </div>
          <div className="rounded-lg border border-brand bg-brand-soft p-3">
            <p className="font-mono text-[10px] text-brand">VERSION B · 실험군</p>
            <p className="mt-1 font-bold">퀴즈 우선 유도</p>
            <p className="mt-1 text-muted">CTA “90초 만에 찾기”</p>
          </div>
        </div>
        <dl className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-[12.5px]">
          {[
            ["주 지표", "세션당 구매 클릭률 (단 하나)"],
            ["분모", "랜딩 진입 세션 전체 — 결과 도달자 아님"],
            ["기간", "14일 고정 · 중간 판정 금지"],
            ["판정", "2×2 카이제곱 · p < 0.05"],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[52px_1fr] gap-3">
              <dt className="font-mono text-[10px] tracking-wider text-muted">{k}</dt>
              <dd className="leading-snug">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 rounded-lg bg-brand-soft p-2.5 text-[11.5px] leading-relaxed text-brand">
          분모를 결과 도달자로 잡으면 A는 출발선부터, B는 결승선부터 재는 셈이라
          B가 무조건 이깁니다. 그래서 둘 다 진입 세션 전체로 정했습니다.
        </p>
      </Card>

      {/* 표본 */}
      <Card title="표본 계산 · 검출 가능한 최소 차이" tag={<Tag kind="design" />}>
        <p className="mb-2.5 text-[12px] leading-relaxed text-muted">
          예산 20만원 → 안당 약 200세션. α=0.05 · 검정력 80% · 기준 전환율 10%
        </p>
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-line font-mono text-[9.5px] tracking-wider text-muted uppercase">
              <th className="pb-2 text-left">안당 세션</th>
              <th className="pb-2 text-right">검출 가능한 차이</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {MDE.map((m) => (
              <tr
                key={m.n}
                className={`border-b border-line last:border-0 ${m.current ? "font-bold text-brand" : ""}`}
              >
                <td className="py-2">
                  {m.n.toLocaleString("ko-KR")}
                  {m.current && <span className="ml-1.5 text-[10px]">← 우리 예산</span>}
                </td>
                <td className="py-2 text-right">
                  {m.from}% → {m.to}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
          목표를 <strong className="text-ink">+100%</strong>로 잡은 건 욕심이 아니라
          이 예산으로 증명 가능한 최소치이기 때문입니다. +30% 개선은 실제로 일어나도
          이 표본으로는 우연과 구별되지 않습니다.
        </p>
      </Card>

      {/* KPI */}
      <Card title="KPI 목표" tag={<Tag kind="design" />}>
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-line font-mono text-[9.5px] tracking-wider text-muted uppercase">
              <th className="pb-2 text-left">지표</th>
              <th className="pb-2 text-right">목표</th>
              <th className="pb-2 text-right">실측</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["퀴즈 완주율", "60% 이상"],
              ["구매 클릭률 (B)", "A 대비 +100%"],
              ["리드 수집률", "방문자의 15%"],
              ["공유율", "결과 도달자의 10%"],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-line last:border-0">
                <td className="py-2">{k}</td>
                <td className="py-2 text-right font-mono tabular-nums">{v}</td>
                <td className="py-2 text-right font-mono text-muted">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* AI 사용 */}
      <Card title="AI 활용 판단">
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div>
            <p className="font-mono text-[9.5px] tracking-wider text-muted uppercase">
              AI로 한 것
            </p>
            <ul className="mt-1.5 flex flex-col gap-1 leading-snug">
              <li>배경·무드 이미지 생성</li>
              <li>메시지 카드 문구</li>
              <li>코드 작성</li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[9.5px] tracking-wider text-brand uppercase">
              일부러 안 한 것
            </p>
            <ul className="mt-1.5 flex flex-col gap-1 leading-snug font-semibold text-brand">
              <li>제품 이미지 생성</li>
              <li>한글 텍스트 생성</li>
              <li>추천 로직에 LLM</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-muted">
          추천은 규칙 기반 점수입니다 — 취향 3점 · 관계 2점 · 예산 2점, 상위 3개.
          매번 LLM을 부르면 비용·지연이 생기고 트래픽이 몰리면 장애가 납니다. LLM은
          메시지 카드 한 곳에만 쓰고 3초 타임아웃과 사전 문구 폴백을 뒀습니다.
        </p>
      </Card>

      <p className="text-center font-mono text-[10px] tracking-wider text-muted">
        AGM 1회차 · 대전 한남대학교 · 캡스톤
      </p>
    </main>
  );
}
