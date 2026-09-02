'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Driver {
  id: number;
  name: string;
  phone: string;
  licenseNumber: string;
  status: string;
  vehiclePlate: string;
}

export default function DriversPage() {
  const [drivers] = useState<Driver[]>([
    { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', licenseNumber: 'DL-123456', status: 'AVAILABLE', vehiclePlate: '65A-12345' },
    { id: 2, name: 'Trần Văn B', phone: '0902345678', licenseNumber: 'DL-234567', status: 'BUSY', vehiclePlate: '68B-67890' },
    { id: 3, name: 'Lê Văn C', phone: '0903456789', licenseNumber: 'DL-345678', status: 'AVAILABLE', vehiclePlate: '66C-11111' },
    { id: 4, name: 'Phạm Văn D', phone: '0904567890', licenseNumber: 'DL-456789', status: 'OFFLINE', vehiclePlate: '67D-22222' },
  ]);

  const [showModal, setShowModal] = useState(false);

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      AVAILABLE: { label: 'Sẵn sàng', color: 'bg-green-100 text-green-700' },
      BUSY: { label: 'Đang bận', color: 'bg-orange-100 text-orange-700' },
      OFFLINE: { label: 'Ngoại tuyến', color: 'bg-gray-100 text-gray-700' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
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
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + Thêm tài xế
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {drivers.map((driver) => {
            const statusInfo = getStatusInfo(driver.status);
            return (
              <div key={driver.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👨‍✈️</span>
                  </div>
                  <div>
                    <h3 className="font-bold">{driver.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Điện thoại:</span>
                    <span className="font-medium">{driver.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GPLX:</span>
                    <span className="font-medium">{driver.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Xe:</span>
                    <span className="font-medium">{driver.vehiclePlate}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button className="btn-secondary flex-1 text-sm">Sửa</button>
                  <button className="btn-secondary flex-1 text-sm">Xem lịch sử</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Driver Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold mb-4">Thêm tài xế mới</h2>
              <form className="space-y-4">
                <div>
                  <label className="label">Họ tên</label>
                  <input type="text" className="input" placeholder="VD: Nguyễn Văn A" />
                </div>
                <div>
                  <label className="label">Số điện thoại</label>
                  <input type="tel" className="input" placeholder="VD: 0901234567" />
                </div>
                <div>
                  <label className="label">Số GPLX</label>
                  <input type="text" className="input" placeholder="VD: DL-123456" />
                </div>
                <div>
                  <label className="label">Biển số xe</label>
                  <input type="text" className="input" placeholder="VD: 65A-12345" />
                </div>
                <div className="flex gap-4 justify-end pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    Thêm tài xế
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
