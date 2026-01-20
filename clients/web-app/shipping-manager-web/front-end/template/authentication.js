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

const APPLICATION_ROLE = "ROLE_SHIPPING_MANAGER"; // Sửa lại cho khớp với Java (có dấu gạch dưới)

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
    res.render('login', { error: null });
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

        // Check: Does the user have ROLE_SHIPPING_MANAGER?
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

    res.render('dashboard', { 
        user: {
            username: req.user.sub,
            email: req.user.email,
            roles: req.user.roles
        },
        report: report || {},
        shipments: shipments || []
    });
});

// --- 1. Trang Đơn hàng chờ (Orders) ---
app.get('/orders', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    const pendingOrders = await apiService.getConfirmedOrders(token);
    
    res.render('pages/orders', {
        user: { username: req.user.sub },
        orders: pendingOrders || []
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
        vehicles: vehicles || []
    });
});

// --- 3. Trang Quản lý Xe (Vehicles) ---
app.get('/vehicles', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    const vehicles = await apiService.getAllVehicles(token);
    res.render('pages/vehicles', { user: { username: req.user.sub }, vehicles: vehicles || [] });
});

// --- 4. Trang Quản lý Tài xế (Drivers) ---
app.get('/drivers', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    const drivers = await apiService.getAllDrivers(token);
    res.render('pages/drivers', { user: { username: req.user.sub }, drivers: drivers || [] });
});

// --- 5. Trang Báo cáo (Reports) ---
app.get('/reports', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    // Giả sử lấy báo cáo tổng hợp
    const report = await apiService.getSummaryReport(token);
    res.render('pages/reports', { user: { username: req.user.sub }, report: report || {} });
});

app.post('/shipments/create', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    await apiService.createShipment(token, req.body);
    res.redirect('/shipments');
});

app.post('/shipments/assign', requireAuth, async (req, res) => {
    const token = req.cookies.auth_token;
    const { shipmentId, driverId, vehicleId } = req.body;
    const success = await apiService.assignDriver(token, shipmentId, driverId, vehicleId);
    res.status(success ? 200 : 500).json({ message: success ? "Success" : "Failed" });
});

app.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});