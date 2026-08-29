export type Variant = "A" | "B";

export type Category = "주방" | "의류" | "수납" | "뷰티" | "디지털" | "운동";

export const CATEGORIES: Category[] = [
  "주방",
  "의류",
  "수납",
  "뷰티",
  "디지털",
  "운동",
];

export type Product = {
  id: number;
  name: string;
  /** 셀렉트숍 카드의 브랜드 라인. 카테고리와 별개로 둡니다. */
  brand: string;
  category: Category;
  price: number;
  /** 원가 — 할인 표기용 (B안에서만 노출) */
  listPrice: number;
  image: string;
  tagline: string;
  features: string[];
  rating: number;
  reviewCount: number;
};

export type SortKey = "추천" | "가격" | "후기";
