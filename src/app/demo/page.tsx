"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import { track } from "@/lib/analytics";
import {
  ensureSession,
  readCart,
  readWish,
  toggleWish,
} from "@/lib/session";
import { CATEGORIES, type Category, type SortKey, type Variant } from "@/lib/types";
import { ProductArt } from "@/components/ProductArt";
import { priceText } from "@/components/ui";
import {
  BottomTabs,
  Sheet,
  StoreFooter,
  StoreHeader,
} from "@/components/StoreChrome";
import { IconHeart, IconStar, IconTruck } from "@/components/icons";

const SORTS: SortKey[] = ["추천", "가격", "후기"];
const SORT_LABEL: Record<SortKey, string> = {
  추천: "추천순",
  가격: "낮은가격",
  후기: "후기많은",
};

export default function DemoLanding() {
  const router = useRouter();

  const [variant, setVariant] = useState<Variant | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wish, setWish] = useState<number[]>([]);

  const [category, setCategory] = useState<Category | "전체">("전체");
  const [sort, setSort] = useState<SortKey>("추천");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sheet, setSheet] = useState<null | "category" | "my">(null);

  useEffect(() => {
    const { variant: v } = ensureSession();
    /* eslint-disable react-hooks/set-state-in-effect -- 클라이언트 전용 값 */
    setVariant(v);
    setCartCount(readCart()?.qty ?? 0);
    setWish(readWish());
    /* eslint-enable react-hooks/set-state-in-effect */
    track("page_view", { page_path: "/demo" });
  }, []);

  const list = useMemo(() => {
    const q = query.trim();
    const filtered = PRODUCTS.filter(
      (p) =>
        (category === "전체" || p.category === category) &&
        (q === "" || p.name.includes(q) || p.tagline.includes(q)),
    );
    const sorted = [...filtered];
    if (sort === "가격") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "후기") sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    return sorted;
  }, [category, sort, query]);

  if (!variant) return <div className="min-h-dvh" />;
  const isB = variant === "B";

  function pickCategory(c: Category | "전체") {
    setCategory(c);
    setSheet(null);
    track("select_category", { category: c });
  }

  function open(id: number, position: number) {
    track("view_product", { product_id: id, position });
    router.push(`/demo/product?id=${id}`);
  }

  function heart(id: number) {
    setWish(toggleWish(id));
  }

  return (
    <main className="fade-up flex min-h-dvh flex-col bg-paper pb-[62px]">
      <StoreHeader
        variant={variant}
        cartCount={cartCount}
        search={{
          open: searchOpen,
          query,
          onToggle: () => {
            setSearchOpen((o) => {
              if (o) setQuery("");
              else track("search_open");
              return !o;
            });
          },
          onChange: setQuery,
        }}
        category={{ value: category, onChange: pickCategory }}
      />

      {/* 배너 — 검색 중에는 감춥니다 */}
      {!searchOpen && (
        <section className="px-4 pt-4">
          <div
            className="overflow-hidden rounded-xl px-5 py-6"
            style={{
              background: isB
                ? "linear-gradient(135deg,#8E2A20 0%,#B14536 100%)"
                : "linear-gradient(135deg,#F0E4D4 0%,#DCC5A8 100%)",
            }}
          >
            {isB ? (
              <>
                <span className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white">
                  오늘 자정 마감
                </span>
                <h1 className="mt-2.5 text-[24px] leading-tight font-extrabold text-white">
                  최대 32% 할인
                  <br />
                  매일 쓰는 것만 골랐습니다
                </h1>
                <p className="mt-2 text-[12.5px] text-white/85">
                  평점 4.2 이상 · 후기 400건 이상 · 오늘 주문 시 내일 도착
                </p>
              </>
            ) : (
              <>
                <p className="font-mono text-[10.5px] tracking-[0.16em] text-[#7A5C38] uppercase">
                  New Arrivals
                </p>
                <h1 className="mt-2 text-[22px] leading-tight font-bold text-[#3A2E22]">
                  생활용품 기획전
                </h1>
                <p className="mt-2 text-[12.5px] text-[#6B5744]">
                  주방 · 의류 · 수납 · 뷰티 · 디지털 · 운동 {PRODUCTS.length}종
                </p>
              </>
            )}
          </div>
        </section>
      )}

      {/* 정렬 바 */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2.5">
        <p className="text-[12.5px] text-muted">
          {category === "전체" ? "전체" : category}{" "}
          <strong className="text-ink">{list.length}</strong>개
          {query && <span className="ml-1 text-muted">· “{query}”</span>}
        </p>
        <div className="flex gap-2.5 text-[12px]">
          {SORTS.map((s, i) => (
            <span key={s} className="flex items-center gap-2.5">
              {i > 0 && <span className="text-line">|</span>}
              <button
                type="button"
                onClick={() => setSort(s)}
                aria-pressed={sort === s}
                className={sort === s ? "font-bold text-ink" : "text-muted"}
              >
                {SORT_LABEL[s]}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 목록 */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 px-4 py-14 text-center">
          <p className="text-[14px] font-semibold">조건에 맞는 상품이 없습니다</p>
          <p className="text-[12.5px] text-muted">
            검색어나 카테고리를 바꿔보세요
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory("전체");
              setQuery("");
            }}
            className="mt-1 rounded-lg border border-ink px-4 py-2 text-[12.5px] font-bold"
          >
            전체 보기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4">
          {list.map((p, i) => {
            const off = Math.round((1 - p.price / p.listPrice) * 100);
            const liked = wish.includes(p.id);
            return (
              <article key={p.id} className="relative">
                <button
                  type="button"
                  onClick={() => open(p.id, i + 1)}
                  className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <div className="relative overflow-hidden rounded-lg border border-line/60">
                    <ProductArt product={p} size={200} />
                    {isB && (
                      <span className="absolute top-2 left-2 rounded bg-brand px-1.5 py-[2px] font-mono text-[10px] font-bold text-white">
                        {off}%
                      </span>
                    )}
                    {isB && i === 0 && sort === "추천" && category === "전체" && (
                      <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-[2px] text-[10px] font-semibold text-white">
                        BEST
                      </span>
                    )}
                  </div>

                  <div className="pt-2 pr-7">
                    <h2 className="text-[13px] leading-snug font-semibold">{p.name}</h2>

                    {isB ? (
                      <>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="font-mono text-[13px] font-bold text-brand">
                            {off}%
                          </span>
                          <span className="font-mono text-[13.5px] font-bold">
                            {priceText(p.price)}
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-muted line-through">
                          {priceText(p.listPrice)}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                          <IconStar className="text-[#e0a01a]" />
                          <span className="font-semibold text-ink">{p.rating}</span>
                          <span className="text-muted/70">
                            ({p.reviewCount.toLocaleString("ko-KR")})
                          </span>
                        </p>
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-brand-soft px-1.5 py-[2px] text-[10px] font-semibold text-brand">
                          <IconTruck size={12} /> 내일 도착
                        </span>
                      </>
                    ) : (
                      <>
                        <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted">
                          {p.tagline}
                        </p>
                        <p className="mt-1.5 font-mono text-[13.5px] font-semibold">
                          {priceText(p.price)}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                          <IconStar className="text-[#c9b8a0]" />
                          {p.rating} · 후기 {p.reviewCount.toLocaleString("ko-KR")}
                        </p>
                      </>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => heart(p.id)}
                  aria-label={liked ? "찜 해제" : "찜하기"}
                  aria-pressed={liked}
                  className={`absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center ${
                    liked ? "text-brand" : "text-muted/60"
                  }`}
                >
                  <IconHeart size={18} />
                </button>
              </article>
            );
          })}
        </div>
      )}

      <StoreFooter />

      <BottomTabs
        cartCount={cartCount}
        onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onCategory={() => setSheet("category")}
        onSearch={() => {
          setSearchOpen(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onMy={() => setSheet("my")}
      />

      {sheet === "category" && (
        <Sheet title="카테고리" onClose={() => setSheet(null)}>
          <div className="grid grid-cols-3 gap-2 pb-2">
            {(["전체", ...CATEGORIES] as const).map((c) => {
              const n =
                c === "전체"
                  ? PRODUCTS.length
                  : PRODUCTS.filter((p) => p.category === c).length;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => pickCategory(c)}
                  className={`rounded-lg border px-2 py-3 text-[12.5px] font-semibold transition ${
                    category === c
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-card text-ink"
                  }`}
                >
                  {c}
                  <span
                    className={`mt-0.5 block font-mono text-[10px] font-normal ${
                      category === c ? "text-white/60" : "text-muted"
                    }`}
                  >
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
        </Sheet>
      )}

      {sheet === "my" && (
        <Sheet title="마이페이지" onClose={() => setSheet(null)}>
          <div className="flex flex-col gap-3 pb-2">
            <div className="rounded-lg border border-line bg-card p-3.5">
              <p className="text-[12.5px] text-muted">찜한 상품</p>
              <p className="mt-0.5 font-mono text-[20px] font-bold">{wish.length}개</p>
              {wish.length > 0 && (
                <p className="mt-1 text-[11.5px] text-muted">
                  {PRODUCTS.filter((p) => wish.includes(p.id))
                    .map((p) => p.name)
                    .join(", ")}
                </p>
              )}
            </div>
            <div className="rounded-lg border border-line bg-card p-3.5">
              <p className="text-[12.5px] text-muted">장바구니</p>
              <p className="mt-0.5 font-mono text-[20px] font-bold">{cartCount}개</p>
            </div>
            <p className="text-[11.5px] leading-relaxed text-muted">
              로그인·주문내역은 구현하지 않았습니다. 이 페이지의 목적은 측정 이벤트를
              발생시키는 것이고, 회원 기능은 그 목적에 필요하지 않습니다.
            </p>
          </div>
        </Sheet>
      )}
    </main>
  );
}
