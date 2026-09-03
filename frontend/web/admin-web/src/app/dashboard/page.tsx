'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardData {
  totalFarms: number;
  totalProducts: number;
  totalOrders: number;
  totalShipments: number;
  verifiedContracts: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({
    totalFarms: 54,
    totalProducts: 186,
    totalOrders: 642,
    totalShipments: 428,
    verifiedContracts: 1250,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header Quản Trị Hệ Thống */}
      <header className="bg-white border-b border-emerald-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-green-600 flex items-center justify-center text-white text-2xl shadow-md shadow-emerald-200">
                🛡️
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>BICAP Admin Portal</span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    Hệ Thống Trung Tâm
                  </span>
                </h1>
                <p className="text-xs text-slate-500">Giám sát toàn diện chuỗi cung ứng nông sản sạch & Blockchain</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="http://localhost:3010"
                className="btn-secondary text-xs py-2"
                title="Mở cổng khách hàng"
              >
                🌐 Mở Cổng Khách Hàng
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-xs py-2 text-rose-700 hover:bg-rose-50 border-rose-200">
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Tổng Quan Quản Trị */}
        <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400 text-emerald-950 uppercase">
              Hệ Thống Microservices Hoạt Động 100%
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Bảng Điều Khiển Nông Nghiệp Chuỗi Khối Quốc Gia</h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Giám sát chất lượng nông sản, xác thực giấy phép VietGAP/GlobalGAP và bảo chứng Smart Contract VeChainThor.
            </p>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
            <span className="block text-3xl font-black text-lime-300">1,250+</span>
            <span className="text-xs text-emerald-100 font-semibold uppercase">Smart Contracts Đã Ký</span>
          </div>
        </div>

        {/* 4 Thẻ Thống Kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card border border-emerald-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Tổng Trang Trại</p>
                <p className="text-3xl font-black text-emerald-800 mt-1">{data.totalFarms}</p>
                <span className="text-[11px] text-emerald-600 font-semibold">100% Đã thẩm định</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl">
                🏡
              </div>
            </div>
          </div>

          <div className="card border border-emerald-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Sản Phẩm Đang Bán</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{data.totalProducts}</p>
                <span className="text-[11px] text-teal-600 font-semibold">Chuẩn VietGAP/Organic</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl">
                🌾
              </div>
            </div>
          </div>

          <div className="card border border-emerald-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Đơn Hàng Sàn B2B</p>
                <p className="text-3xl font-black text-amber-700 mt-1">{data.totalOrders}</p>
                <span className="text-[11px] text-amber-600 font-semibold">Khối lượng 350+ tấn</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl">
                📦
              </div>
            </div>
          </div>

          <div className="card border border-emerald-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Chuyến Xe Lạnh</p>
                <p className="text-3xl font-black text-blue-700 mt-1">{data.totalShipments}</p>
                <span className="text-[11px] text-blue-600 font-semibold">Bảo quản nhiệt độ chuẩn</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl">
                🚚
              </div>
            </div>
          </div>
        </div>

        {/* Lối Tắt Phân Hệ */}
        <div className="card border border-emerald-100">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <span>⚡</span> Phân Hệ Quản Trị Trung Tâm
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/farms" className="p-4 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors">
              <div className="text-2xl mb-1">🏡</div>
              <p className="font-bold text-sm text-slate-900">Duyệt Trang Trại</p>
              <p className="text-xs text-slate-500">Giấy phép VietGAP</p>
            </Link>
            <Link href="/products" className="p-4 bg-teal-50 rounded-2xl hover:bg-teal-100 transition-colors">
              <div className="text-2xl mb-1">🌾</div>
              <p className="font-bold text-sm text-slate-900">Kiểm Định Nông Sản</p>
              <p className="text-xs text-slate-500">Dư lượng 0% BVTV</p>
            </Link>
            <Link href="/orders" className="p-4 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors">
              <div className="text-2xl mb-1">📦</div>
              <p className="font-bold text-sm text-slate-900">Giao Dịch Sàn Sỉ</p>
              <p className="text-xs text-slate-500">Thanh toán đặt cọc</p>
            </Link>
            <Link href="/users" className="p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-1">👥</div>
              <p className="font-bold text-sm text-slate-900">Quản Trị Người Dùng</p>
              <p className="text-xs text-slate-500">Phân quyền vai trò</p>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

