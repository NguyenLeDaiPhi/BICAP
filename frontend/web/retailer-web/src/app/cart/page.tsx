'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  name: string;
  farmName: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const router = useRouter();
  
  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || (role !== 'RETAILER' && role !== 'ROLE_RETAILER')) {
      router.push('/login');
      return;
    }
  }, [router]);

  // Mock cart data - in real app, this would come from API/context
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Lúa Thơm Thượng Hạng ST25 Hữu Cơ',
      farmName: 'Hợp Tác Xã Nông Sản Sạch Sóc Trăng',
      price: 18500,
      unit: 'kg',
      quantity: 500,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 2,
      name: 'Xà Lách Romaine & Lô Lô Thủy Canh',
      farmName: 'Trang Trại Công Nghệ Cao An Phú',
      price: 22000,
      unit: 'kg',
      quantity: 100,
      image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=200&q=80',
    },
  ]);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const updateQuantity = (id: number, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQty } : item
    ));
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    setToastMessage('Đã xóa sản phẩm khỏi giỏ hàng');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const depositPercent = 0.2;
  const depositAmount = subtotal * depositPercent;

  const handlePlaceOrder = () => {
    setToastMessage('Đang chuyển hướng đến trang xác nhận đơn hàng...');
    setTimeout(() => {
      router.push('/orders');
    }, 1500);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center justify-center transition-colors font-bold">
                ←
              </Link>
              <h1 className="text-2xl font-black text-slate-900">Giỏ Hàng B2B</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🧺</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Giỏ hàng trống</h2>
          <p className="text-slate-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
          <Link href="/marketplace" className="btn-primary text-sm py-3 px-6 inline-flex">
            ← Quay lại Sàn Giao Dịch
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-bounce">
          <span className="text-xl">✓</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center justify-center transition-colors font-bold">
                ←
              </Link>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  🛒 Giỏ Hàng B2B
                </h1>
                <p className="text-xs text-slate-500">{cartItems.length} lô hàng trong giỏ</p>
              </div>
            </div>
            <Link href="/marketplace" className="btn-secondary text-xs py-2">
              + Thêm sản phẩm khác
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="card p-5 flex gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-emerald-50 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.farmName}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm">
                      <span className="font-black text-emerald-700">{item.price.toLocaleString('vi-VN')} đ</span>
                      <span className="text-slate-400">/{item.unit}</span>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 50)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="w-20 text-center py-1.5 border border-slate-200 rounded-lg font-semibold text-sm"
                        min="1"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 50)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Thành tiền: <strong className="text-emerald-700">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</strong>
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 border border-emerald-200 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                📋 Tóm Tắt Đơn Hàng
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tạm tính ({cartItems.length} lô)</span>
                  <span className="font-semibold">{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí vận chuyển</span>
                  <span className="text-emerald-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thuế VAT</span>
                  <span className="font-semibold">Đã bao gồm</span>
                </div>
                
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-slate-900">Tổng cộng</span>
                    <span className="font-black text-emerald-700">{subtotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700 font-medium">Tiền cọc ({depositPercent * 100}%)</span>
                    <span className="font-bold text-amber-800">{depositAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <p className="text-[11px] text-amber-600 mt-1">
                    * Thanh toán {depositPercent * 100}% để giữ giá sỉ tốt nhất
                  </p>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full btn-primary mt-6 text-sm py-3 justify-center"
              >
                📋 Đặt Cọc Ngay
              </button>

              <Link
                href="/marketplace"
                className="block w-full text-center text-emerald-700 font-semibold text-sm py-2 mt-2 hover:text-emerald-800 transition-colors"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
