import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Row = {
  variant: string;
  purchased: boolean;
  product_id: number | null;
  amount: number | null;
};

export default async function Admin() {
  let rows: Row[] = [];
  let error: string | null = null;

  try {
    const db = createAdminClient();
    const { data, error: e } = await db
      .from("sessions")
      .select("variant, purchased, product_id, amount");
    if (e) throw e;
    rows = (data ?? []) as Row[];
  } catch (e) {
    error = e instanceof Error ? e.message : "알 수 없는 오류";
  }

  const byVariant = ["A", "B"].map((v) => {
    const all = rows.filter((r) => r.variant === v);
    const bought = all.filter((r) => r.purchased);
    return {
      variant: v,
      total: all.length,
      bought: bought.length,
      rate: all.length ? Math.round((bought.length / all.length) * 10000) / 100 : 0,
      revenue: bought.reduce((a, r) => a + (r.amount ?? 0), 0),
    };
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-[720px] flex-col gap-6 p-6">
      <header>
        <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
          내부 · 원본 수집 데이터
        </p>
        <h1 className="mt-1.5 text-[22px] font-bold tracking-tight">
          샘플 랜딩 수집 현황
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          이 화면은 <strong className="text-ink">실제로 수집된 원본</strong>만
          보여줍니다. 대시보드의 샘플 데이터와는 별개입니다.
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-brand bg-brand-soft p-4 text-[13.5px]">
          <p className="font-bold text-brand">데이터를 불러오지 못했습니다</p>
          <p className="mt-1 text-muted">{error}</p>
          <p className="mt-2 text-muted">
            Supabase를 연결하지 않으면 이 화면은 비어 있는 게 정상입니다.
            <br />
            <span className="font-mono text-[12px]">.env.local</span>에{" "}
            <span className="font-mono text-[12px]">SUPABASE_SERVICE_ROLE_KEY</span>를
            넣으면 채워집니다.
          </p>
        </div>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full min-w-[420px] text-[13.5px]">
            <thead>
              <tr className="border-b border-line font-mono text-[10px] tracking-widest text-muted uppercase">
                <th className="p-3 text-left">Variant</th>
                <th className="p-3 text-right">세션</th>
                <th className="p-3 text-right">구매</th>
                <th className="p-3 text-right">전환율</th>
                <th className="p-3 text-right">매출</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {byVariant.map((v) => (
                <tr key={v.variant} className="border-b border-line last:border-0">
                  <td className="p-3 font-bold">{v.variant}</td>
                  <td className="p-3 text-right">{v.total}</td>
                  <td className="p-3 text-right">{v.bought}</td>
                  <td className="p-3 text-right font-bold">{v.rate}%</td>
                  <td className="p-3 text-right">
                    {v.revenue.toLocaleString("ko-KR")}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="text-[11.5px] leading-relaxed text-muted">
        서버에서 service role 키로 조회합니다. 브라우저에는 키가 나가지 않습니다.
      </p>

      <Link href="/" className="text-[13px] font-semibold text-brand">
        ← 대시보드
      </Link>
    </main>
  );
}
