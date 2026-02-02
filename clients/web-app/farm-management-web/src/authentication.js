const path = require('path');
const fs = require('fs');

// Try to load .env.local first (for local development), then fall back to .env
const envLocalPath = path.resolve(__dirname, '..', 'config', '.env.local');
const envPath = path.resolve(__dirname, '..', 'config', '.env');

if (fs.existsSync(envLocalPath)) {
    console.log('📝 Loading environment from .env.local (local development)');
    require('dotenv').config({ path: envLocalPath });
} else {
    console.log('📝 Loading environment from .env');
    require('dotenv').config({ path: envPath });
}

const farmController = require('./farmController');
const productController = require('../productController');
const productProxyController = require('./productProxyController');
const shippingController = require('./shippingController');
const notificationController = require('./notificationController');
const seasonMonitorController = require('./seasonMonitorController');
const { serialize } = require('cookie');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Add multer for file uploads

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const AUTH_SERVICE_URL_UPDATE = process.env.AUTH_SERVICE_URL_UPDATE;

console.log('AUTH_SERVICE_URL', AUTH_SERVICE_URL);

// Update Role to match Java Enum (ROLE_FARM_MANAGER)
const APPLICATION_ROLE = "ROLE_FARMMANAGER"; 
const CLIENT_ID = "farm";
const COOKIE_NAME = "farm_token";

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const profileRoutes = require('./profile');

const app = express();
const port = 3002;

// Ensure the uploads directory exists and configure Multer
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'images');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
// Memory storage for proxying file uploads to image-storage-service
const uploadMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Per-role JWT secret for farm manager (must match auth-service bicap.app.jwtSecret.farm)
const JWT_SECRET_STRING = process.env.JWT_SECRET_FARM || 'YmljYXAtand0LWZhcm0tcm9sZS1zZWNyZXQta2V5LWF1dGghISEhISEh';
const JWT_SECRET = Buffer.from(JWT_SECRET_STRING, 'base64');

app.set("views", path.join(__dirname, "..", "front-end", "template"));
app.set('view engine', "ejs");

app.use(express.json({ limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb'}));
app.use(express.static(path.join(__dirname, "..","front-end")));
app.use('/assets', express.static(path.join(__dirname, "..", "assets")));
app.use('/src', express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // Serve uploaded files
app.use(express.static('public')); // Serve uploads
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: false }));
app.use(cookieParser());

// Utility: Clear Cookie
const clearAuthCookie = (res) => {
    res.setHeader('Set-Cookie', serialize(COOKIE_NAME, '', {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: -1, 
        path: '/',
    }));
};

// Auth-Middleware
const requireAuth = (req, res, next) => {
    const token = req.cookies[COOKIE_NAME] || req.cookies.auth_token; // legacy fallback

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }); 
        req.user = decoded; 
        next();
    } catch (err) {
        console.error('JWT Verification Failed in Middleware:', err.message);
        clearAuthCookie(res); 
        return res.redirect('/login');
    }
};

