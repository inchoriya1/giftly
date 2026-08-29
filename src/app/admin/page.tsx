import { AdminView } from "@/components/AdminView";
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
    <AdminView
      byVariant={byVariant}
      error={error}
      empty={!error && rows.length === 0}
    />
  );
}
