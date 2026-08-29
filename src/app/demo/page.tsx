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
import { ProductCard } from "@/components/ProductCard";
import {
  BottomTabs,
  SheetHost,
  StoreFooter,
  StoreHeader,
} from "@/components/StoreChrome";

const SORTS: SortKey[] = ["추천", "가격", "후기"];
const SORT_LABEL: Record<SortKey, string> = {
  추천: "추천순",
  가격: "낮은가격순",
  후기: "후기많은순",
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
        (q === "" ||
          p.name.includes(q) ||
          p.tagline.includes(q) ||
          p.brand.includes(q)),
    );
    const sorted = [...filtered];
    if (sort === "가격") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "후기") sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    return sorted;
  }, [category, sort, query]);

  const featured = PRODUCTS[0];
  const featuredOff = Math.round((1 - featured.price / featured.listPrice) * 100);

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
    <main className="flex min-h-dvh flex-col bg-paper pb-[62px] md:pb-0">
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

      {!searchOpen && (
        <section className="fade-up py-12 text-center">
          <div className="mb-3 flex flex-wrap justify-center gap-1.5">
            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[12px] font-bold text-acc-ink">
              샘플
            </span>
            <span className="rounded-full border border-line px-2.5 py-0.5 text-[12px] font-bold text-muted">
              {isB ? "B안 · 혜택" : "A안 · 기본"}
            </span>
            <span className="rounded-full border border-line px-2.5 py-0.5 text-[12px] font-bold text-muted">
              무료 구경
            </span>
          </div>
          {isB ? (
            <>
              <h1 className="text-[2.15rem] leading-[1.28] font-bold text-balance">
                매일 쓰는 것만 <span className="text-brand">골랐습니다</span>
              </h1>
              <p className="mx-auto mt-3 max-w-[33rem] text-muted">
                그림 한 장이 아니라 상품 한 줄을 담으면, 대시보드가 그 클릭을
                읽습니다. {featuredOff}% 할인은 B안에만 보여 줍니다.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[2.15rem] leading-[1.28] font-bold text-balance">
                생활의 기본기를 <span className="text-brand">다시 고릅니다</span>
              </h1>
              <p className="mx-auto mt-3 max-w-[33rem] text-muted">
                주방 · 의류 · 수납 · 뷰티 · 디지털 · 운동 {PRODUCTS.length}종.
                실제 판매는 없고, 측정 이벤트만 남습니다.
              </p>
            </>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("catalog")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-xl bg-brand px-5 py-2.5 text-[14px] font-extrabold text-brand-ink"
            >
              상품 보러가기
            </button>
            <button
              type="button"
              onClick={() => open(featured.id, 1)}
              className="rounded-xl border border-line bg-card px-5 py-2.5 text-[14px] font-extrabold"
            >
              첫 상품 만져보기
            </button>
          </div>
        </section>
      )}

      <h2 className="store-wrap mt-4 mb-0 flex items-center gap-2 border-b border-line pb-2 text-[18px] font-bold">
        <span className="text-brand">①</span> 누구를 데려갈까요
        <span className="text-[14px] font-medium text-muted">
          내 장바구니도, 목록도 같은 줄에 있습니다
        </span>
      </h2>

      <div
        id="catalog"
        className="store-wrap flex items-center justify-between pt-5 pb-4"
      >
        <p className="text-[13px]">
          {category === "전체" ? "전체" : category}{" "}
          <span className="font-bold">{list.length}</span>
          {query && <span className="ml-1 text-muted">· “{query}”</span>}
        </p>
        <div className="flex gap-3 text-[12px]">
          {SORTS.map((s, i) => (
            <span key={s} className="flex items-center gap-3">
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

      {list.length === 0 ? (
        <div className="store-wrap flex flex-col items-center gap-2 py-20 text-center">
          <p className="text-[15px] font-bold">조건에 맞는 상품이 없습니다</p>
          <p className="text-[13px] text-muted">검색어나 카테고리를 바꿔보세요</p>
          <button
            type="button"
            onClick={() => {
              setCategory("전체");
              setQuery("");
            }}
            className="mt-2 rounded-xl border border-line bg-card px-5 py-2 text-[13px] font-extrabold"
          >
            전체 보기
          </button>
        </div>
      ) : (
        <div className="store-wrap grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              variant={variant}
              liked={wish.includes(p.id)}
              onOpen={() => open(p.id, i + 1)}
              onHeart={() => heart(p.id)}
            />
          ))}
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

      <SheetHost
        open={sheet === "category"}
        title="카테고리"
        onClose={() => setSheet(null)}
      >
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
                className={`rounded-xl border px-2 py-3 text-[13px] font-bold ${
                  category === c
                    ? "border-brand bg-brand-soft text-acc-ink"
                    : "border-line bg-card text-ink"
                }`}
              >
                {c}
                <span className="mt-0.5 block text-[11px] font-normal text-muted">
                  {n}
                </span>
              </button>
            );
          })}
        </div>
      </SheetHost>

      <SheetHost open={sheet === "my"} title="마이페이지" onClose={() => setSheet(null)}>
        <div className="flex flex-col gap-4 pb-2">
          <div className="border-b border-line pb-3">
            <p className="text-[12px] text-muted">찜한 상품</p>
            <p className="mt-0.5 text-[20px] font-bold tabular-nums">{wish.length}개</p>
            {wish.length > 0 && (
              <p className="mt-1 text-[12px] text-muted">
                {PRODUCTS.filter((p) => wish.includes(p.id))
                  .map((p) => p.name)
                  .join(", ")}
              </p>
            )}
          </div>
          <div className="border-b border-line pb-3">
            <p className="text-[12px] text-muted">장바구니</p>
            <p className="mt-0.5 text-[20px] font-bold tabular-nums">{cartCount}개</p>
          </div>
          <p className="text-[12px] leading-relaxed text-muted">
            로그인·주문내역은 구현하지 않았습니다. 이 페이지의 목적은 측정 이벤트를
            발생시키는 것이고, 회원 기능은 그 목적에 필요하지 않습니다.
          </p>
        </div>
      </SheetHost>
    </main>
  );
}
