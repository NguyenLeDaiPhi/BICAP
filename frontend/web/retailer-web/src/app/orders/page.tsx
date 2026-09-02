'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Order {
  id: number;
  code: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>([
    {
      id: 1,
      code: 'ORD-2026-001',
      items: [
        { name: 'Lúa ST25', quantity: 100, price: 15000 },
        { name: 'Rau muống', quantity: 50, price: 25000 },
      ],
      totalAmount: 2750000,
      status: 'PENDING',
      createdAt: '2026-09-01 10:30',
    },
    {
      id: 2,
      code: 'ORD-2026-002',
      items: [
        { name: 'Đậu xanh', quantity: 30, price: 35000 },
      ],
      totalAmount: 1050000,
      status: 'SHIPPING',
      createdAt: '2026-09-02 08:15',
    },
    {
      id: 3,
      code: 'ORD-2026-003',
      items: [
        { name: 'Lúa Jasmine', quantity: 200, price: 18000 },
      ],
      totalAmount: 3600000,
      status: 'COMPLETED',
      createdAt: '2026-08-28 14:20',
    },
  ]);

  const [filter, setFilter] = useState('ALL');

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
      ACCEPTED: { label: 'Đã chấp nhận', color: 'bg-blue-100 text-blue-700' },
      DEPOSIT_PAID: { label: 'Đã đặt cọc', color: 'bg-green-100 text-green-700' },
      SHIPPING: { label: 'Đang vận chuyển', color: 'bg-indigo-100 text-indigo-700' },
      DELIVERED: { label: 'Đã giao', color: 'bg-teal-100 text-teal-700' },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-green-500 text-white' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);
  const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
  const completedOrders = orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              ← Quay lại
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'ALL' ? 'bg-primary text-white' : 'bg-white text-gray-700'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'ACTIVE' ? 'bg-primary text-white' : 'bg-white text-gray-700'
            }`}
          >
            Đang xử lý ({activeOrders.length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'COMPLETED' ? 'bg-primary text-white' : 'bg-white text-gray-700'
            }`}
          >
            Đã hoàn thành ({completedOrders.length})
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
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
                    <p className="text-sm text-gray-500 mt-1">{order.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{order.totalAmount.toLocaleString()}đ</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm mb-1">
                      <span>{item.name} x {item.quantity}</span>
                      <span>{(item.quantity * item.price).toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Link href={`/orders/${order.id}`} className="btn-secondary">
                    Chi tiết
                  </Link>
                  {order.status === 'SHIPPING' && (
                    <button className="btn-primary">
                      Xác nhận đã nhận
                    </button>
                  )}
                  {order.status === 'PENDING' && (
                    <button className="btn-danger">
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
