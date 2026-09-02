'use client';

import { useState } from 'react';
import { traceApi } from '@/lib/api';

interface TraceabilityData {
  product?: {
    name: string;
    description: string;
    origin: string;
    certification: string;
  };
  farm?: {
    name: string;
    address: string;
    ownerName: string;
    licenseNumber: string;
  };
  season?: {
    seasonName: string;
    startDate: string;
    expectedHarvestDate: string;
    actualHarvestDate: string;
    status: string;
  };
  farmingProcesses?: Array<{
    processType: string;
    description: string;
    startTime: string;
    endTime: string;
  }>;
  iotSummary?: {
    avgTemperature: number;
    avgHumidity: number;
    avgPh: number;
  };
  blockchain?: {
    transactionHash: string;
    isValid: boolean;
  };
}

export default function TracePage() {
  const [traceCode, setTraceCode] = useState('');
  const [data, setData] = useState<TraceabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await traceApi.getTraceability(traceCode);
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy thông tin truy xuất');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">BICAP</h1>
              <p className="text-sm opacity-80">Truy xuất nguồn gốc nông sản</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔗</span>
              <span className="font-medium">Blockchain Verified</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Traceability Results */}
        {data && (
          <div className="space-y-6">
            {/* Product Info */}
            {data.product && (
              <div className="card">
                <h3 className="text-lg font-bold text-primary mb-4">Thông tin nông sản</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tên sản phẩm</p>
                    <p className="font-medium">{data.product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Xuất xứ</p>
                    <p className="font-medium">{data.product.origin}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Mô tả</p>
                    <p>{data.product.description}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Chứng nhận</p>
                    <p className="font-medium text-green-600">{data.product.certification || 'Đã chứng nhận'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Farm Info */}
            {data.farm && (
              <div className="card">
                <h3 className="text-lg font-bold text-primary mb-4">Thông tin trang trại</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tên trang trại</p>
                    <p className="font-medium">{data.farm.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium">{data.farm.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Chủ trang trại</p>
                    <p className="font-medium">{data.farm.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giấy phép</p>
                    <p className="font-medium">{data.farm.licenseNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain Verification */}
            {data.blockchain && (
              <div className="card bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✓</span>
                  <div>
                    <h3 className="text-lg font-bold text-green-700">Đã xác thực Blockchain</h3>
                    <p className="text-sm text-green-600">Transaction Hash: {data.blockchain.transactionHash}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!data && !loading && !error && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg">Nhập mã truy xuất để xem thông tin nông sản</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-bold text-lg mb-2">BICAP</p>
          <p className="text-sm text-gray-400">
            Tích hợp Blockchain trong sản xuất nông sản sạch
          </p>
        </div>
      </footer>
    </div>
  );
}
