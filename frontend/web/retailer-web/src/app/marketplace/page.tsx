'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  farmName: string;
  price: number;
  unit: string;
  origin: string;
  certification: string;
}

export default function MarketplacePage() {
  const [products] = useState<Product[]>([
    { id: 1, name: 'Lúa ST25', farmName: 'Trang trại XYZ', price: 15000, unit: 'kg', origin: 'Sóc Trăng', certification: 'VietGAP' },
    { id: 2, name: 'Rau muống organic', farmName: 'Trang trại ABC', price: 25000, unit: 'kg', origin: 'Cần Thơ', certification: 'Organic' },
    { id: 3, name: 'Đậu xanh', farmName: 'Trang trại DEF', price: 35000, unit: 'kg', origin: 'An Giang', certification: 'VietGAP' },
    { id: 4, name: 'Lúa Jasmine', farmName: 'Trang trại GHI', price: 18000, unit: 'kg', origin: 'Kiên Giang', certification: 'GlobalGAP' },
    { id: 5, name: 'Cải xanh', farmName: 'Trang trại JKL', price: 20000, unit: 'kg', origin: 'Đồng Tháp', certification: 'VietGAP' },
    { id: 6, name: 'Ớt sạch', farmName: 'Trang trại MNO', price: 30000, unit: 'kg', origin: 'Bến Tre', certification: 'Organic' },
  ]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.farmName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                ← Quay lại
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Sàn giao dịch</h1>
            </div>
            <Link href="/cart" className="btn-primary">
              🛒 Giỏ hàng
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            className="input flex-1"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input w-48" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="ALL">Tất cả</option>
            <option value="RICE">Lúa gạo</option>
            <option value="VEGETABLE">Rau xanh</option>
            <option value="LEGUME">Đậu các loại</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow">
              <div className="bg-gray-100 h-40 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-5xl">🌾</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  ✅ {product.certification}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.farmName} • {product.origin}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{product.price.toLocaleString()}đ</p>
                  <p className="text-sm text-gray-500">/{product.unit}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="btn-primary flex-1">Thêm vào giỏ</button>
                <Link href={`/marketplace/${product.id}`} className="btn-secondary">
                  Chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </main>
    </div>
  );
}
