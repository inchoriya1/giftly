"use client";

import Link from "next/link";
import { AppShell, Notice, Panel, Section, Tag } from "@/components/AppShell";

type VariantStat = {
  variant: string;
  total: number;
  bought: number;
  rate: number;
  revenue: number;
};

export function AdminView({
  byVariant,
  error,
  empty,
}: {
  byVariant: VariantStat[];
  error: string | null;
  empty: boolean;
}) {
  return (
    <AppShell page="admin">
      <header className="fade-up py-10 text-center">
        <div className="mb-3 flex flex-wrap justify-center gap-1.5">
          <Tag>수집 원본</Tag>
          <Tag plain>대시보드 샘플과 별개</Tag>
        </div>
        <h1 className="text-[2.15rem] leading-[1.28] font-bold text-balance">
          실제로 쌓인 것만 <span className="text-brand">보여 줍니다</span>
        </h1>
        <p className="mx-auto mt-2 max-w-[33rem] text-muted">
          숫자를 추정해서 채우지 않습니다. 샘플 랜딩에서 한 바퀴 돌아야 여기에
          줄이 생깁니다.
        </p>
      </header>

      <Notice label="원본">
        이 화면은 <strong className="text-ink">실제로 수집된 원본</strong>만
        보여줍니다. 대시보드의 샘플 데이터와는 별개입니다.
      </Notice>

      {error ? (
        <div className="rounded-xl border border-neg bg-neg-soft p-5 text-[14px]">
          <p className="font-bold text-neg">데이터를 불러오지 못했습니다</p>
          <p className="mt-1 text-muted">{error}</p>
          <p className="mt-3 text-muted">
            Supabase를 연결하지 않으면 이 화면은 비어 있는 게 정상입니다.
            <br />
            <code className="text-[13px]">.env.local</code>에{" "}
            <code className="text-[13px]">SUPABASE_SERVICE_ROLE_KEY</code>를 넣으면
            채워집니다.
          </p>
        </div>
      ) : empty ? (
        <Panel title="세션" note="아직 없음">
          <p className="text-[16px] font-bold">아직 수집된 세션이 없습니다</p>
          <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-muted">
            샘플 랜딩에서 상품을 담아 보면 여기에 원본이 쌓입니다.
          </p>
          <Link
            href="/demo"
            className="mt-4 inline-flex rounded-xl bg-brand px-4 py-2.5 text-[14px] font-extrabold text-brand-ink"
          >
            샘플 랜딩 열기
          </Link>
        </Panel>
      ) : (
        <div>
          <Section id="overview" n="①" title="실험 요약" note="수집된 세션 기준">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {byVariant
                .flatMap((v) => [
                  {
                    key: `${v.variant}-s`,
                    label: `${v.variant}안 세션`,
                    value: v.total.toLocaleString("ko-KR"),
                  },
                  {
                    key: `${v.variant}-c`,
                    label: `${v.variant}안 전환율`,
                    value: `${v.rate}%`,
                  },
                ])
                .map((m) => (
                  <div
                    key={m.key}
                    className="rounded-xl border border-line bg-card px-4 py-3"
                  >
                    <p className="text-[12px] font-bold text-muted">{m.label}</p>
                    <p className="mt-1.5 text-[24px] leading-none tabular-nums">
                      {m.value}
                    </p>
                  </div>
                ))}
            </div>
          </Section>

          <Section id="table" n="②" title="원본 집계" note="variant별">
            <div className="overflow-x-auto rounded-xl border border-line bg-panel">
              <table className="w-full min-w-[480px] text-[14px]">
                <thead>
                  <tr className="border-b border-line bg-card text-left text-[13px] text-muted">
                    <th className="px-4 py-3 font-bold">Variant</th>
                    <th className="px-4 py-3 text-right font-bold">세션</th>
                    <th className="px-4 py-3 text-right font-bold">구매</th>
                    <th className="px-4 py-3 text-right font-bold">전환율</th>
                    <th className="px-4 py-3 text-right font-bold">매출</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {byVariant.map((v) => (
                    <tr key={v.variant} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-bold">{v.variant}</td>
                      <td className="px-4 py-3 text-right">{v.total}</td>
                      <td className="px-4 py-3 text-right">{v.bought}</td>
                      <td className="px-4 py-3 text-right">{v.rate}%</td>
                      <td className="px-4 py-3 text-right">
                        {v.revenue.toLocaleString("ko-KR")}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      <p className="mt-6 text-[13px] leading-relaxed text-muted">
        서버에서 service role 키로 조회합니다. 브라우저에는 키가 나가지 않습니다.
      </p>
    </AppShell>
  );
}
