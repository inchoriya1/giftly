export type Variant = "A" | "B";

export type Product = {
  id: number;
  name: string;
  price: number;
  /** 원가 — 할인 표기용 (B안에서만 노출) */
  listPrice: number;
  image: string;
  tagline: string;
  features: string[];
  rating: number;
  reviewCount: number;
};
