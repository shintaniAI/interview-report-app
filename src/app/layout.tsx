import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "入社後面談レポート作成",
  description: "面談内容からレポートを自動生成するツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
