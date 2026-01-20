import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportForm, setReportForm] = useState({
    title: '',
    content: ''
  });
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    loadSummaryReport();
  }, []);

  const loadSummaryReport = async () => {
    try {
      setLoading(true);
      const data = await api.getSummaryReport();
      setReport(data);
    } catch (err) {
      setError('Không thể tải báo cáo tổng hợp');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!reportForm.title || !reportForm.content) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setSendingReport(true);
      // Note: This would typically call an API endpoint to send report to admin
      // For now, we'll just show a success message
      // await api.sendReportToAdmin(reportForm);
      alert('Gửi báo cáo thành công! (Tính năng này cần API endpoint từ backend)');
      setReportForm({ title: '', content: '' });
    } catch (err) {
      alert('Lỗi khi gửi báo cáo: ' + (err.message || 'Vui lòng thử lại'));
      console.error(err);
    } finally {
      setSendingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">📊 Báo cáo & Thống kê</h2>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Gửi báo cáo tổng hợp cho Admin</h5>
          <form onSubmit={handleSendReport}>
            <div className="mb-3">
              <label className="form-label">Tiêu đề báo cáo</label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: Báo cáo vận chuyển tháng 10"
                value={reportForm.title}
                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nội dung chi tiết</label>
              <textarea
                className="form-control"
                rows="5"
                value={reportForm.content}
                onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                placeholder="Nhập nội dung báo cáo..."
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={sendingReport}>
              {sendingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Thống kê nhanh</h5>
          <div className="row text-center">
            <div className="col-md-4 mb-3">
              <div className="p-3 border bg-light rounded">
                <h3 className="text-primary">{report?.totalShipments || 0}</h3>
                <p className="mb-0">Tổng chuyến hàng</p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 border bg-light rounded">
                <h3 className="text-success">{report?.totalDrivers || 0}</h3>
                <p className="mb-0">Tổng số tài xế</p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 border bg-light rounded">
                <h3 className="text-info">{report?.totalVehicles || 0}</h3>
                <p className="mb-0">Tổng số xe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
