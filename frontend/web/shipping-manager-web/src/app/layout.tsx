import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BICAP - Quản lý vận chuyển',
  description: 'Hệ thống quản lý vận chuyển BICAP',
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
