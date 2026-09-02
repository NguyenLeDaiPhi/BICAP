'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Order {
  id: number;
  code: string;
  retailerName: string;
  products: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      code: 'ORD-2026-001',
      retailerName: 'Siêu thị ABC',
      products: 'Lúa ST25 (100kg), Rau muống (50kg)',
      totalAmount: 2500000,
      status: 'PENDING',
      createdAt: '2026-09-01 10:30:00',
    },
    {
      id: 2,
      code: 'ORD-2026-002',
      retailerName: 'Cửa hàng XYZ',
      products: 'Đậu xanh (30kg)',
      totalAmount: 1050000,
      status: 'ACCEPTED',
      createdAt: '2026-09-02 08:15:00',
    },
    {
      id: 3,
      code: 'ORD-2026-003',
      retailerName: 'Nhà hàng DEF',
      products: 'Lúa ST25 (200kg)',
      totalAmount: 3000000,
      status: 'DEPOSIT_PAID',
      createdAt: '2026-09-02 14:20:00',
    },
  ]);

  const [filter, setFilter] = useState('ALL');

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' };
      case 'ACCEPTED': return { label: 'Đã chấp nhận', color: 'bg-blue-100 text-blue-700' };
      case 'REJECTED': return { label: 'Đã từ chối', color: 'bg-red-100 text-red-700' };
      case 'DEPOSIT_PENDING': return { label: 'Chờ đặt cọc', color: 'bg-orange-100 text-orange-700' };
      case 'DEPOSIT_PAID': return { label: 'Đã đặt cọc', color: 'bg-green-100 text-green-700' };
      case 'READY_TO_SHIP': return { label: 'Sẵn sàng giao', color: 'bg-purple-100 text-purple-700' };
      case 'SHIPPING': return { label: 'Đang vận chuyển', color: 'bg-indigo-100 text-indigo-700' };
      case 'DELIVERED': return { label: 'Đã giao', color: 'bg-teal-100 text-teal-700' };
      case 'COMPLETED': return { label: 'Hoàn thành', color: 'bg-green-500 text-white' };
      default: return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const handleAccept = (id: number) => {
    if (confirm('Bạn có chắc muốn chấp nhận đơn hàng này?')) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'ACCEPTED' } : o));
    }
  };

  const handleReject = (id: number) => {
    if (confirm('Bạn có chắc muốn từ chối đơn hàng này?')) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'REJECTED' } : o));
    }
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                ← Quay lại
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'PENDING', 'ACCEPTED', 'DEPOSIT_PAID', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'Tất cả' : getStatusLabel(status).label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusLabel(order.status);
            return (
              <div key={order.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{order.code}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.retailerName} • {order.createdAt}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{order.totalAmount.toLocaleString()}đ</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-500 mb-1">Sản phẩm:</p>
                  <p className="font-medium">{order.products}</p>
                </div>

                {order.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(order.id)}
                      className="btn-primary flex-1"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleReject(order.id)}
                      className="btn-danger flex-1"
                    >
                      Từ chối
                    </button>
                  </div>
                )}

                {order.status === 'ACCEPTED' && (
                  <div className="flex gap-3">
                    <Link href={`/orders/${order.id}`} className="btn-secondary flex-1 text-center">
                      Xem chi tiết
                    </Link>
                  </div>
                )}
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Không có đơn hàng nào</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
