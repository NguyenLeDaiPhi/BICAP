'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productApi, getErrorMessage } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  price: number;
  unit: string;
  quantity: number;
  status: string;
  imageUrl?: string;
  description?: string;
  farmId?: number;
  origin?: string;
  certification?: string;
}

interface ProductFormData {
  name: string;
  categoryId: number | '';
  category: string;
  price: number | '';
  unit: string;
  quantity: number | '';
  description: string;
}

interface EditFormData {
  name: string;
  categoryId: number | '';
  category: string;
  price: number | '';
  unit: string;
  quantity: number | '';
  description: string;
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Form data cho tạo mới
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    categoryId: '',
    category: '',
    price: '',
    unit: 'kg',
    quantity: '',
    description: '',
  });

  // Form data cho chỉnh sửa
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    categoryId: '',
    category: '',
    price: '',
    unit: 'kg',
    quantity: '',
    description: '',
    status: 'ACTIVE',
  });

  // Helper function để lấy tên category từ ID
  const getCategoryName = (categoryId: number | ''): string => {
    const categories: Record<string, string> = {
      1: 'Lúa gạo',
      2: 'Rau xanh',
      3: 'Đậu các loại',
      4: 'Trái cây',
    };
    return categoryId ? (categories[categoryId.toString()] || 'Chưa phân loại') : 'Chưa phân loại';
  };

  // Lấy danh sách sản phẩm từ API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Thử lấy từ /api/products trước
      let response;
      try {
        response = await productApi.getAllProducts();
      } catch (apiErr: any) {
        // Nếu /api/products lỗi, thử /api/products/my
        console.log('Thử endpoint /api/products/my');
        response = await productApi.getMyProducts();
      }
      
      if (response.data) {
        // Transform dữ liệu từ API - hỗ trợ cả array và wrapped response
        const items = Array.isArray(response.data) ? response.data : (response.data.data || []);
        const transformedProducts: Product[] = items.map((item: any) => ({
          id: item.id,
          name: item.name || 'Sản phẩm không tên',
          category: item.categoryName || item.category || 'Chưa phân loại',
          categoryId: item.categoryId,
          price: item.price || 0,
          unit: item.unit || 'kg',
          quantity: item.quantity || 0,
          status: item.status || 'ACTIVE',
          imageUrl: item.imageUrl,
          description: item.description,
          farmId: item.farmId,
          origin: item.origin,
          certification: item.certification,
        }));
        setProducts(transformedProducts);
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err);
      // Xóa mock data - user cần biết khi không kết nối được
      setProducts([]);
      setError('Không thể kết nối server. Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Xử lý thay đổi form tạo mới
  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  // Xử lý thay đổi form chỉnh sửa
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  // Mở modal chỉnh sửa
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      categoryId: product.categoryId || '',
      category: product.category,
      price: product.price,
      unit: product.unit,
      quantity: product.quantity,
      description: product.description || '',
      status: product.status,
    });
    setEditError(null);
    setShowEditModal(true);
  };

  // Tạo sản phẩm mới
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Chuyển đổi form data sang format backend yêu cầu
      // farmId sẽ được backend tự động lấy từ farm mặc định
      const payload = {
        name: formData.name,
        price: formData.price,
        unit: formData.unit,
        quantity: formData.quantity,
        description: formData.description,
        category: formData.categoryId ? getCategoryName(formData.categoryId) : 'Chưa phân loại',
        // exportBatchId sẽ là null - cho phép tạo sản phẩm trực tiếp
        exportBatchId: null,
      };
      
      await productApi.createProduct(payload);
      
      setShowCreateModal(false);
      setFormData({
        name: '',
        categoryId: '',
        category: '',
        price: '',
        unit: 'kg',
        quantity: '',
        description: '',
      });
      fetchProducts();
      alert('Thêm sản phẩm thành công!');
    } catch (err: any) {
      console.error('Lỗi khi tạo sản phẩm:', err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
    }
  };

  // Cập nhật sản phẩm
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      setEditError(null);
      
      // Chuyển đổi form data sang format backend yêu cầu
      const payload = {
        name: editFormData.name,
        price: editFormData.price,
        unit: editFormData.unit,
        quantity: editFormData.quantity,
        description: editFormData.description,
        category: editFormData.categoryId ? getCategoryName(editFormData.categoryId) : 'Chưa phân loại',
        status: editFormData.status,
      };
      
      await productApi.updateProduct(editingProduct.id, payload);
      
      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
      alert('Cập nhật sản phẩm thành công!');
    } catch (err: any) {
      console.error('Lỗi khi cập nhật sản phẩm:', err);
      const errorMsg = getErrorMessage(err);
      setEditError(errorMsg);
    }
  };

  // Xóa sản phẩm (soft delete - gọi API backend)
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await productApi.deleteProduct(id);
      fetchProducts();
      alert('Xóa sản phẩm thành công!');
    } catch (err: any) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      const errorMsg = getErrorMessage(err);
      alert('Lỗi: ' + errorMsg);
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
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              + Thêm sản phẩm mới
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
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!</p>
          </div>
        ) : (
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
                      <td className="px-6 py-4 font-medium">{typeof product.price === 'number' ? product.price.toLocaleString() : product.price}đ/{product.unit}</td>
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
                          <button 
                            onClick={() => openEditModal(product)} 
                            className="text-primary hover:underline text-sm"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="text-red-500 hover:underline text-sm"
                          >
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
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold mb-4">Thêm sản phẩm mới</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">Tên sản phẩm *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleCreateInputChange}
                    className="input"
                    placeholder="VD: Lúa ST25"
                    required
                  />
                </div>
                <div>
                  <label className="label">Danh mục</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleCreateInputChange}
                    className="input"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="1">Lúa gạo</option>
                    <option value="2">Rau xanh</option>
                    <option value="3">Đậu các loại</option>
                    <option value="4">Trái cây</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Giá (VNĐ) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleCreateInputChange}
                      className="input"
                      placeholder="15000"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Đơn vị</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleCreateInputChange}
                      className="input"
                    >
                      <option value="kg">kg</option>
                      <option value="tấn">tấn</option>
                      <option value="chai">chai</option>
                      <option value="thùng">thùng</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Số lượng</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleCreateInputChange}
                    className="input"
                    placeholder="100"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleCreateInputChange}
                    className="input"
                    rows={3}
                    placeholder="Mô tả sản phẩm..."
                  ></textarea>
                </div>
                <div className="flex gap-4 justify-end">
                  <button type="button" onClick={() => {
                    setShowCreateModal(false);
                    setError(null);
                  }} className="btn-secondary">
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

        {/* Edit Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold mb-4">Sửa sản phẩm</h2>
              {editError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {editError}
                </div>
              )}
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="label">Tên sản phẩm *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Danh mục</label>
                  <select
                    name="categoryId"
                    value={editFormData.categoryId}
                    onChange={handleEditInputChange}
                    className="input"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="1">Lúa gạo</option>
                    <option value="2">Rau xanh</option>
                    <option value="3">Đậu các loại</option>
                    <option value="4">Trái cây</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Giá (VNĐ) *</label>
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditInputChange}
                      className="input"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Đơn vị</label>
                    <select
                      name="unit"
                      value={editFormData.unit}
                      onChange={handleEditInputChange}
                      className="input"
                    >
                      <option value="kg">kg</option>
                      <option value="tấn">tấn</option>
                      <option value="chai">chai</option>
                      <option value="thùng">thùng</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Số lượng</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editFormData.quantity}
                    onChange={handleEditInputChange}
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">Trạng thái</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                    className="input"
                  >
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Ngừng bán</option>
                  </select>
                </div>
                <div>
                  <label className="label">Mô tả</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    className="input"
                    rows={3}
                  ></textarea>
                </div>
                <div className="flex gap-4 justify-end">
                  <button type="button" onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                    setEditError(null);
                  }} className="btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    Lưu thay đổi
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
