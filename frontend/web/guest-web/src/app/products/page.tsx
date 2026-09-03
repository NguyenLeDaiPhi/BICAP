'use client';

import { useState } from 'react';
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
  description: string;
  stock: number;
}

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCert, setSelectedCert] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [priceRange, setPriceRange] = useState<number>(300000);
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<{ product: ProductItem; quantity: number }[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const productList: ProductItem[] = [
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
      description: 'Lá dày giòn ngọt tự nhiên, trồng theo mô hình thủy canh hồi lưu tuần hoàn không dư lượng BVTV.',
      stock: 50,
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
      description: 'Quả to đỏ mọng, vị ngọt thanh mát xen chút chua dịu giàu vitamin C, hái tuyển thủ công.',
      stock: 35,
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
      description: 'Cà chua ngọt bùi, vỏ mỏng căng bóng, có thể ăn sống như hoa quả hoặc làm salad tuyệt hảo.',
      stock: 40,
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
      description: 'Gạo ngon nhất thế giới, hạt thon dài trắng trong, cơm dẻo mềm thơm mùi lá dứa tự nhiên.',
      stock: 120,
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
      description: 'Màu sắc rực rỡ, thịt ớt dày giòn, không hăng cay, cung cấp dồi dào chất chống oxy hóa.',
      stock: 60,
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
      description: 'Nấm giòn ngọt thịt dày, giàu protein thực vật, nuôi trồng trong môi trường vô trùng khép kín.',
      stock: 45,
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
      description: 'Tép bưởi hồng mọng, tróc đều róc vỏ, vị ngọt thanh không chua chát, chuẩn xuất khẩu.',
      stock: 80,
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
      description: 'Lá xanh mướt mọng nước, giàu chất sắt và canxi tự nhiên, lý tưởng làm nước ép hoặc xào tỏi.',
      stock: 55,
    },
    {
      id: 9,
      name: 'Cà Rốt Baby Đà Lạt Hữu Cơ Ngọt Lịm',
      category: 'ROOT',
      price: 35000,
      originalPrice: 42000,
      unit: 'Túi 500g',
      origin: 'Đơn Dương, Lâm Đồng',
      certification: 'VietGAP',
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      soldCount: 520,
      harvestDate: 'Hôm nay, 07:00 Sáng',
      blockchainCode: 'BICAP-CARROT-DALAT-102',
      description: 'Củ nhỏ xinh giòn tan, màu cam đậm tự nhiên, ngọt thanh không sượng, bé nhỏ cực kỳ yêu thích.',
      stock: 45,
    },
  ];

  const addToCart = (product: ProductItem) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setToastMsg(`Đã thêm ${product.name} vào giỏ!`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const filteredProducts = productList
    .filter(p => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchCert = selectedCert === 'ALL' || p.certification === selectedCert;
      const matchPrice = p.price <= priceRange;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.origin.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchCert && matchPrice && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.soldCount - a.soldCount;
    });

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-emerald-50/30 py-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500 animate-bounce">
          <span>🌿</span>
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Floating Cart Button */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/50 animate-pulse">
          <span className="text-xl">🧺</span>
          <span className="text-sm font-bold">{totalCartCount} món nông sản</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Header Xanh Mát */}
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Cửa Hàng Nông Sản BICAP
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mt-3">
              Nông Sản Sạch Tươi Mới Mỗi Ngày
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base mt-2">
              Khám phá rau củ thủy canh, hoa quả đặc sản và gạo sạch đạt chuẩn quốc tế. Đảm bảo an toàn vệ sinh thực phẩm 100% có thể kiểm chứng trên Blockchain.
            </p>
          </div>
          <div className="absolute right-6 -bottom-8 opacity-20 text-9xl select-none pointer-events-none">
            🥬
          </div>
        </div>

        {/* Layout Chính: Sidebar Bộ Lọc & Danh Sách Sản Phẩm */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cột Trái: Bộ Lọc Xanh Mát (4 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-6 border border-emerald-100 sticky top-24">
              <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                <span>🍃</span> Bộ Lọc Nông Sản
              </h3>

              {/* Tìm kiếm */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Tìm kiếm</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Tên rau, quả, vùng..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input pl-9 text-xs py-2"
                  />
                </div>
              </div>

              {/* Danh mục */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Nhóm Nông Sản</label>
                <div className="space-y-1.5 text-sm">
                  {[
                    { id: 'ALL', label: 'Tất cả nông sản' },
                    { id: 'VEGETABLE', label: '🥬 Rau ăn lá thủy canh' },
                    { id: 'ROOT', label: '🥕 Củ quả hữu cơ' },
                    { id: 'FRUIT', label: '🍓 Trái cây đặc sản' },
                    { id: 'RICE', label: '🌾 Gạo ST25 & Hạt' },
                    { id: 'HERB', label: '🍄 Nấm & Thảo mộc' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCategory(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        selectedCategory === item.id
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-emerald-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      {selectedCategory === item.id && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chứng chỉ chất lượng */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Chứng Nhận An Toàn</label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'ALL', label: 'Tất cả chứng nhận' },
                    { id: 'VietGAP', label: '✓ VietGAP chuẩn Việt Nam' },
                    { id: 'GlobalGAP', label: '✓ GlobalGAP tiêu chuẩn toàn cầu' },
                    { id: 'Organic', label: '🌿 100% Hữu cơ Organic' },
                  ].map((cert) => (
                    <button
                      key={cert.id}
                      onClick={() => setSelectedCert(cert.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl font-semibold transition-colors ${
                        selectedCert === cert.id
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cert.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mức giá tối đa */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                  <span className="uppercase">Mức Giá Tối Đa</span>
                  <span className="text-emerald-700 font-black">{priceRange.toLocaleString('vi-VN')} đ</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="300000"
                  step="10000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Nút Đặt Lại */}
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedCert('ALL');
                  setPriceRange(300000);
                  setSearch('');
                }}
                className="w-full mt-6 btn-secondary text-xs py-2 justify-center"
              >
                Xóa Bộ Lọc
              </button>
            </div>
          </div>

          {/* Cột Phải: Grid Nông Sản (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Thanh công cụ sắp xếp */}
            <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-100">
              <p className="text-xs text-slate-500 font-medium">
                Tìm thấy <strong className="text-emerald-800">{filteredProducts.length}</strong> sản phẩm nông sản sạch phù hợp
              </p>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold whitespace-nowrap">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input py-1.5 px-3 text-xs w-auto cursor-pointer font-semibold"
                >
                  <option value="popular">Bán Chạy Nhất</option>
                  <option value="rating">Đánh Giá Cao Nhất</option>
                  <option value="price-asc">Giá: Thấp Đến Cao</option>
                  <option value="price-desc">Giá: Cao Đến Thấp</option>
                </select>
              </div>
            </div>

            {/* Danh sách thẻ nông sản */}
            {filteredProducts.length === 0 ? (
              <div className="card p-12 text-center border-dashed border-2 border-emerald-200">
                <div className="text-6xl mb-4">🧺</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa tìm thấy nông sản phù hợp</h3>
                <p className="text-sm text-slate-500 mb-4">Bạn vui lòng điều chỉnh lại mức giá hoặc từ khóa tìm kiếm nhé!</p>
                <button
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedCert('ALL');
                    setPriceRange(300000);
                  }}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Xem Tất Cả Sản Phẩm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="card-product group">
                    <div className="relative h-48 w-full overflow-hidden bg-emerald-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />

                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {product.certification === 'VietGAP' && <span className="badge-vietgap shadow-sm">✓ VietGAP</span>}
                        {product.certification === 'GlobalGAP' && <span className="badge-globalgap shadow-sm">✓ GlobalGAP</span>}
                        {product.certification === 'Organic' && <span className="badge-organic shadow-sm">🌿 Organic</span>}
                      </div>

                      {product.originalPrice && (
                        <div className="absolute top-2.5 right-2.5 bg-rose-500 text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="truncate max-w-[130px]">📍 {product.origin}</span>
                          <span className="text-amber-500 font-bold">★ {product.rating} ({product.soldCount})</span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                          {product.name}
                        </h4>

                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-emerald-700">
                            {product.price.toLocaleString('vi-VN')} đ
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {product.originalPrice.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">/{product.unit}</span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full btn-buy-now text-xs py-2 justify-center"
                        >
                          <span>🧺 Thêm Vào Giỏ</span>
                        </button>

                        <Link
                          href={`/trace?code=${product.blockchainCode}`}
                          className="w-full btn-secondary text-[11px] py-1 justify-center text-emerald-800"
                        >
                          <span>🔗 Nguồn Gốc Blockchain</span>
                        </Link>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
