'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi, getErrorMessage } from '@/lib/api';

type Resource = 'farms' | 'products' | 'orders' | 'users';
interface Row {
  id?: number;
  orderId?: number;
  farmName?: string;
  address?: string;
  ownerName?: string;
  name?: string;
  categoryName?: string;
  imageUrl?: string;
  category?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  username?: string;
  email?: string;
  roles?: string[];
  status?: string;
  totalAmount?: number;
  createdAt?: string;
}
interface Column {
  label: string;
  render: (row: Row) => ReactNode;
}

const text = (value: string | number | undefined) => value ?? '—';
const money = (value: number | undefined) => value == null
  ? '—'
  : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const date = (value: string | undefined) => value ? new Date(value).toLocaleString('vi-VN') : '—';
const statusLabels: Record<string, string> = {
  ACTIVE: 'Hoạt động', INACTIVE: 'Không hoạt động', BLOCKED: 'Đã khóa',
  BANNED: 'Đã khóa', PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối', OUT_OF_STOCK: 'Hết hàng', CREATED: 'Mới tạo',
  CONFIRMED: 'Đã xác nhận', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy',
};
const roleLabels: Record<string, string> = {
  ROLE_ADMIN: 'Quản trị viên', ROLE_FARMMANAGER: 'Quản lý trang trại',
  ROLE_RETAILER: 'Nhà bán lẻ', ROLE_SHIPPINGMANAGER: 'Quản lý vận chuyển',
  ROLE_SHIPPINGDRIVER: 'Tài xế', ROLE_USER: 'Người dùng',
};
const status = (row: Row) => row.status ? (
  <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
    {statusLabels[row.status] || row.status}
  </span>
) : '—';

const resources: Record<Resource, { title: string; description: string; columns: Column[] }> = {
  farms: {
    title: 'Trang trại', description: 'Danh sách trang trại trong hệ thống.',
    columns: [
      { label: 'ID', render: row => text(row.id) },
      { label: 'Tên trang trại', render: row => text(row.farmName) },
      { label: 'Địa chỉ', render: row => text(row.address) },
      { label: 'Chủ trang trại', render: row => text(row.ownerName) },
    ],
  },
  products: {
    title: 'Sản phẩm', description: 'Tiếp nhận và duyệt sản phẩm do trang trại gửi lên sàn giao dịch.',
    columns: [
      { label: 'ID', render: row => text(row.id) },
      { label: 'Ảnh', render: row => row.imageUrl ? <a href={row.imageUrl} target="_blank" rel="noreferrer"><img src={row.imageUrl} alt={row.name || 'Ảnh sản phẩm'} className="h-16 w-16 rounded-lg object-cover" /></a> : 'Chưa có ảnh' },
      { label: 'Tên sản phẩm', render: row => text(row.name) },
      { label: 'Danh mục', render: row => text(row.categoryName || row.category) },
      { label: 'Trang trại', render: row => text(row.farmName) },
      { label: 'Giá', render: row => money(row.price) },
      { label: 'Số lượng', render: row => `${text(row.quantity)} ${row.unit || ''}` },
      { label: 'Trạng thái', render: status },
    ],
  },
  orders: {
    title: 'Đơn hàng', description: 'Theo dõi các đơn hàng trong hệ thống.',
    columns: [
      { label: 'Mã đơn', render: row => text(row.orderId) },
      { label: 'Tổng tiền', render: row => money(row.totalAmount) },
      { label: 'Trạng thái', render: status },
      { label: 'Ngày tạo', render: row => date(row.createdAt) },
    ],
  },
  users: {
    title: 'Người dùng', description: 'Danh sách tài khoản, vai trò và trạng thái hoạt động.',
    columns: [
      { label: 'ID', render: row => text(row.id) },
      { label: 'Tên tài khoản', render: row => text(row.username) },
      { label: 'Email', render: row => text(row.email) },
      { label: 'Vai trò', render: row => row.roles?.map(role => roleLabels[role] || role).join(', ') || '—' },
      { label: 'Trạng thái', render: status },
    ],
  },
};
const pageSize = 20;

