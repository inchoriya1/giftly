import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "GIFTLY — 90초 기프트 큐레이터",
  description:
    "받는 분과의 관계, 예산, 취향만 알려주시면 딱 맞는 선물 3가지를 골라드립니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
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
        <div className="app-frame">{children}</div>
      </body>
    </html>
  );
}
