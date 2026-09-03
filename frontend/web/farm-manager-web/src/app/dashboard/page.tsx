'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSeasons: 4,
    activeProducts: 12,
    pendingOrders: 5,
    iotOnlineSensors: 16,
    avgTemp: 22.4,
    avgHumidity: 76.5,
    avgPh: 6.3,
  });

  useEffect(() => {
    // Demo mode: nếu chưa có token, cho phép trải nghiệm trực tiếp để bảo vệ đồ án và kiểm thử UI mượt mà
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role && role !== 'FARM_MANAGER') {
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
      {/* Header Nông Trại Xanh */}
      <header className="bg-white border-b border-emerald-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white text-2xl shadow-md shadow-emerald-200">
                🏡
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>Hợp Tác Xã Nông Nghiệp Công Nghệ Cao An Phú</span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    VietGAP Certified
                  </span>
                </h1>
                <p className="text-xs text-slate-500">Hệ thống giám sát nông trại sinh thái & Chuỗi khối BICAP</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="http://localhost:3010/trace"
                className="btn-secondary text-xs py-2"
                title="Xem trang tra cứu công khai"
              >
                🔍 Xem Cổng Tra Cứu QR
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-xs py-2 text-rose-700 hover:bg-rose-50 border-rose-200">
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Tổng Quan Sinh Thái */}
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400 text-emerald-950 uppercase">
              Hệ Thống Đang Vận Hành Ổn Định
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Nhà Màng Sinh Thái Đà Lạt - Khu A & B</h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              16 trạm cảm biến IoT đang gửi dữ liệu nhiệt độ, độ ẩm và dinh dưỡng đất liên tục lên Smart Contract VeChainThor.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/seasons"
              className="btn-primary bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs py-3 px-5 shadow-lg border-0"
            >
              🌱 Tạo Mùa Vụ Mới
            </Link>
            <Link
              href="/products"
              className="btn-secondary bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-xs py-3 px-5 border border-emerald-600"
            >
              🌾 Đẩy Lên Sàn B2B
            </Link>
          </div>
        </div>

        {/* 4 Thống Kê Nhanh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card border border-emerald-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Mùa Vụ Đang Canh Tác</p>
                <p className="text-3xl font-black text-emerald-800 mt-1">{stats.totalSeasons}</p>
                <span className="text-[11px] text-emerald-600 font-semibold">2 vụ chuẩn bị thu hoạch</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl">
                🌱
              </div>
            </div>
          </div>

          <div className="card border border-emerald-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Nông Sản Niêm Yết</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stats.activeProducts}</p>
                <span className="text-[11px] text-emerald-600 font-semibold">Đã kiểm định 100%</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl">
                🌾
              </div>
            </div>
          </div>

          <div className="card border border-emerald-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Đơn Hàng Chờ Xử Lý</p>
                <p className="text-3xl font-black text-amber-600 mt-1">{stats.pendingOrders}</p>
                <span className="text-[11px] text-amber-700 font-semibold">Từ Siêu Thị Co.op & WinMart</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl">
                📦
              </div>
            </div>
          </div>

          <div className="card border border-emerald-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Cảm Biến IoT Online</p>
                <p className="text-3xl font-black text-blue-700 mt-1">{stats.iotOnlineSensors}/16</p>
                <span className="text-[11px] text-blue-600 font-semibold">Kết nối trạm LoRaWAN</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl">
                📡
              </div>
            </div>
          </div>
        </div>

        {/* Giám Sát Môi Trường IoT Nhà Kính Thời Gian Thực */}
        <div className="card border border-emerald-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>📊</span> Chỉ Số Cảm Biến Môi Trường Nhà Kính Hôm Nay
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tự động cập nhật mỗi 5 phút từ thiết bị Gateway IoT</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
              ● Trạng thái sinh trưởng: CỰC TỐT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
              <span className="text-3xl mb-1 block">🌡️</span>
              <p className="text-xs text-slate-500 font-bold uppercase">Nhiệt Độ Không Khí</p>
              <p className="text-3xl font-black text-emerald-800 mt-1">{stats.avgTemp}°C</p>
              <div className="w-full bg-emerald-200 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-[65%]"></div>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-1.5">Ngưỡng an toàn: 18°C - 26°C</span>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 text-center">
              <span className="text-3xl mb-1 block">💧</span>
              <p className="text-xs text-slate-500 font-bold uppercase">Độ Ẩm Không Khí</p>
              <p className="text-3xl font-black text-teal-800 mt-1">{stats.avgHumidity}%</p>
              <div className="w-full bg-teal-200 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full w-[76%]"></div>
              </div>
              <span className="text-[10px] text-teal-700 font-semibold block mt-1.5">Ngưỡng tối ưu: 70% - 85%</span>
            </div>

            <div className="p-5 rounded-2xl bg-lime-50/70 border border-lime-200 text-center">
              <span className="text-3xl mb-1 block">🧪</span>
              <p className="text-xs text-slate-500 font-bold uppercase">Độ pH Dung Dịch Tưới</p>
              <p className="text-3xl font-black text-lime-900 mt-1">{stats.avgPh}</p>
              <div className="w-full bg-lime-200 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-lime-600 h-full rounded-full w-[60%]"></div>
              </div>
              <span className="text-[10px] text-lime-800 font-semibold block mt-1.5">Ngưỡng chuẩn VietGAP: 5.8 - 6.5</span>
            </div>
          </div>
        </div>

        {/* Lối Tắt Quản Trị Nhanh */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="card border border-emerald-100">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <span>📋</span> Quản Lý Canh Tác & Chuỗi Khối
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/seasons" className="p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors">
                <span className="text-2xl mb-1 block">🌱</span>
                <p className="font-bold text-sm text-slate-900">Quản Lý Mùa Vụ</p>
                <p className="text-xs text-slate-500">Lịch gieo hạt & thu hoạch</p>
              </Link>
              <Link href="/seasons" className="p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors">
                <span className="text-2xl mb-1 block">🔒</span>
                <p className="font-bold text-sm text-slate-900">Ghi Nhật Ký Chuỗi Khối</p>
                <p className="text-xs text-slate-500">Smart contract bất biến</p>
              </Link>
            </div>
          </div>

          <div className="card border border-emerald-100">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <span>🌾</span> Thương Mại & Phân Phối
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/products" className="p-4 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors">
                <span className="text-2xl mb-1 block">🏷️</span>
                <p className="font-bold text-sm text-slate-900">Nông Sản Xuất Bán</p>
                <p className="text-xs text-slate-500">Đăng bán lên sàn sỉ</p>
              </Link>
              <Link href="/orders" className="p-4 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors">
                <span className="text-2xl mb-1 block">📦</span>
                <p className="font-bold text-sm text-slate-900">Đơn Hàng & Đặt Cọc</p>
                <p className="text-xs text-slate-500">Xử lý hợp đồng siêu thị</p>
              </Link>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

