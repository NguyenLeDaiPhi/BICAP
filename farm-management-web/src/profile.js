const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer config - secure, with limits and filter
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'), // Ensure folder exists!
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

module.exports = (requireAuth) => {
    const AUTH_SERVICE_URL_UPDATE = process.env.AUTH_SERVICE_URL_UPDATE || 'http://default-url'; // Fallback

    // GET profile page
    router.get('/profile', requireAuth, async (req, res) => {
        let profileData = {};
        try {
            console.log('Fetching profile with token:', req.cookies.auth_token?.substring(0, 20) + '...'); // Partial log
            const response = await fetch(`${AUTH_SERVICE_URL_UPDATE}/profile`, {
                headers: { 'Authorization': `Bearer ${req.cookies.auth_token}` }
            });
            if (response.ok) {
                profileData = await response.json();
                // The auth-service returns a pure base64 string in 'avatarBase64'.
                // We must convert it to a full data URI for the <img> tag.
                if (profileData.avatarBase64) {
                    // Prepend the necessary data URI prefix. We assume JPEG as a default.
                    profileData.avatar = `data:image/jpeg;base64,${profileData.avatarBase64}`;
                }
            } else {
                console.error('Fetch profile failed:', response.status);
            }
        } catch (err) {
            console.error('Error fetching profile:', err.message);
        }

        res.render('profile', { 
            user: {
                username: req.user?.sub || req.user?.username || 'Unknown',
                email: req.user?.email || 'Unknown',
                roles: req.user?.roles || [],
                ...profileData 
            } 
        });
    });

    // POST update profile - Pass-through for Base64 avatar
    router.post('/api/profile/update', requireAuth, async (req, res) => {
        try {
            // The body already contains the businessLicense, address, and Base64 avatar
            const payload = req.body;

            console.log('Payload to Java (pass-through):', { ...payload, avatar: payload.avatar ? payload.avatar.substring(0, 40) + '...' : null });
            console.log('Full backend URL:', `${AUTH_SERVICE_URL_UPDATE}/profile`);

            const apiResponse = await fetch(`${AUTH_SERVICE_URL_UPDATE}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${req.cookies.auth_token || ''}`
                },
                body: JSON.stringify(payload)
            });

            const rawBody = await apiResponse.text();
            console.log('Java response status:', apiResponse.status, 'Body:', rawBody);

            if (!apiResponse.ok) {
                throw new Error(`Backend returned ${apiResponse.status}: ${rawBody}`);
            }

            let data;
            try {
                data = rawBody ? JSON.parse(rawBody) : { message: 'Profile updated successfully' };
            } catch (parseErr) {
                console.error('JSON parse failed:', parseErr.message, 'Raw:', rawBody.substring(0, 300));
                return res.status(502).json({ error: 'Invalid response from backend' });
            }

            res.json(data);

        } catch (error) {
            console.error('Profile update error:', error.message);
            res.status(500).json({ error: 'Server error during profile update.', message: error.message });
        }
    });

    return router;
};