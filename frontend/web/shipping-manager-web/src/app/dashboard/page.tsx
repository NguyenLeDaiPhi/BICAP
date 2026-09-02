'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalShipments: 45,
    pendingShipments: 8,
    inTransitShipments: 12,
    completedShipments: 25,
    totalDrivers: 10,
    availableDrivers: 6,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (role !== 'SHIPPING_MANAGER') {
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
              <h1 className="text-3xl font-bold text-primary">BICAP - Quản lý vận chuyển</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-gray-600">Tổng chuyến</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalShipments}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Chờ xử lý</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingShipments}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Đang vận chuyển</p>
            <p className="text-3xl font-bold text-blue-600">{stats.inTransitShipments}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Hoàn thành</p>
            <p className="text-3xl font-bold text-green-600">{stats.completedShipments}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Tài xế</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDrivers}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Sẵn sàng</p>
            <p className="text-3xl font-bold text-green-600">{stats.availableDrivers}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Quản lý vận chuyển</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/shipments" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <span className="text-2xl mb-2 block">🚚</span>
                <p className="font-medium">Danh sách chuyến</p>
              </Link>
              <Link href="/shipments/new" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <span className="text-2xl mb-2 block">📦</span>
                <p className="font-medium">Tạo chuyến mới</p>
              </Link>
              <Link href="/drivers" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-2xl mb-2 block">👨‍✈️</span>
                <p className="font-medium">Tài xế</p>
              </Link>
              <Link href="/vehicles" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-2xl mb-2 block">🚛</span>
                <p className="font-medium">Phương tiện</p>
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Chuyến gần đây</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">SHP-2026-001</p>
                  <p className="text-sm text-gray-500">Trang trại ABC → Siêu thị XYZ</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Đang vận chuyển</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">SHP-2026-002</p>
                  <p className="text-sm text-gray-500">Trang trại DEF → Cửa hàng 123</p>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">Chờ phân công</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">SHP-2026-003</p>
                  <p className="text-sm text-gray-500">Trang trại GHI → Nhà hàng ABC</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Hoàn thành</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reports */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Báo cáo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/reports/daily" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-2xl mb-2 block">📊</span>
              <p className="font-medium">Báo cáo ngày</p>
            </Link>
            <Link href="/reports/monthly" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <span className="text-2xl mb-2 block">📈</span>
              <p className="font-medium">Báo cáo tháng</p>
            </Link>
            <Link href="/notifications" className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <span className="text-2xl mb-2 block">🔔</span>
              <p className="font-medium">Thông báo</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
