'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { useRetailerSession,useApprovedProducts,readCart,saveCart,MarketProduct } from '@/lib/marketplace';
export default function MarketplacePage(){
  const ready=useRetailerSession();const {products,loading,error}=useApprovedProducts(ready);
  const [search,setSearch]=useState('');const [selected,setSelected]=useState<number|null>(null);const [quantities,setQuantities]=useState<Record<number,number>>({});const [cartCount,setCartCount]=useState(0);const [message,setMessage]=useState<string|null>(null);
  useEffect(()=>{if(ready){setSelected(Number(new URLSearchParams(window.location.search).get('productId')) || null);setCartCount(readCart().reduce((n,x)=>n+x.quantity,0));}},[ready]);
  const add=(product:MarketProduct)=>{const quantity=quantities[product.id] ?? 1;const cart=readCart();const existing=cart.find(x=>x.productId===product.id);if(!Number.isInteger(quantity)||quantity<1 || quantity+(existing?.quantity||0)>product.quantity){setMessage('Số lượng mua phải từ 1 đến số lượng hiện có.');return;}if(existing)existing.quantity+=quantity;else cart.push({productId:product.id,quantity});saveCart(cart);setCartCount(cart.reduce((n,x)=>n+x.quantity,0));setMessage('Đã thêm “'+product.name+'” vào giỏ hàng.');};
  const visible=products.filter(p=>(p.name+' '+(p.farmName||'')).toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  return <div className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5"><Link href="/dashboard" className="text-emerald-700">← Bảng điều khiển</Link><h1 className="text-2xl font-bold">Sàn giao dịch nông sản</h1><div className="flex gap-4"><Link href="/orders">Đơn hàng</Link><Link href="/cart" className="font-bold text-emerald-700">Giỏ hàng ({cartCount})</Link></div></div></header>
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-8"><p className="text-slate-500">Sản phẩm đã được admin duyệt, sẵn sàng để retailer đặt mua.</p><input aria-label="Tìm sản phẩm" type="search" placeholder="Tìm sản phẩm, trang trại..." value={search} onChange={e=>setSearch(e.target.value)} className="input" />
      {message&&<p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">{message}</p>}
      {!ready||loading?<p role="status">Đang tải sản phẩm...</p>:error?<p role="alert" className="text-red-700">{error}</p>:<>
        {selected&&!products.some(p=>p.id===selected)&&<p role="alert">Sản phẩm bạn chọn chưa được duyệt hoặc đã ngừng bán.</p>}
        {visible.length===0?<p className="rounded-xl bg-white p-8 text-center">Chưa có sản phẩm phù hợp để mua.</p>:<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visible.map(p=><article key={p.id} className={'rounded-2xl bg-white p-5 shadow-sm '+(p.id===selected?'ring-2 ring-emerald-600':'')}>
          <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-emerald-50">{p.imageUrl?<img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover"/>:<span className="text-5xl">🌾</span>}</div>
          <h2 className="text-xl font-bold">{p.name}</h2><p className="mt-1 text-sm text-slate-500">{p.farmName || 'Trang trại #'+p.farmId}</p><p className="my-3 text-sm text-slate-600">{p.description || p.category}</p><p className="font-bold text-emerald-800">{p.price.toLocaleString('vi-VN')}đ/{p.unit}</p><p className="my-3 text-sm">Hiện có: {p.quantity} {p.unit}</p>
          <div className="flex gap-3"><input type="number" aria-label={'Số lượng '+p.name} min={1} max={p.quantity} value={quantities[p.id]??1} onChange={e=>setQuantities(q=>({...q,[p.id]:Number(e.target.value)}))} className="input w-24"/><button type="button" onClick={()=>add(p)} disabled={p.quantity<=0} className="btn-primary flex-1 disabled:opacity-50">{p.quantity>0?'Thêm vào giỏ':'Hết hàng'}</button></div>
        </article>)}</div>}
      </>}
    </main></div>;
}
