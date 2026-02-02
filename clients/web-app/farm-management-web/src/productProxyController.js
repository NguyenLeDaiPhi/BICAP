const axios = require('axios');

// Get API Gateway base URL
const getApiGatewayBaseUrl = () => {
    const MARKETPLACE_API_PATH = process.env.MARKETPLACE_API_PATH || 'http://localhost:8000/api/marketplace-products';
    return MARKETPLACE_API_PATH.split('/api')[0] || 'http://localhost:8000';
};

const API_GATEWAY_BASE_URL = getApiGatewayBaseUrl();
const MARKETPLACE_PRODUCTS_API_URL = process.env.MARKETPLACE_API_PATH || `${API_GATEWAY_BASE_URL}/api/marketplace-products`;
const IMAGES_API_URL = process.env.IMAGES_API_PATH || `${API_GATEWAY_BASE_URL}/api/images`;
const FARM_API_URL = process.env.FARM_API_URL || `${API_GATEWAY_BASE_URL}/api/farm-features`;
const EXPORT_BATCH_API_URL = process.env.EXPORT_BATCH_API_URL || `${API_GATEWAY_BASE_URL}/api/export-batches`;

// Helper function để lấy Farm ID từ Owner ID
const getFarmId = async (ownerId, token) => {
    try {
        const response = await axios.get(`${FARM_API_URL}/owner/${ownerId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data?.id || null;
    } catch (error) {
        console.error('Error getting farm ID:', error.message);
        return null;
    }
};

// Proxy: Get export batches by farm
exports.getExportBatches = async (req, res) => {
    try {
        const token = req.cookies.farm_token || req.cookies.auth_token; // legacy fallback
        if (!token) {
            return res.status(401).json({ error: 'Token không tồn tại' });
        }

        const ownerId = req.user?.userId || req.user?.id || req.user?.sub;
        const farmId = await getFarmId(ownerId, token);

        if (!farmId) {
            return res.status(404).json({ error: 'Không tìm thấy trang trại cho người dùng này.' });
        }

        console.log(`Getting export batches for farm ID: ${farmId}`);

        const response = await axios.get(`${EXPORT_BATCH_API_URL}/farm/${farmId}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error getting export batches:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            error: 'Không thể lấy lịch sử xuất hàng: ' + (error.response?.data?.message || error.message)
        });
    }
};