export default function AdminResourcePage({ resource }: { resource: Resource }) {
  const router = useRouter();
  const config = resources[resource];
  const paginated = resource === 'products' || resource === 'users';
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const approveProduct = async (row: Row) => {
    if (row.id == null || approvingId != null || !row.imageUrl) return;
    setApprovingId(row.id); setActionError(null); setSuccess(null);
    try {
      await adminApi.approveProduct(row.id);
      setSuccess(`Đã duyệt sản phẩm “${row.name || row.id}”.`);
      setRefresh(value => value + 1);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = { page, size: pageSize, keyword: keyword || undefined };
    const request = resource === 'users' ? adminApi.getUsers(params)
      : resource === 'products' ? adminApi.getProducts(params)
      : resource === 'farms' ? adminApi.getFarms() : adminApi.getOrders();
    request.then(response => {
      if (cancelled) return;
      const data = response.data;
      const content = Array.isArray(data) ? data : data.content;
      if (!Array.isArray(content)) throw new Error('Không thể đọc danh sách từ máy chủ.');
      setRows(content);
      setTotal(Array.isArray(data) ? data.length : data.totalElements);
    }).catch(err => {
      if (!cancelled) setError(err.response?.status === 403
        ? 'Tài khoản không có quyền truy cập. Vui lòng đăng nhập bằng tài khoản admin.'
        : getErrorMessage(err));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [resource, paginated ? page : 0, paginated ? keyword : '', refresh, router]);

  const filteredRows = paginated ? rows : rows.filter(row =>
    Object.values(row).some(value => String(value ?? '').toLocaleLowerCase('vi').includes(keyword.toLocaleLowerCase('vi'))));
  const count = paginated ? total : filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const visibleRows = paginated ? rows : filteredRows.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-sm font-semibold text-emerald-700">← Bảng điều khiển admin</Link>
          <nav aria-label="Quản trị" className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(resources) as Resource[]).map(key => (
              <Link key={key} href={`/${key}`} aria-current={resource === key ? 'page' : undefined}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${resource === key ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}>
                {resources[key].title}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
        </div>
        <div className="card">
          {actionError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{actionError}</p>}
          {success && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-4 text-emerald-800">{success}</p>}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <form className="flex w-full gap-2 sm:w-auto" onSubmit={event => {
              event.preventDefault(); setKeyword(query.trim()); setPage(0);
            }}>
              <label htmlFor="admin-search" className="sr-only">Tìm kiếm {config.title.toLowerCase()}</label>
              <input id="admin-search" type="search" className="input sm:w-72" placeholder="Nhập từ khóa tìm kiếm..."
                value={query} onChange={event => setQuery(event.target.value)} />
              <button type="submit" className="btn-primary whitespace-nowrap">Tìm kiếm</button>
            </form>
            <button type="button" disabled={loading} className="btn-secondary disabled:opacity-50" onClick={() => setRefresh(value => value + 1)}>Tải lại</button>
          </div>
          {loading ? <p role="status" className="py-12 text-center text-slate-500">Đang tải danh sách...</p>
            : error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
              <p>{error}</p>
              <button type="button" className="mt-3 font-semibold underline" onClick={() => setRefresh(value => value + 1)}>Thử lại</button>
            </div>
            : <>
              <p className="mb-3 text-sm text-slate-500">{count} bản ghi{keyword && ` · Từ khóa: ${keyword}`}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-emerald-50 text-emerald-900">
                    <tr>{config.columns.map(column => <th key={column.label} scope="col" className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
                      {resource === 'products' && <th scope="col" className="px-4 py-3">Xác nhận</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleRows.length ? visibleRows.map(row => <tr key={row.id ?? row.orderId} className="hover:bg-slate-50">
                      {config.columns.map(column => <td key={column.label} className="px-4 py-4 text-slate-700">{column.render(row)}</td>)}
                      {resource === 'products' && <td className="px-4 py-4">
                        {row.status === 'PENDING' ? <button type="button" className="btn-primary whitespace-nowrap disabled:opacity-50"
                          disabled={approvingId != null || !row.imageUrl} onClick={() => approveProduct(row)}>
                          {!row.imageUrl ? 'Cần bổ sung ảnh' : approvingId === row.id ? 'Đang duyệt...' : 'Duyệt sản phẩm'}
                        </button> : <span className="text-slate-500">{row.status === 'APPROVED' ? 'Đã duyệt' : '—'}</span>}
                      </td>}
                    </tr>) : <tr><td colSpan={config.columns.length + (resource === 'products' ? 1 : 0)} className="px-4 py-12 text-center text-slate-500">
                      {keyword ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có dữ liệu.'}
                    </td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Trang {page + 1} / {pageCount}</span>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary disabled:opacity-40" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Trước</button>
                  <button type="button" className="btn-secondary disabled:opacity-40" disabled={page + 1 >= pageCount} onClick={() => setPage(value => value + 1)}>Sau</button>
                </div>
              </div>
            </>}
        </div>
      </main>
    </div>
  );
}
