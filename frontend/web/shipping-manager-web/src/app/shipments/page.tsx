'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { shippingApi, driverApi, vehicleApi, getErrorMessage } from '@/lib/api';

interface Driver {
  id: number;
  name: string;
  phone?: string;
  license?: string;
}

interface Vehicle {
  id: number;
  plate: string;
  type?: string;
  status?: string;
}

interface Shipment {
  id: number;
  code?: string;
  orderId: number;
  fromLocation: string;
  toLocation: string;
  driver?: Driver;
  vehicle?: Vehicle;
  status: string;
  createdDate?: string;
  updatedDate?: string;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await shippingApi.getShipments();
      setShipments(response.data || []);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Chờ xử lý', color: 'bg-gray-100 text-gray-700' },
      ASSIGNED: { label: 'Đã phân công', color: 'bg-blue-100 text-blue-700' },
      PICKING_UP: { label: 'Đang lấy hàng', color: 'bg-yellow-100 text-yellow-700' },
      PICKED_UP: { label: 'Đã lấy hàng', color: 'bg-teal-100 text-teal-700' },
      IN_TRANSIT: { label: 'Đang vận chuyển', color: 'bg-indigo-100 text-indigo-700' },
      DELIVERED: { label: 'Đã giao', color: 'bg-purple-100 text-purple-700' },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-green-500 text-white' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const filteredShipments = filter === 'ALL' ? shipments : shipments.filter(s => s.status === filter);

  const handleAssignClick = async (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setAssignError('');

    // Fetch drivers and vehicles for selection via API (with Authorization header)
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        driverApi.getDrivers(),
        vehicleApi.getVehicles()
      ]);
      setDrivers(driversRes.data || driversRes || []);
      setVehicles(vehiclesRes.data || vehiclesRes || []);
    } catch (err) {
      console.error('Error fetching drivers/vehicles:', err);
    }

    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedShipment || !selectedDriverId || !selectedVehicleId) {
      setAssignError('Vui lòng chọn tài xế và phương tiện');
      return;
    }

    setAssigning(true);
    setAssignError('');

    try {
      await shippingApi.assignDriver(selectedShipment.id, selectedDriverId, selectedVehicleId);
      setShowAssignModal(false);
      setSelectedShipment(null);
      setSelectedDriverId(null);
      setSelectedVehicleId(null);
      fetchShipments();
    } catch (err: any) {
      setAssignError(getErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (shipmentId: number, newStatus: string) => {
    try {
      await shippingApi.updateStatus(shipmentId, newStatus);
      fetchShipments();
    } catch (err: any) {
      alert('Cập nhật thất bại: ' + getErrorMessage(err));
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy chuyến hàng này?')) return;

    try {
      await shippingApi.cancelShipment(id);
      fetchShipments();
    } catch (err: any) {
      alert('Hủy thất bại: ' + getErrorMessage(err));
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Danh sách chuyến</h1>
            </div>
            <Link href="/shipments/new" className="btn-primary">
              + Tạo chuyến mới
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={fetchShipments} className="ml-4 underline hover:no-underline">
              Thử lại
            </button>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['ALL', 'PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map((status) => (
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

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Đang tải danh sách chuyến...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có chuyến hàng nào.</p>
            <Link href="/shipments/new" className="mt-4 btn-primary inline-block">
              + Tạo chuyến mới
            </Link>
          </div>
        ) : (
          /* Shipments List */
          <div className="space-y-4">
            {filteredShipments.map((shipment) => {
              const statusInfo = getStatusInfo(shipment.status);
              return (
                <div key={shipment.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">SHP-{shipment.id.toString().padStart(4, '0')}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Mã đơn: {shipment.orderId}</p>
                      {shipment.createdDate && (
                        <p className="text-xs text-gray-400">Tạo: {new Date(shipment.createdDate).toLocaleString('vi-VN')}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Trạng thái</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Từ:</p>
                      <p className="font-medium">{shipment.fromLocation}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Đến:</p>
                      <p className="font-medium">{shipment.toLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Tài xế:</p>
                        <p className="font-medium">{shipment.driver?.name || 'Chưa phân công'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Xe:</p>
                        <p className="font-medium">{shipment.vehicle?.plate || '-'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {shipment.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleAssignClick(shipment)} className="btn-primary">
                            Phân công
                          </button>
                          <button onClick={() => handleCancel(shipment.id)} className="btn-danger">
                            Hủy
                          </button>
                        </>
                      )}
                      {shipment.status === 'ASSIGNED' && (
                        <button onClick={() => handleUpdateStatus(shipment.id, 'PICKING_UP')} className="btn-secondary">
                          Bắt đầu lấy hàng
                        </button>
                      )}
                      {shipment.status === 'PICKING_UP' && (
                        <button onClick={() => handleUpdateStatus(shipment.id, 'IN_TRANSIT')} className="btn-secondary">
                          Bắt đầu vận chuyển
                        </button>
                      )}
                      {shipment.status === 'IN_TRANSIT' && (
                        <button onClick={() => handleUpdateStatus(shipment.id, 'DELIVERED')} className="btn-secondary">
                          Đã giao hàng
                        </button>
                      )}
                      {shipment.status === 'DELIVERED' && (
                        <button onClick={() => handleUpdateStatus(shipment.id, 'COMPLETED')} className="btn-primary">
                          Hoàn thành
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Assign Driver/Vehicle Modal */}
      {showAssignModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">Phân công tài xế & xe</h2>
            <p className="text-sm text-gray-500 mb-4">
              Chuyến: SHP-{selectedShipment.id.toString().padStart(4, '0')}
            </p>

            {assignError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {assignError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="label">Chọn tài xế *</label>
                <select
                  className="input"
                  value={selectedDriverId || ''}
                  onChange={(e) => setSelectedDriverId(Number(e.target.value) || null)}
                >
                  <option value="">-- Chọn tài xế --</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} {driver.phone ? `(${driver.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Chọn xe *</label>
                <select
                  className="input"
                  value={selectedVehicleId || ''}
                  onChange={(e) => setSelectedVehicleId(Number(e.target.value) || null)}
                >
                  <option value="">-- Chọn xe --</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} {vehicle.type ? `(${vehicle.type})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedShipment(null);
                }}
                className="btn-secondary"
                disabled={assigning}
              >
                Hủy
              </button>
              <button onClick={handleAssign} className="btn-primary" disabled={assigning}>
                {assigning ? 'Đang phân công...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
