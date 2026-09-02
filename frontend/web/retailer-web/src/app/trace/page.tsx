'use client';

import { useState } from 'react';
import Link from 'next/link';
import { traceApi } from '@/lib/api';

export default function TracePage() {
  const [traceCode, setTraceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await traceApi.getTraceability(traceCode);
      console.log('Trace result:', response.data.data);
      // Handle result
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              ← Quay lại
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Truy xuất nguồn gốc</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Nhập mã truy xuất</h2>
          <form onSubmit={handleTrace} className="flex gap-4">
            <input
              type="text"
              className="input flex-1"
              value={traceCode}
              onChange={(e) => setTraceCode(e.target.value)}
              placeholder="VD: BICAP-TRC-2026-000001"
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang tìm...' : 'Truy xuất'}
            </button>
          </form>
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Hướng dẫn</h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-medium text-gray-900">Quét mã QR trên sản phẩm</p>
                <p className="text-sm">Sử dụng ứng dụng BICAP để quét mã QR trên bao bì sản phẩm</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-medium text-gray-900">Nhập mã truy xuất</p>
                <p className="text-sm">Nhập mã BICAP-TRC-XXXXXX vào ô trên để xem thông tin</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-medium text-gray-900">Xem thông tin</p>
                <p className="text-sm">Xem chi tiết về nguồn gốc, quá trình sản xuất và Blockchain</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
