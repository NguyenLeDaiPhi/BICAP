'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Order {
  id: number;
  code: string;
  farmName: string;
  items: { name: string; quantity: number; unit: string; price: number }[];
  depositAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'DEPOSIT_PAID' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  blockchainContractHash: string;
  coldChainTemp?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      code: 'BICAP-ORD-2026-088',
      farmName: 'Hợp Tác Xã Nông Sản Sạch Sóc Trăng',
      items: [
        { name: 'Lúa Thơm Thượng Hạng ST25 Hữu Cơ', quantity: 500, unit: 'kg', price: 18500 },
      ],
      depositAmount: 1850000,
      totalAmount: 9250000,
      status: 'SHIPPING',
      createdAt: '02/03/2026 09:30',
      blockchainContractHash: '0x3f9c81a20e4b8891f94c1a89004123de776891ac',
      coldChainTemp: '5.2°C (Xe lạnh BICAP Logistics #XE-29C-8812)',
    },
    {
      id: 2,
      code: 'BICAP-ORD-2026-089',
      farmName: 'Trang Trại Công Nghệ Cao An Phú Đà Lạt',
      items: [
        { name: 'Xà Lách Romaine & Lô Lô Thủy Canh', quantity: 100, unit: 'kg', price: 22000 },
        { name: 'Cà Chua Bi Hữu Cơ Giọt Lệ Đỏ', quantity: 80, unit: 'kg', price: 32000 },
      ],
      depositAmount: 952000,
      totalAmount: 4760000,
      status: 'DEPOSIT_PAID',
      createdAt: '03/03/2026 06:15',
      blockchainContractHash: '0x889a71bc9942a12fe41b89901d8988456102aaef',
    },
    {
      id: 3,
      code: 'BICAP-ORD-2026-075',
      farmName: 'Nông Hộ Bến Tre Xuất Khẩu',
      items: [
        { name: 'Bưởi Da Xanh Ruột Hồng Loại 1', quantity: 300, unit: 'kg', price: 45000 },
      ],
      depositAmount: 2700000,
      totalAmount: 13500000,
      status: 'COMPLETED',
      createdAt: '25/02/2026 14:20',
      blockchainContractHash: '0x12bc900188ef771239aa88912345bcdef1209384',
    },
  ]);

  const [filter, setFilter] = useState('ALL');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">⏳ Chờ Nông Trại Xác Nhận</span>;
      case 'DEPOSIT_PAID':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✓ Đã Đặt Cọc 20% (Chờ Thu Hoạch)</span>;
      case 'SHIPPING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 animate-pulse">🚚 Đang Vận Chuyển Xe Lạnh</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-800 text-emerald-100">🏁 Đã Nhập Kho & Tất Toán</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const handleConfirmReceived = (orderId: number) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'COMPLETED' } : o));
    setSuccessMsg('Đã xác nhận nhập kho thành công! Hợp đồng số đã được hoàn tất trên Blockchain.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const filteredOrders = filter === 'ALL'
    ? orders
    : filter === 'ACTIVE'
    ? orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status))
    : orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-bounce">
          <span className="text-xl">✅</span>
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center justify-center transition-colors font-bold">
                ←
              </Link>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>📋 Quản Lý Đơn Hàng & Hợp Đồng B2B</span>
                </h1>
                <p className="text-xs text-slate-500">Giám sát các lô hàng nông sản bao tiêu từ nông trại</p>
              </div>
            </div>
            <Link href="/marketplace" className="btn-primary text-xs py-2">
              🌾 Đặt Mua Thêm Nông Sản
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs Lọc */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filter === 'ALL' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất Cả Đơn Hàng ({orders.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filter === 'ACTIVE' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Đang Xử Lý & Vận Chuyển ({orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filter === 'COMPLETED' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Đã Hoàn Thành ({orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status)).length})
          </button>
        </div>

        {/* Danh Sách Đơn Hàng */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="card border border-emerald-100 p-6 space-y-4">
              
              {/* Top info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-slate-900">{order.code}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    🏡 Nông trại: <strong className="text-slate-800">{order.farmName}</strong> • Tạo ngày: {order.createdAt}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Tổng giá trị lô hàng</span>
                  <span className="text-2xl font-black text-emerald-800">
                    {order.totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold block">
                    (Đã cọc: {order.depositAmount.toLocaleString('vi-VN')} đ)
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100/60">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm py-1">
                    <span className="font-semibold text-slate-800">
                      🌿 {item.name}
                    </span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500 font-bold">{item.quantity} {item.unit} x {item.price.toLocaleString('vi-VN')} đ</span>
                      <span className="font-black text-slate-900">{(item.quantity * item.price).toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thông tin vận chuyển xe lạnh nếu có */}
              {order.coldChainTemp && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900">
                    <span className="text-lg">❄️</span>
                    <span><strong>Nhiệt độ bảo quản lạnh:</strong> {order.coldChainTemp}</span>
                  </div>
                  <span className="font-bold text-blue-700">GPS Đang Hoạt Động</span>
                </div>
              )}

              {/* Blockchain info & Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-500 font-mono">
                  <span>🔒 Smart Contract:</span>
                  <span className="text-emerald-700 font-bold break-all">{order.blockchainContractHash}</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {order.status === 'SHIPPING' && (
                    <button
                      onClick={() => handleConfirmReceived(order.id)}
                      className="btn-primary flex-1 sm:flex-initial text-xs py-2 px-4"
                    >
                      📦 Xác Nhận Đã Nhập Kho Siêu Thị
                    </button>
                  )}
                  <Link
                    href={`http://localhost:3010/trace`}
                    className="btn-secondary text-xs py-2 px-3 text-emerald-800"
                  >
                    🔍 Quét QR Xác Minh
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

