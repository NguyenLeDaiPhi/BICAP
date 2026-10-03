'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { farmProductionApi, getErrorMessage } from '@/lib/api';

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

interface SeasonFormData {
  name: string;
  productName: string;
  startDate: string;
  expectedHarvestDate: string;
  area: string;
  quantity: string;
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SeasonFormData>({
    name: '',
    productName: '',
    startDate: '',
    expectedHarvestDate: '',
    area: '',
    quantity: '',
  });

  // Lấy danh sách mùa vụ từ API
  const fetchSeasons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await farmProductionApi.getSeasons();
      if (response.data) {
        // Transform dữ liệu từ API - hỗ trợ cả array và wrapped response
        const items = Array.isArray(response.data) ? response.data : (response.data.data || []);
        const transformedSeasons: Season[] = items.map((item: any) => ({
          id: item.id,
          name: item.name || item.batchCode || `Mùa vụ #${item.id}`,
          productName: item.productType || item.productName || 'Chưa xác định',
          startDate: item.startDate || item.start_date || '',
          expectedHarvestDate: item.endDate || item.end_date || '',
          status: item.status || 'PLANNING',
          area: item.area ? `${item.area} ha` : (item.farmArea ? `${item.farmArea} ha` : 'Chưa xác định'),
          quantity: item.quantity ? `${item.quantity} tấn` : 'Chưa xác định',
        }));
        setSeasons(transformedSeasons);
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy danh sách mùa vụ:', err);
      // Không dùng mock data nữa - hiển thị lỗi cho user
      setSeasons([]);
      setError('Không thể kết nối server. Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Chuyển đổi form data sang format backend yêu cầu
      const payload = {
        name: formData.name,
        productType: formData.productName,
        startDate: formData.startDate,
        endDate: formData.expectedHarvestDate,
        area: formData.area ? parseFloat(formData.area) : null,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        status: 'PLANNING',
      };
      
      // Gọi API tạo mùa vụ
      await farmProductionApi.createSeason(payload);
      
      // Đóng modal và refresh danh sách
      setShowModal(false);
      setFormData({
        name: '',
        productName: '',
        startDate: '',
        expectedHarvestDate: '',
        area: '',
        quantity: '',
      });
      fetchSeasons();
      alert('Tạo mùa vụ thành công!');
    } catch (err: any) {
      console.error('Lỗi khi tạo mùa vụ:', err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      alert('Lỗi: ' + errorMsg);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNING': return { label: 'Kế hoạch', color: 'bg-blue-100 text-blue-700' };
      case 'ACTIVE': return { label: 'Đang trồng', color: 'bg-yellow-100 text-yellow-700' };
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
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        ) : seasons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có mùa vụ nào. Hãy tạo mùa vụ đầu tiên!</p>
          </div>
        ) : (
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
                      <span className="font-medium">{season.startDate || 'Chưa xác định'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dự kiến thu hoạch:</span>
                      <span className="font-medium">{season.expectedHarvestDate || 'Chưa xác định'}</span>
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
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold mb-4">Tạo mùa vụ mới</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Tên mùa vụ *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="VD: Vụ lúa Đông Xuân 2027"
                    required
                  />
                </div>
                <div>
                  <label className="label">Loại sản phẩm *</label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="VD: Lúa ST25, Rau muống"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Ngày bắt đầu *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Ngày thu hoạch dự kiến *</label>
                    <input
                      type="date"
                      name="expectedHarvestDate"
                      value={formData.expectedHarvestDate}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Diện tích (ha)</label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="VD: 5"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="label">Sản lượng dự kiến (tấn)</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="VD: 25"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setError(null);
                    }}
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
