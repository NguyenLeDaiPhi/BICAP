import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-100/90 pt-16 pb-12 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/60">
          
          {/* Cột 1: Thông tin hệ sinh thái BICAP */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-300 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <span className="text-2xl">🌱</span>
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight">BICAP</span>
                <p className="text-xs text-emerald-300 font-medium">Nông Nghiệp Sạch • Chuỗi Khối Minh Bạch</p>
              </div>
            </div>
            
            <p className="text-sm text-emerald-200/80 leading-relaxed pr-6">
              Hệ thống tiên phong ứng dụng công nghệ Chuỗi khối (Blockchain VeChainThor) và Cảm biến IoT vào quy trình canh tác nông nghiệp sạch. Mang sự tươi mát, an toàn và minh bạch tuyệt đối từ nông trại đến từng bữa ăn gia đình Việt.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/90 text-emerald-300 border border-emerald-700">
                ✓ Chuẩn VietGAP
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/90 text-emerald-300 border border-emerald-700">
                ✓ Chuẩn GlobalGAP
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/90 text-emerald-300 border border-emerald-700">
                ✓ 100% Organic
              </span>
            </div>
          </div>

          {/* Cột 2: Khám Phá Nông Sản */}
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Nông Sản Sạch</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products?category=VEGETABLE" className="hover:text-emerald-300 transition-colors">
                  🥬 Rau Ăn Lá Thủy Canh
                </Link>
              </li>
              <li>
                <Link href="/products?category=ROOT" className="hover:text-emerald-300 transition-colors">
                  🥕 Củ Quả Hữu Cơ Đà Lạt
                </Link>
              </li>
              <li>
                <Link href="/products?category=FRUIT" className="hover:text-emerald-300 transition-colors">
                  🍎 Trái Cây Đặc Sản Miền Tây
                </Link>
              </li>
              <li>
                <Link href="/products?category=RICE" className="hover:text-emerald-300 transition-colors">
                  🌾 Gạo ST25 Thượng Hạng
                </Link>
              </li>
              <li>
                <Link href="/products?category=HERB" className="hover:text-emerald-300 transition-colors">
                  🌿 Nấm & Thảo Dược Sạch
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Công Nghệ & Minh Bạch */}
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Minh Bạch Số</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/trace" className="text-emerald-300 font-semibold hover:underline flex items-center gap-1">
                  <span>🔍</span> Tra Cứu Mã Lô Hàng
                </Link>
              </li>
              <li>
                <Link href="/trace" className="hover:text-emerald-300 transition-colors">
                  📱 Quét QR Nguồn Gốc
                </Link>
              </li>
              <li>
                <span className="text-emerald-200/60 block">
                  ⛓️ VeChainThor Smart Contract
                </span>
              </li>
              <li>
                <span className="text-emerald-200/60 block">
                  📡 Giám Sát Cảm Biến IoT Đất/Nước
                </span>
              </li>
              <li>
                <span className="text-emerald-200/60 block">
                  ❄️ Vận Chuyển Chuỗi Lạnh
                </span>
              </li>
            </ul>
          </div>

          {/* Cột 4: Hỗ Trợ & Đối Tác */}
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Kết Nối Với Chúng Tôi</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-emerald-400">📍</span>
                <span>Khu Công Nghệ Cao Nông Nghiệp, Việt Nam</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-400">📞</span>
                <span className="font-semibold text-white">1900 6868 (Miễn phí)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-400">✉️</span>
                <span>contact@bicap.vn</span>
              </p>
              <div className="pt-2">
                <p className="text-xs text-emerald-300/80 mb-2">Đăng ký nhận thông tin mùa vụ tươi mới:</p>
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="Email của bạn..."
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-emerald-900 border border-emerald-700 text-white placeholder-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg text-xs transition-colors">
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bản quyền */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400/80">
          <p>© 2026 BICAP - Nền Tảng Nông Sản Sạch Tích Hợp Blockchain. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <span>Tiêu chuẩn nông sản quốc gia</span>
            <span>Chống hàng giả mạo bằng mã băm chuỗi khối</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
