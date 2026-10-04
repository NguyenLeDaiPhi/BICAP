'use client';
import { useEffect,useState } from 'react';import Link from 'next/link';
import { orderApi,getErrorMessage } from '@/lib/api';
import { useRetailerSession,useApprovedProducts,readCart,saveCart,CartLine } from '@/lib/marketplace';
export default function CartPage(){const ready=useRetailerSession();const {products,loading,error}=useApprovedProducts(ready);const [cart,setCart]=useState<CartLine[]>([]);const [address,setAddress]=useState('');const [saving,setSaving]=useState(false);const [submitError,setSubmitError]=useState<string|null>(null);const [orderId,setOrderId]=useState<number|null>(null);
  useEffect(()=>{if(ready)setCart(readCart());},[ready]);
  const update=(lines:CartLine[])=>{setCart(lines);saveCart(lines);};
  const unavailable=cart.some(line=>{const p=products.find(p=>p.id===line.productId);return !p||line.quantity>p.quantity||line.quantity<1;});
  const total=cart.reduce((sum,line)=>sum+(products.find(p=>p.id===line.productId)?.price||0)*line.quantity,0);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();if(saving||unavailable||!cart.length)return;setSaving(true);setSubmitError(null);try{const r=await orderApi.createOrder({shippingAddress:address.trim(),items:cart.map(line=>({productId:line.productId,quantity:line.quantity}))});setOrderId(r.data.orderId);update([]);}catch(err){setSubmitError(getErrorMessage(err));}finally{setSaving(false);}};
  return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-4xl space-y-6 px-6 py-8"><Link href="/marketplace" className="text-emerald-700">← Tiếp tục chọn sản phẩm</Link><h1 className="text-3xl font-bold">Giỏ hàng retailer</h1>
    {orderId&&<div role="status" className="rounded-xl bg-emerald-50 p-5 text-emerald-900">Đã tạo đơn hàng #{orderId}, đang chờ trang trại xác nhận. <Link href="/orders" className="underline">Xem đơn hàng</Link></div>}
    {!ready||loading?<p>Đang tải giỏ hàng...</p>:error?<p role="alert" className="text-red-700">{error}</p>:cart.length===0?<p className="rounded-xl bg-white p-8">Giỏ hàng trống.</p>:<form onSubmit={submit}><fieldset disabled={saving} className="space-y-5">
      {cart.map(line=>{const p=products.find(p=>p.id===line.productId);return <div key={line.productId} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5"><div><h2 className="font-bold">{p?.name||'Sản phẩm #'+line.productId}</h2>{p?<p>{p.price.toLocaleString('vi-VN')}đ/{p.unit} · Hiện có {p.quantity} {p.unit}</p>:<p className="text-red-700">Sản phẩm đã ngừng bán hoặc chưa được duyệt.</p>}</div><div className="flex gap-3"><input aria-label={'Số lượng sản phẩm '+line.productId} type="number" min={1} max={p?.quantity} required value={line.quantity} className="input w-24" onChange={e=>update(cart.map(x=>x.productId===line.productId?{...x,quantity:Number(e.target.value)}:x))}/><button type="button" className="btn-secondary" onClick={()=>update(cart.filter(x=>x.productId!==line.productId))}>Xóa</button></div></div>;})}
      {unavailable&&<p role="alert" className="text-red-700">Vui lòng bỏ sản phẩm ngừng bán hoặc giảm số lượng vượt tồn kho trước khi đặt hàng.</p>}
      <label htmlFor="shipping-address" className="block font-semibold">Địa chỉ nhận hàng</label><textarea id="shipping-address" required maxLength={255} value={address} onChange={e=>setAddress(e.target.value)} className="input" rows={3}/>
      <p className="text-xl font-bold">Tổng tiền hàng: {total.toLocaleString('vi-VN')}đ</p>{submitError&&<p role="alert" className="text-red-700">{submitError}</p>}<button type="submit" disabled={saving||unavailable||!address.trim()} className="btn-primary disabled:opacity-50">{saving?'Đang đặt hàng...':'Đặt hàng'}</button>
    </fieldset></form>}
  </div></main>;
}
