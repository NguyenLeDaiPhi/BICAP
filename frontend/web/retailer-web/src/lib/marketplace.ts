'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi, getErrorMessage } from '@/lib/api';
export interface MarketProduct { id: number; name: string; category?: string; description?: string; farmName?: string; farmId?: number; price: number; unit: string; quantity: number; imageUrl?: string; status: string; }
export interface CartLine { productId: number; quantity: number; }
export function useRetailerSession() {
  const router = useRouter(); const [ready,setReady] = useState(false);
  useEffect(()=>{const role=localStorage.getItem('role'); if(!localStorage.getItem('token') || !['RETAILER','ROLE_RETAILER'].includes(role || '')) { router.replace('/login?next=' + encodeURIComponent(window.location.pathname + window.location.search)); return; } setReady(true);},[router]);
  return ready;
}
function cartKey() { try { const user=JSON.parse(localStorage.getItem('user') || '{}'); return 'bicap.retailer.cart.' + (user.email || user.username || 'current'); } catch { return 'bicap.retailer.cart.current'; } }
export function readCart(): CartLine[] { try { const data=JSON.parse(localStorage.getItem(cartKey()) || '[]'); return Array.isArray(data) ? data.filter((x:CartLine)=>Number.isInteger(x.productId) && x.productId>0 && Number.isInteger(x.quantity) && x.quantity>0) : []; } catch { return []; } }
export function saveCart(lines:CartLine[]) { localStorage.setItem(cartKey(),JSON.stringify(lines)); }
export function useApprovedProducts(enabled:boolean) {
  const [products,setProducts]=useState<MarketProduct[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  useEffect(()=>{if(!enabled)return; let active=true, inFlight=false;
    const load=async()=>{if(inFlight)return; inFlight=true; try { const r=await productApi.getProducts(); if(active){setProducts(r.data.filter((p:MarketProduct)=>p.status==='APPROVED'));setError(null);} } catch(err){if(active){setError(getErrorMessage(err));setProducts([]);}} finally{inFlight=false;if(active)setLoading(false);} };
    const refresh=()=>{if(!document.hidden)void load();}; void load(); const timer=setInterval(refresh,15000); window.addEventListener('focus',refresh); document.addEventListener('visibilitychange',refresh);
    return ()=>{active=false;clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[enabled]); return {products,loading,error};
}
