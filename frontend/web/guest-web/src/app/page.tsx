'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProductItem {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  origin: string;
  certification: 'VietGAP' | 'GlobalGAP' | 'Organic';
  image: string;
  rating: number;
  soldCount: number;
  harvestDate: string;
  blockchainCode: string;
  freshPercent: number;
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Danh mục sản phẩm nông sản sạch phong phú
  const categories = [
    { id: 'ALL', name: 'Tất Cả', icon: '🌿' },
    { id: 'VEGETABLE', name: 'Rau Thủy Canh', icon: '🥬' },
    { id: 'ROOT', name: 'Củ Quả Hữu Cơ', icon: '🥕' },
    { id: 'FRUIT', name: 'Trái Cây Đặc Sản', icon: '🍓' },
    { id: 'RICE', name: 'Gạo ST25 & Hạt', icon: '🌾' },
    { id: 'HERB', name: 'Nấm & Thảo Mộc', icon: '🍄' },
  ];

  // Mock data sản phẩm tươi ngon, hình ảnh chất lượng cao kích thích vị giác
  const featuredProducts: ProductItem[] = [
    {
      id: 1,
      name: 'Xà Lách Romaine Thủy Canh Đà Lạt',
      category: 'VEGETABLE',
      price: 32000,
      originalPrice: 40000,
      unit: 'Gói 500g',
      origin: 'Đà Lạt, Lâm Đồng',
      certification: 'VietGAP',
      image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      soldCount: 842,
      harvestDate: 'Hôm nay, 05:30 Sáng',
      blockchainCode: 'BICAP-DALAT-ROM-8821',
      freshPercent: 99,
    },
    {
      id: 2,
      name: 'Dâu Tây Giống New Zealand Mọng Nước',
      category: 'FRUIT',
      price: 145000,
      originalPrice: 175000,
      unit: 'Hộp 500g',
      origin: 'Trang Trại Mai Khôi, Đà Lạt',
      certification: 'GlobalGAP',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
      rating: 5.0,
      soldCount: 1240,
      harvestDate: 'Hôm nay, 06:00 Sáng',
      blockchainCode: 'BICAP-STRAW-NZ-9912',
      freshPercent: 98,
    },
    {
      id: 3,
      name: 'Cà Chua Bi Hữu Cơ Giọt Lệ Đỏ',
      category: 'ROOT',
      price: 45000,
      originalPrice: 55000,
      unit: 'Hộp 500g',
      origin: 'Nông Trại Xanh Đơn Dương',
      certification: 'Organic',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      soldCount: 650,
      harvestDate: 'Hôm qua, 16:00 Chiều',
      blockchainCode: 'BICAP-TOMATO-ORG-3129',
      freshPercent: 96,
    },
    {
      id: 4,
      name: 'Gạo Thơm Thượng Hạng ST25 Ông Cua',
      category: 'RICE',
      price: 195000,
      originalPrice: 220000,
      unit: 'Túi 5kg',
      origin: 'Sóc Trăng (Vùng lúa - tôm sạch)',
      certification: 'GlobalGAP',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      rating: 5.0,
      soldCount: 3100,
      harvestDate: 'Vụ Đông Xuân 2026',
      blockchainCode: 'BICAP-ST25-SOC-1004',
      freshPercent: 100,
    },
    {
      id: 5,
      name: 'Ớt Chuông Ngọt Đà Lạt 3 Màu Giòn Ngọt',
      category: 'ROOT',
      price: 38000,
      originalPrice: 48000,
      unit: 'Gói 500g',
      origin: 'Nhà Kính Lạc Dương',
      certification: 'VietGAP',
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
      rating: 4.7,
      soldCount: 420,
      harvestDate: 'Hôm nay, 06:15 Sáng',
      blockchainCode: 'BICAP-BELL-PEPPER-4401',
      freshPercent: 98,
    },
    {
      id: 6,
      name: 'Nấm Đùi Gà Sinh Thái Nguyên Cây',
      category: 'HERB',
      price: 42000,
      originalPrice: 50000,
      unit: 'Khay 350g',
      origin: 'Trang Trại Sinh Học Củ Chi',
      certification: 'Organic',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      soldCount: 512,
      harvestDate: 'Hôm nay, 05:00 Sáng',
      blockchainCode: 'BICAP-MUSH-CUCHI-5523',
      freshPercent: 97,
    },
    {
      id: 7,
      name: 'Bưởi Da Xanh Ruột Hồng Bến Tre',
      category: 'FRUIT',
      price: 68000,
      originalPrice: 85000,
      unit: 'Quả (1.2kg - 1.4kg)',
      origin: 'Châu Thành, Bến Tre',
      certification: 'GlobalGAP',
      image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      soldCount: 980,
      harvestDate: 'Hái trực tiếp tại vườn',
      blockchainCode: 'BICAP-POMELO-BEN-0199',
      freshPercent: 99,
    },
    {
      id: 8,
      name: 'Cải Bó Xôi (Chân Vịt) Hữu Cơ Giàu Sắt',
      category: 'VEGETABLE',
      price: 28000,
      originalPrice: 35000,
      unit: 'Bó 400g',
      origin: 'Đà Lạt, Lâm Đồng',
      certification: 'Organic',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      soldCount: 710,
      harvestDate: 'Hôm nay, 06:30 Sáng',
      blockchainCode: 'BICAP-SPINACH-DALAT-221',
      freshPercent: 100,
    },
  ];

  const handleAddToCart = (productName: string) => {
    setCartCount(prev => prev + 1);
    setToastMessage(`Đã thêm "${productName}" vào giỏ hàng thành công!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const filteredProducts = featuredProducts.filter(p => {
    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.origin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Toast thông báo đặt hàng tiện lợi */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-bounce">
          <span className="text-xl">🧺</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Floating Quick Cart */}
      {cartCount > 0 && (
        <Link
          href="/cart"
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-3 rounded-full shadow-xl shadow-green-600/40 hover:scale-105 transition-all flex items-center gap-2 border border-white/40"
        >
          <span className="text-xl">🛒</span>
          <span className="font-bold text-sm">Giỏ hàng ({cartCount})</span>
        </Link>
      )}

      {/* 1. HERO SECTION - Cảm giác xanh mát & sinh động */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Nền đồ họa lá cây nhẹ nhàng */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Cột trái: Thông điệp kích thích vị giác & niềm tin */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-semibold backdrop-blur-sm">
                <span className="animate-pulse text-emerald-400">●</span>
                <span>Thu hoạch sớm sáng nay • Giao lạnh giữ nguyên độ tươi</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                Nông Sản Xanh <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-lime-300">Thuần Khiết</span>, 
                Vị Ngon Tự Nhiên
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl font-normal leading-relaxed">
                Tận hưởng từng búp xà lách giòn ngọt, từng quả dâu mọng nước từ nông trại chuẩn VietGAP & GlobalGAP. Mỗi giỏ hàng đều được <strong>bảo chứng minh bạch 100% bằng Blockchain VeChainThor</strong>.
              </p>

              {/* Thanh tìm kiếm trực quan & hấp dẫn */}
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-xl mx-auto lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
                    <input
                      type="text"
                      placeholder="Tìm kiếm rau cải ngọt, dâu tây, gạo ST25, nấm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-400"
                    />
                  </div>
                  <Link
                    href="/products"
                    className="btn-buy-now whitespace-nowrap text-sm py-3 px-6 text-center"
                  >
                    Khám Phá Ngay
                  </Link>
                </div>
              </div>

              {/* Cam kết minh bạch */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-700/50 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-300">100%</p>
                  <p className="text-xs text-emerald-200/80">Không Hóa Chất</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-lime-300">50+</p>
                  <p className="text-xs text-emerald-200/80">Trang Trại Chuẩn</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-teal-300">VeChain</p>
                  <p className="text-xs text-emerald-200/80">Blockchain Bất Biến</p>
                </div>
              </div>
            </div>

            {/* Cột phải: Hình ảnh nông sản tươi đọng sương sống động */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Vòng hào quang xanh */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-lime-400 rounded-3xl blur-2xl opacity-40 transform -rotate-3 scale-95"></div>

                {/* Khung ảnh chính */}
                <div className="relative rounded-3xl overflow-hidden border-4 border-white/40 shadow-2xl bg-emerald-950">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
                    alt="Rau củ quả tươi ngon BICAP"
                    className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-vietgap">✓ VietGAP Certified</span>
                      <span className="badge-blockchain">⛓️ On-Chain Hash</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Rau Củ Tươi Trong Ngày</h3>
                    <p className="text-xs text-emerald-200">Giao tận bếp trong 2h tại nội thành</p>
                  </div>
                </div>

                {/* Floating Card minh họa IoT độ tươi */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3 animate-float">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl">
                    🌱
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Chỉ số tươi mới</p>
                    <p className="text-sm font-bold text-emerald-700">99.8% Tươi Sạch</p>
                    <p className="text-[10px] text-slate-400">Nhiệt độ bảo quản: 4°C - 8°C</p>
                  </div>
                </div>

                {/* Floating Card Blockchain */}
                <div className="absolute -top-4 -right-4 bg-emerald-900/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-emerald-600 text-white flex items-center gap-2 text-xs">
                  <span className="text-lg">🔒</span>
                  <div>
                    <p className="font-bold text-emerald-300">VeChainThor</p>
                    <p className="text-[10px] opacity-80">Mã hóa chống giả</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. KHU VỰC DANH MỤC NÔNG SẢN XANH MÁT */}
      <section className="py-12 bg-white border-b border-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Danh Mục <span className="text-emerald-700">Nông Sản Sạch</span> Tuyển Chọn
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Lựa chọn sản phẩm theo từng nhóm dinh dưỡng, được chăm sóc theo tiêu chuẩn hữu cơ sinh thái.
            </p>
          </div>

          <div className="flex items-center justify-start sm:justify-center gap-3 overflow-x-auto pb-4 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                      : 'bg-emerald-50/70 hover:bg-emerald-100 text-slate-700 border border-emerald-200/80 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FLASH DEAL HÔM NAY - KÍCH THÍCH MUA HÀNG */}
      <section className="py-12 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider">
                ⚡ Giờ Vàng Thu Hoạch
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">Ưu Đãi Nông Sản Tươi Trong Ngày - Giảm Tới 25%</h3>
              <p className="text-emerald-100 text-sm max-w-xl">
                Các lô rau thủy canh và trái cây vừa cắt cành lúc 5h sáng, đóng gói giữ nguyên vị giòn ngọt nguyên bản.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl text-center border border-white/20">
                <span className="block text-2xl font-black text-amber-300">03</span>
                <span className="text-[10px] uppercase text-emerald-200 font-semibold">Giờ</span>
              </div>
              <span className="text-2xl font-bold text-amber-300">:</span>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl text-center border border-white/20">
                <span className="block text-2xl font-black text-amber-300">45</span>
                <span className="text-[10px] uppercase text-emerald-200 font-semibold">Phút</span>
              </div>
              <span className="text-2xl font-bold text-amber-300">:</span>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl text-center border border-white/20">
                <span className="block text-2xl font-black text-amber-300">20</span>
                <span className="text-[10px] uppercase text-emerald-200 font-semibold">Giây</span>
              </div>
            </div>
          </div>

          {/* Grid Thẻ Nông Sản Bán Chạy & Kích Thích Vị Giác */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                <span>Rau Củ Tươi Ngon Hôm Nay</span>
                <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                  {filteredProducts.length} Sản Phẩm
                </span>
              </h3>
              <p className="text-sm text-slate-500 mt-1">Đảm bảo độ tươi và giữ nguyên hàm lượng vitamin</p>
            </div>
            <Link href="/products" className="text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1">
              Xem Tất Cả <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="card-product group"
              >
                {/* Hình ảnh & Badges */}
                <div className="relative h-52 w-full overflow-hidden bg-emerald-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  
                  {/* Badge Chứng Nhận */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.certification === 'VietGAP' && (
                      <span className="badge-vietgap shadow-sm">✓ VietGAP</span>
                    )}
                    {product.certification === 'GlobalGAP' && (
                      <span className="badge-globalgap shadow-sm">✓ GlobalGAP</span>
                    )}
                    {product.certification === 'Organic' && (
                      <span className="badge-organic shadow-sm">🌿 100% Organic</span>
                    )}
                  </div>

                  {/* Giảm giá nếu có */}
                  {product.originalPrice && (
                    <div className="absolute top-3 right-3 bg-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  )}

                  {/* Độ tươi mới */}
                  <div className="absolute bottom-3 left-3 bg-emerald-950/80 backdrop-blur-sm text-emerald-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{product.freshPercent}% Tươi ngon</span>
                  </div>
                </div>

                {/* Nội dung sản phẩm */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Xuất xứ & Đánh giá */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="truncate max-w-[150px]">📍 {product.origin}</span>
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        ★ {product.rating} <span className="text-slate-400 font-normal">({product.soldCount})</span>
                      </span>
                    </div>

                    {/* Tên sản phẩm */}
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h4>

                    {/* Giờ thu hoạch */}
                    <p className="text-xs text-emerald-700/80 font-medium mt-1">
                      🌱 Thu hoạch: {product.harvestDate}
                    </p>
                  </div>

                  {/* Giá tiền & Đơn vị */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-emerald-700">
                        {product.price.toLocaleString('vi-VN')} đ
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {product.originalPrice.toLocaleString('vi-VN')} đ
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium block">/{product.unit}</span>
                  </div>

                  {/* Nút hành động Mua Ngay & Xem Blockchain */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => handleAddToCart(product.name)}
                      className="w-full btn-buy-now text-xs py-2.5 justify-center"
                    >
                      <span>🧺 Thêm Vào Giỏ</span>
                    </button>
                    
                    <Link
                      href={`/trace?code=${product.blockchainCode}`}
                      className="w-full btn-secondary text-[11px] py-1.5 justify-center text-emerald-800"
                    >
                      <span>🔗 Xem Gốc Blockchain</span>
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TRỰC QUAN HÓA BLOCKCHAIN TRACEABILITY - TẠO NIỀM TIN TUYỆT ĐỐI */}
      <section className="py-16 bg-emerald-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-emerald-800/80 px-3.5 py-1.5 rounded-full border border-emerald-700">
              Công Nghệ Minh Bạch
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4">
              Hành Trình Nông Sản Từ Vườn Đến Bàn Ăn
            </h2>
            <p className="text-emerald-100/80 text-sm sm:text-base mt-3">
              Mỗi quả cà chua hay búp rau đều được ghi nhận tự động vào sổ cái VeChainThor, không ai có thể làm giả hoặc thay đổi dữ liệu canh tác.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Bước 1 */}
            <div className="bg-emerald-950/60 p-6 rounded-3xl border border-emerald-700/60 text-center relative group hover:bg-emerald-950 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-emerald-700/60 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                🌱
              </div>
              <div className="text-xs font-black text-emerald-400 mb-1">BƯỚC 01</div>
              <h4 className="font-bold text-lg mb-2 text-white">Gieo Hạt & Đất Sạch</h4>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Nguồn giống thuần chủng, kiểm định độ pH, kim loại nặng trong đất và nước tưới.
              </p>
            </div>

            {/* Bước 2 */}
            <div className="bg-emerald-950/60 p-6 rounded-3xl border border-emerald-700/60 text-center relative group hover:bg-emerald-950 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-emerald-700/60 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                📡
              </div>
              <div className="text-xs font-black text-emerald-400 mb-1">BƯỚC 02</div>
              <h4 className="font-bold text-lg mb-2 text-white">Chăm Sóc & IoT</h4>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Cảm biến IoT giám sát nhiệt độ, ánh sáng và độ ẩm tự động 24/7 ghi lên Smart Contract.
              </p>
            </div>

            {/* Bước 3 */}
            <div className="bg-emerald-950/60 p-6 rounded-3xl border border-emerald-700/60 text-center relative group hover:bg-emerald-950 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-emerald-700/60 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                🏷️
              </div>
              <div className="text-xs font-black text-emerald-400 mb-1">BƯỚC 03</div>
              <h4 className="font-bold text-lg mb-2 text-white">Thu Hoạch & Gán QR</h4>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Đóng gói đạt chuẩn và sinh mã QR định danh duy nhất cho từng lô nông sản xuất trại.
              </p>
            </div>

            {/* Bước 4 */}
            <div className="bg-emerald-950/60 p-6 rounded-3xl border border-emerald-700/60 text-center relative group hover:bg-emerald-950 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-emerald-700/60 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                🚚
              </div>
              <div className="text-xs font-black text-emerald-400 mb-1">BƯỚC 04</div>
              <h4 className="font-bold text-lg mb-2 text-white">Chuỗi Lạnh Tận Bếp</h4>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Xe tải lạnh giữ trọn vẹn sự tươi giòn từ vườn tới người tiêu dùng trong vài giờ.
              </p>
            </div>

          </div>

          {/* CTA Tra Cứu */}
          <div className="mt-12 text-center">
            <Link
              href="/trace"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-500 hover:to-emerald-500 text-emerald-950 font-black px-8 py-3.5 rounded-2xl shadow-xl shadow-lime-400/20 hover:scale-105 transition-all text-sm"
            >
              <span>🔍</span>
              <span>Trải Nghiệm Tra Cứu Nguồn Gốc Blockchain Ngay</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CẢM NHẬN KHÁCH HÀNG & BẢO HÀNH TƯƠI SẠCH */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="card p-8 bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="text-4xl mb-4">🛡️</div>
                <h4 className="text-xl font-bold text-emerald-900 mb-2">Cam Kết 1 Đổi 1</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Nếu bất kỳ sản phẩm nào bị dập héo, không đạt chuẩn tươi ngon khi nhận hàng, chúng tôi hoàn tiền hoặc đổi mới ngay trong 24 giờ.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-200/80 text-xs font-bold text-emerald-800">
                ✓ Đảm bảo quyền lợi khách hàng 100%
              </div>
            </div>

            <div className="card p-8 bg-teal-50/50 border border-teal-200 flex flex-col justify-between">
              <div>
                <div className="text-4xl mb-4">❄️</div>
                <h4 className="text-xl font-bold text-teal-900 mb-2">Vận Chuyển Giữ Lạnh</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Hệ thống thùng bảo ôn và xe tải lạnh kiểm soát nhiệt độ từ 4°C - 8°C, giúp rau củ giữ nguyên vị ngọt mọng tự nhiên như vừa hái.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-teal-200/80 text-xs font-bold text-teal-800">
                ✓ Giữ độ giòn ngọt nguyên bản
              </div>
            </div>

            <div className="card p-8 bg-lime-50/50 border border-lime-200 flex flex-col justify-between">
              <div>
                <div className="text-4xl mb-4">💚</div>
                <h4 className="text-xl font-bold text-lime-950 mb-2">Hỗ Trợ Nông Dân Việt</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mỗi đơn hàng của bạn góp phần giúp bà con nông dân và hợp tác xã tiếp cận công nghệ mới, nâng cao giá trị nông sản Việt Nam.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-lime-200/80 text-xs font-bold text-lime-900">
                ✓ Phát triển nông nghiệp bền vững
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

