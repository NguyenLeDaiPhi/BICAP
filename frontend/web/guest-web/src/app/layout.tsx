import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BICAP - Truy xuất nguồn gốc nông sản',
  description: 'Tích hợp Blockchain trong sản xuất nông sản sạch - Truy xuất nguồn gốc',
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
