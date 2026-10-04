'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productApi, farmProductionApi, getErrorMessage } from '@/lib/api';

interface Season {
  id: number;
  name: string;
  batchCode: string;
  productType: string;
}

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
  batchId?: number;
}

interface ProductFormData {
  productionBatchId: number | '';
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
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonsLoading, setSeasonsLoading] = useState(true);
  const [seasonsError, setSeasonsError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewProductId, setViewProductId] = useState<number | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  useEffect(() => {
    if (!productImage) { setImagePreview(null); return; }
    const url = URL.createObjectURL(productImage); setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [productImage]);
  const imageError = (file: File | null): string | null => {
    if (!file) return 'Vui lòng chọn ảnh sản phẩm trước khi gửi duyệt.';
    if (!['image/jpeg', 'image/png'].includes(file.type)) return 'Chỉ nhận ảnh JPG hoặc PNG.';
    if (file.size > 5 * 1024 * 1024) return 'Ảnh tối đa 5 MB.';
    return null;
  };
  const uploadImage = async (id: number, file: File | null) => {
    const validation = imageError(file);
    if (validation) { setError(validation); return; }
    if (uploadingId != null || !file) return;
    setUploadingId(id); setError(null); setSuccess(null);
    try {
      await productApi.uploadProductImage(id, file);
      await fetchProducts();
      setSuccess('Đã tải ảnh và gửi sản phẩm sang admin duyệt.');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setUploadingId(null); }
  };
  const imageUploadControl = (product: Product) => <label className="inline-block cursor-pointer text-sm text-emerald-700 underline">
    {uploadingId === product.id ? 'Đang tải ảnh...' : product.imageUrl ? 'Đổi ảnh' : 'Thêm ảnh và gửi duyệt'}
    <input aria-label={'Ảnh cho ' + product.name} type="file" accept="image/jpeg,image/png" className="sr-only"
      disabled={uploadingId != null || isCreating} onChange={event => {
        const file = event.target.files?.[0] || null; event.target.value = ''; void uploadImage(product.id, file);
      }} />
  </label>;
  const viewedProduct = products.find(product => product.id === viewProductId);

  // Form data cho tạo mới
  const [formData, setFormData] = useState<ProductFormData>({
    productionBatchId: '',
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
      
      const response = await productApi.getMyProducts();
      
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
          batchId: item.batchId,
        }));
        setProducts(transformedProducts);
        return transformedProducts;
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err);
      // Xóa mock data - user cần biết khi không kết nối được
      setProducts([]);
      setError(getErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const requestedProductId = Number(new URLSearchParams(window.location.search).get('productId'));
    if (requestedProductId > 0) setViewProductId(requestedProductId);
    Promise.all([fetchProducts(), farmProductionApi.getSeasons()]).then(([myProducts, response]) => {
      const data = response.data.data || response.data;
      const items: Season[] = Array.isArray(data) ? data : [];
      setSeasons(items);
      const requestedId = Number(new URLSearchParams(window.location.search).get('seasonId'));
      if (requestedId > 0) {
        if (!myProducts) return;
        const existingProduct = myProducts.find(product => product.batchId === requestedId);
        if (existingProduct) {
          setViewProductId(existingProduct.id);
          return;
        }
        const selected = items.find(season => season.id === requestedId);
        if (selected) {
          setFormData(previous => ({ ...previous, productionBatchId: selected.id, name: selected.productType || selected.name }));
          setShowCreateModal(true);
        } else {
          setError('Không tìm thấy mùa vụ thuộc trang trại của bạn.');
        }
      }
    }).catch(err => setSeasonsError(getErrorMessage(err)))
      .finally(() => setSeasonsLoading(false));
  }, []);

  // Xử lý thay đổi form tạo mới
  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'productionBatchId') {
      const selected = seasons.find(season => season.id === Number(value));
      setFormData(previous => ({ ...previous, productionBatchId: value ? Number(value) : '',
        name: previous.name || selected?.productType || selected?.name || '' }));
      return;
    }
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
    if (isCreating) return;
    const validation = imageError(productImage);
    if (validation) { setError(validation); return; }
    const existingProduct = products.find(product => product.batchId === formData.productionBatchId);
    if (existingProduct) {
      setShowCreateModal(false);
      setViewProductId(existingProduct.id);
      setError('Mùa vụ này đã có sản phẩm. Vui lòng xem sản phẩm đã tạo.');
      return;
    }
    setIsCreating(true);
    setSuccess(null);
    let draftId: number | null = null;
    try {
      setError(null);
      
      // Chuyển đổi form data sang format backend yêu cầu
      // farmId sẽ được backend tự động lấy từ farm mặc định
      const payload = {
        productionBatchId: formData.productionBatchId || null,
        name: formData.name,
        price: formData.price,
        unit: formData.unit,
        quantity: formData.quantity,
        description: formData.description,
        category: formData.categoryId ? getCategoryName(formData.categoryId) : 'Chưa phân loại',
        // exportBatchId sẽ là null - cho phép tạo sản phẩm trực tiếp
        exportBatchId: null,
      };
      
      const response = await productApi.createProduct(payload);
      draftId = response.data.id;
      if (!draftId || !productImage) throw new Error('Chưa xác định được sản phẩm để tải ảnh.');
      await productApi.uploadProductImage(draftId, productImage);
      setProductImage(null);
      
      setShowCreateModal(false);
      setFormData({
        productionBatchId: '',
        name: '',
        categoryId: '',
        category: '',
        price: '',
        unit: 'kg',
        quantity: '',
        description: '',
      });
      await fetchProducts();
      setSuccess('Đã thêm sản phẩm. Sản phẩm mới đang chờ admin duyệt.');
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      if (draftId) {
        setShowCreateModal(false); setViewProductId(draftId); setProductImage(null);
        await fetchProducts();
        setError('Đã lưu bản nháp, chưa gửi admin. Hãy chọn “Thêm ảnh và gửi duyệt” để thử lại. ' + errorMsg);
      } else setError(errorMsg);
    } finally {
      setIsCreating(false);
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
            <button onClick={() => { setError(null); setSuccess(null); setShowCreateModal(true); }} className="btn-primary">
              + Thêm sản phẩm mới
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewedProduct && <section aria-labelledby="view-product-title" className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 id="view-product-title" className="text-xl font-bold">{viewedProduct.name}</h2>
            <button type="button" className="btn-secondary" onClick={() => setViewProductId(null)}>Đóng chi tiết</button>
          </div>
          {viewedProduct.imageUrl && <img src={viewedProduct.imageUrl} alt={viewedProduct.name} className="mt-4 h-48 w-48 rounded-lg object-cover" />}
          <div className="mt-3">{imageUploadControl(viewedProduct)}</div>
          <p className="mt-2 whitespace-pre-wrap text-gray-600">{viewedProduct.description || 'Chưa có mô tả.'}</p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div><dt className="text-sm text-gray-500">Giá</dt><dd>{viewedProduct.price.toLocaleString('vi-VN')}đ/{viewedProduct.unit}</dd></div>
            <div><dt className="text-sm text-gray-500">Số lượng</dt><dd>{viewedProduct.quantity} {viewedProduct.unit}</dd></div>
            <div><dt className="text-sm text-gray-500">Trạng thái</dt><dd>{({ DRAFT: 'Bản nháp · Cần ảnh', PENDING: 'Chờ admin duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Đã từ chối', BANNED: 'Đã khóa' } as Record<string, string>)[viewedProduct.status] || viewedProduct.status}</dd></div>
          </dl>
          {viewedProduct.batchId && <Link href={`/seasons/${viewedProduct.batchId}`} className="mt-4 inline-block text-emerald-700 underline">Xem mùa vụ nguồn gốc</Link>}
        </section>}
        {success && <p role="status" className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">{success}</p>}
        {error && !showCreateModal && <div role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          <p>{error}</p>
          <button type="button" className="mt-2 underline" onClick={fetchProducts}>Thử lại</button>
        </div>}
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
                            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-lg object-cover" /> : <span className="text-2xl">🌾</span>}
                          </div>
                          <div>
                            <span className="font-medium">{product.name}</span>
                            {product.batchId && <Link href={`/seasons/${product.batchId}`} className="mt-1 block text-xs text-emerald-700 hover:underline">
                              Mùa vụ: {seasons.find(season => season.id === product.batchId)?.name || `#${product.batchId}`}
                            </Link>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 font-medium">{typeof product.price === 'number' ? product.price.toLocaleString() : product.price}đ/{product.unit}</td>
                      <td className="px-6 py-4">{product.quantity} {product.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {({ DRAFT: 'Bản nháp · Cần ảnh', PENDING: 'Chờ admin duyệt', APPROVED: 'Đã duyệt', ACTIVE: 'Đang bán', BANNED: 'Đã khóa', REJECTED: 'Đã từ chối' } as Record<string, string>)[product.status] || product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {imageUploadControl(product)}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div role="dialog" aria-modal="true" aria-labelledby="create-product-title" className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 id="create-product-title" className="text-xl font-bold mb-4">Thêm sản phẩm mới</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <fieldset disabled={isCreating} className="space-y-4">
                <div>
                  <label htmlFor="product-image" className="label">Ảnh sản phẩm *</label>
                  <input id="product-image" type="file" accept="image/jpeg,image/png" required className="input" onChange={event => {
                    const file = event.target.files?.[0] || null;
                    const validation = imageError(file);
                    setError(validation); setProductImage(validation ? null : file);
                    if (validation) event.target.value = '';
                  }} />
                  <p className="mt-1 text-sm text-gray-500">Ảnh JPG/PNG, tối đa 5 MB. Sản phẩm chỉ được gửi admin khi tải ảnh thành công.</p>
                  {imagePreview && <img src={imagePreview} alt="Ảnh sản phẩm đã chọn" className="mt-3 h-32 w-32 rounded-lg object-cover" />}
                </div>
                <div>
                  <label htmlFor="product-season" className="label">Mùa vụ nguồn gốc</label>
                  <select id="product-season" name="productionBatchId" value={formData.productionBatchId}
                    onChange={handleCreateInputChange} className="input" disabled={seasonsLoading || !!seasonsError}>
                    <option value="">{seasonsLoading ? 'Đang tải mùa vụ...' : 'Không liên kết mùa vụ'}</option>
                    {seasons.map(season => <option key={season.id} value={season.id} disabled={products.some(product => product.batchId === season.id)}>
                      {season.name || season.batchCode} · {season.batchCode}{products.some(product => product.batchId === season.id) ? ' · Đã có sản phẩm' : ''}
                    </option>)}
                  </select>
                  {seasonsError && <p role="alert" className="mt-1 text-sm text-red-600">Không tải được mùa vụ: {seasonsError}</p>}
                </div>
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
                      min="1"
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
                    step="1"
                    required
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
                    maxLength={255}
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
                  <button type="submit" className="btn-primary" disabled={isCreating || seasonsLoading}>
                    {isCreating ? 'Đang thêm...' : 'Thêm sản phẩm'}
                  </button>
                </div>
                </fieldset>
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
