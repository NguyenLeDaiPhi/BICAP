const express = require('express');
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: path.resolve(__dirname, '..', 'config', '.env') });

const router = express.Router();

// Cấu hình URL tới các Services
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:8085';
const TRADING_ORDER_SERVICE_URL = process.env.TRADING_ORDER_SERVICE_URL || 'http://localhost:8082';

// Đồng bộ secret/role với authentication.js để đọc JWT trong cookie
const JWT_SECRET_STRING = 'YmljYXAtc2VjcmV0LWtleS1mb3Itand0LWF1dGhlbnRpY2F0aW9u';
const JWT_SECRET = Buffer.from(JWT_SECRET_STRING, 'base64');
const APPLICATION_ROLE = 'ROLE_ADMIN';

// Gắn cookie-parser cho router
router.use(cookieParser());

// Lấy JWT từ cookie và gán req.user
const requireAuth = (req, res, next) => {
    const token = req.cookies?.auth_token;
    console.log('[adminOrder requireAuth] Path:', req.path);
    console.log('[adminOrder requireAuth] Token exists:', !!token);
    if (!token) {
        console.log('[adminOrder requireAuth] No token, redirecting to login');
        return res.redirect('/login');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('[adminOrder requireAuth] Token verified for user:', decoded.sub);
        req.user = {
            sub: decoded.sub,
            username: decoded.sub,
            email: decoded.email,
            roles: decoded.roles || []
        };
        req.accessToken = token;
        return next();
    } catch (err) {
        console.log('[adminOrder requireAuth] Token verify error:', err.message);
        return res.redirect('/login');
    }
};

// Kiểm tra role Admin
const requireAdmin = (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    const roles = req.user.roles || [];
    if (!roles.includes('ADMIN') && !roles.includes(APPLICATION_ROLE)) {
        return res.status(403).render('error', { message: 'Bạn không có quyền truy cập trang này!' });
    }
    next();
};

// =========================================================
// 1. ROUTE: XÉT DUYỆT SẢN PHẨM LÊN SÀN (Product Approval)
// =========================================================

// Trang xét duyệt sản phẩm (hiển thị sản phẩm PENDING)
router.get('/admin/categories', requireAuth, requireAdmin, async (req, res) => {
    try {
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        const { page = 0, keyword = '' } = req.query;
        
        console.log('Calling Trading Order Service for pending products at:', TRADING_ORDER_SERVICE_URL);
        
        // Gọi API lấy danh sách sản phẩm PENDING từ Trading Order Service
        let apiUrl = `${TRADING_ORDER_SERVICE_URL}/api/admin/products/pending?page=${page}&size=10`;
        if (keyword) {
            apiUrl += `&keyword=${encodeURIComponent(keyword)}`;
        }
        
        const response = await axios.get(apiUrl, { 
            headers,
            timeout: 10000
        });
        
        const products = response.data || { content: [], totalPages: 0 };
        console.log('Pending products received:', products.content?.length || 0, 'items');

        res.render('admin-categories', {
            products: products,
            currentPage: parseInt(page),
            keyword: keyword,
            user: req.user
        });
    } catch (e) {
        console.error('Lỗi gọi Pending Products API:', e.message);
        res.render('admin-categories', {
            products: { content: [], totalPages: 0 },
            currentPage: 0,
            keyword: '',
            user: req.user
        });
    }
});

