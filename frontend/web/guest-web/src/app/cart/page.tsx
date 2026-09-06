'use client';

import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-green-700 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🛒</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Giỏ Hàng</h1>
            <p className="text-emerald-100 mt-2">Yêu cầu đăng nhập Retailer</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Warning */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-900 mb-2">Yêu Cầu Đăng Nhập</h2>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Chỉ có <strong>tài khoản Nhà Bán Lẻ (Retailer)</strong> mới được phép mua hàng trên Sàn Bán Lẻ. 
                    Vui lòng đăng nhập hoặc đăng ký để tiếp tục.
                  </p>
                </div>
              </div>
            </div>

            {/* Available for guests */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔍</span>
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 mb-1">Tra Cứu Nguồn Gốc</h3>
                  <p className="text-emerald-700 text-sm">
                    Là Khách, bạn vẫn có thể <Link href="/trace" className="underline font-semibold">tra cứu nguồn gốc nông sản sạch</Link> miễn phí.
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
                📝 Đăng Ký Retailer Mới
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
            <Link href="/" className="text-emerald-700 font-semibold text-sm hover:text-emerald-800 flex items-center justify-center gap-2">
              ← Quay về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
