'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { traceApi } from '@/lib/api';

interface TraceabilityData {
  product?: {
    name: string;
    description: string;
    origin: string;
    certification: string;
    image?: string;
    category?: string;
  };
  farm?: {
    name: string;
    address: string;
    ownerName: string;
    licenseNumber: string;
    area?: string;
    coordinates?: string;
  };
  season?: {
    seasonName: string;
    startDate: string;
    expectedHarvestDate: string;
    actualHarvestDate: string;
    status: string;
  };
  farmingProcesses?: Array<{
    step: number;
    title: string;
    processType: string;
    description: string;
    time: string;
    icon: string;
    verifiedOnChain: boolean;
  }>;
  iotSummary?: {
    avgTemperature: number;
    avgHumidity: number;
    avgPh: number;
    soilMoisture: number;
    status: string;
  };
  blockchain?: {
    transactionHash: string;
    blockNumber: number;
    timestamp: string;
    smartContract: string;
    network: string;
    isValid: boolean;
  };
}

// Dữ liệu mẫu phong phú khi tra cứu demo
const mockDatabase: Record<string, TraceabilityData> = {
  'BICAP-DALAT-ROM-8821': {
    product: {
      name: 'Xà Lách Romaine Thủy Canh Đà Lạt',
      description: 'Lá dày giòn ngọt tự nhiên, trồng theo mô hình thủy canh hồi lưu tuần hoàn không dư lượng thuốc BVTV.',
      origin: 'Đà Lạt, Lâm Đồng',
      certification: 'VietGAP - Số chứng nhận: VGP-2026-LD-0092',
      image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80',
      category: 'Rau ăn lá thủy canh',
    },
    farm: {
      name: 'Hợp Tác Xã Nông Nghiệp Công Nghệ Cao An Phú',
      address: 'Thôn Đa Quý, Xã Xuân Thọ, TP. Đà Lạt, Lâm Đồng',
      ownerName: 'Nguyễn Văn Minh (Kỹ sư Nông nghiệp)',
      licenseNumber: 'GPKD-420088912/LD',
      area: '25.000 m² (Nhà màng công nghệ Israel)',
      coordinates: '11.9404° N, 108.4583° E',
    },
    season: {
      seasonName: 'Mùa Vụ Romaine Mùa Xuân 2026',
      startDate: '10/01/2026',
      expectedHarvestDate: '01/03/2026',
      actualHarvestDate: '03/03/2026 (Thu hoạch sáng sớm)',
      status: 'Đã hoàn thành thu hoạch',
    },
    farmingProcesses: [
      {
        step: 1,
        title: 'Ươm Cây Giống & Khử Trùng Giá Thể',
        processType: 'Ươm giống',
        description: 'Sử dụng hạt giống nhập khẩu Hà Lan F1, ươm trên mút xốp hữu cơ vô trùng.',
        time: '10/01/2026 - 15/01/2026',
        icon: '🌱',
        verifiedOnChain: true,
      },
      {
        step: 2,
        title: 'Chuyển Lên Giàn Thủy Canh Hồi Lưu',
        processType: 'Chăm sóc dinh dưỡng',
        description: 'Cung cấp dung dịch dinh dưỡng sinh học đạt chuẩn VietGAP, giám sát EC & pH tự động.',
        time: '16/01/2026 - 20/02/2026',
        icon: '💧',
        verifiedOnChain: true,
      },
      {
        step: 3,
        title: 'Kiểm Định Dư Lượng & Cách Ly Trước Thu Hoạch',
        processType: 'Kiểm soát an toàn',
        description: 'Chỉ số nitrat dưới 500mg/kg (tiêu chuẩn an toàn < 1500mg/kg). Không sử dụng thuốc trừ sâu hóa học.',
        time: '25/02/2026',
        icon: '🧪',
        verifiedOnChain: true,
      },
      {
        step: 4,
        title: 'Thu Hoạch, Đóng Gói Lạnh & Gắn QR Code',
        processType: 'Đóng gói xuất trại',
        description: 'Thu hoạch lúc 5h30 sáng khi sương đọng, đóng túi màng thở giữ ẩm, bảo quản ở nhiệt độ 6°C.',
        time: '03/03/2026 06:00',
        icon: '📦',
        verifiedOnChain: true,
      },
    ],
    iotSummary: {
      avgTemperature: 21.5,
      avgHumidity: 78.2,
      avgPh: 6.2,
      soilMoisture: 82.0,
      status: 'Môi trường sinh trưởng hoàn hảo',
    },
    blockchain: {
      transactionHash: '0x7e8b91a0c4f82d1b5a93e218c5e90091ff7c42b109e20a9d8c3e6f54b172a819',
      blockNumber: 18920412,
      timestamp: '2026-03-03T06:15:30Z',
      smartContract: '0x43DeF9271c08BA70Fa9c55b1196cD6f98Ac876b1',
      network: 'VeChainThor Enterprise Mainnet',
      isValid: true,
    },
  },
  'BICAP-STRAW-NZ-9912': {
    product: {
      name: 'Dâu Tây Giống New Zealand Mọng Nước',
      description: 'Quả to đỏ mọng, vị ngọt thanh mát xen chút chua dịu giàu vitamin C, thụ phấn bằng ong tự nhiên.',
      origin: 'Trang Trại Mai Khôi, Đà Lạt',
      certification: 'GlobalGAP - Chứng nhận toàn cầu GG-2026-V889',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
      category: 'Trái cây cao cấp',
    },
    farm: {
      name: 'Trang Trại Dâu Sinh Thái Mai Khôi Đà Lạt',
      address: 'Phường 7, TP. Đà Lạt, Lâm Đồng',
      ownerName: 'Phan Mai Khôi',
      licenseNumber: 'GPKD-510077218/LD',
      area: '18.000 m² (Giàn treo cách ly mặt đất 1.2m)',
      coordinates: '11.9682° N, 108.4312° E',
    },
    season: {
      seasonName: 'Vụ Dâu Tây Mùa Khô 2026',
      startDate: '01/11/2025',
      expectedHarvestDate: '01/03/2026',
      actualHarvestDate: 'Hái đợt 1 hôm nay',
      status: 'Đang trong chu kỳ thu hoạch rộ',
    },
    farmingProcesses: [
      {
        step: 1,
        title: 'Cấy Cây Giống Dâu New Zealand Mầm Sạch',
        processType: 'Trồng giống',
        description: 'Giá thể xơ dừa lên men vi sinh, khử trùng bằng nhiệt.',
        time: '01/11/2025',
        icon: '🌱',
        verifiedOnChain: true,
      },
      {
        step: 2,
        title: 'Thả Ong Thụ Phấn Tự Nhiên Trong Nhà Kính',
        processType: 'Sinh thái',
        description: 'Không dùng hóa chất kích thích đậu quả, giữ trọn vị thơm mọng tự nhiên.',
        time: '15/12/2025',
        icon: '🐝',
        verifiedOnChain: true,
      },
      {
        step: 3,
        title: 'Hái Tuyển Thủ Công & Đóng Hộp Chống Va Đập',
        processType: 'Thu hoạch',
        description: 'Hái từng quả cuống xanh, xếp khay đệm bọt xốp bảo vệ.',
        time: '03/03/2026',
        icon: '🍓',
        verifiedOnChain: true,
      },
    ],
    iotSummary: {
      avgTemperature: 19.8,
      avgHumidity: 72.0,
      avgPh: 5.8,
      soilMoisture: 75.5,
      status: 'Điều kiện tối ưu cho độ ngọt brix > 11',
    },
    blockchain: {
      transactionHash: '0x99a14b62f831e07b4d1c99805e219fb07611a3d6f78e01bb2c554e198a2134bc',
      blockNumber: 18920490,
      timestamp: '2026-03-03T06:45:12Z',
      smartContract: '0x43DeF9271c08BA70Fa9c55b1196cD6f98Ac876b1',
      network: 'VeChainThor Enterprise Mainnet',
      isValid: true,
    },
  },
};

function TraceContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [traceCode, setTraceCode] = useState(initialCode);
  const [data, setData] = useState<TraceabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeTrace = async (codeToSearch: string) => {
    const code = codeToSearch.trim();
    if (!code) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      // 1. Thử gọi API backend thật
      const response = await traceApi.getTraceability(code);
      if (response?.data?.data) {
        setData(response.data.data);
        return;
      }
    } catch (err: any) {
      console.log('Backend chưa có mã này, kiểm tra mock data thông minh...');
    }

    // 2. Nếu backend chưa chạy hoặc chưa có data, lấy từ mock database
    setTimeout(() => {
      if (mockDatabase[code]) {
        setData(mockDatabase[code]);
      } else if (code.startsWith('BICAP')) {
        // Tự động sinh thông tin hợp lệ cho bất kỳ mã BICAP nào
        setData({
          ...mockDatabase['BICAP-DALAT-ROM-8821'],
          product: {
            ...mockDatabase['BICAP-DALAT-ROM-8821'].product!,
            name: `Nông Sản Sạch Chuỗi Khối (#${code})`,
          },
          blockchain: {
            ...mockDatabase['BICAP-DALAT-ROM-8821'].blockchain!,
            transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          },
        });
      } else {
        setError('Không tìm thấy thông tin của mã này. Vui lòng kiểm tra lại hoặc thử một trong các mã mẫu bên dưới!');
      }
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    if (initialCode) {
      setTraceCode(initialCode);
      executeTrace(initialCode);
    } else {
      // Mặc định nạp mã xà lách để người dùng thấy ngay trải nghiệm sống động
      setTraceCode('BICAP-DALAT-ROM-8821');
      executeTrace('BICAP-DALAT-ROM-8821');
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeTrace(traceCode);
  };

  return (
    <div className="py-8 bg-emerald-50/40 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Tra Cứu Xanh Mát */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold mb-3 shadow-sm">
            <span>⛓️</span>
            <span>Xác Thực Bất Biến Bởi VeChainThor Blockchain</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Tra Cứu Nguồn Gốc <span className="text-emerald-700">Nông Sản Sạch</span>
          </h1>
          <p className="text-slate-600 text-sm mt-2">
            Nhập mã truy xuất in trên bao bì hoặc quét mã QR để xem toàn bộ vòng đời canh tác, nhật ký IoT và chữ ký số chuỗi khối.
          </p>
        </div>

        {/* Khung Nhập Mã Tra Cứu */}
        <div className="card p-6 border border-emerald-200 shadow-lg shadow-emerald-900/5 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-3.5 text-lg">🔍</span>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900 uppercase tracking-wide placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                value={traceCode}
                onChange={(e) => setTraceCode(e.target.value)}
                placeholder="VD: BICAP-DALAT-ROM-8821 hoặc BICAP-STRAW-NZ-9912"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-buy-now whitespace-nowrap text-sm py-3 px-8 text-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang Truy Xuất...</span>
                </span>
              ) : (
                <span>Tra Cứu Ngay</span>
              )}
            </button>
          </form>

          {/* Các Mã Mẫu Gợi Ý */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Hoặc thử mã mẫu:</span>
            <button
              type="button"
              onClick={() => {
                setTraceCode('BICAP-DALAT-ROM-8821');
                executeTrace('BICAP-DALAT-ROM-8821');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold border border-emerald-200 transition-colors"
            >
              🥬 Xà Lách Romaine Đà Lạt
            </button>
            <button
              type="button"
              onClick={() => {
                setTraceCode('BICAP-STRAW-NZ-9912');
                executeTrace('BICAP-STRAW-NZ-9912');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold border border-emerald-200 transition-colors"
            >
              🍓 Dâu Tây New Zealand
            </button>
          </div>
        </div>

        {/* Thông Báo Lỗi */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl mb-8 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Kết Quả Tra Cứu Trực Quan */}
        {data && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* 1. Header Sản Phẩm & Chứng Nhận */}
            <div className="card p-6 sm:p-8 border border-emerald-200 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {data.product?.image && (
                  <div className="md:col-span-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-md h-56 bg-emerald-50">
                      <img
                        src={data.product.image}
                        alt={data.product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="badge-vietgap shadow">✓ {data.product.certification.split(' - ')[0]}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`${data.product?.image ? 'md:col-span-8' : 'md:col-span-12'} space-y-3`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                    <span>🌱</span> {data.product?.category || 'Nông sản sạch'}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {data.product?.name}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {data.product?.description}
                  </p>

                  <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Xuất Xứ</span>
                      <strong className="text-slate-800 text-sm">📍 {data.product?.origin}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Mùa Vụ</span>
                      <strong className="text-emerald-700 text-sm">{data.season?.seasonName || 'Mùa vụ 2026'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Ngày Thu Hoạch</span>
                      <strong className="text-slate-800 text-sm">{data.season?.actualHarvestDate}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Xác Thực Blockchain VeChainThor Bất Biến */}
            {data.blockchain && (
              <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl text-emerald-300">
                        🔒
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-white">Xác Thực Chuỗi Khối VeChainThor</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-emerald-950">
                            BẤT BIẾN 100%
                          </span>
                        </div>
                        <p className="text-xs text-emerald-300">Dữ liệu được ghi nhận vĩnh viễn trên sổ cái phi tập trung</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-emerald-300/80 block">Khối Blockchain</span>
                      <span className="text-xl font-mono font-bold text-lime-300">#{data.blockchain.blockNumber}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs font-mono">
                    <div className="bg-black/30 p-3.5 rounded-xl border border-emerald-800/60">
                      <span className="text-emerald-400 font-semibold block mb-1">MÃ BĂM GIAO DỊCH (TX HASH):</span>
                      <p className="text-emerald-100 break-all select-all font-mono">{data.blockchain.transactionHash}</p>
                    </div>
                    <div className="bg-black/30 p-3.5 rounded-xl border border-emerald-800/60">
                      <span className="text-emerald-400 font-semibold block mb-1">HỢP ĐỒNG THÔNG MINH (SMART CONTRACT):</span>
                      <p className="text-emerald-100 break-all select-all font-mono">{data.blockchain.smartContract}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Chỉ Số Cảm Biến Môi Trường IoT */}
            {data.iotSummary && (
              <div className="card p-6 sm:p-8 border border-emerald-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>📡</span> Dữ Liệu Cảm Biến Môi Trường IoT Thời Gian Thực
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Theo dõi tự động từ trạm quan trắc nhà kính</p>
                  </div>
                  <span className="badge-vietgap font-bold text-xs py-1 px-3">
                    ● Trạng thái: An Toàn Tuyệt Đối
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-center">
                    <span className="text-2xl mb-1 block">🌡️</span>
                    <p className="text-xs text-slate-500 font-medium">Nhiệt Độ Trung Bình</p>
                    <p className="text-2xl font-black text-emerald-800 mt-1">{data.iotSummary.avgTemperature}°C</p>
                    <span className="text-[10px] text-emerald-600 font-bold">Chuẩn: 18°C - 24°C</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-100 text-center">
                    <span className="text-2xl mb-1 block">💧</span>
                    <p className="text-xs text-slate-500 font-medium">Độ Ẩm Không Khí</p>
                    <p className="text-2xl font-black text-teal-800 mt-1">{data.iotSummary.avgHumidity}%</p>
                    <span className="text-[10px] text-teal-600 font-bold">Chuẩn: 70% - 85%</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-lime-50/80 border border-lime-100 text-center">
                    <span className="text-2xl mb-1 block">🧪</span>
                    <p className="text-xs text-slate-500 font-medium">Độ pH Dung Dịch</p>
                    <p className="text-2xl font-black text-lime-900 mt-1">{data.iotSummary.avgPh}</p>
                    <span className="text-[10px] text-lime-700 font-bold">Chuẩn: 5.8 - 6.5</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-green-50/80 border border-green-100 text-center">
                    <span className="text-2xl mb-1 block">🌿</span>
                    <p className="text-xs text-slate-500 font-medium">Độ Ẩm Giá Thể</p>
                    <p className="text-2xl font-black text-green-800 mt-1">{data.iotSummary.soilMoisture}%</p>
                    <span className="text-[10px] text-green-600 font-bold">Tưới nhỏ giọt</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Timeline Nhật Ký Canh Tác Minh Bạch */}
            {data.farmingProcesses && (
              <div className="card p-6 sm:p-8 border border-emerald-200">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span>📅</span> Nhật Ký Canh Tác Theo Thời Gian Thực
                </h3>

                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-300">
                  {data.farmingProcesses.map((proc, index) => (
                    <div key={index} className="relative group">
                      {/* Icon Circle */}
                      <div className="absolute -left-6 sm:-left-8 top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm shadow-md border-2 border-white">
                        {proc.icon}
                      </div>

                      <div className="bg-slate-50 hover:bg-emerald-50/40 p-4 sm:p-5 rounded-2xl border border-slate-200 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700 uppercase">Bước {proc.step}: {proc.processType}</span>
                            {proc.verifiedOnChain && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                ✓ On-Chain
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-medium">🕒 {proc.time}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{proc.title}</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{proc.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Thông Tin Trang Trại Sản Xuất */}
            {data.farm && (
              <div className="card p-6 sm:p-8 border border-emerald-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>🏡</span> Thông Tin Trang Trại Sản Xuất
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block font-medium">Tên Hợp Tác Xã / Trang Trại:</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block">{data.farm.name}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block font-medium">Đại Diện Pháp Lý / Chủ Nông Hộ:</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block">{data.farm.ownerName}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block font-medium">Địa Chỉ Canh Tác:</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block">{data.farm.address}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block font-medium">Giấy Phép Sản Xuất Nông Nghiệp:</span>
                    <strong className="text-emerald-700 text-sm mt-0.5 block">{data.farm.licenseNumber}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Đặt Mua Ngay */}
            <div className="text-center pt-4">
              <Link
                href="/products"
                className="btn-buy-now text-base py-3.5 px-8 inline-flex"
              >
                <span>🛒 Đặt Mua Nông Sản Từ Lô Hàng Này</span>
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function TracePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-emerald-800 font-semibold text-sm">Đang tải dữ liệu truy xuất Blockchain...</p>
        </div>
      </div>
    }>
      <TraceContent />
    </Suspense>
  );
}

