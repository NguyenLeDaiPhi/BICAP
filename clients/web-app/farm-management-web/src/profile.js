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
    const AUTH_SERVICE_URL_UPDATE = process.env.AUTH_SERVICE_URL_UPDATE || 'http://default-url/api/update'; // Fallback and assume it includes /api/update
    const authServiceBaseUrl = new URL(AUTH_SERVICE_URL_UPDATE).origin; // Extract protocol, hostname, and port

    // GET profile page
    router.get('/profile', requireAuth, async (req, res) => {
        let profileData = {};
        try {
            console.log('Fetching profile with token:', req.cookies.auth_token?.substring(0, 20) + '...'); // Partial log
            const response = await fetch(`${AUTH_SERVICE_URL_UPDATE}/profile`, {
                headers: { 'Authorization': `Bearer ${req.cookies.auth_token}` },
                cache: 'no-store'  // Force no cache
            });
            if (response.ok) {
                profileData = await response.json();
                console.log('Fetched profile data: ', profileData);
                
                // Construct full URL for avatar if it exists
                // Handle both avatarBase64 (if manually set) and avatarBytes (default JPA mapping)
                const avatarSource = profileData.avatarBase64 || profileData.avatarBytes;
                if (avatarSource) {
                    profileData.avatar = `data:image/png;base64,${avatarSource}`;
                }

                // Construct full URLs for business licenses
                if (profileData.businessLicenses && Array.isArray(profileData.businessLicenses)) {
                    profileData.businessLicenses.forEach(license => {
                        if (license.licenseBase64) {
                            license.licensePath = `data:image/png;base64,${license.licenseBase64}`;
                        } else if (license.licensePath && !license.licensePath.startsWith('data:')) {
                            try {
                                // Extract just the filename from the licensePath
                                const filename = license.licensePath.substring(license.licensePath.lastIndexOf('/') + 1);
                                license.licensePath = `${authServiceBaseUrl}/api/update/license/${filename}`;
                            } catch (e) {
                                console.error('Error constructing license URL:', license.licensePath, e);
                                license.licensePath = '/placeholder-image.jpg';  // Fallback
                            }
                        }
                    });
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
                roles: Array.isArray(req.user?.roles) ? req.user.roles : (req.user?.roles ? [req.user.roles] : []),
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
            if (rawBody.length > 1e7) {  // Arbitrary large limit
                throw new Error('Response too large - possible serialization error');
            }

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