'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Retailer login page URL - uses environment variable
  const RETAILER_LOGIN_URL = process.env.NEXT_PUBLIC_RETAILER_URL 
    ? `${process.env.NEXT_PUBLIC_RETAILER_URL}/login` 
    : 'http://localhost:3000/login';
  const RETAILER_REGISTER_URL = process.env.NEXT_PUBLIC_RETAILER_URL 
    ? `${process.env.NEXT_PUBLIC_RETAILER_URL}/register` 
    : 'http://localhost:3000/register';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-700 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🏪</span>
          </div>
          <h2 className="text-xl font-bold">Đăng Nhập Để Mua Hàng</h2>
          <p className="text-emerald-100 text-sm mt-1">
            {message || 'Chỉ có tài khoản Nhà Bán Lẻ mới được phép đặt hàng trên Sàn Bán Lẻ'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Alert message */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800">Giới hạn cho Guest</p>
                <p className="text-amber-700 mt-1">
                  Bạn đang truy cập với tư cách <strong>Khách</strong>. 
                  Để thêm sản phẩm vào giỏ hàng và mua hàng, vui lòng đăng nhập hoặc đăng ký tài khoản Nhà Bán Lẻ.
                </p>
              </div>
            </div>
          </div>

          {/* Guest can still trace */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔍</span>
              <div>
                <p className="font-semibold text-emerald-800">Tra Cứu Nguồn Gốc</p>
                <p className="text-emerald-700 mt-1">
                  Là Khách, bạn vẫn có thể <Link href="/trace" className="underline font-semibold">tra cứu nguồn gốc nông sản sạch</Link> miễn phí.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <Link
              href={showRegister ? RETAILER_REGISTER_URL : RETAILER_LOGIN_URL}
              className="block w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl text-center transition-all shadow-lg shadow-emerald-600/30"
              onClick={onClose}
            >
              {showRegister ? '📝 Đăng Ký Tài Khoản Retailer' : '🔐 Đăng Nhập'}
            </Link>

            <button
              onClick={() => setShowRegister(!showRegister)}
              className="w-full text-emerald-700 font-semibold py-2 text-sm hover:text-emerald-800 transition-colors"
            >
              {showRegister ? '← Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay →'}
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
