'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RetailerPage() {
  const [countdown, setCountdown] = useState(3);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRedirecting(true);
          // Redirect to retailer login page
          window.location.href = process.env.NEXT_PUBLIC_RETAILER_URL || 'http://localhost:3000/login';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-green-700 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏪</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Sàn Bán Lẻ Nông Sản</h1>
            <p className="text-emerald-100 mt-2">Dành cho Nhà Bán Lẻ & Siêu Thị</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Warning Message */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-900 mb-2">Truy Cập Bị Hạn Chế</h2>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Sàn Bán Lẻ chỉ dành cho <strong>tài khoản Nhà Bán Lẻ (Retailer)</strong> đã được xác thực. 
                    Bạn cần <strong>đăng nhập</strong> hoặc <strong>đăng ký</strong> tài khoản Retailer để truy cập trang này.
                  </p>
                </div>
              </div>
            </div>

            {/* Guest Can Trace */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔍</span>
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 mb-1">Tra Cứu Nguồn Gốc</h3>
                  <p className="text-emerald-700 text-sm">
                    Là Khách, bạn vẫn có thể <Link href="/trace" className="underline font-semibold">tra cứu nguồn gốc nông sản sạch</Link> miễn phí mà không cần đăng nhập.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href={process.env.NEXT_PUBLIC_RETAILER_URL 
                  ? `${process.env.NEXT_PUBLIC_RETAILER_URL}/login` 
                  : 'http://localhost:3000/login'}
                className="block w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl text-center transition-all shadow-lg shadow-emerald-600/30 text-lg"
              >
                🔐 Đăng Nhập Retailer
              </Link>

              <Link
                href={process.env.NEXT_PUBLIC_RETAILER_URL 
                  ? `${process.env.NEXT_PUBLIC_RETAILER_URL}/register` 
                  : 'http://localhost:3000/register'}
                className="block w-full bg-white border-2 border-emerald-600 text-emerald-700 font-bold py-4 px-6 rounded-xl text-center hover:bg-emerald-50 transition-all text-lg"
              >
                📝 Đăng Ký Tài Khoản Retailer Mới
              </Link>
            </div>

            {/* Countdown */}
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm mb-2">
                {isRedirecting ? 'Đang chuyển hướng...' : `Tự động chuyển đến trang đăng nhập sau ${countdown} giây...`}
              </p>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-1000"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
            <Link href="/" className="text-emerald-700 font-semibold text-sm hover:text-emerald-800 flex items-center justify-center gap-2">
              ← Quay về Trang Chủ
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 pointer-events-none">🌿</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-20 pointer-events-none">🥬</div>
      </div>
    </div>
  );
}
