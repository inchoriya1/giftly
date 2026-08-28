# GIFTLY

AI 기프트 큐레이터 — 퀴즈 4문항으로 선물 3종을 추천하고 개인화 메시지 카드를 만듭니다.
청년 K-뉴딜 아카데미 Adobe AI 콘텐츠 마케팅 과정 캡스톤.

## 스택

| | |
|---|---|
| 프레임워크 | Next.js 16 (App Router) · React 19 |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS 4 |
| DB | Supabase (Postgres) |
| 검증 | zod — API 입력 검증 |
| 분석 | GA4 |
| LLM | Claude Haiku (메시지 카드 전용) |
| 배포 | Vercel |

## 5분 안에 실행하기

```bash
npm install
cp .env.example .env.local     # 값은 비어 있어도 실행됩니다
npm run dev                    # http://localhost:3000
```

**환경변수가 하나도 없어도 앱은 돌아갑니다.** Supabase가 없으면 수집만 건너뛰고,
Claude 키가 없으면 사전 작성 문구가 나갑니다. 화면 확인이 목적이면 그대로 두세요.

## 화면

| 경로 | 내용 |
|---|---|
| `/` | 랜딩 — **A/B 자동 분기** (A: 상품 나열 / B: 퀴즈 유도) |
| `/quiz` | 4문항 취향 진단 |
| `/result` | 추천 3종 + 메시지 카드 + 공유 + 리드 수집 |
| `/admin` | A/B 완주율, 취향 분포, 리드 수 (서버 전용 조회) |

A/B를 강제로 바꾸려면 브라우저 콘솔에서:

```js
localStorage.setItem('giftly_variant', 'B'); location.reload();
```

## 팀이 고칠 곳은 세 군데뿐입니다

1. **`src/data/products.ts`** — 상품 8종, 이미지 경로, 스마트스토어 URL, `BRAND_NAME`
2. **`public/products/`** — 상품 이미지 (`/products/01.jpg` 형태로 참조)
3. **`src/data/fallback-messages.ts`** — 상황별 메시지 문구 12종

## Supabase 연결

1. supabase.com에서 프로젝트 생성
2. **SQL Editor**에 `supabase/schema.sql` 전체를 붙여넣고 실행
3. **Settings > API**에서 URL과 키 두 개를 복사해 `.env.local`에 입력

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY`에는 **절대 `NEXT_PUBLIC_`을 붙이지 마세요.**
> 붙이는 순간 이 키가 브라우저 번들에 들어가 DB 전체가 공개됩니다.

RLS는 익명 키에 **insert만** 허용합니다. `select`를 열면 수집한 이메일이
브라우저에서 그대로 조회됩니다.

## GA4 연결

`.env.local`에 `NEXT_PUBLIC_GA_ID=G-XXXXXXX`를 넣습니다.

**⚠️ 그다음이 더 중요합니다.** GA4 `관리 > 데이터 표시 > 맞춤 정의`에서
아래를 **이벤트 범위**로 등록하세요. **등록 이전 데이터는 소급 적용되지 않습니다.**

`variant` · `session_id` · `step` · `is_fallback` · `product_id`

발송하는 이벤트 8종:

```
page_view → quiz_start → quiz_step(×4) → quiz_complete
                                          ├ card_generate (is_fallback)
                                          ├ share_click
                                          ├ lead_submit
                                          └ purchase_click  ← 주 전환 지표
```

개발 모드에서는 콘솔에 `[track]`으로 전부 찍힙니다.

## 배포 (Vercel)

```bash
npx vercel
```

또는 GitHub에 push한 뒤 vercel.com에서 리포지토리를 연결합니다.
**환경변수는 Vercel 대시보드에 별도로 등록해야 합니다** — `.env.local`은 올라가지 않습니다.

## 설계에서 일부러 뺀 것

회원가입 · 장바구니 · 자체 결제 · 데스크톱 레이아웃 · 다국어.
8주 안에 배포까지 가려면 넣지 않는 게 넣는 것보다 중요했습니다.
구매는 스마트스토어 외부 링크로 넘깁니다.

## 알아둘 두 가지

**추천에는 LLM을 쓰지 않습니다.** `src/lib/recommend.ts`의 규칙 기반 점수 계산입니다
(취향 3점 · 관계 2점 · 예산 2점, 상위 3개). 매번 LLM을 부르면 비용이 들고, 느리고,
광고 트래픽이 몰리면 터집니다. LLM은 메시지 카드 한 곳에만 쓰고 **3초 타임아웃 + 폴백**이
걸려 있습니다.

**A/B 배정은 `useEffect` 안에서만 합니다.** 서버 렌더링 중에 `localStorage`를 읽으면
hydration이 깨지면서 배정이 뒤섞여 실험 데이터가 오염됩니다. 확정 전에는 스켈레톤을
보여줍니다.
