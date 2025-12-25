const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', 'config', '.env') });

const { serialize } = require('cookie');
const jwt = require('jsonwebtoken');
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

console.log('AUTH_SERVICE_URL', AUTH_SERVICE_URL);

// Update Role to match Java Enum (ROLE_FARM_MANAGER)
const APPLICATION_ROLE = "ROLE_FARMMANAGER"; 

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3002;

// Base64 String from Java properties
const JWT_SECRET_STRING = 'YmljYXAtc2VjcmV0LWtleS1mb3Itand0LWF1dGhlbnRpY2F0aW9uCg==';
// Convert the Base64 string to a Buffer
const JWT_SECRET = Buffer.from(JWT_SECRET_STRING, 'base64');

app.set("views", path.join(__dirname, "..", "front-end", "template"));
app.set('view engine', "ejs");

app.use(express.static(path.join(__dirname, "..","front-end")));
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
            console.log('Login failed from API:', responseText);
            return res.status(apiResponse.status).render('login', { error: responseText || 'Invalid credentials.' });
        }
    
        const accessToken = responseText;
        
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
    res.render('register');
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
        
        const data = await apiResponse.json();

        if (apiResponse.ok) {
            res.redirect('/login');
        } else {
            return res.status(apiResponse.status).send(data.message || 'Registration failed.');
        }

    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(503).send('Service unavailable.');
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

app.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Farm Management web app started on http://localhost:${port}`);
});