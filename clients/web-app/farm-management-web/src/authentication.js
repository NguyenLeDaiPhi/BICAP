const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', 'config', '.env') });

const farmController = require('./farmController');
const notificationController = require('./notificationController');
const { serialize } = require('cookie');
const jwt = require('jsonwebtoken');
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const AUTH_SERVICE_URL_UPDATE = process.env.AUTH_SERVICE_URL_UPDATE;

console.log('AUTH_SERVICE_URL', AUTH_SERVICE_URL);

// Update Role to match Java Enum (ROLE_FARM_MANAGER)
const APPLICATION_ROLE = "ROLE_FARMMANAGER"; 

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const profileRoutes = require('./profile');

const app = express();
const port = 3002;

// Base64 String from Java properties
const JWT_SECRET_STRING = 'YmljYXAtc2VjcmV0LWtleS1mb3Itand0LWF1dGhlbnRpY2F0aW9uCg==';
// Convert the Base64 string to a Buffer
const JWT_SECRET = Buffer.from(JWT_SECRET_STRING, 'base64');

app.set("views", path.join(__dirname, "..", "front-end", "template"));
app.set('view engine', "ejs");

app.use(express.json({ limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb'}));
app.use(express.static(path.join(__dirname, "..","front-end")));
app.use('/assets', express.static(path.join(__dirname, "..", "assets")));
app.use('/src', express.static(path.join(__dirname)));
app.use(express.static('public')); // Serve uploads
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: false }));
app.use(cookieParser());

// Utility: Clear Cookie
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
        const decoded = jwt.verify(token, JWT_SECRET); 
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
        if (req.cookies.auth_token) {
            const decoded = jwt.verify(req.cookies.auth_token, JWT_SECRET); 
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
    
    try {
        const apiResponse = await fetch(`${AUTH_SERVICE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const responseText = await apiResponse.text();

        if (!apiResponse.ok) {
            console.error(`Login failed from API. Status: ${apiResponse.status} ${apiResponse.statusText}. URL: ${AUTH_SERVICE_URL}/login. Response: ${responseText}`);
            return res.status(apiResponse.status).render('login', { error: responseText || 'Invalid credentials.' });
        }
    
        const accessToken = responseText;
        
        console.log('Login success - Token:', accessToken.substring(0, 20) + '...'); // Debug
        
        const decodedToken = jwt.verify(accessToken, JWT_SECRET); 
        
        const userRoles = decodedToken.roles;

        if (!userRoles || !userRoles.includes(APPLICATION_ROLE)) {
            console.error(`Role Mismatch: Required ${APPLICATION_ROLE}, Got ${userRoles}`);
            clearAuthCookie(res); 
            return res.status(403).render('login', { error: `Access Denied. You need ${APPLICATION_ROLE}.` });
        }

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
        return res.status(503).render('login', { error: 'Login Error: ' + error.message });
    }
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const apiResponse = await fetch(`${AUTH_SERVICE_URL}/register`, {
            method: 'POST',
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
        
        if (apiResponse.ok) {
            // It's possible the success response has no body or is not JSON.
            // Since we just redirect, we don't need to parse it.
            res.redirect('/login');
        } else {
            const errorText = await apiResponse.text();
            console.error('Registration failed:', errorText);
            return res.status(apiResponse.status).render('register', { error: errorText || 'Registration failed.' });
        }

    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(503).render('register', { error: 'Service unavailable.' });
    }
});

app.get('/dashboard', requireAuth, (req, res) => {
    const API_GATEWAY_BASE_URL = process.env.MARKETPLACE_API_PATH.split('/api')[0];
    const MARKETPLACE_API_PATH = process.env.MARKETPLACE_API_PATH;
    const FARMING_SEASONS_API_PATH = process.env.FARMING_SEASONS_API_PATH;

    res.render('dashboard', {
        user: {
            username: req.user.sub,
            email: req.user.email,
            roles: req.user.roles
        },
        API_GATEWAY_BASE_URL: API_GATEWAY_BASE_URL,
        MARKETPLACE_API_PATH: MARKETPLACE_API_PATH,
        FARMING_SEASONS_API_PATH: FARMING_SEASONS_API_PATH    });
});

// Debug endpoint - xem token chứa gì
app.get('/debug/user-info', requireAuth, (req, res) => {
    res.json({
        message: 'Token decoded successfully',
        user: req.user,
        availableFields: Object.keys(req.user)
    });
});

app.get('/farm-info', requireAuth, farmController.getFarmInfoPage);
app.get('/farm-info/edit', requireAuth, farmController.getEditFarmPage);
app.post('/farm-info/update', requireAuth, farmController.updateFarmInfo);

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
})

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.listen(port, () => {
    console.log(`Farm Management web app started on http://localhost:${port}`);
});
