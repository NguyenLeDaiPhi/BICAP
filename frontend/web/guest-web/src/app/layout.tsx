import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BICAP - Nông Sản Sạch & Nguồn Gốc Blockchain',
  description: 'Tích hợp Blockchain trong sản xuất nông sản sạch - Khám phá nông sản tươi ngon, an toàn tuyệt đối',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 antialiased selection:bg-emerald-200 selection:text-emerald-900">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
