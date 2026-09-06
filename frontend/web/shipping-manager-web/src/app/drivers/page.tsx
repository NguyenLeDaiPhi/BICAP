'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { driverApi, getErrorMessage } from '@/lib/api';

interface Driver {
  id: number;
  name: string;
  phone: string;
  license: string;
  citizenId: string;
  email?: string;
}

interface DriverFormData {
  name: string;
  phone: string;
  license: string;
  citizenId: string;
  email: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    phone: '',
    license: '',
    citizenId: '',
    email: '',
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await driverApi.getDrivers();
      setDrivers(response.data || []);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      if (editingDriver) {
        // Update existing driver
        await driverApi.updateDriver(editingDriver.id, formData);
      } else {
        // Create new driver
        await driverApi.createDriver(formData);
      }
      setShowModal(false);
      setEditingDriver(null);
      setFormData({ name: '', phone: '', license: '', citizenId: '', email: '' });
      fetchDrivers();
    } catch (err: any) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      license: driver.license,
      citizenId: driver.citizenId,
      email: driver.email || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài xế này?')) return;

    try {
      await driverApi.deleteDriver(id);
      fetchDrivers();
    } catch (err: any) {
      alert('Xóa thất bại: ' + getErrorMessage(err));
    }
  };

  const openAddModal = () => {
    setEditingDriver(null);
    setFormData({ name: '', phone: '', license: '', citizenId: '', email: '' });
    setSubmitError('');
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                ← Quay lại
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý tài xế</h1>
            </div>
            <button onClick={openAddModal} className="btn-primary">
              + Thêm tài xế
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={fetchDrivers} className="ml-4 underline hover:no-underline">
              Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Đang tải danh sách tài xế...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có tài xế nào.</p>
            <button onClick={openAddModal} className="mt-4 btn-primary">
              + Thêm tài xế đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👨‍✈️</span>
                  </div>
                  <div>
                    <h3 className="font-bold">{driver.name}</h3>
                    <p className="text-xs text-gray-500">ID: {driver.id}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Điện thoại:</span>
                    <span className="font-medium">{driver.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GPLX:</span>
                    <span className="font-medium">{driver.license || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CCCD:</span>
                    <span className="font-medium">{driver.citizenId || '-'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button onClick={() => handleEdit(driver)} className="btn-secondary flex-1 text-sm">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(driver.id)} className="btn-danger flex-1 text-sm">
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Driver Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingDriver ? 'Sửa thông tin tài xế' : 'Thêm tài xế mới'}
              </h2>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Họ tên *</label>
                  <input
                    type="text"
                    name="name"
                    className="input"
                    placeholder="VD: Nguyễn Văn A"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    className="input"
                    placeholder="VD: 0901234567"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="label">Số GPLX</label>
                  <input
                    type="text"
                    name="license"
                    className="input"
                    placeholder="VD: 01-123456789"
                    value={formData.license}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="label">Số CCCD *</label>
                  <input
                    type="text"
                    name="citizenId"
                    className="input"
                    placeholder="VD: 079123456789"
                    value={formData.citizenId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input"
                    placeholder="VD: taixe@bicap.vn"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
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
                    {submitting ? 'Đang xử lý...' : editingDriver ? 'Lưu thay đổi' : 'Thêm tài xế'}
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
