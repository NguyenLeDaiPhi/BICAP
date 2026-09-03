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
  certification: 'VietGAP' | 'GlobalGAP' | 'Organic';
  image: string;
  minOrder: number;
  expectedHarvest: string;
  availableQuantity: number;
  category: string;
}

export default function MarketplacePage() {
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'Lúa Thơm Thượng Hạng ST25 Hữu Cơ',
      farmName: 'Hợp Tác Xã Nông Sản Sạch Sóc Trăng',
      price: 18500,
      unit: 'kg',
      origin: 'Sóc Trăng (Vùng lúa tôm sinh thái)',
      certification: 'GlobalGAP',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      minOrder: 500,
      expectedHarvest: 'Đang sẵn sàng xuất kho',
      availableQuantity: 25000,
      category: 'RICE',
    },
    {
      id: 2,
      name: 'Xà Lách Romaine & Lô Lô Thủy Canh',
      farmName: 'Trang Trại Công Nghệ Cao An Phú',
      price: 22000,
      unit: 'kg',
      origin: 'Xuân Thọ, TP. Đà Lạt',
      certification: 'VietGAP',
      image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80',
      minOrder: 50,
      expectedHarvest: 'Thu hoạch hàng ngày lúc 5h sáng',
      availableQuantity: 3500,
      category: 'VEGETABLE',
    },
    {
      id: 3,
      name: 'Dâu Tây Giống New Zealand Cắt Cành',
      farmName: 'Trang Trại Dâu Sinh Thái Mai Khôi',
      price: 110000,
      unit: 'kg',
      origin: 'Phường 7, TP. Đà Lạt',
      certification: 'GlobalGAP',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
      minOrder: 20,
      expectedHarvest: 'Thu hoạch trong tuần tới',
      availableQuantity: 800,
      category: 'FRUIT',
    },
    {
      id: 4,
      name: 'Cà Chua Bi Hữu Cơ Giọt Lệ Đỏ',
      farmName: 'Hợp Tác Xã Nông Trại Xanh Đơn Dương',
      price: 32000,
      unit: 'kg',
      origin: 'Đơn Dương, Lâm Đồng',
      certification: 'Organic',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      minOrder: 100,
      expectedHarvest: 'Đang thu hoạch rộ',
      availableQuantity: 4200,
      category: 'VEGETABLE',
    },
    {
      id: 5,
      name: 'Bưởi Da Xanh Ruột Hồng Loại 1',
      farmName: 'Nông Hộ Bến Tre Xuất Khẩu',
      price: 45000,
      unit: 'kg',
      origin: 'Châu Thành, Bến Tre',
      certification: 'GlobalGAP',
      image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80',
      minOrder: 200,
      expectedHarvest: 'Có sẵn tại vườn',
      availableQuantity: 12000,
      category: 'FRUIT',
    },
    {
      id: 6,
      name: 'Nấm Đùi Gà Sinh Thái Nguyên Khay',
      farmName: 'Viện Công Nghệ Sinh Học Củ Chi',
      price: 65000,
      unit: 'kg',
      origin: 'Củ Chi, TP. Hồ Chí Minh',
      certification: 'Organic',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
      minOrder: 30,
      expectedHarvest: 'Xuất xưởng mỗi ngày',
      availableQuantity: 1500,
      category: 'LEGUME',
    },
  ]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesCategory = category === 'ALL' || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.farmName.toLowerCase().includes(search.toLowerCase()) ||
                          p.origin.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOrder = (product: Product) => {
    setCartCount(prev => prev + 1);
    setToastMessage(`Đã thêm lô "${product.name}" (${product.minOrder} ${product.unit}) vào đơn đặt hàng sỉ!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-bounce">
          <span className="text-xl">📋</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Sàn Giao Dịch */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center justify-center transition-colors font-bold">
                ←
              </Link>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>🌾 Sàn Giao Dịch Nông Sản B2B</span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    Dành Cho Siêu Thị & Nhà Bán Lẻ
                  </span>
                </h1>
                <p className="text-xs text-slate-500">Kết nối trực tiếp với 50+ Hợp tác xã VietGAP/GlobalGAP toàn quốc</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/orders" className="btn-secondary text-xs py-2">
                📋 Quản Lý Đơn Hàng
              </Link>
              <Link href="/orders" className="btn-primary text-xs py-2">
                🛒 Giỏ Hàng B2B ({cartCount})
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Khuyến Khích Đặt Cọc Sớm */}
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 rounded-3xl p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase">
              Chính Sách Ưu Đãi Nhà Bán Lẻ
            </span>
            <h2 className="text-2xl font-black mt-2">Đặt Cọc Mùa Vụ Trực Tuyến - Giữ Giá Sỉ Tốt Nhất</h2>
            <p className="text-xs sm:text-sm text-emerald-100">
              Ký kết hợp đồng số được xác thực bằng Smart Contract trên Blockchain VeChainThor. Bảo hiểm 100% sản lượng và chất lượng thu hoạch.
            </p>
          </div>
          <div className="flex items-center gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
              <span className="block text-2xl font-black text-amber-300">20%</span>
              <span className="text-[10px] text-emerald-100 uppercase">Tiền cọc tối thiểu</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
              <span className="block text-2xl font-black text-lime-300">0%</span>
              <span className="text-[10px] text-emerald-100 uppercase">Rủi ro trung gian</span>
            </div>
          </div>
        </div>

        {/* Thanh Tìm Kiếm & Lọc Nông Sản */}
        <div className="card p-4 mb-8 flex flex-col sm:flex-row gap-4 border border-emerald-100">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
            <input
              type="text"
              className="input pl-10 text-sm py-2.5"
              placeholder="Tìm kiếm theo tên nông sản, tên hợp tác xã, địa phương (Sóc Trăng, Đà Lạt, Bến Tre)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input sm:w-56 text-sm font-semibold cursor-pointer"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="ALL">Tất cả danh mục</option>
            <option value="RICE">🌾 Lúa gạo & Ngũ cốc</option>
            <option value="VEGETABLE">🥬 Rau củ quả sạch</option>
            <option value="FRUIT">🍎 Trái cây xuất khẩu</option>
            <option value="LEGUME">🍄 Nấm & Thảo mộc</option>
          </select>
        </div>

        {/* Grid Danh Sách Lô Hàng B2B */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card p-0 overflow-hidden flex flex-col justify-between group hover:border-emerald-300">
              
              {/* Hình ảnh & Tags */}
              <div className="relative h-52 w-full overflow-hidden bg-emerald-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.certification === 'VietGAP' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 shadow">
                      ✓ VietGAP
                    </span>
                  )}
                  {product.certification === 'GlobalGAP' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-900 shadow">
                      ✓ GlobalGAP
                    </span>
                  )}
                  {product.certification === 'Organic' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-lime-100 text-lime-900 shadow">
                      🌿 Organic
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  Sẵn có: {product.availableQuantity.toLocaleString()} {product.unit}
                </div>
              </div>

              {/* Nội dung chi tiết */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors leading-snug">
                    {product.name}
                  </h3>
                  
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <span className="text-emerald-700 font-bold">🏡 Trang trại:</span>
                      <span className="text-slate-800 font-semibold">{product.farmName}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-emerald-700 font-bold">📍 Xuất xứ:</span>
                      <span>{product.origin}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-emerald-700 font-bold">⏱️ Lịch thu hoạch:</span>
                      <span className="text-amber-700 font-medium">{product.expectedHarvest}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-emerald-700 font-bold">📦 Đơn tối thiểu (MOQ):</span>
                      <span className="text-slate-800 font-bold">{product.minOrder} {product.unit}</span>
                    </p>
                  </div>
                </div>

                {/* Khung Giá Sỉ */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Giá sỉ bao tiêu</span>
                    <span className="text-2xl font-black text-emerald-800">
                      {product.price.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/{product.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block">Đã kiểm định</span>
                    <span className="text-xs font-semibold text-slate-600">VAT & Giao lạnh</span>
                  </div>
                </div>

                {/* Các nút hành động */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleOrder(product)}
                    className="btn-primary flex-1 text-xs py-2.5 justify-center"
                  >
                    <span>📋 Đặt Cọc Lô Hàng</span>
                  </button>
                  <Link
                    href={`http://localhost:3010/trace`}
                    className="btn-secondary text-xs py-2.5 px-3 text-emerald-800"
                    title="Xem chuỗi khối"
                  >
                    <span>🔗 Gốc</span>
                  </Link>
                </div>

              </div>

            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="card text-center py-16 text-slate-500 border-dashed border-2 border-emerald-200">
            <span className="text-5xl mb-3 block">🌾</span>
            <p className="text-base font-bold text-slate-700">Không tìm thấy nông sản nào phù hợp với bộ lọc</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng thử tìm kiếm với tên loại nông sản khác</p>
          </div>
        )}
      </main>
    </div>
  );
}