// Routes
app.get('/', (req, res) => {
    let user = null;
    try {
        const token = req.cookies[COOKIE_NAME] || req.cookies.auth_token; // legacy fallback
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }); 
            user = {
                sub: decoded.sub,
                username: decoded.sub,
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

app.post('/login', async (req, res) => {
    const { email, password } = req.body;  
    
    // Validate AUTH_SERVICE_URL
    if (!AUTH_SERVICE_URL) {
        console.error('❌ AUTH_SERVICE_URL is not defined in environment variables!');
        return res.status(500).render('login', { error: 'Server configuration error: AUTH_SERVICE_URL is missing.' });
    }
    
    const loginUrl = `${AUTH_SERVICE_URL}/login`;
    console.log('🔐 Attempting login to:', loginUrl);
    
    try {
        const apiResponse = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, clientId: CLIENT_ID }),
        });

        const responseText = await apiResponse.text();

        if (!apiResponse.ok) {
            console.error(`❌ Login failed from API. Status: ${apiResponse.status} ${apiResponse.statusText}. URL: ${loginUrl}. Response: ${responseText}`);
            
            // Check if it's a network/DNS error
            if (responseText.includes('name resolution failed') || responseText.includes('ENOTFOUND') || responseText.includes('getaddrinfo')) {
                const errorMsg = `Cannot connect to auth service at ${AUTH_SERVICE_URL}. ` +
                               `If running locally, make sure to use 'localhost' instead of 'kong-gateway' in your .env file. ` +
                               `Current URL: ${AUTH_SERVICE_URL}`;
                console.error('❌ DNS/Network Error:', errorMsg);
                return res.status(503).render('login', { 
                    error: `Connection Error: Cannot reach authentication service. Please check your configuration. (URL: ${AUTH_SERVICE_URL})` 
                });
            }
            
            return res.status(apiResponse.status).render('login', { error: responseText || 'Invalid credentials.' });
        }
    
        const accessToken = responseText.trim(); // Remove any whitespace
        
        console.log('=== JWT DEBUG INFO ===');
        console.log('Token (first 50 chars):', accessToken.substring(0, 50) + '...');
        console.log('Token length:', accessToken.length);
        console.log('JWT_SECRET type:', typeof JWT_SECRET);
        console.log('JWT_SECRET length:', JWT_SECRET.length);
        console.log('JWT_SECRET preview:', JWT_SECRET.toString('hex').substring(0, 20) + '...');
        
        // Decode without verification to see payload
        let decodedWithoutVerify;
        try {
            decodedWithoutVerify = jwt.decode(accessToken, { complete: true });
            if (decodedWithoutVerify) {
                console.log('Token header:', JSON.stringify(decodedWithoutVerify.header));
                console.log('Token payload:', JSON.stringify(decodedWithoutVerify.payload));
                console.log('Token algorithm:', decodedWithoutVerify.header.alg);
            }
        } catch (e) {
            console.error('Failed to decode token:', e.message);
        }
        
        // Verify token with proper error handling
        let decodedToken;
        try {
            // First try to verify properly
            decodedToken = jwt.verify(accessToken, JWT_SECRET, { algorithms: ['HS256'] });
            console.log('✓ Token verified successfully with Buffer');
        } catch (verifyError) {
            console.error('✗ Buffer verification failed:', verifyError.message);
            
            // Try with decoded string
            const secretString = Buffer.from(JWT_SECRET_STRING, 'base64').toString('utf8');
            try {
                decodedToken = jwt.verify(accessToken, secretString, { algorithms: ['HS256'] });
                console.log('✓ Token verified successfully with String');
            } catch (stringError) {
                console.error('✗ String verification also failed:', stringError.message);
                throw stringError;
            }
        }
        console.log('=== END JWT DEBUG ==='); 
        
        const userRoles = decodedToken.roles;
        
        // Check if user has required role - handle both string and array formats
        let hasRequiredRole = false;
        if (userRoles) {
            if (Array.isArray(userRoles)) {
                hasRequiredRole = userRoles.some(role => 
                    role === APPLICATION_ROLE || 
                    role === 'ROLE_FARMMANAGER' || 
                    role === 'ROLE_ADMIN'
                );
            } else if (typeof userRoles === 'string') {
                hasRequiredRole = userRoles.includes(APPLICATION_ROLE) || 
                                 userRoles.includes('ROLE_FARMMANAGER') || 
                                 userRoles.includes('ROLE_ADMIN');
            }
        }

        if (!hasRequiredRole) {
            console.error(`❌ Role Mismatch: Required ${APPLICATION_ROLE}, Got ${JSON.stringify(userRoles)} (type: ${typeof userRoles})`);
            clearAuthCookie(res); 
            return res.status(403).render('login', { error: `Access Denied. You need ${APPLICATION_ROLE}. Current roles: ${JSON.stringify(userRoles)}` });
        }
        
        console.log(`✓ Role check passed. User has ${APPLICATION_ROLE}. Roles: ${JSON.stringify(userRoles)}`);
        const cookie = serialize(COOKIE_NAME, accessToken, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
        
        res.setHeader('Set-Cookie', cookie);
        res.redirect('/dashboard');

    } catch (error) {
        console.error('❌ Login Route Error:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        // Check for DNS/network errors
        const errorMessage = error.message || String(error);
        let userFriendlyError = 'Login Error: ' + errorMessage;
        
        if (errorMessage.includes('name resolution failed') || 
            errorMessage.includes('ENOTFOUND') || 
            errorMessage.includes('getaddrinfo') ||
            errorMessage.includes('kong-gateway')) {
            userFriendlyError = `Cannot connect to authentication service. ` +
                              `The URL "${AUTH_SERVICE_URL}" cannot be resolved. ` +
                              `If you're running locally (not in Docker), please update your .env file to use 'localhost' instead of 'kong-gateway'. ` +
                              `See config/.env.local.example for the correct local configuration.`;
        }
        
        return res.status(503).render('login', { error: userFriendlyError });
    }
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    // Validate AUTH_SERVICE_URL
    if (!AUTH_SERVICE_URL) {
        console.error('❌ AUTH_SERVICE_URL is not defined in environment variables!');
        return res.status(500).render('register', { error: 'Server configuration error: AUTH_SERVICE_URL is missing.' });
    }
    
    const registerUrl = `${AUTH_SERVICE_URL}/register`;
    console.log('🔐 Attempting registration to:', registerUrl);
    console.log('🔐 AUTH_SERVICE_URL from env:', AUTH_SERVICE_URL);
    
    // Test Kong Gateway connection first
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const kongTest = await fetch('http://localhost:8000', { 
            method: 'GET',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log('✓ Kong Gateway is reachable at localhost:8000');
    } catch (kongError) {
        console.error('❌ Cannot reach Kong Gateway at localhost:8000');
        console.error('   Make sure Kong Gateway is running: docker-compose up -d kong-gateway');
        console.error('   Error:', kongError.message);
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const apiResponse = await fetch(registerUrl, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                username, 
                password, 
                email, 
                role: 'FARMMANAGER'
            }),
        });
        clearTimeout(timeoutId);
        
        if (apiResponse.ok) {
            // It's possible the success response has no body or is not JSON.
            // Since we just redirect, we don't need to parse it.
            res.redirect('/login');
        } else {
            const errorText = await apiResponse.text();
            console.error('❌ Registration failed:', errorText);
            
            // Check if it's a network/DNS error
            if (errorText.includes('name resolution failed') || errorText.includes('ENOTFOUND') || errorText.includes('getaddrinfo')) {
                const errorMsg = `Cannot connect to auth service at ${AUTH_SERVICE_URL}. ` +
                               `If running locally, make sure to use 'localhost' instead of 'kong-gateway' in your .env file. ` +
                               `Current URL: ${AUTH_SERVICE_URL}`;
                console.error('❌ DNS/Network Error:', errorMsg);
                return res.status(503).render('register', { 
                    error: `Connection Error: Cannot reach authentication service. Please check your configuration. (URL: ${AUTH_SERVICE_URL})` 
                });
            }
            
            return res.status(apiResponse.status).render('register', { error: errorText || 'Registration failed.' });
        }

    } catch (error) {
        console.error('❌ Registration Error:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        // Check for DNS/network errors
        const errorMessage = error.message || String(error);
        let userFriendlyError = 'Registration Error: ' + errorMessage;
        
        if (errorMessage.includes('name resolution failed') || 
            errorMessage.includes('ENOTFOUND') || 
            errorMessage.includes('getaddrinfo') ||
            errorMessage.includes('kong-gateway')) {
            userFriendlyError = `Cannot connect to authentication service. ` +
                              `The URL "${AUTH_SERVICE_URL}" cannot be resolved. ` +
                              `If you're running locally (not in Docker), please update your .env file to use 'localhost' instead of 'kong-gateway'. ` +
                              `See config/.env.local.example for the correct local configuration.`;
        }
        
        return res.status(503).render('register', { error: userFriendlyError });
    }
});

