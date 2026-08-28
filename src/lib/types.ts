export type Variant = "A" | "B";

export type Relation = "거래처" | "부모님" | "동료" | "친구";
export type Budget = "1" | "3" | "5";
export type Taste = "전통" | "모던" | "달콤" | "담백";
export type Occasion = "연말" | "감사" | "기념";

export type Answers = {
  relation: Relation;
  budget: Budget;
  taste: Taste;
  occasion: Occasion;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  taste: Taste[];
  relation: Relation[];
  budget: Budget[];
  why: string;
  storeUrl: string;
};

export type Scored = Product & {
  score: number;
  matched: string[];
};
