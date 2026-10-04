'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productApi, getErrorMessage } from '@/lib/api';
interface Product { id: number; name: string; description?: string; category?: string; price: number; unit: string; quantity: number; imageUrl?: string; farmName?: string; farmId?: number; status: string; }
const retailerUrl = process.env.NEXT_PUBLIC_RETAILER_URL || 'http://localhost:3000';
export default function ApprovedProducts({ category = 'ALL', search = '', limit }: { category?: string; search?: string; limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sort, setSort] = useState('newest');
  useEffect(() => {
    let active = true; let inFlight = false;
    const load = async () => {
      if (inFlight) return; inFlight = true;
      try {
        const response = await productApi.getProducts();
        if (active) { setProducts(response.data.filter((p: Product) => p.status === 'APPROVED')); setError(null); }
      } catch (err) { if (active) { setError(getErrorMessage(err)); setProducts([]); } }
      finally { inFlight = false; if (active) setLoading(false); }
    };
    const onFocus = () => { if (!document.hidden) void load(); };
    void load();
    const timer = setInterval(onFocus, 15000);
    window.addEventListener('focus', onFocus); document.addEventListener('visibilitychange', onFocus);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onFocus); };
  }, []);
  const normalizeCategory = (value?: string) => ({ 'Lúa gạo': 'RICE', 'Rau xanh': 'VEGETABLE', 'Trái cây': 'FRUIT' } as Record<string,string>)[value || ''] || value;
  const visible = products.filter(p => (category === 'ALL' || normalizeCategory(p.category) === category) && (selectedCategory === 'ALL' || p.category === selectedCategory) && (p.name + ' ' + (p.farmName || '')).toLocaleLowerCase('vi').includes((search || keyword).toLocaleLowerCase('vi')));
  if (sort === 'price-asc') visible.sort((a,b) => a.price-b.price);
  if (sort === 'price-desc') visible.sort((a,b) => b.price-a.price);
  const displayed = limit ? visible.slice(0,limit) : visible;
  return <div>
    {!limit && <div className="mb-6 flex flex-wrap gap-3">
      <input aria-label="Tìm sản phẩm" type="search" placeholder="Tìm tên sản phẩm, trang trại..." value={keyword} onChange={e=>setKeyword(e.target.value)} className="input flex-1" />
      <select aria-label="Danh mục" className="input w-auto" value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)}><option value="ALL">Tất cả danh mục</option>{Array.from(new Set(products.map(p=>p.category).filter(Boolean))).map(c=><option key={c} value={c}>{c}</option>)}</select>
      <select aria-label="Sắp xếp" className="input w-auto" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Mới nhất</option><option value="price-asc">Giá tăng dần</option><option value="price-desc">Giá giảm dần</option></select>
    </div>}
    {loading ? <p role="status" className="py-12 text-center">Đang tải sản phẩm...</p> : error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p> : displayed.length === 0 ? <p className="rounded-xl bg-white p-8 text-center text-slate-500">{products.length ? 'Không có sản phẩm phù hợp.' : 'Chưa có sản phẩm được duyệt để bán.'}</p> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {displayed.map(p=><article key={p.id} className="card-product overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex h-44 items-center justify-center bg-emerald-50">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" /> : <span aria-label="Chưa có ảnh" className="text-5xl">🌾</span>}</div>
        <div className="space-y-3 p-5"><p className="text-xs text-emerald-700">{p.farmName || 'Trang trại #' + p.farmId}</p><h3 className="text-lg font-bold text-slate-900">{p.name}</h3><p className="line-clamp-2 text-sm text-slate-500">{p.description || p.category}</p>
          <p className="font-bold text-emerald-800">{p.price.toLocaleString('vi-VN')}đ/{p.unit}</p><p className="text-sm text-slate-500">Số lượng: {p.quantity} {p.unit}</p>
          {p.quantity > 0 ? <a href={retailerUrl + '/marketplace?productId=' + p.id} className="btn-primary block text-center">Mua với tài khoản retailer</a> : <p className="text-sm text-slate-500">Hết hàng</p>}
        </div>
      </article>)}
    </div>}
  </div>;
}
