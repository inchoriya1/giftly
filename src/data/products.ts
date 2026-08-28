import type { Product } from "@/lib/types";

/**
 * 샘플 광고 랜딩에 쓰는 가상 상품입니다.
 *
 * 이 페이지의 목적은 상품을 파는 게 아니라
 * 대시보드가 읽는 이벤트를 실제로 발생시키는 것입니다.
 * 특정 업종에 치우치지 않도록 중립적인 생활용품으로 구성했습니다.
 */
export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "데일리 텀블러 500ml",
    price: 24900,
    listPrice: 35000,
    image: "",
    tagline: "6시간 보온, 새지 않는 잠금 뚜껑",
    features: ["스테인리스 이중벽", "식기세척기 사용 가능", "무게 280g"],
    rating: 4.7,
    reviewCount: 1284,
  },
  {
    id: 2,
    name: "코튼 오버셔츠",
    price: 39900,
    listPrice: 59000,
    image: "",
    tagline: "사계절 겹쳐 입는 기본 셔츠",
    features: ["면 100%", "남녀공용 4사이즈", "3색"],
    rating: 4.5,
    reviewCount: 892,
  },
  {
    id: 3,
    name: "원목 데스크 정리함",
    price: 32000,
    listPrice: 42000,
    image: "",
    tagline: "책상 위를 한 번에 정리",
    features: ["3단 구조", "조립 5분", "천연 오일 마감"],
    rating: 4.8,
    reviewCount: 447,
  },
  {
    id: 4,
    name: "수분 진정 앰플 50ml",
    price: 28000,
    listPrice: 38000,
    image: "",
    tagline: "건조한 날 하나면 충분",
    features: ["무향·무색소", "민감성 테스트 완료", "펌프형 용기"],
    rating: 4.6,
    reviewCount: 2013,
  },
  {
    id: 5,
    name: "휴대용 무선 충전기",
    price: 34900,
    listPrice: 49000,
    image: "",
    tagline: "케이블 없이 올려두면 끝",
    features: ["15W 고속 충전", "10,000mAh", "기내 반입 가능"],
    rating: 4.4,
    reviewCount: 1567,
  },
  {
    id: 6,
    name: "논슬립 요가매트",
    price: 42000,
    listPrice: 58000,
    image: "",
    tagline: "땀에 젖어도 미끄러지지 않는",
    features: ["두께 6mm", "TPE 소재", "전용 스트랩 포함"],
    rating: 4.9,
    reviewCount: 723,
  },
];

export const BRAND_NAME = "샘플 스토어";

export function findProduct(id: number) {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
}
