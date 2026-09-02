import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BICAP - Quản lý trang trại',
  description: 'Hệ thống quản lý trang trại BICAP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
