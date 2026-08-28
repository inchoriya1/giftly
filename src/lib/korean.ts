/**
 * 한국어 조사 처리.
 *
 * "유튜브으로", "카카오을" 같은 문장이 대시보드에 뜨면
 * 그 순간 완성도가 무너집니다. 받침 유무로 갈라 씁니다.
 */

function hasFinalConsonant(word: string): boolean {
  const ch = word.trim().charCodeAt(word.trim().length - 1);
  if (Number.isNaN(ch)) return false;
  if (ch < 0xac00 || ch > 0xd7a3) return false; // 한글 음절이 아니면 없음으로 처리
  return (ch - 0xac00) % 28 !== 0;
}

/** 로 / 으로 — 'ㄹ' 받침은 '로'를 씁니다 (예: 서울로) */
export function ro(word: string): string {
  const trimmed = word.trim();
  const ch = trimmed.charCodeAt(trimmed.length - 1);
  const isHangul = ch >= 0xac00 && ch <= 0xd7a3;
  const jong = isHangul ? (ch - 0xac00) % 28 : 0;
  return `${word}${!isHangul || jong === 0 || jong === 8 ? "로" : "으로"}`;
}

/** 을 / 를 */
export function eul(word: string): string {
  return `${word}${hasFinalConsonant(word) ? "을" : "를"}`;
}

/** 이 / 가 */
export function i(word: string): string {
  return `${word}${hasFinalConsonant(word) ? "이" : "가"}`;
}

/** 은 / 는 */
export function eun(word: string): string {
  return `${word}${hasFinalConsonant(word) ? "은" : "는"}`;
}

/** 과 / 와 */
export function gwa(word: string): string {
  return `${word}${hasFinalConsonant(word) ? "과" : "와"}`;
}
