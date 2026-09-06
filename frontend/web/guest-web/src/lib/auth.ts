'use client';

import { useEffect, useState } from 'react';

interface AuthUser {
  email: string;
  role: string;
  username?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isRetailer = user?.role === 'RETAILER';
  const isLoggedIn = !!token;

  return { user, loading, isRetailer, isLoggedIn };
}

export function checkIsRetailer(): boolean {
  if (typeof window === 'undefined') return false;
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  return role === 'RETAILER' && !!token;
}

export function checkIsLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}
