export type IndustryId = "fashion" | "food" | "beauty" | "edu" | "living";

export type ChannelId = "meta" | "google" | "naver" | "kakao" | "youtube";

export type DailyRow = {
  date: string; // MM/DD
  channel: ChannelId;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
};

export type ChannelStat = {
  id: ChannelId;
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  ctr: number; // %
  cvr: number; // %
  cpc: number; // 원
  cpa: number; // 원
  roas: number; // %
  share: number; // 예산 비중 %
};

export type Segment = {
  age: string;
  gender: "여성" | "남성";
  clicks: number;
  conversions: number;
  cost: number;
  cvr: number;
  cpa: number;
};

export type FunnelStage = {
  key: string;
  label: string;
  value: number;
  dropFromPrev: number; // %
};

export type AbResult = {
  variant: "A" | "B";
  label: string;
  sessions: number;
  conversions: number;
  rate: number; // %
};

export type Creative = {
  id: string;
  name: string;
  type: "이미지" | "영상";
  ctrEarly: number;
  ctrLate: number;
  clicks: number;
  conversions: number;
};

export type Industry = {
  id: IndustryId;
  name: string;
  productLabel: string;
  daily: DailyRow[];
  channels: ChannelStat[];
  segments: Segment[];
  funnel: FunnelStage[];
  ab: { a: AbResult; b: AbResult; pValue: number; significant: boolean };
  creatives: Creative[];
  totals: {
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    revenue: number;
    ctr: number;
    cvr: number;
    cpa: number;
    roas: number;
  };
  /** 직전 동일 기간 대비 변화율 (%) */
  deltas: { clicks: number; conversions: number; cpa: number; roas: number };
};
