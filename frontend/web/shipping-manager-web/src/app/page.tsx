'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login or dashboard based on auth state
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      if (role === 'SHIPPING_MANAGER') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-4">🚚</div>
        <h1 className="text-2xl font-bold text-gray-900">BICAP - Shipping Manager</h1>
        <p className="text-gray-500 mt-2">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
