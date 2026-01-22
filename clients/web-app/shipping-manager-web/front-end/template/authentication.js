const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../config/.env') });

const axios = require('axios'); // Dùng axios thay cho node-fetch
const { serialize } = require('cookie');  // FIX: Use destructuring to get the serialize function
const jwt = require('jsonwebtoken'); 
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

let apiService;
try {
    apiService = require('../../config/apiService'); 
} catch (e) {
    console.error("CRITICAL ERROR: Không thể load file apiService.js.");
    console.error("Chi tiết lỗi:", e); // In ra lỗi cụ thể để debug
    process.exit(1); // Dừng app để báo lỗi rõ ràng
}

console.log('AUTH_SERVICE_URL', AUTH_SERVICE_URL);

const APPLICATION_ROLE = "ROLE_SHIPPINGMANAGER"; // Role đúng theo ERole enum (không có dấu gạch dưới giữa SHIPPING và MANAGER)

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3003;

// Base64 String from Java properties (FIX: Remove extra 'Cg==' to eliminate trailing newline in decoded key)
const JWT_SECRET_STRING = 'YmljYXAtc2VjcmV0LWtleS1mb3Itand0LWF1dGhlbnRpY2F0aW9uCg==';
// Convert the Base64 string to a Buffer, exactly like Java's Decoders.BASE64.decode()
const JWT_SECRET = Buffer.from(JWT_SECRET_STRING, 'base64');

app.set("views", __dirname);
app.set('view engine', "ejs");

app.use(express.static(path.join(__dirname, "..")));
app.use(bodyParser.urlencoded( { extended: false }));
app.use(cookieParser());

// Middleware: Truyền biến 'path' xuống View để highlight Sidebar
app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
});

// -------------------------------------------------------------
// Utility: Clear Cookie
// -------------------------------------------------------------
const clearAuthCookie = (res) => {
    res.setHeader('Set-Cookie', serialize('auth_token', '', {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: -1, 
        path: '/',
    }));
};

// Auth-Middleware
const requireAuth = (req, res, next) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        // Validates using the Buffer secret (matches Java)
        const decoded = jwt.verify(token, JWT_SECRET); 
        req.user = decoded; 
        next();
    } catch (err) {
        console.error('JWT Verification Failed in Middleware:', err.message);
        clearAuthCookie(res); 
        return res.redirect('/login');
    }
};

// -------------------------------------------------------------
// Routes
// -------------------------------------------------------------

app.get('/', (req, res) => {
    let user = null;
    try {
        if (req.cookies.auth_token) {
            // Just decoding for display is fine here, verify() is safer though
            const decoded = jwt.verify(req.cookies.auth_token, JWT_SECRET); 
            user = {
                sub: decoded.sub,
                username: decoded.sub,  // Normalize for EJS (username = sub from JWT)
                email: decoded.email,
                roles: decoded.roles
            };
        }
    } catch(e) { /* ignore errors for public index page */ }

    res.render('index', { user: user });
});

app.get('/login', (req, res) => {
    const message = req.query.message || null;
    res.render('login', { error: null, message: message });
});

// -------------------------------------------------------------
// REGISTER GET: Show registration form
// -------------------------------------------------------------
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// -------------------------------------------------------------
// REGISTER POST: Register new user
// -------------------------------------------------------------
app.post('/register', async (req, res) => {
    const { email, username, password, role } = req.body;
    
    try {
        // 1. Call Java Backend to register
        const response = await axios.post(`${AUTH_SERVICE_URL}/register`, {
            email,
            username,
            password,
            role: role || 'SHIPPINGMANAGER' // Không có ROLE_ prefix, UserRegistrationFactory sẽ tự thêm
        });
        
        // 2. Registration successful, redirect to login
        res.redirect('/login?message=Registration successful! Please login.');
        
    } catch (error) {
        console.error('Register Route Error:', error.message);
        const errorMsg = error.response && error.response.data 
            ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
            : error.message;
            
        return res.status(400).render('register', { error: 'Registration Failed: ' + errorMsg });
    }
});

