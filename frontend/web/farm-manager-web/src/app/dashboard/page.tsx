'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSeasons: 0,
    totalProducts: 0,
    pendingOrders: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (role !== 'FARM_MANAGER') {
      router.push('/login');
      return;
    }

    // Fetch stats (mock data)
    setStats({
      totalSeasons: 3,
      totalProducts: 12,
      pendingOrders: 5,
      unreadNotifications: 2,
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">BICAP - Quản lý trang trại</h1>
              <p className="text-sm text-gray-500">Chào mừng bạn quay trở lại!</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="btn-secondary">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mùa vụ</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSeasons}</p>
              </div>
              <span className="text-3xl">🌱</span>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sản phẩm</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <span className="text-3xl">🌾</span>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đơn hàng chờ</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
              </div>
              <span className="text-3xl">📦</span>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Thông báo mới</p>
                <p className="text-3xl font-bold text-blue-600">{stats.unreadNotifications}</p>
              </div>
              <span className="text-3xl">🔔</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Quản lý trang trại</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/farm" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-2xl mb-2 block">🏡</span>
                <p className="font-medium">Thông tin trang trại</p>
              </Link>
              <Link href="/seasons" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-2xl mb-2 block">🌱</span>
                <p className="font-medium">Mùa vụ</p>
              </Link>
              <Link href="/processes" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-2xl mb-2 block">📋</span>
                <p className="font-medium">Quá trình canh tác</p>
              </Link>
              <Link href="/iot" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-2xl mb-2 block">📊</span>
                <p className="font-medium">Dữ liệu IoT</p>
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Kinh doanh</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/products" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-2xl mb-2 block">🌾</span>
                <p className="font-medium">Nông sản</p>
              </Link>
              <Link href="/trading" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-2xl mb-2 block">🏪</span>
                <p className="font-medium">Sàn giao dịch</p>
              </Link>
              <Link href="/orders" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-2xl mb-2 block">📦</span>
                <p className="font-medium">Đơn hàng</p>
              </Link>
              <Link href="/payments" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-2xl mb-2 block">💰</span>
                <p className="font-medium">Thanh toán</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">📦</span>
              <div className="flex-1">
                <p className="font-medium">Có đơn hàng mới từ Nhà bán lẻ ABC</p>
                <p className="text-sm text-gray-500">2 giờ trước</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🌱</span>
              <div className="flex-1">
                <p className="font-medium">Mùa vụ "Vụ lúa Đông Xuân 2026" đã được tạo</p>
                <p className="text-sm text-gray-500">1 ngày trước</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">💰</span>
              <div className="flex-1">
                <p className="font-medium">Thanh toán thành công: 5,000,000 VNĐ</p>
                <p className="text-sm text-gray-500">2 ngày trước</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
