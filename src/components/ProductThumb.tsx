import Image from "next/image";
import type { Product } from "@/lib/types";

/**
 * 상품 썸네일.
 *
 * 이미지가 아직 없어도 "깨진 화면"이 아니라 의도된 타일로 보이게 합니다.
 * 상품 id로 색을 고정 배분하므로 같은 상품은 언제나 같은 색입니다.
 */
const TILES = [
  { from: "#F0E4D4", to: "#DCC5A8", ink: "#7A5C38" },
  { from: "#EFE0DE", to: "#D9BAB5", ink: "#7E5049" },
  { from: "#E6E7DC", to: "#C7CBB4", ink: "#5D6647" },
  { from: "#EAE3EC", to: "#CBBED2", ink: "#5F5169" },
  { from: "#E2E8E9", to: "#BFCED1", ink: "#47595E" },
  { from: "#F1E7D2", to: "#DDCB9F", ink: "#77653A" },
  { from: "#E9E1D8", to: "#CDBCAA", ink: "#6B584A" },
  { from: "#EDE3E0", to: "#D3BDB6", ink: "#71564E" },
];

export function ProductThumb({
  product,
  size,
  className = "",
}: {
  product: Product;
  size: number;
  className?: string;
}) {
  if (product.image) {
    return (
      <Image
        src={product.image}
        alt={product.name}
        width={size}
        height={size}
        className={`aspect-square w-full object-cover ${className}`}
      />
    );
  }

  const t = TILES[(product.id - 1) % TILES.length];
  // 상품명에서 핵심 단어만 뽑아 타일에 얹습니다 (예: "수제 약과 선물세트 12구" → "약과")
  const keyword = product.name.replace(/\s*\d+[구종]$/, "").split(" ").slice(-2).join(" ");

  return (
    <div
      className={`relative flex aspect-square w-full items-end overflow-hidden ${className}`}
      style={{ background: `linear-gradient(145deg, ${t.from}, ${t.to})` }}
      aria-label={product.name}
    >
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center leading-tight font-bold"
        style={{ color: t.ink, fontSize: Math.max(11, size * 0.13) }}
      >
        {keyword}
      </span>
    </div>
  );
}
