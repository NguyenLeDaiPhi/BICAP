const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', 'config', '.env') });

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
    res.render('dashboard', { 
        user: {
            username: req.user.sub,
            email: req.user.email,
            roles: req.user.roles
        } 
    });
});

app.get('/farm-info', requireAuth, (req, res) => {
    res.render('farm-info', { 
        user: {
            username: req.user.sub,
            email: req.user.email,
            roles: req.user.roles
        },
        farm: {
            farmName: 'Trang trại BiCap',
            createdAt: new Date().toISOString(),
            areaSize: 50,
            hotline: '0123-456-789',
            email: 'contact@bicap.farm',
            address: '123 Đường ABC, Quận XYZ, TP.HCM',
            description: 'Trang trại nông nghiệp sạch, cung cấp sản phẩm hữu cơ chất lượng cao.',
            image: '/assets/img/farm-organic-1.jpg'
        }
    });
});
app.get('/farm-info/edit', requireAuth, (req, res) => {
    res.render('farm-info-edit', { 
        user: {
            username: req.user.sub,
            email: req.user.email,
            roles: req.user.roles
        } 
    });
});
app.get('/notifications', requireAuth, (req, res) => {
    res.render('notifications', { 
        user: {
            username: req.user.sub,
            email: req.user.email,
            roles: req.user.roles
        } 
    });
});
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
