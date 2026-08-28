import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Row = {
  variant: string;
  completed: boolean;
  relation: string | null;
  taste: string | null;
  budget: string | null;
};

export default async function Admin() {
  let rows: Row[] = [];
  let leads = 0;
  let error: string | null = null;

  try {
    const db = createAdminClient();
    const [q, l] = await Promise.all([
      db.from("quiz_responses").select("variant, completed, relation, taste, budget"),
      db.from("leads").select("id", { count: "exact", head: true }),
    ]);
    if (q.error) throw q.error;
    rows = (q.data ?? []) as Row[];
    leads = l.count ?? 0;
  } catch (e) {
    error = e instanceof Error ? e.message : "알 수 없는 오류";
  }

  const byVariant = ["A", "B"].map((v) => {
    const all = rows.filter((r) => r.variant === v);
    const done = all.filter((r) => r.completed);
    return {
      variant: v,
      total: all.length,
      done: done.length,
      rate: all.length ? Math.round((done.length / all.length) * 1000) / 10 : 0,
    };
  });

  const tasteDist = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      if (r.taste) acc[r.taste] = (acc[r.taste] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <main className="flex min-h-dvh flex-col gap-6 p-6">
      <header>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          내부 대시보드
        </p>
        <h1 className="mt-1.5 text-[22px] font-bold tracking-tight">
          퀴즈 응답 현황
        </h1>
      </header>

      {error ? (
        <div className="rounded-xl border border-brand bg-brand-soft p-4 text-[13.5px]">
          <p className="font-bold text-brand">데이터를 불러오지 못했습니다</p>
          <p className="mt-1 text-muted">{error}</p>
          <p className="mt-2 text-muted">
            .env.local 에 SUPABASE_SERVICE_ROLE_KEY 가 있는지 확인하세요.
          </p>
        </div>
      ) : (
        <>
          <section className="overflow-x-auto rounded-xl border border-line bg-card">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] tracking-widest text-muted uppercase">
                  <th className="p-3 text-left">Variant</th>
                  <th className="p-3 text-right">진입</th>
                  <th className="p-3 text-right">완주</th>
                  <th className="p-3 text-right">완주율</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {byVariant.map((v) => (
                  <tr key={v.variant} className="border-b border-line last:border-0">
                    <td className="p-3 font-bold">{v.variant}</td>
                    <td className="p-3 text-right">{v.total}</td>
                    <td className="p-3 text-right">{v.done}</td>
                    <td className="p-3 text-right font-bold">{v.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-xl border border-line bg-card p-4">
            <h2 className="font-mono text-[10px] tracking-widest text-muted uppercase">
              취향 분포 · V2.0 소재 근거
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {tasteDist.length === 0 && (
                <p className="text-[13.5px] text-muted">아직 데이터가 없습니다.</p>
              )}
              {tasteDist.map(([taste, n]) => (
                <div key={taste} className="flex items-center gap-3">
                  <span className="w-12 text-[13.5px] font-semibold">{taste}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-line">
                    <div
                      className="h-full bg-brand"
                      style={{ width: `${(n / rows.length) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[12px]">{n}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-card p-4">
            <h2 className="font-mono text-[10px] tracking-widest text-muted uppercase">
              수집 리드
            </h2>
            <p className="mt-1 font-mono text-[26px] font-bold tabular-nums">
              {leads}
            </p>
          </section>
        </>
      )}

      <p className="text-[11px] leading-relaxed text-muted">
        이 페이지는 서버에서 service role 키로 조회합니다. 브라우저에는 키가
        나가지 않습니다. 배포 시 Vercel 환경변수에 별도로 등록하세요.
      </p>
    </main>
  );
}
