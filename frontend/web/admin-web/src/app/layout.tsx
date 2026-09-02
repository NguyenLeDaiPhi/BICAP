import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BICAP - Quản trị hệ thống',
  description: 'Hệ thống quản trị BICAP - Tích hợp Blockchain trong sản xuất nông sản sạch',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  );
}