// API Proxy: Tạo danh mục mới
router.post('/api/v1/admin/categories', requireAuth, requireAdmin, async (req, res) => {
    try {
        const headers = { 
            Authorization: `Bearer ${req.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        console.log('Creating new category:', req.body);
        
        const response = await axios.post(`${ADMIN_SERVICE_URL}/api/v1/admin/categories`, req.body, {
            headers,
            timeout: 5000
        });
        
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Lỗi tạo category:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || error.response?.data || 'Lỗi khi tạo danh mục';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Cập nhật danh mục
router.put('/api/v1/admin/categories/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const headers = { 
            Authorization: `Bearer ${req.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        console.log('Updating category:', id, req.body);
        
        const response = await axios.put(`${ADMIN_SERVICE_URL}/api/v1/admin/categories/${id}`, req.body, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi cập nhật category:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || error.response?.data || 'Lỗi khi cập nhật danh mục';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Xóa mềm danh mục (ẩn)
router.delete('/api/v1/admin/categories/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        console.log('Soft deleting category:', id);
        
        const response = await axios.delete(`${ADMIN_SERVICE_URL}/api/v1/admin/categories/${id}`, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json({ message: response.data || 'Đã ẩn danh mục thành công' });
    } catch (error) {
        console.error('Lỗi xóa category:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || error.response?.data || 'Lỗi khi xóa danh mục';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Xóa vĩnh viễn danh mục
router.delete('/api/v1/admin/categories/:id/permanent', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        console.log('Hard deleting category:', id);
        
        const response = await axios.delete(`${ADMIN_SERVICE_URL}/api/v1/admin/categories/${id}/permanent`, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json({ message: response.data || 'Đã xóa vĩnh viễn danh mục' });
    } catch (error) {
        console.error('Lỗi xóa vĩnh viễn category:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || error.response?.data || 'Lỗi khi xóa vĩnh viễn danh mục';
        res.status(statusCode).json({ message });
    }
});

// =========================================================
// 2. ROUTE: GIÁM SÁT SẢN PHẨM (Products)
// =========================================================

// Trang giám sát sản phẩm
router.get('/admin/products', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { keyword = '', status = '', farmId = '', page = 0, size = 10 } = req.query;
        const headers = { Authorization: `Bearer ${req.accessToken}` };

        console.log('Calling Admin Service for products at:', ADMIN_SERVICE_URL);

        // Chỉ gửi các tham số filter khi có giá trị, tránh truyền chuỗi rỗng gây lỗi/không khớp
        const params = {
            page,
            size
        };
        if (keyword) params.keyword = keyword;
        if (status) params.status = status;
        if (farmId) params.farmId = farmId;

        // Gọi API lấy danh sách products từ Admin Service
        const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/products`, {
            params,
            headers,
            timeout: 5000
        });

        const payload = response.data || {};
        const products = payload.content || [];
        const pagination = {
            page: payload.number ?? Number(page) ?? 0,
            size: payload.size ?? Number(size) ?? 10,
            totalPages: payload.totalPages ?? 1,
            totalElements: payload.totalElements ?? products.length
        };

        console.log('Products received:', products.length, 'items');

        res.render('admin-products', {
            products: products,
            keyword,
            status,
            farmId,
            pagination,
            user: req.user
        });
    } catch (e) {
        console.error('Lỗi gọi Products API:', e.message);
        res.render('admin-products', {
            products: [],
            keyword: '',
            status: '',
            farmId: '',
            pagination: { page: 0, size: 10, totalPages: 1, totalElements: 0 },
            user: req.user
        });
    }
});

// API Proxy: Lấy chi tiết sản phẩm
router.get('/api/v1/admin/products/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/products/${id}`, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi lấy chi tiết product:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi lấy chi tiết sản phẩm';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Khóa sản phẩm (ban)
router.put('/api/v1/admin/products/:id/ban', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const headers = { 
            Authorization: `Bearer ${req.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        console.log('Banning product:', id, req.body);
        
        const response = await axios.put(`${ADMIN_SERVICE_URL}/api/v1/admin/products/${id}/ban`, req.body, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi khóa product:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi khóa sản phẩm';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Mở khóa sản phẩm (unban)
router.put('/api/v1/admin/products/:id/unban', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        console.log('Unbanning product:', id);
        
        const response = await axios.put(`${ADMIN_SERVICE_URL}/api/v1/admin/products/${id}/unban`, null, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi mở khóa product:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi mở khóa sản phẩm';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Duyệt sản phẩm lên sàn (approve)
router.put('/api/v1/admin/products/:id/approve', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const headers = { 
            Authorization: `Bearer ${req.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        console.log('Approving product:', id);
        
        // Gọi API Trading Order Service để approve sản phẩm
        const response = await axios.put(`${TRADING_ORDER_SERVICE_URL}/api/admin/products/${id}/approve`, null, {
            headers,
            timeout: 10000
        });
        
        res.status(200).json(response.data || { message: 'Đã duyệt sản phẩm thành công!' });
    } catch (error) {
        console.error('Lỗi duyệt product:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi duyệt sản phẩm';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Từ chối sản phẩm (reject)
router.put('/api/v1/admin/products/:id/reject', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const headers = { 
            Authorization: `Bearer ${req.accessToken}`,
            'Content-Type': 'application/json'
        };
        
        console.log('Rejecting product:', id, 'Reason:', reason);
        
        // Gọi API Trading Order Service để reject sản phẩm
        const response = await axios.put(`${TRADING_ORDER_SERVICE_URL}/api/admin/products/${id}/reject`, 
            { reason: reason },
            { headers, timeout: 10000 }
        );
        
        res.status(200).json(response.data || { message: 'Đã từ chối sản phẩm!' });
    } catch (error) {
        console.error('Lỗi từ chối product:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi từ chối sản phẩm';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Thống kê sản phẩm
router.get('/api/v1/admin/products/statistics', requireAuth, requireAdmin, async (req, res) => {
    try {
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/products/statistics`, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi lấy thống kê products:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi lấy thống kê sản phẩm';
        res.status(statusCode).json({ message });
    }
});

// =========================================================
// 3. ROUTE: QUẢN LÝ ĐƠN HÀNG (Orders)
// =========================================================

// Trang quản lý đơn hàng
router.get('/admin/orders', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { status = '' } = req.query;
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        console.log('Calling Admin Service for orders at:', ADMIN_SERVICE_URL);
        
        let orders = [];
        
        if (status) {
            // Lấy đơn hàng theo trạng thái
            const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/orders/status/${status}`, { 
                headers,
                timeout: 5000
            });
            orders = response.data || [];
        } else {
            // Lấy tất cả đơn hàng
            const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/orders`, { 
                headers,
                timeout: 5000
            });
            orders = response.data || [];
        }
        
        console.log('Orders received:', orders.length, 'items');

        res.render('admin-orders', {
            orders: orders,
            status,
            user: req.user
        });
    } catch (e) {
        console.error('Lỗi gọi Orders API:', e.message);
        res.render('admin-orders', {
            orders: [],
            status: '',
            user: req.user
        });
    }
});

// API Proxy: Lấy tất cả đơn hàng
router.get('/api/v1/admin/orders', requireAuth, requireAdmin, async (req, res) => {
    try {
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/orders`, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi lấy danh sách orders:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Lấy chi tiết đơn hàng
router.get('/api/v1/admin/orders/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/orders/${id}`, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi lấy chi tiết order:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi lấy chi tiết đơn hàng';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Lấy đơn hàng theo trạng thái
router.get('/api/v1/admin/orders/status/:status', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { status } = req.params;
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/orders/status/${status}`, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi lấy orders theo status:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi lấy đơn hàng theo trạng thái';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Lấy đơn hàng theo Farm
router.get('/api/v1/admin/orders/by-farm/:farmId', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { farmId } = req.params;
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/orders/by-farm/${farmId}`, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi lấy orders theo farm:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi lấy đơn hàng theo farm';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Thống kê đơn hàng
router.get('/api/v1/admin/orders/statistics', requireAuth, requireAdmin, async (req, res) => {
    try {
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/orders/statistics`, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi lấy thống kê orders:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi lấy thống kê đơn hàng';
        res.status(statusCode).json({ message });
    }
});

// API Proxy: Đếm tổng đơn hàng
router.get('/api/v1/admin/orders/count', requireAuth, requireAdmin, async (req, res) => {
    try {
        const headers = { Authorization: `Bearer ${req.accessToken}` };
        
        const response = await axios.get(`${ADMIN_SERVICE_URL}/api/v1/admin/orders/count`, {
            headers,
            timeout: 5000
        });
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Lỗi đếm orders:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const message = error.response?.data?.message || 'Lỗi khi đếm đơn hàng';
        res.status(statusCode).json({ message });
    }
});

module.exports = router;
