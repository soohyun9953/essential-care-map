import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '국립중앙의료원 필수의료 취약지 진단 및 사업계획서 자동생성 플랫폼',
  description: '응급·분만·소아 3대 필수의료 취약지 지표 진단, 전국 시·군·구 GIS 행정구역 지도 시각화 및 공문서 개조식 사업계획서 자동 생성 시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