// Proxy: Get products by farm
exports.getProductsByFarm = async (req, res) => {
    try {
        const { farmId } = req.params;
        const token = req.cookies.farm_token || req.cookies.auth_token; // legacy fallback

        if (!token) {
            return res.status(401).json({ error: 'Token không tồn tại' });
        }

        console.log(`Getting products for farm ID: ${farmId}`);

        const response = await axios.get(`${MARKETPLACE_PRODUCTS_API_URL}/farm/${farmId}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error getting products:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            error: 'Không thể lấy danh sách sản phẩm: ' + (error.response?.data?.message || error.message)
        });
    }
};

// Proxy: Create product
exports.createProduct = async (req, res) => {
    try {
        const token = req.cookies.farm_token || req.cookies.auth_token; // legacy fallback

        if (!token) {
            return res.status(401).json({ error: 'Token không tồn tại' });
        }

        // Decode token to check roles (for debugging)
        const jwt = require('jsonwebtoken');
        try {
            const decoded = jwt.decode(token);
            console.log('🔐 [Create Product] Token info - Username:', decoded?.sub, 'Roles:', decoded?.roles);
            console.log('🔐 [Create Product] Roles type:', typeof decoded?.roles);
            console.log('🔐 [Create Product] Roles value:', JSON.stringify(decoded?.roles));
            
            // Check if user has required role
            const roles = decoded?.roles;
            const hasRequiredRole = roles && (
                (Array.isArray(roles) && roles.some(r => r === 'ROLE_FARMMANAGER' || r === 'ROLE_ADMIN')) ||
                (typeof roles === 'string' && (roles.includes('ROLE_FARMMANAGER') || roles.includes('ROLE_ADMIN')))
            );
            
            if (!hasRequiredRole) {
                console.warn('⚠️ [Create Product] User does not have ROLE_FARMMANAGER or ROLE_ADMIN');
                console.warn('⚠️ [Create Product] User roles:', roles);
            }
        } catch (e) {
            console.warn('Could not decode token:', e.message);
        }

        // Đảm bảo farmId có trong request body
        let productData = { ...req.body };
        
        // Nếu farmId thiếu hoặc null, lấy từ user
        if (!productData.farmId) {
            const ownerId = req.user?.userId || req.user?.id || req.user?.sub;
            if (ownerId) {
                console.log('📦 [Create Product] farmId missing, fetching from ownerId:', ownerId);
                const farmId = await getFarmId(ownerId, token);
                if (farmId) {
                    productData.farmId = farmId;
                    console.log('✅ [Create Product] farmId retrieved:', farmId);
                } else {
                    return res.status(400).json({
                        error: 'Không tìm thấy trang trại. Vui lòng tạo trang trại trước.',
                        details: { ownerId }
                    });
                }
            } else {
                return res.status(400).json({
                    error: 'farmId is required. Không thể xác định ownerId từ token.'
                });
            }
        }

        console.log('📦 [Create Product] Creating product:', JSON.stringify(productData, null, 2));
        console.log('📦 [Create Product] API URL:', MARKETPLACE_PRODUCTS_API_URL);
        console.log('📦 [Create Product] Token (first 50 chars):', token ? token.substring(0, 50) + '...' : 'MISSING');

        const response = await axios.post(MARKETPLACE_PRODUCTS_API_URL, productData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            validateStatus: function (status) {
                // Don't throw error for any status, we'll handle it manually
                return status >= 200 && status < 600;
            }
        });

        // Check if response is successful
        if (response.status >= 200 && response.status < 300) {
            console.log('✅ [Create Product] Product created successfully');
            return res.json(response.data);
        }
        
        // Handle error response
        console.error('❌ [Create Product] Error response status:', response.status);
        throw {
            response: {
                status: response.status,
                data: response.data
            }
        };
    } catch (error) {
        console.error('❌ [Create Product] Error creating product:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            
            // Handle different response types (JSON, HTML, text, etc.)
            let responseData = error.response.data;
            if (typeof responseData === 'string') {
                try {
                    responseData = JSON.parse(responseData);
                } catch (e) {
                    // If it's not JSON, treat it as plain text
                    responseData = { message: responseData };
                }
            }
            
            console.error('Response data:', JSON.stringify(responseData, null, 2));
            
            // Pass through the actual error message from the backend
            let errorMessage = responseData?.message || 
                                responseData?.error || 
                                responseData?.errorMessage ||
                                (error.response.status === 403 
                                    ? 'Access Denied: Bạn không có quyền tạo sản phẩm. Vui lòng kiểm tra role của bạn.' 
                                    : `Failed to save product (Status: ${error.response.status})`);
            
            // Add more context for 403 errors
            if (error.response.status === 403 && responseData) {
                const currentRoles = responseData.currentRoles || 'unknown';
                const currentUser = responseData.currentUser || 'unknown';
                errorMessage += ` (User: ${currentUser}, Roles: ${currentRoles})`;
                console.error('🚫 [Create Product] Access Denied Details:', {
                    user: currentUser,
                    roles: currentRoles,
                    requiredRoles: ['ROLE_FARMMANAGER', 'ROLE_ADMIN'],
                    fullResponse: responseData
                });
            }
            
            return res.status(error.response.status).json({
                error: errorMessage,
                details: responseData
            });
        }
        res.status(500).json({
            error: 'Không thể tạo sản phẩm: ' + error.message
        });
    }
};

// Proxy: Update product
exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const token = req.cookies.farm_token || req.cookies.auth_token; // legacy fallback

        if (!token) {
            return res.status(401).json({ error: 'Token không tồn tại' });
        }

        console.log(`Updating product ID: ${productId}`);

        const response = await axios.put(`${MARKETPLACE_PRODUCTS_API_URL}/${productId}`, req.body, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error updating product:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            error: 'Không thể cập nhật sản phẩm: ' + (error.response?.data?.message || error.message)
        });
    }
};

// Proxy: Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const token = req.cookies.farm_token || req.cookies.auth_token; // legacy fallback

        if (!token) {
            return res.status(401).json({ error: 'Token không tồn tại' });
        }

        console.log(`Deleting product ID: ${productId}`);

        const response = await axios.delete(`${MARKETPLACE_PRODUCTS_API_URL}/${productId}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error deleting product:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            error: 'Không thể xóa sản phẩm: ' + (error.response?.data?.message || error.message)
        });
    }
};

