'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Lúa ST25',
      category: 'Lúa gạo',
      price: 15000,
      unit: 'kg',
      quantity: 1000,
      status: 'ACTIVE',
      imageUrl: '',
    },
    {
      id: 2,
      name: 'Rau muống organic',
      category: 'Rau xanh',
      price: 25000,
      unit: 'kg',
      quantity: 500,
      status: 'ACTIVE',
      imageUrl: '',
    },
    {
      id: 3,
      name: 'Đậu xanh',
      category: 'Đậu các loại',
      price: 35000,
      unit: 'kg',
      quantity: 300,
      status: 'INACTIVE',
      imageUrl: '',
    },
  ]);

  const [showModal, setShowModal] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      setProducts(products.filter(p => p.id !== id));
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
              <h1 className="text-2xl font-bold text-gray-900">Nông sản</h1>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + Thêm sản phẩm mới
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🌾</span>
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 font-medium">{product.price.toLocaleString()}đ/{product.unit}</td>
                    <td className="px-6 py-4">{product.quantity} {product.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link href={`/products/${product.id}`} className="text-primary hover:underline text-sm">
                          Sửa
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline text-sm">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold mb-4">Thêm sản phẩm mới</h2>
              <form className="space-y-4">
                <div>
                  <label className="label">Tên sản phẩm</label>
                  <input type="text" className="input" placeholder="VD: Lúa ST25" />
                </div>
                <div>
                  <label className="label">Danh mục</label>
                  <select className="input">
                    <option value="">Chọn danh mục</option>
                    <option value="1">Lúa gạo</option>
                    <option value="2">Rau xanh</option>
                    <option value="3">Đậu các loại</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Giá (VNĐ)</label>
                    <input type="number" className="input" placeholder="15000" />
                  </div>
                  <div>
                    <label className="label">Đơn vị</label>
                    <select className="input">
                      <option value="kg">kg</option>
                      <option value="tấn">tấn</option>
                      <option value="chai">chai</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Số lượng</label>
                  <input type="number" className="input" placeholder="100" />
                </div>
                <div>
                  <label className="label">Mô tả</label>
                  <textarea className="input" rows={3} placeholder="Mô tả sản phẩm..."></textarea>
                </div>
                <div className="flex gap-4 justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    Thêm sản phẩm
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
