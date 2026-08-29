import type { Product, Variant } from "@/lib/types";
import { ProductArt } from "@/components/ProductArt";
import { priceText } from "@/components/ui";
import { IconHeart } from "@/components/icons";

export function ProductCard({
  product,
  variant,
  liked,
  onOpen,
  onHeart,
}: {
  product: Product;
  variant: Variant;
  liked?: boolean;
  onOpen: () => void;
  onHeart?: () => void;
}) {
  const isB = variant === "B";
  const off = Math.round((1 - product.price / product.listPrice) * 100);

  return (
    <article className="relative overflow-hidden rounded-xl border border-line bg-card">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <div className="bg-studio">
          <ProductArt product={product} size={280} />
        </div>
        <div className={`border-t border-line p-3 ${onHeart ? "pr-10" : ""}`}>
          <p className="text-[12px] font-bold text-muted">{product.brand}</p>
          <h2 className="mt-0.5 text-[14px] leading-snug font-bold">{product.name}</h2>
          {isB ? (
            <p className="mt-1.5 text-[15px] font-extrabold tabular-nums">
              <span className="mr-1 text-sale">{off}%</span>
              {priceText(product.price)}
            </p>
          ) : (
            <p className="mt-1.5 text-[15px] font-extrabold tabular-nums">
              {priceText(product.price)}
            </p>
          )}
          <p className="mt-1 text-[12px] text-muted">
            {product.rating} ({product.reviewCount.toLocaleString("ko-KR")})
          </p>
        </div>
      </button>
      {onHeart && (
        <button
          type="button"
          onClick={onHeart}
          aria-label={liked ? "찜 해제" : "찜하기"}
          aria-pressed={liked}
          className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel ${
            liked ? "text-brand" : "text-muted"
          }`}
        >
          <IconHeart size={16} filled={liked} />
        </button>
      )}
    </article>
  );
}
