import Image from "next/image";
import type { Product } from "@/lib/types";

/* ────────────────────────────────────────────────────────────
   상품 일러스트

   실제 상품 사진이 없으므로 벡터로 그립니다.
   회색 자리표시자는 "미완성"으로 보이지만, 물건 모양이 보이면
   의도된 디자인으로 읽힙니다.

   product.image 를 채우면 사진이 그대로 우선합니다.
   ──────────────────────────────────────────────────────────── */

type Palette = { bg: [string, string]; body: string; dark: string; accent: string };

const PALETTES: Palette[] = [
  { bg: ["#F2E7D7", "#E0CBAE"], body: "#4F6B78", dark: "#38505B", accent: "#C9DDE6" },
  { bg: ["#EFE1DF", "#DCBDB7"], body: "#7E5049", dark: "#5E3833", accent: "#F0DCD6" },
  { bg: ["#E8E9DE", "#C9CDB6"], body: "#8A6A44", dark: "#654C2F", accent: "#E5D4B8" },
  { bg: ["#EBE4ED", "#CCC0D4"], body: "#6E5F7B", dark: "#4E4159", accent: "#DCCFE4" },
  { bg: ["#E3E9EA", "#C1CFD2"], body: "#39505A", dark: "#26383F", accent: "#8FC7D4" },
  { bg: ["#F1E8D3", "#DDCCA0", ], body: "#5E7A5A", dark: "#41573E", accent: "#CFE0C4" },
];

function Art({ id, p }: { id: number; p: Palette }) {
  switch (id) {
    /* 1 · 텀블러 */
    case 1:
      return (
        <>
          <rect x="36" y="15" width="28" height="10" rx="3.4" fill={p.dark} />
          <path
            d="M38 25h24l-2.6 54a4 4 0 0 1-4 3.6h-10.8a4 4 0 0 1-4-3.6z"
            fill={p.body}
          />
          <path d="M41 30h6l-2 46h-2.6z" fill={p.accent} opacity=".35" />
          <rect x="38.4" y="48" width="23.2" height="6" fill={p.dark} opacity=".55" />
          <rect x="45" y="11" width="10" height="5" rx="2.2" fill={p.dark} opacity=".7" />
        </>
      );

    /* 2 · 오버셔츠 */
    case 2:
      return (
        <>
          <path
            d="M38 22 26 28l-4 16 9 3 1-6v41h36V41l1 6 9-3-4-16-12-6-8 6z"
            fill={p.body}
          />
          <path d="M38 22h6l6 6-8 6-4-9z" fill={p.accent} opacity=".5" />
          <path d="M62 22h-6l-6 6 8 6 4-9z" fill={p.accent} opacity=".5" />
          <path d="M50 34v48" stroke={p.dark} strokeWidth="1.6" />
          <circle cx="50" cy="46" r="1.7" fill={p.accent} />
          <circle cx="50" cy="58" r="1.7" fill={p.accent} />
          <circle cx="50" cy="70" r="1.7" fill={p.accent} />
        </>
      );

    /* 3 · 데스크 정리함 */
    case 3:
      return (
        <>
          <rect x="38" y="24" width="4" height="22" rx="2" fill={p.dark} transform="rotate(-9 40 35)" />
          <rect x="45" y="20" width="4" height="26" rx="2" fill={p.accent} />
          <rect x="52" y="26" width="4" height="20" rx="2" fill={p.dark} transform="rotate(7 54 36)" />
          <rect x="20" y="44" width="60" height="34" rx="4" fill={p.body} />
          <rect x="20" y="44" width="60" height="7" fill={p.dark} opacity=".35" />
          <path d="M40 51v27M60 51v27" stroke={p.dark} strokeWidth="1.8" />
          <rect x="24" y="56" width="12" height="18" rx="1.6" fill={p.accent} opacity=".45" />
        </>
      );

    /* 4 · 앰플 */
    case 4:
      return (
        <>
          <rect x="42" y="14" width="16" height="17" rx="3.2" fill={p.dark} />
          <rect x="45.5" y="30" width="9" height="8" fill={p.body} opacity=".8" />
          <rect x="36" y="37" width="28" height="46" rx="6" fill={p.body} />
          <rect x="36" y="55" width="28" height="28" rx="6" fill={p.accent} opacity=".5" />
          <rect x="40" y="43" width="5" height="34" rx="2.5" fill="#fff" opacity=".28" />
          <path d="M36 55h28" stroke={p.dark} strokeWidth="1.4" opacity=".5" />
        </>
      );

    /* 5 · 무선 충전기 */
    case 5:
      return (
        <>
          <rect x="37" y="16" width="26" height="46" rx="4.4" fill={p.dark} />
          <rect x="40" y="20" width="20" height="36" rx="2.4" fill={p.accent} opacity=".55" />
          <path d="M51 26l-6 10h5l-1.5 8 6.5-10.5h-5z" fill={p.body} />
          <ellipse cx="50" cy="72" rx="27" ry="9" fill={p.body} />
          <ellipse cx="50" cy="69.5" rx="27" ry="9" fill={p.dark} />
          <ellipse cx="50" cy="69.5" rx="14" ry="4.6" fill={p.accent} opacity=".4" />
        </>
      );

    /* 6 · 요가매트 */
    default:
      return (
        <>
          <rect x="34" y="32" width="42" height="36" rx="3" fill={p.body} />
          <ellipse cx="34" cy="50" rx="10" ry="18" fill={p.dark} />
          <ellipse cx="34" cy="50" rx="5.6" ry="10" fill={p.accent} opacity=".55" />
          <ellipse cx="34" cy="50" rx="2" ry="3.6" fill={p.dark} />
          <path
            d="M46 30v40M62 30v40"
            stroke={p.dark}
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity=".55"
          />
          <rect x="70" y="30" width="6" height="40" rx="2" fill={p.dark} opacity=".4" />
        </>
      );
  }
}

export function ProductArt({
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

  const p = PALETTES[(product.id - 1) % PALETTES.length];
  const gid = `g${product.id}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`aspect-square w-full ${className}`}
      role="img"
      aria-label={product.name}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.bg[0]} />
          <stop offset="100%" stopColor={p.bg[1]} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      <ellipse cx="50" cy="86" rx="26" ry="4" fill="#000" opacity=".07" />
      <Art id={product.id} p={p} />
    </svg>
  );
}
