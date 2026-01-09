const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', 'config', '.env') });

const { serialize } = require('cookie');
const jwt = require('jsonwebtoken');
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const AUTH_SERVICE_URL_UPDATE = process.env.AUTH_SERVICE_URL_UPDATE;

console.log('AUTH_SERVICE_URL', AUTH_SERVICE_URL);

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

app.set("views", path.join(__dirname, "..", "pages"));
app.set('view engine', "ejs");

app.use(express.json({ limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb'}));
app.use(express.static(path.join(__dirname, "..", "assets"))); // Serve assets from assets folder
app.use('/src', express.static(path.join(__dirname)));
app.use(express.static('public')); // Serve uploads
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: false }));
app.use(cookieParser());

// Utility: Clear Cookie
const clearAuthCookie = (res) => {
    res.setHeader('Set-Cookie', serialize('auth_token', '', {
        httpOnly: false, 
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
        // Ensure roles is always an array to prevent template errors
        if (req.user.roles && !Array.isArray(req.user.roles)) {
            req.user.roles = [req.user.roles];
        }
        next();
    } catch (err) {
        console.error('JWT Verification Failed in Middleware:', err.message);
        clearAuthCookie(res); 
        return res.redirect('/login');
    }
};

// Routes
app.get('/', (req, res) => {
    res.render('landing', { user: null });
});

app.get('/login', (req, res) => {
    res.render('sign-in', { error: null });
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
            return res.status(apiResponse.status).render('sign-in', { error: responseText || 'Invalid credentials.' });
        }
    
        const accessToken = responseText;
        
        console.log('Login success - Token:', accessToken.substring(0, 20) + '...'); // Debug
        
        const decodedToken = jwt.verify(accessToken, JWT_SECRET); 
        
        const userRoles = decodedToken.roles;
        const farmId = decodedToken.farmId || decodedToken.farm_id;
        if (!farmId) {
            console.warn('Warning: No farmId found in token for user', decodedToken.sub);
        }

        // Normalize roles to array for checking
        const rolesArray = Array.isArray(userRoles) ? userRoles : (userRoles ? [userRoles] : []);
        const hasRequiredRole = rolesArray.includes('FARMMANAGER') || rolesArray.includes('ROLE_FARMMANAGER');

        if (!hasRequiredRole) {
            console.error(`Role Mismatch: Required 'FARMMANAGER', Got ${userRoles}`);
            clearAuthCookie(res); 
            return res.status(403).render('sign-in', { error: `Access Denied. You need to be a Farm Manager.` });
        }

        const cookie = serialize('auth_token', accessToken, {
            httpOnly: false, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
        
        res.setHeader('Set-Cookie', cookie);
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Login Route Error:', error.message);
        return res.status(503).render('sign-in', { error: 'Login Error: ' + error.message });
    }
});

app.get('/register', (req, res) => {
    res.render('sign-up', { error: null });
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
            res.redirect('/login');
        } else {
            const errorText = await apiResponse.text();
            console.error('Registration failed:', errorText);
            return res.status(apiResponse.status).render('sign-up', { error: errorText || 'Registration failed.' });
        }

    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(503).render('sign-up', { error: 'Service unavailable.' });
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

app.get('/product-management', requireAuth, (req, res) => {
    res.render('product-management', {
        user: {
            username: req.user.sub,
            email: req.user.email,
            roles: req.user.roles,
            farmId: req.user.farmId || req.user.farm_id
        },
        API_GATEWAY_BASE_URL: process.env.API_GATEWAY_URL,
        MARKETPLACE_API_PATH: process.env.MARKETPLACE_API_PATH,
        FARMING_SEASONS_API_PATH: process.env.FARMING_SEASONS_API_PATH
    });
});

app.get('/farm-info', requireAuth, (req, res) => {
    res.render('farm-info', { 
        user: {
            username: req.user.sub,
            email: req.user.email,
            roles: req.user.roles
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
