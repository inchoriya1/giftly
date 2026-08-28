/** 광고 랜딩·퀴즈·결과는 모바일 프레임 안에서 렌더합니다. */
export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="app-frame">{children}</div>;
}
