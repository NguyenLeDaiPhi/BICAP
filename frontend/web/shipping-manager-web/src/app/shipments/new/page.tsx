'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { shippingApi, getErrorMessage } from '@/lib/api';

interface ShipmentFormData {
  orderId: string;
  fromLocation: string;
  toLocation: string;
}

export default function NewShipmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ShipmentFormData>({
    orderId: '',
    fromLocation: '',
    toLocation: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const orderIdNum = parseInt(formData.orderId, 10);
      if (isNaN(orderIdNum)) {
        setError('Mã đơn hàng phải là số');
        setSubmitting(false);
        return;
      }

      await shippingApi.createShipment({
        orderId: orderIdNum,
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
      });

      router.push('/shipments');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/shipments" className="text-gray-500 hover:text-gray-700">
              ← Quay lại
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Tạo chuyến hàng mới</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span>📦</span> Thông tin chuyến hàng
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Mã đơn hàng (Order ID) *</label>
              <input
                type="number"
                name="orderId"
                className="input"
                placeholder="VD: 1, 2, 3..."
                value={formData.orderId}
                onChange={handleInputChange}
                required
                min="1"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nhập ID của đơn hàng từ hệ thống Farm Service đã được xác nhận
              </p>
            </div>

            <div>
              <label className="label">Địa điểm lấy hàng *</label>
              <textarea
                name="fromLocation"
                className="input min-h-[100px]"
                placeholder="VD: Trang trại ABC, 123 Đường XYZ, Quận Ninh Kiều, Cần Thơ"
                value={formData.fromLocation}
                onChange={handleInputChange}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Nhập địa chỉ đầy đủ nơi lấy hàng từ nông trại
              </p>
            </div>

            <div>
              <label className="label">Địa điểm giao hàng *</label>
              <textarea
                name="toLocation"
                className="input min-h-[100px]"
                placeholder="VD: Siêu thị XYZ, 456 Đường ABC, Quận 1, TP.HCM"
                value={formData.toLocation}
                onChange={handleInputChange}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Nhập địa chỉ đầy đủ nơi giao hàng đến cửa hàng/siêu thị
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Link href="/shipments" className="btn-secondary flex-1 text-center">
                Hủy bỏ
              </Link>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={submitting}
              >
                {submitting ? 'Đang tạo...' : 'Tạo chuyến hàng'}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-2">💡 Lưu ý</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Sau khi tạo, chuyến hàng sẽ ở trạng thái "Chờ xử lý"</li>
            <li>• Bạn cần phân công tài xế và xe để bắt đầu vận chuyển</li>
            <li>• Xe lạnh sẽ duy trì nhiệt độ 4°C - 8°C trong suốt hành trình</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
