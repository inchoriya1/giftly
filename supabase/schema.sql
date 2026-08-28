-- 샘플 광고 랜딩 이벤트 수집 스키마
-- Supabase 대시보드 > SQL Editor 에 그대로 붙여넣고 실행하세요.

create table if not exists sessions (
  id         bigint primary key generated always as identity,
  session_id uuid        not null,
  variant    text        not null check (variant in ('A','B')),
  product_id int,
  amount     int,
  purchased  boolean     default false,
  created_at timestamptz default now()
);

create index if not exists sessions_created_idx on sessions (created_at);
create index if not exists sessions_variant_idx on sessions (variant);

-- ────────────────────────────────────────────────────────────
-- RLS — 익명 키에 insert 만 허용합니다.
--
-- ⚠️ select 를 열면 수집 데이터가 브라우저에서 그대로 조회됩니다.
--    어드민 조회는 서버에서 service role 키로만 합니다.
-- ────────────────────────────────────────────────────────────

alter table sessions enable row level security;

drop policy if exists "anon insert session" on sessions;
create policy "anon insert session" on sessions
  for insert to anon with check (true);

-- select / update / delete 정책은 만들지 않습니다.
-- 정책이 없으면 RLS 가 기본 거부합니다.


-- ────────────────────────────────────────────────────────────
-- 분석 쿼리
-- ────────────────────────────────────────────────────────────

-- ① A/B별 구매 전환율 — 분모는 진입 세션 전체
-- select variant,
--        count(*)                          as 세션,
--        count(*) filter (where purchased) as 구매,
--        round(100.0 * count(*) filter (where purchased) / count(*), 2) as 전환율
-- from sessions group by variant;

-- ② 상품별 구매
-- select product_id, count(*) as 구매, sum(amount) as 매출
-- from sessions where purchased
-- group by product_id order by 구매 desc;

-- ③ 일자별 추이 — 매일 아침 고장 감지용. 0이면 계측이 죽은 것
-- select date(created_at) as 일자, variant, count(*) as 세션
-- from sessions group by 1,2 order by 1 desc limit 14;