app.get('/dashboard', requireAuth, (req, res) => {
    const MARKETPLACE_API_PATH = process.env.MARKETPLACE_API_PATH || 'http://localhost:8000/api/marketplace';
    const API_GATEWAY_BASE_URL = MARKETPLACE_API_PATH.split('/api')[0];
    const FARMING_SEASONS_API_PATH = process.env.FARMING_SEASONS_API_PATH || 'http://localhost:8000/api/production-batches';

    res.render('dashboard', {
        user: {
            username: req.user.sub,
            email: req.user.email,
            roles: req.user.roles
        },
        API_GATEWAY_BASE_URL: API_GATEWAY_BASE_URL,
        MARKETPLACE_API_PATH: MARKETPLACE_API_PATH,
        FARMING_SEASONS_API_PATH: FARMING_SEASONS_API_PATH
    });
});

// Debug endpoint - xem token chứa gì
app.get('/debug/user-info', requireAuth, (req, res) => {
    const roles = req.user.roles;
    const rolesArray = Array.isArray(roles) ? roles : (typeof roles === 'string' ? roles.split(',') : []);
    const rolesString = typeof roles === 'string' ? roles : (Array.isArray(roles) ? roles.join(',') : String(roles));
    
    res.json({
        message: 'Token decoded successfully',
        user: req.user,
        availableFields: Object.keys(req.user),
        roles: roles,
        rolesType: typeof roles,
        rolesArray: rolesArray,
        rolesString: rolesString,
        hasROLE_FARMMANAGER: rolesArray.includes('ROLE_FARMMANAGER') || rolesString.includes('ROLE_FARMMANAGER'),
        hasROLE_ADMIN: rolesArray.includes('ROLE_ADMIN') || rolesString.includes('ROLE_ADMIN'),
        APPLICATION_ROLE: APPLICATION_ROLE,
        roleCheck: rolesArray.includes(APPLICATION_ROLE) || rolesString.includes(APPLICATION_ROLE)
    });
});

