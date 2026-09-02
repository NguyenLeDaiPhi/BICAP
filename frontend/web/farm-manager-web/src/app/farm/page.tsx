'use client';

import { useState } from 'react';
import Link from 'next/link';
import { farmApi } from '@/lib/api';

export default function FarmPage() {
  const [farm, setFarm] = useState({
    id: 1,
    name: 'Trang trại XYZ',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    ownerName: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'farm@example.com',
    licenseNumber: 'DL-123456',
    status: 'APPROVED',
    area: '10 ha',
    description: 'Trang trại chuyên canh tác rau mầm organic',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(farm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call API to update farm
    setFarm(formData);
    setIsEditing(false);
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
              <h1 className="text-2xl font-bold text-gray-900">Thông tin trang trại</h1>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-primary">
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-xl font-bold mb-6">Chỉnh sửa thông tin trang trại</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Tên trang trại</label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  className="input"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    className="input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="label">Diện tích</label>
                <input
                  type="text"
                  name="area"
                  className="input"
                  value={formData.area}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Mô tả</label>
                <textarea
                  name="description"
                  className="input"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button type="submit" className="btn-primary">
                Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(farm);
                }}
                className="btn-secondary"
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{farm.name}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  farm.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  farm.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {farm.status === 'APPROVED' ? 'Đã duyệt' :
                   farm.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Chủ trang trại</p>
                <p className="font-medium">{farm.ownerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-medium">{farm.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{farm.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Giấy phép</p>
                <p className="font-medium">{farm.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Diện tích</p>
                <p className="font-medium">{farm.area}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="font-medium">{farm.address}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Mô tả</p>
                <p className="font-medium">{farm.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Certificates */}
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-4">Chứng nhận</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium">VietGAP</p>
                  <p className="text-sm text-gray-500">Hết hạn: 01/01/2027</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Hợp lệ</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium">Organic</p>
                  <p className="text-sm text-gray-500">Hết hạn: 01/06/2027</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Hợp lệ</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
