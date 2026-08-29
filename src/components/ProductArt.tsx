import Image from "next/image";
import type { Category, Product } from "@/lib/types";

/* ────────────────────────────────────────────────────────────
   상품 일러스트

   실제 사진이 없으므로 벡터로 그립니다.
   모양은 카테고리로, 색은 상품 id로 정합니다 —
   같은 카테고리라도 다른 상품임이 보입니다.

   product.image 를 채우면 사진이 그대로 우선합니다.
   ──────────────────────────────────────────────────────────── */

type Palette = { bg: [string, string]; body: string; dark: string; accent: string };

/* 스튜디오 컷처럼 배경은 모두 같은 회색. 상품만 id로 구분합니다. */
const STUDIO = "#f4f4f4";
const PALETTES: Palette[] = [
  { bg: [STUDIO, STUDIO], body: "#3d4a52", dark: "#2a3338", accent: "#c5d0d4" },
  { bg: [STUDIO, STUDIO], body: "#6a4540", dark: "#4a2f2c", accent: "#d4c4c0" },
  { bg: [STUDIO, STUDIO], body: "#6e5638", dark: "#4d3c26", accent: "#d2c6b4" },
  { bg: [STUDIO, STUDIO], body: "#4a4452", dark: "#322e38", accent: "#c9c4ce" },
  { bg: [STUDIO, STUDIO], body: "#2f3d44", dark: "#1e282c", accent: "#b7c4c8" },
  { bg: [STUDIO, STUDIO], body: "#4a5c48", dark: "#334032", accent: "#c4d0c0" },
  { bg: [STUDIO, STUDIO], body: "#5a4e42", dark: "#3d342c", accent: "#d0c8bc" },
  { bg: [STUDIO, STUDIO], body: "#3a4658", dark: "#262e3a", accent: "#b8c2d0" },
];

function Shape({ c, p }: { c: Category; p: Palette }) {
  switch (c) {
    /* 주방 — 텀블러 */
    case "주방":
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

    /* 의류 — 셔츠 */
    case "의류":
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

    /* 수납 — 정리함 */
    case "수납":
      return (
        <>
          <rect
            x="38"
            y="24"
            width="4"
            height="22"
            rx="2"
            fill={p.dark}
            transform="rotate(-9 40 35)"
          />
          <rect x="45" y="20" width="4" height="26" rx="2" fill={p.accent} />
          <rect
            x="52"
            y="26"
            width="4"
            height="20"
            rx="2"
            fill={p.dark}
            transform="rotate(7 54 36)"
          />
          <rect x="20" y="44" width="60" height="34" rx="4" fill={p.body} />
          <rect x="20" y="44" width="60" height="7" fill={p.dark} opacity=".35" />
          <path d="M40 51v27M60 51v27" stroke={p.dark} strokeWidth="1.8" />
          <rect x="24" y="56" width="12" height="18" rx="1.6" fill={p.accent} opacity=".45" />
        </>
      );

    /* 뷰티 — 앰플 */
    case "뷰티":
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

    /* 디지털 — 충전기 + 기기 */
    case "디지털":
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

    /* 운동 — 말린 매트 */
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
  view = 0,
  className = "",
}: {
  product: Product;
  size: number;
  /** 상세 갤러리용 — 0 정면, 1 확대, 2 밝은 배경 */
  view?: number;
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
  const gid = `pa${product.id}-${view}`;
  const scale = view === 1 ? 1.42 : 1;
  const bg: [string, string] = view === 2 ? ["#fafafa", "#f4f4f4"] : p.bg;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`aspect-square w-full ${className}`}
      role="img"
      aria-label={product.name}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bg[0]} />
          <stop offset="100%" stopColor={bg[1]} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      <g transform={`translate(50 52) scale(${scale}) translate(-50 -52)`}>
        <ellipse cx="50" cy="86" rx="26" ry="4" fill="#000" opacity=".07" />
        <Shape c={product.category} p={p} />
      </g>
    </svg>
  );
}
