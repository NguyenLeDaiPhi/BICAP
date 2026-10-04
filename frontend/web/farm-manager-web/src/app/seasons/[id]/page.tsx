'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { farmProductionApi, productApi, getErrorMessage } from '@/lib/api';

interface SeasonDetail {
  id: number;
  batchCode: string;
  name: string;
  productType: string;
  startDate: string;
  endDate: string;
  area: number;
  quantity: number;
  status: string;
  txHash: string;
  farmId: number;
  farmName: string;
  createdAt: string;
}

interface FarmingProcess {
  id: number;
  processType: string;
  description: string;
  performedDate: string;
  status: string;
}

interface ExportBatch {
  id: number;
  batchCode: string;
  quantity: number;
  exportDate: string;
  qrCode: string;
  status: string;
}

const getToday = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().split('T')[0];
};

export default function SeasonDetailPage() {
  const params = useParams();
  const seasonId = params.id as string;
  
  const [season, setSeason] = useState<SeasonDetail | null>(null);
  const [processes, setProcesses] = useState<FarmingProcess[]>([]);
  const [exportBatches, setExportBatches] = useState<ExportBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonProduct, setSeasonProduct] = useState<{ id: number; batchId?: number } | null>(null);
  
  // Form state for adding new process
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [isSavingProcess, setIsSavingProcess] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState<string | null>(null);
  const [processForm, setProcessForm] = useState({
    processType: '',
    description: '',
    performedDate: getToday(),
  });

  // Lấy chi tiết mùa vụ từ API
  const fetchSeasonDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Gọi API lấy chi tiết đầy đủ
      const [response, productsResponse] = await Promise.all([
        farmProductionApi.getSeasonDetail(Number(seasonId)), productApi.getMyProducts(),
      ]);
      const products = productsResponse.data.data || productsResponse.data;
      setSeasonProduct(Array.isArray(products) ? products.find(product => product.batchId === Number(seasonId)) || null : null);
      
      if (response.data) {
        // Backend trả về SeasonDetailResponse với cấu trúc:
        // { productionBatch, farmingProcesses, exportBatches }
        const data = response.data.data || response.data;
        
        // Transform productionBatch thành SeasonDetail
        const batch = data.productionBatch || data;
        setSeason({
          id: batch.id,
          batchCode: batch.batchCode,
          name: batch.name,
          productType: batch.productType,
          startDate: batch.startDate,
          endDate: batch.endDate,
          area: batch.area,
          quantity: batch.quantity,
          status: batch.status,
          txHash: batch.txHash,
          farmId: batch.farm?.id || batch.farmId,
          farmName: batch.farm?.farmName || '',
          createdAt: batch.createdAt,
        });
        
        // Transform farmingProcesses
        if (data.farmingProcesses) {
          setProcesses(data.farmingProcesses.map((p: any) => ({
            id: p.id,
            processType: p.processType,
            description: p.description,
            performedDate: p.performedDate,
            status: p.status,
          })));
        }
        
        // Transform exportBatches
        if (data.exportBatches) {
          setExportBatches(data.exportBatches.map((e: any) => ({
            id: e.id,
            batchCode: e.batchCode,
            quantity: e.quantity,
            exportDate: e.exportDate,
            qrCode: e.qrCode,
            status: e.status,
          })));
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy chi tiết mùa vụ:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (seasonId) {
      fetchSeasonDetail();
    }
  }, [seasonId]);

  // Thêm nhật ký canh tác mới
  const handleAddProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProcess) return;
    setIsSavingProcess(true);
    setProcessError(null);
    setProcessSuccess(null);
    try {
      await farmProductionApi.createProcess(Number(seasonId), {
        processType: processForm.processType,
        description: processForm.description.trim(),
        performedDate: `${processForm.performedDate}T00:00:00`,
      });
      
      setShowProcessForm(false);
      setProcessForm({
        processType: '',
        description: '',
        performedDate: getToday(),
      });
      
      // Refresh lại chi tiết
      await fetchSeasonDetail();
      setProcessSuccess('Đã lưu nhật ký canh tác.');
    } catch (err: any) {
      console.error('Lỗi khi thêm nhật ký:', err);
      setProcessError(getErrorMessage(err));
    } finally {
      setIsSavingProcess(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNING': return { label: 'Kế hoạch', color: 'bg-blue-100 text-blue-700' };
      case 'PENDING_BLOCKCHAIN': return { label: 'Chờ Blockchain', color: 'bg-yellow-100 text-yellow-700' };
      case 'SYNCED': return { label: 'Đã đồng bộ', color: 'bg-green-100 text-green-700' };
      case 'ACTIVE': return { label: 'Đang trồng', color: 'bg-yellow-100 text-yellow-700' };
      case 'IN_PROGRESS': return { label: 'Đang trồng', color: 'bg-yellow-100 text-yellow-700' };
      case 'HARVESTED': return { label: 'Đã thu hoạch', color: 'bg-green-100 text-green-700' };
      case 'EXPORTED': return { label: 'Đã xuất bán', color: 'bg-purple-100 text-purple-700' };
      case 'CANCELLED': return { label: 'Đã hủy', color: 'bg-red-100 text-red-700' };
      default: return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getProcessStageLabel = (stage: string) => {
    const stages: Record<string, { label: string; color: string }> = {
      'PREPARATION': { label: 'Chuẩn bị', color: 'bg-blue-100 text-blue-700' },
      'PLANTING': { label: 'Gieo hạt', color: 'bg-green-100 text-green-700' },
      'SOWING': { label: 'Gieo hạt', color: 'bg-green-100 text-green-700' },
      'GROWING': { label: 'Phát triển', color: 'bg-emerald-100 text-emerald-700' },
      'FERTILIZING': { label: 'Bón phân', color: 'bg-amber-100 text-amber-700' },
      'IRRIGATION': { label: 'Tưới tiêu', color: 'bg-cyan-100 text-cyan-700' },
      'WATERING': { label: 'Tưới tiêu', color: 'bg-cyan-100 text-cyan-700' },
      'PEST_CONTROL': { label: 'Phòng trừ', color: 'bg-orange-100 text-orange-700' },
      'MONITORING': { label: 'Giám sát', color: 'bg-purple-100 text-purple-700' },
      'HARVESTING': { label: 'Thu hoạch', color: 'bg-yellow-100 text-yellow-700' },
      'OTHER': { label: 'Khác', color: 'bg-gray-100 text-gray-700' },
    };
    return stages[stage] || { label: stage, color: 'bg-gray-100 text-gray-700' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Đang tải chi tiết mùa vụ...</p>
        </div>
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link href="/seasons" className="text-gray-500 hover:text-gray-700">
                ← Quay lại danh sách mùa vụ
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h3 className="font-bold">Lỗi khi tải chi tiết mùa vụ</h3>
            <p className="mt-2">{error || 'Không tìm thấy mùa vụ'}</p>
            <button 
              onClick={fetchSeasonDetail}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  const statusInfo = getStatusLabel(season.status);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/seasons" className="text-gray-500 hover:text-gray-700">
                ← Quay lại
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {season.name || season.batchCode}
                </h1>
                <p className="text-sm text-gray-500">
                  Mã lô: {season.batchCode}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={seasonProduct ? `/products?productId=${seasonProduct.id}` : `/products?seasonId=${season.id}`} className="btn-primary text-sm">{seasonProduct ? 'Xem sản phẩm' : '+ Thêm sản phẩm từ mùa vụ'}</Link>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Thông tin mùa vụ */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin mùa vụ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-500">Loại sản phẩm</label>
              <p className="text-lg font-medium">{season.productType || 'Chưa xác định'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Ngày bắt đầu</label>
              <p className="text-lg font-medium">{season.startDate || 'Chưa xác định'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Dự kiến thu hoạch</label>
              <p className="text-lg font-medium">{season.endDate || 'Chưa xác định'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Diện tích</label>
              <p className="text-lg font-medium">{season.area ? `${season.area} ha` : 'Chưa xác định'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Sản lượng dự kiến</label>
              <p className="text-lg font-medium">{season.quantity ? `${season.quantity} tấn` : 'Chưa xác định'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Trang trại</label>
              <p className="text-lg font-medium">{season.farmName || `Farm #${season.farmId}`}</p>
            </div>
          </div>
          
          {/* Blockchain Info */}
          {season.txHash && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin Blockchain</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm font-medium text-green-700">Đã ghi nhận trên Blockchain</span>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Transaction Hash</label>
                  <p className="text-sm font-mono text-gray-700 break-all">{season.txHash}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nhật ký canh tác */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Nhật ký canh tác</h2>
            <button 
              type="button"
              onClick={() => {
                setShowProcessForm(!showProcessForm);
                setProcessError(null);
                setProcessSuccess(null);
              }}
              className="btn-primary text-sm"
              disabled={isSavingProcess}
              aria-expanded={showProcessForm}
              aria-controls="farming-process-form"
            >
              {showProcessForm ? 'Đóng biểu mẫu' : '+ Thêm nhật ký'}
            </button>
          </div>

          <p className="mb-4 text-sm text-gray-500">Nhật ký được lưu ngay và hệ thống tự động ghi nhận, không cần admin duyệt. Ghi nhận hiện ở chế độ mô phỏng, không chứng nhận hoạt động canh tác ngoài thực tế.</p>
          {processSuccess && (
            <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-green-700">{processSuccess}</p>
          )}

          {/* Form thêm nhật ký */}
          {showProcessForm && (
            <div id="farming-process-form" className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-3">Thêm nhật ký canh tác</h3>
              <form onSubmit={handleAddProcess} className="space-y-4">
                {processError && (
                  <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{processError}</p>
                )}
                <fieldset disabled={isSavingProcess} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="process-type" className="label">Hoạt động canh tác *</label>
                    <select
                      id="process-type"
                      value={processForm.processType}
                      onChange={(e) => setProcessForm({...processForm, processType: e.target.value})}
                      className="input"
                      required
                    >
                      <option value="">Chọn hoạt động</option>
                      <option value="PREPARATION">Chuẩn bị</option>
                      <option value="PLANTING">Gieo hạt</option>
                      <option value="GROWING">Phát triển</option>
                      <option value="FERTILIZING">Bón phân</option>
                      <option value="IRRIGATION">Tưới tiêu</option>
                      <option value="PEST_CONTROL">Phòng trừ sâu bệnh</option>
                      <option value="MONITORING">Giám sát</option>
                      <option value="HARVESTING">Thu hoạch</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="process-date" className="label">Ngày thực hiện *</label>
                    <input
                      type="date"
                      id="process-date"
                      value={processForm.performedDate}
                      onChange={(e) => setProcessForm({...processForm, performedDate: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="process-description" className="label">Nội dung ghi chép</label>
                  <textarea
                    id="process-description"
                    value={processForm.description}
                    onChange={(e) => setProcessForm({...processForm, description: e.target.value})}
                    className="input"
                    rows={3}
                    maxLength={255}
                    placeholder="Mô tả chi tiết công việc..."
                  />
                  <p className="mt-1 text-xs text-gray-500">Tối đa 255 ký tự.</p>
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProcessForm(false);
                      setProcessError(null);
                    }}
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    {isSavingProcess ? 'Đang lưu...' : 'Lưu nhật ký'}
                  </button>
                </div>
                </fieldset>
              </form>
            </div>
          )}

          {/* Danh sách nhật ký */}
          {processes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có nhật ký canh tác nào</p>
              <p className="text-sm mt-1">Nhấn "Thêm nhật ký" để bắt đầu ghi chép</p>
            </div>
          ) : (
            <div className="space-y-4">
              {processes.map((process) => {
                const stageInfo = getProcessStageLabel(process.processType);
                const processStatus = process.status === 'SYNCED'
                  ? { label: 'Đã ghi nhận (mô phỏng)', color: 'bg-green-100 text-green-700' }
                  : process.status === 'PENDING_BLOCKCHAIN'
                  ? { label: 'Đã lưu · Chờ ghi nhận tự động', color: 'bg-yellow-100 text-yellow-700' }
                  : process.status === 'COMPLETED'
                  ? { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' }
                  : { label: process.status, color: 'bg-gray-100 text-gray-700' };
                return (
                  <div key={process.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageInfo.color}`}>
                          {stageInfo.label}
                        </span>
                        <p className="mt-2 text-gray-700 whitespace-pre-wrap break-words">{process.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{process.performedDate
                          ? new Date(process.performedDate).toLocaleDateString('vi-VN')
                          : 'Chưa có ngày thực hiện'}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${processStatus.color}`}>
                          {processStatus.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lô xuất hàng */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Lô xuất hàng & Mã QR</h2>
          
          {exportBatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có lô xuất hàng nào</p>
              <p className="text-sm mt-1">Lô xuất hàng sẽ xuất hiện sau khi thu hoạch và tạo mã QR</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportBatches.map((batch) => (
                <div key={batch.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{batch.batchCode}</p>
                      <p className="text-sm text-gray-500">
                        Số lượng: {batch.quantity} | Ngày: {batch.exportDate}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'EXPORTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {batch.status === 'EXPORTED' ? 'Đã xuất' : batch.status}
                    </span>
                  </div>
                  {batch.qrCode && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-1">Mã QR:</p>
                      <div className="bg-gray-100 rounded p-2 text-center">
                        <span className="text-sm font-mono">{batch.qrCode}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