exports.getExportBatches = async(req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) return res.status(401).json({ error: 'Token không tồn tại.'})

        const ownerId = req.user?.userId || req.user?.id || req.user?.sub;
        const farmId = await getFarmId(ownerId, token);

        if (!farmId) return res.status(404).json({ error: 'Không tìm thấy chủ trang trại.'});

        // Logic Check: 
        // Java Controller: /api/export-batches/farm/{farmId}
        // Kong: forwards /api/export-batches
        // Axios call below: matches perfectly

        const response = await axios.get(`${EXPORT_BATCH_API_URL}/farm/${farmId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error getting export batches:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Không thể lấy lịch sử xuất hàng.'
        });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        const response = await axios.post(`${MARKETPLACE_PRODUCTS_API_URL}`, req.body, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

// Proxy: Upload product image to image-storage-service
exports.uploadProductImage = async (req, res) => {
    try {
        const token = req.cookies.farm_token || req.cookies.auth_token; // legacy fallback
        if (!token) {
            return res.status(401).json({ error: 'Token không tồn tại' });
        }

        const { productId, farmId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Vui lòng chọn ảnh sản phẩm' });
        }
        if (!productId || !farmId) {
            return res.status(400).json({ error: 'Thiếu productId hoặc farmId' });
        }

        const FormData = require('form-data');
        const formData = new FormData();
        // Use buffer from memory storage or read from path if disk storage
        const fileBuffer = file.buffer || require('fs').readFileSync(file.path);
        formData.append('file', fileBuffer, { filename: file.originalname });
        formData.append('productId', productId);
        formData.append('farmId', farmId);

        const response = await axios.post(`${IMAGES_API_URL}/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error uploading product image:', error.message);
        const status = error.response?.status || 500;
        const msg = error.response?.data?.message || error.response?.data?.error || error.message;
        res.status(status).json({ error: 'Không thể tải ảnh lên: ' + msg });
    }
};

// Proxy: Upload product image via farm-production-service (updates product.imageUrl)
exports.uploadMarketplaceProductImage = async (req, res) => {
    try {
        const token = req.cookies.farm_token || req.cookies.auth_token; // legacy fallback
        if (!token) {
            return res.status(401).json({ error: 'Token không tồn tại' });
        }

        const { productId } = req.params;
        const { farmId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Vui lòng chọn ảnh sản phẩm' });
        }
        if (!productId || !farmId) {
            return res.status(400).json({ error: 'Thiếu productId hoặc farmId' });
        }

        const FormData = require('form-data');
        const formData = new FormData();
        const fileBuffer = file.buffer || require('fs').readFileSync(file.path);
        formData.append('file', fileBuffer, { filename: file.originalname });
        formData.append('farmId', farmId);

        const response = await axios.post(`${MARKETPLACE_PRODUCTS_API_URL}/${productId}/images`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error uploading marketplace product image:', error.message);
        const status = error.response?.status || 500;
        const msg = error.response?.data?.message || error.response?.data?.error || error.message;
        res.status(status).json({ error: 'Không thể tải ảnh lên: ' + msg });
    }
};