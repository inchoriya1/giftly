import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "마케팅 성과 대시보드",
  description:
    "채널·소재·타겟·랜딩 성과를 한 화면에서 보고, 다음에 무엇을 할지까지 제안합니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        {/*
          자동 page_view 를 끄고 랜딩에서 수동으로 보냅니다.
          기본 설정으로 두면 variant 가 정해지기 전에 page_view 가 나가서
          세션의 첫 이벤트에 variant 가 비고 A/B 분모가 깨집니다.
        */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
