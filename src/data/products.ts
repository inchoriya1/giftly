import type { Product } from "@/lib/types";

/**
 * 팀이 고칠 곳 ①
 * 브랜드 확정 후 상품 8종을 실제 데이터로 교체하세요.
 * image 는 /public 아래 경로 (예: "/products/01.jpg")
 * storeUrl 은 스마트스토어 상품 URL
 */
export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "수제 약과 선물세트 12구",
    price: 32000,
    image: "",
    taste: ["전통", "달콤"],
    relation: ["거래처", "부모님"],
    budget: ["3", "5"],
    why: "격식 있는 자리에 무난합니다",
    storeUrl: "",
  },
  {
    id: 2,
    name: "모약과 리본 패키지 6구",
    price: 18000,
    image: "",
    taste: ["전통", "달콤"],
    relation: ["동료", "친구"],
    budget: ["1", "3"],
    why: "부담 없는 가격대의 인기 구성",
    storeUrl: "",
  },
  {
    id: 3,
    name: "한과 종합 선물세트",
    price: 48000,
    image: "",
    taste: ["전통"],
    relation: ["거래처", "부모님"],
    budget: ["5"],
    why: "어른께 드리기 좋은 정식 구성",
    storeUrl: "",
  },
  {
    id: 4,
    name: "구움과자 8종 박스",
    price: 26000,
    image: "",
    taste: ["달콤", "모던"],
    relation: ["동료", "친구"],
    budget: ["1", "3"],
    why: "호불호가 적어 실패 확률이 낮습니다",
    storeUrl: "",
  },
  {
    id: 5,
    name: "티푸드 & 차 세트",
    price: 38000,
    image: "",
    taste: ["모던", "담백"],
    relation: ["부모님", "친구"],
    budget: ["3", "5"],
    why: "차를 즐기는 분께 잘 맞습니다",
    storeUrl: "",
  },
  {
    id: 6,
    name: "저당 견과 정과 세트",
    price: 29000,
    image: "",
    taste: ["담백"],
    relation: ["부모님", "거래처"],
    budget: ["1", "3"],
    why: "단맛이 부담스러운 분께",
    storeUrl: "",
  },
  {
    id: 7,
    name: "수제청 2종 세트",
    price: 22000,
    image: "",
    taste: ["모던", "담백"],
    relation: ["동료", "친구"],
    budget: ["1", "3"],
    why: "오래 두고 쓸 수 있습니다",
    storeUrl: "",
  },
  {
    id: 8,
    name: "프리미엄 혼합 기프트",
    price: 65000,
    image: "",
    taste: ["전통", "모던"],
    relation: ["거래처"],
    budget: ["5"],
    why: "중요한 자리를 위한 최상위 구성",
    storeUrl: "",
  },
];

export const BRAND_NAME = "브랜드명";