// -------------------------------------------------------------
// LOGIN POST: Authenticate & Set Cookie
// -------------------------------------------------------------
app.post('/login', async (req, res) => {
    const { email, password } = req.body;  
    
    try {
        // 1. Call Java Backend
        // Sử dụng axios để tránh lỗi node-fetch ESM
        const response = await axios.post(`${AUTH_SERVICE_URL}/login`, { 
            email, 
            password 
        });
        const accessToken = response.data;
        
        // 2. Verify Token & Check Role
        // Using the Buffer secret to verify signature
        const decodedToken = jwt.verify(accessToken, JWT_SECRET); 
        
        // Java sends "roles" (plural) in the claim: .claim("roles", roles)
        const userRoles = decodedToken.roles;

        // Check: Does the user have ROLE_SHIPPINGMANAGER?
        if (!userRoles || !userRoles.includes(APPLICATION_ROLE)) {
            console.error(`Role Mismatch: Required ${APPLICATION_ROLE}, Got ${userRoles}`);
            clearAuthCookie(res); 
            return res.status(403).render('login', { error: `Access Denied. You need ${APPLICATION_ROLE}.` });
        }

        // 3. Set Cookie
        const cookie = serialize('auth_token', accessToken, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
        
        res.setHeader('Set-Cookie', cookie);
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Login Route Error:', error.message); 
        // Xử lý lỗi từ axios (nếu backend trả về 401/403/500)
        const errorMsg = error.response && error.response.data 
            ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
            : error.message;
            
        return res.status(401).render('login', { error: 'Login Failed: ' + errorMsg });
    }
});

app.get('/dashboard', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    // Gọi API lấy báo cáo và danh sách vận đơn
    const report = await apiService.getSummaryReport(token);
    const shipments = await apiService.getAllShipments(token);
    const pendingDriverReports = await apiService.getPendingDriverReports(token);

    // Tính toán thống kê từ shipments
    const inTransitShipments = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'ASSIGNED').length;
    const deliveredShipments = shipments.filter(s => s.status === 'DELIVERED').length;
    const pendingShipments = shipments.filter(s => s.status === 'PENDING').length;

    res.render('dashboard', { 
        user: {
            username: req.user.sub,
            email: req.user.email,
            roles: req.user.roles
        },
        report: {
            ...report,
            inTransitShipments: inTransitShipments,
            deliveredShipments: deliveredShipments,
            pendingShipments: pendingShipments,
            pendingDriverReportsCount: pendingDriverReports ? pendingDriverReports.length : 0
        },
        shipments: shipments || []
    });
});

// --- 1. Trang Đơn hàng chờ (Orders) ---
app.get('/orders', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    const pendingOrders = await apiService.getConfirmedOrders(token);
    
    res.render('pages/orders', {
        user: { username: req.user.sub },
        orders: pendingOrders || [],
        query: req.query // Pass query params for success/error messages
    });
});

// --- 2. Trang Quản lý Vận chuyển (Shipments) ---
app.get('/shipments', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    const shipments = await apiService.getAllShipments(token);
    const drivers = await apiService.getAllDrivers(token);
    const vehicles = await apiService.getAllVehicles(token);

    res.render('pages/shipments', {
        user: { username: req.user.sub },
        shipments: shipments || [],
        drivers: drivers || [],
        vehicles: vehicles || [],
        query: req.query // Pass query params for success/error messages
    });
});

// --- 3. Trang Quản lý Xe (Vehicles) ---
app.get('/vehicles', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    const vehicles = await apiService.getAllVehicles(token);
    res.render('pages/vehicles', { 
        user: { username: req.user.sub }, 
        vehicles: vehicles || [],
        query: req.query 
    });
});

app.post('/vehicles', requireAuth, async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        await apiService.createVehicle(token, req.body);
        res.redirect('/vehicles?success=Xe đã được thêm thành công');
    } catch (error) {
        console.error('Error creating vehicle:', error);
        res.redirect('/vehicles?error=' + encodeURIComponent(error.message || 'Có lỗi xảy ra khi thêm xe'));
    }
});

app.post('/vehicles/:id', requireAuth, async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        const vehicleId = req.params.id;
        if (req.body._method === 'PUT') {
            await apiService.updateVehicle(token, vehicleId, req.body);
            res.redirect('/vehicles?success=Xe đã được cập nhật thành công');
        } else if (req.body._method === 'DELETE') {
            await apiService.deleteVehicle(token, vehicleId);
            res.redirect('/vehicles?success=Xe đã được xóa thành công');
        } else {
            res.redirect('/vehicles?error=Phương thức không hợp lệ');
        }
    } catch (error) {
        console.error('Error updating/deleting vehicle:', error);
        const action = req.body._method === 'PUT' ? 'cập nhật' : 'xóa';
        res.redirect('/vehicles?error=' + encodeURIComponent(`Có lỗi xảy ra khi ${action} xe: ${error.message || 'Vui lòng thử lại'}`));
    }
});

// --- 4. Trang Quản lý Tài xế (Drivers) ---
app.get('/drivers', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    const drivers = await apiService.getAllDrivers(token);
    res.render('pages/drivers', { 
        user: { username: req.user.sub }, 
        drivers: drivers || [],
        query: req.query 
    });
});

