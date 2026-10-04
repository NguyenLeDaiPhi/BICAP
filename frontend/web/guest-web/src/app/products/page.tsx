import ApprovedProducts from '@/components/ApprovedProducts';
export default function ProductsPage() {
  return <main className="min-h-screen bg-emerald-50/30 py-10"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold text-emerald-900">Nông sản từ trang trại</h1><p className="mb-8 mt-2 text-slate-600">Sản phẩm đã được admin duyệt. Đăng nhập tài khoản retailer để đặt mua.</p><ApprovedProducts /></div></main>;
}
