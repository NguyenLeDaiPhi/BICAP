'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productApi } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  origin: string;
  imageUrl: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getProducts();
        setProducts(response.data.data.slice(0, 8));
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">BICAP</h1>
              <p className="text-sm text-gray-600">Truy xuất nguồn gốc nông sản sạch</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/trace" className="btn-secondary">
                Truy xuất nguồn gốc
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Nông sản sạch - Nguồn gốc rõ ràng
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Với BICAP, bạn có thể truy xuất toàn bộ quá trình sản xuất nông sản
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/trace" className="bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Quét QR Code
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">Tính năng nổi bật</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🔗</div>
              <h4 className="font-bold mb-2">Blockchain</h4>
              <p className="text-gray-600">Dữ liệu được xác thực trên Blockchain</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📱</div>
              <h4 className="font-bold mb-2">QR Code</h4>
              <p className="text-gray-600">Quét mã QR để truy xuất nhanh chóng</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h4 className="font-bold mb-2">IoT</h4>
              <p className="text-gray-600">Theo dõi điều kiện môi trường thời gian thực</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">Sản phẩm nổi bật</h3>
            <Link href="/products" className="text-primary font-medium hover:underline">
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                  <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="bg-gray-100 h-40 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🌾</span>
                  </div>
                  <h4 className="font-bold mb-2">{product.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{product.origin}</p>
                  <p className="font-bold text-primary">{product.price?.toLocaleString()} VNĐ</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold text-lg mb-2">BICAP</p>
          <p className="text-sm text-gray-400">
            Tích hợp Blockchain trong sản xuất nông sản sạch
          </p>
          <p className="text-xs text-gray-500 mt-4">
            © 2026 BICAP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
