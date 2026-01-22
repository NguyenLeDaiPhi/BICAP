const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { serialize } = require('cookie');
require('dotenv').config({ path: path.resolve(__dirname, '..', 'config', '.env') });
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

const JWT_SECRET_STRING = 'YmljYXAtc2VjcmV0LWtleS1mb3Itand0LWF1dGhlbnRpY2F0aW9uCg==';
const JWT_SECRET = Buffer.from(JWT_SECRET_STRING, 'base64');
const APPLICATION_ROLE = 'ROLE_ADMIN';
const app = express();
const port = 3001;

app.set("views", path.join(__dirname, "..", "front-end", "template"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "..", "front-end")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set the clear authentication cookie for user when logout
const clearAuthCookie = (res) => {
    res.setHeader('Set-Cookie', serialize('auth_token', '', {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict',
        maxAge: -1,
        path: "/"
    }));
}

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
        console.log("Error message: Middleware to verify the token is error", err.message);
        clearAuthCookie(res);
        return res.redirect('/login');
    }
}

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
    } catch (e) { /* Ignore JWT errors for public index page */ }
    res.render('index', { user: user });
});

// Rendering the login GUI
app.get('/login', (req, res) => {
    res.render('login', { error: null });
})

app.post('/login', async(req, res) => {
    const { email, password } = req.body;

    try {
        const apiResponse = await fetch(`${AUTH_SERVICE_URL}/login`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });

        const responseText = await apiResponse.text();

        if (!apiResponse.ok) {
            console.log('Login from api: ', responseText);
            return res.status(apiResponse.status).render('login', { error: responseText || "Invalid Credentials", success: null});
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
            sameSite: 'strict', 
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        });
        res.setHeader('Set-Cookie', cookie);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login Route Error:', error.message);
        return res.status(503).render('login', { error: "Login failed: " + error.message, success: null});
    }
});

app.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});