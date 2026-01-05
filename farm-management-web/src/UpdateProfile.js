// UpdateProfile.js - Client-side only

async function handleProfileSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('profile-error');
    const successDiv = document.getElementById('profile-success');

    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
        const formData = new FormData(form);
        const payload = {
            address: formData.get('address') || null,
            avatar: null,
            businessLicense: [] // Initialize as an empty array
        };

        // Handle businessLicense files -> convert to Base64 array
        const businessLicenseFiles = form.querySelector('#businessLicenseUpload').files;
        if (businessLicenseFiles && businessLicenseFiles.length > 0) {
            for (let i = 0; i < businessLicenseFiles.length; i++) {
                const file = businessLicenseFiles[i];
                if (file.size > 0) { // Only process if file has content
                    // Add size check if needed, similar to avatar
                    payload.businessLicense.push(await fileToBase64(file));
                }
            }
        }

        // Handle avatar file → convert to Base64
        const avatarFile = formData.get('avatar');
        if (avatarFile && avatarFile.size > 0) {
            if (avatarFile.size > 10 * 1024 * 1024) { // 10MB
                throw new Error('Image file is too large. Maximum allowed: 10MB');
            }
            payload.avatar = await fileToBase64(avatarFile);
        }

        const response = await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();

        if (!response.ok) {
            let errMsg = `Server error ${response.status}: ${rawText.substring(0, 200)}...`;
            if (response.status === 403) {
                errMsg = 'Forbidden - please check your login or permissions and try again.';
            } else if (response.status === 401) {
                errMsg = 'Unauthorized - please login again.';
            }
            throw new Error(errMsg);
        }

        let data;
        try {
            data = JSON.parse(rawText);
        } catch {
            throw new Error('Invalid JSON response from server');
        }

        // Success feedback
        if (successDiv) {
            successDiv.textContent = 'Profile updated successfully! Reloading...';
            successDiv.style.display = 'block';
        }

        // Reload to show updated data
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (err) {
        console.error('Profile update failed:', err);
        if (errorDiv) {
            errorDiv.textContent = err.message || 'Failed to update profile';
            errorDiv.style.display = 'block';
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Profile';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('update-profile-form');
    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatar-preview');

    // Live preview when user selects new avatar
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (form) {
        form.addEventListener('submit', handleProfileSubmit);
    }
});

// Helper: Convert File to Base64 string (without prefix)
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // The data URL prefix (e.g., "data:image/jpeg;base64,") is required by the backend.
            resolve(reader.result);
        };
        reader.onerror = error => reject(error);
    });
}