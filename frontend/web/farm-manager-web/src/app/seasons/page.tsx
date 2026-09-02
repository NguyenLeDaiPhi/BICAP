'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Season {
  id: number;
  name: string;
  productName: string;
  startDate: string;
  expectedHarvestDate: string;
  status: string;
  area: string;
  quantity: string;
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([
    {
      id: 1,
      name: 'Vụ lúa Đông Xuân 2026',
      productName: 'Lúa ST25',
      startDate: '2026-01-15',
      expectedHarvestDate: '2026-04-15',
      status: 'IN_PROGRESS',
      area: '5 ha',
      quantity: '25 tấn',
    },
    {
      id: 2,
      name: 'Vụ rau mùa hè 2026',
      productName: 'Rau muống',
      startDate: '2026-03-01',
      expectedHarvestDate: '2026-05-01',
      status: 'HARVESTED',
      area: '2 ha',
      quantity: '10 tấn',
    },
    {
      id: 3,
      name: 'Vụ đậu 2026',
      productName: 'Đậu xanh',
      startDate: '2026-02-01',
      expectedHarvestDate: '2026-04-20',
      status: 'PLANNED',
      area: '3 ha',
      quantity: '8 tấn',
    },
  ]);

  const [showModal, setShowModal] = useState(false);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNED': return { label: 'Kế hoạch', color: 'bg-blue-100 text-blue-700' };
      case 'IN_PROGRESS': return { label: 'Đang trồng', color: 'bg-yellow-100 text-yellow-700' };
      case 'HARVESTED': return { label: 'Đã thu hoạch', color: 'bg-green-100 text-green-700' };
      case 'EXPORTED': return { label: 'Đã xuất bán', color: 'bg-purple-100 text-purple-700' };
      case 'CANCELLED': return { label: 'Đã hủy', color: 'bg-red-100 text-red-700' };
      default: return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                ← Quay lại
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Mùa vụ</h1>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + Tạo mùa vụ mới
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seasons.map((season) => {
            const statusInfo = getStatusLabel(season.status);
            return (
              <div key={season.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{season.name}</h3>
                    <p className="text-sm text-gray-500">{season.productName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Diện tích:</span>
                    <span className="font-medium">{season.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sản lượng dự kiến:</span>
                    <span className="font-medium">{season.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bắt đầu:</span>
                    <span className="font-medium">{season.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dự kiến thu hoạch:</span>
                    <span className="font-medium">{season.expectedHarvestDate}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Link 
                    href={`/seasons/${season.id}`}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold mb-4">Tạo mùa vụ mới</h2>
              <form className="space-y-4">
                <div>
                  <label className="label">Tên mùa vụ</label>
                  <input type="text" className="input" placeholder="VD: Vụ lúa Đông Xuân 2027" />
                </div>
                <div>
                  <label className="label">Sản phẩm</label>
                  <select className="input">
                    <option value="">Chọn sản phẩm</option>
                    <option value="1">Lúa ST25</option>
                    <option value="2">Rau muống</option>
                    <option value="3">Đậu xanh</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Ngày bắt đầu</label>
                    <input type="date" className="input" />
                  </div>
                  <div>
                    <label className="label">Ngày thu hoạch dự kiến</label>
                    <input type="date" className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Diện tích (ha)</label>
                    <input type="number" className="input" placeholder="VD: 5" />
                  </div>
                  <div>
                    <label className="label">Sản lượng dự kiến (tấn)</label>
                    <input type="number" className="input" placeholder="VD: 25" />
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    Tạo mùa vụ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
