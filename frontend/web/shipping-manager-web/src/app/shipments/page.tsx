'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Shipment {
  id: number;
  code: string;
  fromAddress: string;
  toAddress: string;
  orderId: string;
  driverName: string;
  vehiclePlate: string;
  status: string;
  pickupTime: string;
  deliveryTime: string;
}

export default function ShipmentsPage() {
  const [shipments] = useState<Shipment[]>([
    { id: 1, code: 'SHP-2026-001', fromAddress: 'Trang trại ABC, Cần Thơ', toAddress: 'Siêu thị XYZ, TP.HCM', orderId: 'ORD-001', driverName: 'Nguyễn Văn A', vehiclePlate: '65A-12345', status: 'IN_TRANSIT', pickupTime: '2026-09-01 08:00', deliveryTime: '2026-09-01 14:00' },
    { id: 2, code: 'SHP-2026-002', fromAddress: 'Trang trại DEF, An Giang', toAddress: 'Cửa hàng 123, Cần Thơ', orderId: 'ORD-002', driverName: 'Chưa phân công', vehiclePlate: '-', status: 'ASSIGNED', pickupTime: '2026-09-02 07:00', deliveryTime: '2026-09-02 11:00' },
    { id: 3, code: 'SHP-2026-003', fromAddress: 'Trang trại GHI, Kiên Giang', toAddress: 'Nhà hàng ABC, Rạch Giá', orderId: 'ORD-003', driverName: 'Trần Văn B', vehiclePlate: '68B-67890', status: 'DELIVERED', pickupTime: '2026-08-30 06:00', deliveryTime: '2026-08-30 12:00' },
    { id: 4, code: 'SHP-2026-004', fromAddress: 'Trang trại JKL, Đồng Tháp', toAddress: 'Siêu thị DEF, Cần Thơ', orderId: 'ORD-004', driverName: 'Nguyễn Văn A', vehiclePlate: '65A-12345', status: 'COMPLETED', pickupTime: '2026-08-29 07:00', deliveryTime: '2026-08-29 13:00' },
  ]);

  const [filter, setFilter] = useState('ALL');

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      CREATED: { label: 'Đã tạo', color: 'bg-gray-100 text-gray-700' },
      ASSIGNED: { label: 'Đã phân công', color: 'bg-blue-100 text-blue-700' },
      PICKING_UP: { label: 'Đang lấy hàng', color: 'bg-yellow-100 text-yellow-700' },
      PICKED_UP: { label: '� Đã lấy hàng', color: 'bg-teal-100 text-teal-700' },
      IN_TRANSIT: { label: 'Đang vận chuyển', color: 'bg-indigo-100 text-indigo-700' },
      DELIVERED: { label: 'Đã giao', color: 'bg-purple-100 text-purple-700' },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-green-500 text-white' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const filteredShipments = filter === 'ALL' ? shipments : shipments.filter(s => s.status === filter);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                ← Quay lại
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Danh sách chuyến</h1>
            </div>
            <Link href="/shipments/new" className="btn-primary">
              + Tạo chuyến mới
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['ALL', 'CREATED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].map((status) => (
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

        {/* Shipments List */}
        <div className="space-y-4">
          {filteredShipments.map((shipment) => {
            const statusInfo = getStatusInfo(shipment.status);
            return (
              <div key={shipment.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{shipment.code}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Đơn hàng: {shipment.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Giờ lấy hàng</p>
                    <p className="font-medium">{shipment.pickupTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Từ:</p>
                    <p className="font-medium">{shipment.fromAddress}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Đến:</p>
                    <p className="font-medium">{shipment.toAddress}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tài xế:</p>
                      <p className="font-medium">{shipment.driverName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Xe:</p>
                      <p className="font-medium">{shipment.vehiclePlate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/shipments/${shipment.id}`} className="btn-secondary">
                      Chi tiết
                    </Link>
                    {shipment.status === 'CREATED' && (
                      <button className="btn-primary">
                        Phân công
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
