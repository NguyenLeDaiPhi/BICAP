'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Trang Chủ', href: '/' },
    { name: 'Nông Sản Tươi', href: '/products' },
    { name: 'Truy Xuất Nguồn Gốc', href: '/trace', highlight: true },
    { name: 'Sàn Bán Lẻ B2B', href: 'http://localhost:3000/marketplace', external: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm shadow-emerald-50">
      {/* Top Banner ưu đãi xanh mát */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 text-white text-xs sm:text-sm py-1.5 px-4 text-center font-medium tracking-wide">
        🌿 <span>Nông sản tươi sạch hái trong ngày • 100% Chuẩn VietGAP/GlobalGAP • Mã hóa nguồn gốc trên Blockchain VeChainThor</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo sống động */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform duration-300">
              <span className="text-2xl">🌱</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-emerald-900 group-hover:text-emerald-700 transition-colors">
                  BICAP
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Clean Agri
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Nông Sản Sạch Chuỗi Khối</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    link.highlight
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 shadow-sm'
                      : isActive
                      ? 'text-emerald-700 bg-emerald-50/60 font-bold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                  }`}
                >
                  {link.highlight && <span className="text-base">🔗</span>}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/trace"
              className="btn-outline-green text-sm py-2 px-3.5"
            >
              <span>🔍</span>
              <span>Tra Cứu QR</span>
            </Link>
            <Link
              href="/products"
              className="btn-primary text-sm py-2 px-4 shadow-emerald-200"
            >
              <span>🛒</span>
              <span>Mua Nông Sản</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-100 space-y-2 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/trace"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary w-full justify-center"
              >
                🔍 Tra Cứu Nguồn Gốc QR
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full justify-center"
              >
                🛒 Mua Nông Sản Sạch
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
