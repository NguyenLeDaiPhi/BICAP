'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalShipments: 48,
    pendingShipments: 6,
    inTransitShipments: 14,
    completedShipments: 28,
    totalDrivers: 12,
    availableDrivers: 5,
    avgColdTemp: 4.8,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (role !== 'SHIPPING_MANAGER' && role !== 'ROLE_SHIPPINGMANAGER') {
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
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header Điều Phối Xe Lạnh */}
      <header className="bg-white border-b border-emerald-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white text-2xl shadow-md shadow-emerald-200">
                🚚
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>BICAP Chuỗi Lạnh Logistics</span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                    Cold Chain 4°C - 8°C
                  </span>
                </h1>
                <p className="text-xs text-slate-500">Giám sát xe lạnh vận chuyển nông sản sạch từ nông trại tới siêu thị</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="btn-secondary text-xs py-2 text-rose-700 hover:bg-rose-50 border-rose-200">
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Tổng Quan Chuỗi Lạnh */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400 text-teal-950 uppercase">
              100% Thùng Xe Lạnh Đạt Chuẩn
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Trung Tâm Điều Phối Đội Xe Lạnh BICAP</h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Cảm biến GPS và cảm biến nhiệt độ gắn trong thùng xe bảo đảm rau củ luôn giữ trọn vị giòn ngọt nguyên bản suốt hành trình.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
            <span className="text-xs text-emerald-200 uppercase font-bold block">Nhiệt Độ Thùng Xe TB</span>
            <span className="text-3xl font-black text-lime-300">{stats.avgColdTemp}°C</span>
            <span className="text-[10px] text-emerald-200 block mt-0.5">Tiêu chuẩn bảo quản lạnh</span>
          </div>
        </div>

        {/* 6 Thống Kê Nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card p-4 text-center border border-emerald-100">
            <p className="text-xs text-slate-500 font-bold uppercase">Tổng Chuyến</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalShipments}</p>
          </div>
          <div className="card p-4 text-center border border-amber-100 bg-amber-50/40">
            <p className="text-xs text-amber-700 font-bold uppercase">Chờ Điều Xe</p>
            <p className="text-2xl font-black text-amber-800 mt-1">{stats.pendingShipments}</p>
          </div>
          <div className="card p-4 text-center border border-blue-100 bg-blue-50/40">
            <p className="text-xs text-blue-700 font-bold uppercase">Đang Lăn Bánh</p>
            <p className="text-2xl font-black text-blue-800 mt-1">{stats.inTransitShipments}</p>
          </div>
          <div className="card p-4 text-center border border-emerald-100 bg-emerald-50/40">
            <p className="text-xs text-emerald-700 font-bold uppercase">Đã Giao Kho</p>
            <p className="text-2xl font-black text-emerald-800 mt-1">{stats.completedShipments}</p>
          </div>
          <div className="card p-4 text-center border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase">Tổng Tài Xế</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalDrivers}</p>
          </div>
          <div className="card p-4 text-center border border-teal-100 bg-teal-50/40">
            <p className="text-xs text-teal-700 font-bold uppercase">Tài Xế Sẵn Sàng</p>
            <p className="text-2xl font-black text-teal-800 mt-1">{stats.availableDrivers}</p>
          </div>
        </div>

        {/* Thao Tác Nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card border border-emerald-100">
            <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <span>🚚</span> Quản Lý Chuyến Vận Chuyển Xe Lạnh
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/shipments" className="p-4 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors">
                <span className="text-2xl mb-1 block">📦</span>
                <p className="font-bold text-sm text-slate-900">Danh Sách Chuyến</p>
                <p className="text-xs text-slate-500">Giám sát lộ trình giao</p>
              </Link>
              <Link href="/shipments" className="p-4 bg-teal-50 rounded-2xl hover:bg-teal-100 transition-colors">
                <span className="text-2xl mb-1 block">➕</span>
                <p className="font-bold text-sm text-slate-900">Tạo Chuyến Mới</p>
                <p className="text-xs text-slate-500">Gán đơn hàng thành công</p>
              </Link>
            </div>
          </div>

          <div className="card border border-emerald-100">
            <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <span>👨‍✈️</span> Đội Xe & Tài Xế
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/drivers" className="p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors">
                <span className="text-2xl mb-1 block">👨‍✈️</span>
                <p className="font-bold text-sm text-slate-900">Danh Sách Tài Xế</p>
                <p className="text-xs text-slate-500">Bằng lái & Lịch trình</p>
              </Link>
              <Link href="/drivers" className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                <span className="text-2xl mb-1 block">❄️</span>
                <p className="font-bold text-sm text-slate-900">Phương Tiện Bảo Ôn</p>
                <p className="text-xs text-slate-500">Kiểm định thùng lạnh</p>
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