app.post('/drivers', requireAuth, async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        await apiService.createDriver(token, req.body);
        res.redirect('/drivers?success=Tài xế đã được thêm thành công');
    } catch (error) {
        console.error('Error creating driver:', error);
        res.redirect('/drivers?error=' + encodeURIComponent(error.message || 'Có lỗi xảy ra khi thêm tài xế'));
    }
});

app.post('/drivers/:id', requireAuth, async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        const driverId = req.params.id;
        if (req.body._method === 'PUT') {
            await apiService.updateDriver(token, driverId, req.body);
            res.redirect('/drivers?success=Tài xế đã được cập nhật thành công');
        } else if (req.body._method === 'DELETE') {
            await apiService.deleteDriver(token, driverId);
            res.redirect('/drivers?success=Tài xế đã được xóa thành công');
        } else {
            res.redirect('/drivers?error=Phương thức không hợp lệ');
        }
    } catch (error) {
        console.error('Error updating/deleting driver:', error);
        const action = req.body._method === 'PUT' ? 'cập nhật' : 'xóa';
        res.redirect('/drivers?error=' + encodeURIComponent(`Có lỗi xảy ra khi ${action} tài xế: ${error.message || 'Vui lòng thử lại'}`));
    }
});

// --- 5. Trang Báo cáo (Reports) ---
app.get('/reports', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    const report = await apiService.getSummaryReport(token);
    const driverReports = await apiService.getAllDriverReports(token);
    const pendingDriverReports = await apiService.getPendingDriverReports(token);
    const myAdminReports = await apiService.getMyAdminReports(token);
    
    res.render('pages/reports', { 
        user: { username: req.user.sub }, 
        report: report || {},
        driverReports: driverReports || [],
        pendingDriverReports: pendingDriverReports || [],
        myAdminReports: myAdminReports || [],
        query: req.query
    });
});

app.post('/reports/admin', requireAuth, async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        const { title, description, reportType, priority } = req.body;
        await apiService.sendReportToAdmin(token, {
            title,
            description,
            reportType: reportType || 'GENERAL',
            priority: priority || 'MEDIUM'
        });
        res.redirect('/reports?success=Báo cáo đã được gửi thành công');
    } catch (error) {
        console.error('Error sending report to admin:', error);
        res.redirect('/reports?error=' + encodeURIComponent(error.message || 'Có lỗi xảy ra khi gửi báo cáo'));
    }
});

// --- 6. Trang Gửi Thông báo (Notifications) ---
app.get('/notifications', requireAuth, async (req, res) => {
    res.render('pages/notifications', { 
        user: { username: req.user.sub },
        query: req.query
    });
});

app.post('/notifications', requireAuth, async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        const { recipientType, title, message, priority, relatedOrderId } = req.body;
        
        const notificationData = {
            recipientType,
            title,
            message,
            priority: priority || 'MEDIUM'
        };
        
        if (relatedOrderId && relatedOrderId.trim() !== '') {
            notificationData.relatedOrderId = parseInt(relatedOrderId);
        }
        
        await apiService.sendNotification(token, notificationData);
        res.redirect('/notifications?success=Thông báo đã được gửi thành công');
    } catch (error) {
        console.error('Error sending notification:', error);
        const errorMsg = error.response && error.response.data 
            ? (typeof error.response.data === 'string' ? error.response.data : error.response.data.error || JSON.stringify(error.response.data))
            : error.message;
        res.redirect('/notifications?error=' + encodeURIComponent(errorMsg || 'Có lỗi xảy ra khi gửi thông báo'));
    }
});

app.post('/shipments/create', requireAuth, async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        await apiService.createShipment(token, req.body);
        res.redirect('/shipments?success=Tạo vận đơn thành công');
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.redirect('/orders?error=' + encodeURIComponent(error.message || 'Có lỗi xảy ra khi tạo vận đơn'));
    }
});

app.post('/shipments/assign', requireAuth, async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        const { shipmentId, driverId, vehicleId } = req.body;
        const success = await apiService.assignDriver(token, shipmentId, driverId, vehicleId);
        if (success) {
            res.redirect('/shipments?success=Gán xe thành công');
        } else {
            res.redirect('/shipments?error=Gán xe thất bại');
        }
    } catch (error) {
        console.error('Error assigning driver:', error);
        res.redirect('/shipments?error=' + encodeURIComponent(error.message || 'Có lỗi xảy ra'));
    }
});

app.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.redirect('/');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${port}`);
});