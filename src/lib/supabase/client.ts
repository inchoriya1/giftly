import { createClient } from "@supabase/supabase-js";

/**
 * 브라우저용 익명 클라이언트.
 *
 * 이 키는 브라우저에 그대로 노출됩니다. 그래도 안전한 이유는
 * Supabase 쪽에서 RLS 로 insert 만 허용하기 때문입니다.
 * select 를 열어두면 수집한 이메일이 브라우저에서 그대로 조회됩니다.
 * → supabase/schema.sql 참고
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

/** 환경변수가 없어도 앱은 그대로 동작해야 합니다 (수집만 건너뜀). */
export const isSupabaseReady = Boolean(supabase);
