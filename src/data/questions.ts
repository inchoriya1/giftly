import type { Answers } from "@/lib/types";

export type Question = {
  key: keyof Answers;
  title: string;
  options: { value: string; label: string; hint?: string }[];
};

export const QUESTIONS: Question[] = [
  {
    key: "relation",
    title: "누구에게 선물하시나요?",
    options: [
      { value: "거래처", label: "거래처 · 고객사", hint: "격식이 필요한 자리" },
      { value: "부모님", label: "부모님 · 어른", hint: "정성이 보이는 구성" },
      { value: "동료", label: "직장 동료", hint: "부담 없는 가격대" },
      { value: "친구", label: "친구 · 지인", hint: "취향을 타는 선택" },
    ],
  },
  {
    key: "budget",
    title: "예산은 어느 정도인가요?",
    options: [
      { value: "1", label: "2만원 이하", hint: "가볍게" },
      { value: "3", label: "2 ~ 4만원", hint: "가장 많이 고르는 구간" },
      { value: "5", label: "4만원 이상", hint: "각별한 분께" },
    ],
  },
  {
    key: "taste",
    title: "받는 분의 취향에 가까운 건?",
    options: [
      { value: "전통", label: "전통적인 것을 좋아함", hint: "한과 · 약과" },
      { value: "모던", label: "세련된 걸 좋아함", hint: "구움과자 · 티푸드" },
      { value: "달콤", label: "단 걸 좋아함", hint: "디저트류" },
      { value: "담백", label: "단 걸 부담스러워함", hint: "저당 · 견과" },
    ],
  },
  {
    key: "occasion",
    title: "어떤 상황인가요?",
    options: [
      { value: "연말", label: "연말 인사" },
      { value: "감사", label: "감사 표현" },
      { value: "기념", label: "기념일 · 축하" },
    ],
  },
];
