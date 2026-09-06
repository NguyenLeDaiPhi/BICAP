'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { vehicleApi, getErrorMessage } from '@/lib/api';

interface Vehicle {
  id: number;
  plate: string;
  type: string;
  status: string;
}

interface VehicleFormData {
  plate: string;
  type: string;
  status: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const [formData, setFormData] = useState<VehicleFormData>({
    plate: '',
    type: '',
    status: 'AVAILABLE',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await vehicleApi.getVehicles();
      setVehicles(response.data || []);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      if (editingVehicle) {
        // Update existing vehicle
        await vehicleApi.updateVehicle(editingVehicle.id, formData);
      } else {
        // Create new vehicle
        await vehicleApi.createVehicle(formData);
      }
      setShowModal(false);
      setEditingVehicle(null);
      setFormData({ plate: '', type: '', status: 'AVAILABLE' });
      fetchVehicles();
    } catch (err: any) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate,
      type: vehicle.type,
      status: vehicle.status,
    });
    setSubmitError('');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) return;

    try {
      await vehicleApi.deleteVehicle(id);
      fetchVehicles();
    } catch (err: any) {
      alert('Xóa thất bại: ' + getErrorMessage(err));
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({ plate: '', type: '', status: 'AVAILABLE' });
    setSubmitError('');
    setShowModal(true);
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      AVAILABLE: { label: 'Sẵn sàng', color: 'bg-green-100 text-green-700' },
      BUSY: { label: 'Đang bận', color: 'bg-orange-100 text-orange-700' },
      MAINTENANCE: { label: 'Bảo dưỡng', color: 'bg-yellow-100 text-yellow-700' },
      INACTIVE: { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-700' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const getTypeIcon = (type: string) => {
    const typeMap: Record<string, string> = {
      'REEFER': '🚛',
      'FREEZER': '❄️',
      'TRUCK': '🚚',
      'VAN': '🚐',
      'DEFAULT': '🚗',
    };
    return typeMap[type] || typeMap['DEFAULT'];
  };

  const filteredVehicles = filter === 'ALL' ? vehicles : vehicles.filter(v => v.status === filter);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                ← Quay lại
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý phương tiện</h1>
            </div>
            <button onClick={openAddModal} className="btn-primary">
              + Thêm phương tiện
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={fetchVehicles} className="ml-4 underline hover:no-underline">
              Thử lại
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card p-4 text-center">
            <p className="text-3xl font-black text-slate-900">{vehicles.length}</p>
            <p className="text-xs text-slate-500 uppercase">Tổng xe</p>
          </div>
          <div className="card p-4 text-center border border-green-100 bg-green-50/40">
            <p className="text-3xl font-black text-green-800">
              {vehicles.filter(v => v.status === 'AVAILABLE').length}
            </p>
            <p className="text-xs text-green-700 uppercase">Sẵn sàng</p>
          </div>
          <div className="card p-4 text-center border border-orange-100 bg-orange-50/40">
            <p className="text-3xl font-black text-orange-800">
              {vehicles.filter(v => v.status === 'BUSY').length}
            </p>
            <p className="text-xs text-orange-700 uppercase">Đang bận</p>
          </div>
          <div className="card p-4 text-center border border-yellow-100 bg-yellow-50/40">
            <p className="text-3xl font-black text-yellow-800">
              {vehicles.filter(v => v.status === 'MAINTENANCE').length}
            </p>
            <p className="text-xs text-yellow-700 uppercase">Bảo dưỡng</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['ALL', 'AVAILABLE', 'BUSY', 'MAINTENANCE', 'INACTIVE'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === status ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'Tất cả' : getStatusInfo(status).label}
            </button>
          ))}
        </div>

        {/* Vehicles List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Đang tải danh sách phương tiện...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có phương tiện nào.</p>
            <button onClick={openAddModal} className="mt-4 btn-primary">
              + Thêm phương tiện đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => {
              const statusInfo = getStatusInfo(vehicle.status);
              return (
                <div key={vehicle.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-3xl">
                        {getTypeIcon(vehicle.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{vehicle.plate}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Loại xe:</span>
                      <span className="font-medium">{vehicle.type || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID:</span>
                      <span className="font-medium">#{vehicle.id}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button onClick={() => handleEdit(vehicle)} className="btn-secondary flex-1 text-sm">
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(vehicle.id)} className="btn-danger flex-1 text-sm">
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingVehicle ? 'Sửa thông tin phương tiện' : 'Thêm phương tiện mới'}
            </h2>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Biển số xe *</label>
                <input
                  type="text"
                  name="plate"
                  className="input"
                  placeholder="VD: 65A-12345"
                  value={formData.plate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="label">Loại xe</label>
                <select
                  name="type"
                  className="input"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="">-- Chọn loại xe --</option>
                  <option value="REEFER">Xe lạnh (Reefer)</option>
                  <option value="FREEZER">Xe đông lạnh (Freezer)</option>
                  <option value="TRUCK">Xe tải thường</option>
                  <option value="VAN">Xe van</option>
                </select>
              </div>

              <div>
                <label className="label">Trạng thái</label>
                <select
                  name="status"
                  className="input"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="AVAILABLE">Sẵn sàng</option>
                  <option value="BUSY">Đang bận</option>
                  <option value="MAINTENANCE">Bảo dưỡng</option>
                  <option value="INACTIVE">Không hoạt động</option>
                </select>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Đang xử lý...' : editingVehicle ? 'Lưu thay đổi' : 'Thêm phương tiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
