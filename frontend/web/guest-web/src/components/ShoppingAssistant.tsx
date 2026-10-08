'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Sparkles, ArrowRight } from 'lucide-react';
interface Product { id: number; name: string; price: number; unit: string; quantity: number; imageUrl?: string; status: string; }
interface Filters { quantity?: number | null; unit?: string | null; maxUnitPrice?: number | null; maxTotalPrice?: number | null; }
interface Message { role: 'user' | 'assistant'; content: string; products?: Product[]; filters?: Filters; error?: boolean; }
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const retailerUrl = process.env.NEXT_PUBLIC_RETAILER_URL || 'http://localhost:3000';
const money = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';
export default function ShoppingAssistant({ retailer = false }: { retailer?: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => { scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading, open]);
  useEffect(() => { if (!loading) { setSlow(false); return; } const timer = setTimeout(() => setSlow(true), 15000); return () => clearTimeout(timer); }, [loading]);
  useEffect(() => () => controller.current?.abort(), []);
  const send = async (suggestion?: string) => {
    const message = (suggestion || input).trim();
    if (!message || loading || message.length > 1200) return;
    const history = messages.filter(m => !m.error).slice(-8).map(m => ({ role: m.role, content: m.content.slice(0, 1200) }));
    setMessages(previous => [...previous, { role: 'user', content: message }]); setInput(''); setLoading(true);
    const abort = new AbortController(); controller.current = abort;
    const timer = setTimeout(() => abort.abort('timeout'), 55000);
    try {
      const response = await fetch(apiUrl + '/api/assistant/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }), signal: abort.signal });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Trợ lý AI tạm thời chưa sẵn sàng. Vui lòng thử lại.');
      if (!Array.isArray(data?.products) || typeof data?.reply !== 'string') throw new Error('Chưa đọc được kết quả tìm kiếm. Vui lòng thử lại.');
      setMessages(previous => [...previous, { role: 'assistant', content: data.reply, products: data.products.filter((p: Product) => p.status === 'APPROVED' && p.quantity > 0), filters: data.filters }]);
    } catch (error) {
      setMessages(previous => [...previous, { role: 'assistant', content: abort.signal.aborted ? (abort.signal.reason === 'cancelled' ? 'Đã dừng chờ kết quả. Bạn có thể xem danh mục sản phẩm hoặc thử lại sau ít giây.' : 'AI chưa trả kết quả trong 55 giây. Bạn có thể thử lại hoặc dùng trang danh mục sản phẩm.') : error instanceof Error ? error.message : 'Chưa kết nối được trợ lý AI.', error: true }]);
    } finally { clearTimeout(timer); controller.current = null; setLoading(false); }
  };
  return <aside aria-label="Trợ lý tìm sản phẩm" className="fixed bottom-4 right-4 z-50">
    {open ? <section role="dialog" aria-label="Tìm sản phẩm cùng AI" className="flex h-[min(650px,80dvh)] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl">
      <header className="flex items-center gap-3 bg-emerald-800 px-4 py-3 text-white">
        <Sparkles size={22} aria-hidden="true" /><div className="flex-1"><h2 className="font-bold">Tìm sản phẩm cùng AI</h2><p className="text-xs text-emerald-100">Theo nhu cầu, ngân sách và số lượng của bạn</p></div>
        <button type="button" aria-label="Đóng trợ lý" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-emerald-700"><X size={20} /></button>
      </header>
      <div ref={scroll} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-4 overflow-y-auto p-4">
        {!messages.length && <div className="space-y-3"><p className="rounded-xl bg-emerald-50 p-3 text-sm text-slate-700">Bạn đang cần nông sản gì? Hãy cho tôi biết loại sản phẩm, số lượng và ngân sách để tìm trong danh mục đang bán.</p>
          {['Tìm gạo ST25 dưới 20 nghìn/kg', 'Tôi cần 10 kg gạo, tổng dưới 200 nghìn', 'Tìm rau còn hàng, giá rẻ nhất'].map(text => <button type="button" key={text} onClick={() => void send(text)} className="block w-full rounded-xl border border-emerald-200 p-3 text-left text-sm text-emerald-800 hover:bg-emerald-50">{text}</button>)}
        </div>}
        {messages.map((message, index) => <div key={index} className={message.role === 'user' ? 'ml-8' : 'mr-2'}>
          <p className={'whitespace-pre-wrap rounded-xl p-3 text-sm ' + (message.role === 'user' ? 'bg-emerald-700 text-white' : message.error ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-700')}>{message.content}</p>
          {message.products?.length ? <div className="mt-2 space-y-2">
            {message.filters && <div className="flex flex-wrap gap-1 text-xs text-slate-600">
              {message.filters.quantity != null && <span className="rounded bg-emerald-50 p-1">Cần {message.filters.quantity} {message.filters.unit}</span>}
              {message.filters.maxUnitPrice != null && <span className="rounded bg-emerald-50 p-1">Giá tối đa {money(message.filters.maxUnitPrice)}/{message.filters.unit || 'đơn vị'}</span>}
              {message.filters.maxTotalPrice != null && <span className="rounded bg-emerald-50 p-1">Tổng tối đa {money(message.filters.maxTotalPrice)}</span>}
            </div>}
            {message.products.map(product => <article key={product.id} className="rounded-xl border border-emerald-100 p-3">
              <div className="flex gap-3">{product.imageUrl && <img src={product.imageUrl} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />}<div><h3 className="text-sm font-semibold text-slate-900">{product.name}</h3><p className="text-sm font-bold text-emerald-800">{money(product.price)}/{product.unit}</p><p className="text-xs text-slate-500">Còn {product.quantity} {product.unit}</p></div></div>
              <a href={(retailer ? '' : retailerUrl) + '/marketplace?productId=' + product.id} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">{retailer ? 'Xem sản phẩm' : 'Mua với tài khoản retailer'}<ArrowRight size={16} aria-hidden="true" /></a>
            </article>)}
          </div> : null}
          {message.error && <a href={retailer ? '/marketplace' : '/products'} className="mt-2 inline-block text-sm text-emerald-700 underline">Mở danh mục sản phẩm</a>}
        </div>)}
        {loading && <div className="space-y-2"><p role="status" className="text-sm text-emerald-700">{slow ? 'Lần tìm đầu có thể mất khoảng 30–45 giây để chuẩn bị AI. Bạn có thể dừng chờ và xem danh mục sản phẩm.' : 'AI đang tìm sản phẩm…'}</p><button type="button" onClick={() => controller.current?.abort('cancelled')} className="text-sm text-emerald-700 underline">Dừng chờ</button></div>}
      </div>
      <footer className="border-t p-3">
        <form onSubmit={event => { event.preventDefault(); void send(); }} className="flex items-end gap-2">
          <label htmlFor="assistant-message" className="sr-only">Nhu cầu tìm sản phẩm</label><textarea id="assistant-message" value={input} onChange={event => setInput(event.target.value)} maxLength={1200} rows={2} placeholder="Ví dụ: 10 kg gạo, ngân sách 200.000đ" disabled={loading} className="min-w-0 flex-1 resize-none rounded-xl border border-slate-300 p-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none disabled:bg-slate-50" />
          <button type="submit" disabled={loading || !input.trim()} aria-label="Gửi yêu cầu" className="rounded-xl bg-emerald-700 p-3 text-white hover:bg-emerald-800 disabled:opacity-40"><Send size={18} /></button>
        </form>
        <button type="button" disabled={loading || !messages.length} onClick={() => setMessages([])} className="mt-2 text-xs text-slate-500 underline disabled:opacity-40">Bắt đầu tìm kiếm mới</button>
      </footer>
    </section> : <button type="button" aria-expanded={open} onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-3 font-semibold text-white shadow-lg hover:bg-emerald-700"><MessageCircle size={22} aria-hidden="true" />Hỏi AI tìm sản phẩm</button>}
  </aside>;
}