app.get('/farm-info', requireAuth, farmController.getFarmInfoPage);
app.get('/farm-info/edit', requireAuth, farmController.getEditFarmPage);
app.post('/farm-info/create', requireAuth, farmController.createFarm);
app.post('/farm-info/update', requireAuth, farmController.updateFarmInfo);

app.get('/products', requireAuth, productController.getProductsPage);

// Product API proxy routes (frontend calls these instead of direct API)
app.get('/api/export-batches', requireAuth, seasonMonitorController.getExportBatchesForFarm);
app.get('/api/marketplace-products/farm/:farmId', requireAuth, productProxyController.getProductsByFarm);
app.post('/api/marketplace-products', requireAuth, productProxyController.createProduct);
app.put('/api/marketplace-products/:productId', requireAuth, productProxyController.updateProduct);
app.delete('/api/marketplace-products/:productId', requireAuth, productProxyController.deleteProduct);
app.post('/api/marketplace-products/:productId/images', requireAuth, uploadMemory.single('file'), productProxyController.uploadMarketplaceProductImage);
app.post('/api/images/upload', requireAuth, uploadMemory.single('file'), productProxyController.uploadProductImage);

app.get('/shipping', requireAuth, shippingController.getShippingPage);

// Season Monitor routes
app.get('/season-monitor', requireAuth, seasonMonitorController.getSeasonMonitorPage);
app.get('/api/season-monitor/:id/detail', requireAuth, seasonMonitorController.getSeasonDetail);
app.post('/api/season-monitor/create', requireAuth, seasonMonitorController.createSeason);
app.post('/api/season-monitor/:batchId/progress', requireAuth, seasonMonitorController.updateSeasonProgress);
app.post('/api/season-monitor/:batchId/export', requireAuth, seasonMonitorController.exportSeason);

// Notification routes
app.get('/notifications', requireAuth, notificationController.getNotificationsPage);
app.get('/api/notifications/stream', requireAuth, notificationController.streamNotifications);
app.get('/api/notifications', requireAuth, notificationController.getAllNotifications);
app.post('/api/notifications/:id/read', requireAuth, notificationController.markAsRead);
app.delete('/api/notifications/:id', requireAuth, notificationController.deleteNotification);
app.delete('/api/notifications', requireAuth, notificationController.clearAllNotifications);
app.post('/api/notifications/test', requireAuth, notificationController.sendTestNotification);

// Use profile routes
app.use('/', profileRoutes(requireAuth));

app.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.redirect('/');
});

// New image upload route
app.post('/upload/product-image', requireAuth, upload.single('productImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Respond with the URL to the uploaded image
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.json({ imageUrl: imageUrl });
});

// Global error handler (JSON only)
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    const status = err.status || 500;
    res.status(status).json({
        error: 'Internal Server Error',
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'File too large', 
            message: 'The uploaded image is too big. Please use a smaller file (max 10MB).',
            maxSize: '10MB'
        });
    } else {
        next(err);
    }
});

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Start server
app.listen(port, () => {
    console.log(`Farm Management web app started on http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`RabbitMQ: ${process.env.RABBITMQ_ENABLED !== 'false' ? 'Enabled' : 'Disabled'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});
