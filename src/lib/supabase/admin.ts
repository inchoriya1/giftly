import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * 서버 전용 클라이언트. RLS 를 우회하므로 절대 브라우저로 나가면 안 됩니다.
 *
 * ⚠️ SUPABASE_SERVICE_ROLE_KEY 에는 NEXT_PUBLIC_ 을 절대 붙이지 마세요.
 *    붙이는 순간 이 키가 번들에 포함되어 전체 DB가 공개됩니다.
 *
 * "server-only" import 는 이 파일이 실수로 클라이언트 컴포넌트에
 * import 되면 빌드를 실패시킵니다.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase 관리자 환경변수가 없습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 넣으세요.",
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
