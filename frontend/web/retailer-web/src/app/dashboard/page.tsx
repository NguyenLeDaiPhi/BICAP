'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    pendingOrders: 3,
    totalOrders: 15,
    totalSpent: 45000000,
    unreadNotifications: 5,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (role !== 'RETAILER') {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">BICAP - Nhà bán lẻ</h1>
              <p className="text-sm text-gray-500">Chào mừng bạn quay trở lại!</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <p className="text-sm text-gray-600">Đơn chờ xử lý</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Tổng đơn hàng</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Tổng chi tiêu</p>
            <p className="text-3xl font-bold text-green-600">{(stats.totalSpent / 1000000).toFixed(1)}M</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Thông báo mới</p>
            <p className="text-3xl font-bold text-blue-600">{stats.unreadNotifications}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Mua sắm</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/marketplace" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-2xl mb-2 block">🏪</span>
                <p className="font-medium">Sàn giao dịch</p>
              </Link>
              <Link href="/trace" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-2xl mb-2 block">🔍</span>
                <p className="font-medium">Truy xuất nguồn gốc</p>
              </Link>
              <Link href="/cart" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <span className="text-2xl mb-2 block">🛒</span>
                <p className="font-medium">Giỏ hàng</p>
              </Link>
              <Link href="/qr-scan" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <span className="text-2xl mb-2 block">📱</span>
                <p className="font-medium">Quét QR</p>
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Đơn hàng của tôi</h2>
            <div className="space-y-3">
              <Link href="/orders" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div>
                  <p className="font-medium">ORD-2026-001</p>
                  <p className="text-sm text-gray-500">Chờ xác nhận</p>
                </div>
                <span className="text-orange-600 font-medium">2.5M đ</span>
              </Link>
              <Link href="/orders" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div>
                  <p className="font-medium">ORD-2026-002</p>
                  <p className="text-sm text-gray-500">Đang vận chuyển</p>
                </div>
                <span className="text-blue-600 font-medium">1.5M đ</span>
              </Link>
              <Link href="/orders" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div>
                  <p className="font-medium">ORD-2026-003</p>
                  <p className="text-sm text-gray-500">Hoàn thành</p>
                </div>
                <span className="text-green-600 font-medium">3.0M đ</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
