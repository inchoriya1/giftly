-- GIFTLY 스키마
-- Supabase 대시보드 > SQL Editor 에 그대로 붙여넣고 실행하세요.

create table if not exists quiz_responses (
  id          bigint primary key generated always as identity,
  session_id  uuid        not null,
  variant     text        not null check (variant in ('A','B')),
  relation    text,
  budget      text,
  taste       text,
  occasion    text,
  recommended jsonb,
  completed   boolean     default false,
  created_at  timestamptz default now()
);

create table if not exists leads (
  id         bigint primary key generated always as identity,
  session_id uuid        not null,
  email      text        not null,
  variant    text        not null check (variant in ('A','B')),
  created_at timestamptz default now()
);

create index if not exists quiz_responses_created_idx on quiz_responses (created_at);
create index if not exists quiz_responses_variant_idx on quiz_responses (variant);

-- ────────────────────────────────────────────────────────────
-- RLS — 익명 키에 insert 만 허용합니다.
--
-- ⚠️ select 를 열면 수집한 이메일이 브라우저에서 그대로 조회됩니다.
--    어드민 조회는 서버에서 service role 키로만 합니다.
-- ────────────────────────────────────────────────────────────

alter table quiz_responses enable row level security;
alter table leads          enable row level security;

drop policy if exists "anon insert quiz" on quiz_responses;
create policy "anon insert quiz" on quiz_responses
  for insert to anon with check (true);

drop policy if exists "anon insert lead" on leads;
create policy "anon insert lead" on leads
  for insert to anon with check (true);

-- select / update / delete 정책은 만들지 않습니다.
-- 정책이 없으면 RLS 가 기본 거부합니다.


-- ────────────────────────────────────────────────────────────
-- 분석 쿼리 (측정 설계서 8장)
-- ────────────────────────────────────────────────────────────

-- ① A/B별 완주율
-- select variant,
--        count(*)                          as 시작,
--        count(*) filter (where completed) as 완주,
--        round(100.0 * count(*) filter (where completed) / count(*), 1) as 완주율
-- from quiz_responses group by variant;

-- ② 문항별 이탈 지점
-- select variant,
--        count(*) filter (where relation is not null) as "1문항",
--        count(*) filter (where budget   is not null) as "2문항",
--        count(*) filter (where taste    is not null) as "3문항",
--        count(*) filter (where occasion is not null) as "4문항"
-- from quiz_responses group by variant;

-- ③ 취향 분포 — V2.0 소재 교체 근거
-- select taste, budget, count(*) as n
-- from quiz_responses where completed
-- group by taste, budget order by n desc;

-- ⑤ 일자별 추이 — 매일 아침 고장 감지용. 0이면 계측이 죽은 것
-- select date(created_at) as 일자, variant, count(*) as 세션
-- from quiz_responses group by 1,2 order by 1 desc limit 14;
