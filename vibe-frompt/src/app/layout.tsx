import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "VIBE Frompt – AI Prompt Builder cho người Việt",
  description:
    "Công cụ tạo prompt AI thông minh hàng đầu Việt Nam. Viết lách, lập trình, tạo ảnh, phân tích dữ liệu – chỉ cần 3 bước.",
  keywords: ["AI prompt", "prompt builder", "ChatGPT", "Midjourney", "công cụ AI Việt Nam"],
  openGraph: {
    title: "VIBE Frompt – AI Hiểu Ý Bạn Chuẩn 100%",
    description: "Vibe Your Prompt – Tiết kiệm 70% thời gian viết prompt",
    type: "website",
  },
};

import GalaxyBackground from "@/components/GalaxyBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={outfit.variable} suppressHydrationWarning>
      <body className="font-outfit antialiased" suppressHydrationWarning>
        <GalaxyBackground />
        {children}
      </body>
    </html>
  );
}
