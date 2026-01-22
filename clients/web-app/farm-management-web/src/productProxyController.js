const axios = require('axios');

// Get API Gateway base URL
const getApiGatewayBaseUrl = () => {
    const MARKETPLACE_API_PATH = process.env.MARKETPLACE_API_PATH || 'http://kong-gateway:8000/api/marketplace-products';
    return MARKETPLACE_API_PATH.split('/api')[0] || 'http://kong-gateway:8000';
};

const API_GATEWAY_BASE_URL = getApiGatewayBaseUrl();
const MARKETPLACE_PRODUCTS_API_URL = process.env.MARKETPLACE_API_PATH || `${API_GATEWAY_BASE_URL}/api/marketplace-products`;

// Proxy: Get products by farm
exports.getProductsByFarm = async (req, res) => {
    try {
        const { farmId } = req.params;
        const token = req.cookies.auth_token;

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
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({ error: 'Token không tồn tại' });
        }

        console.log('Creating product:', req.body);

        const response = await axios.post(MARKETPLACE_PRODUCTS_API_URL, req.body, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error creating product:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            error: 'Không thể tạo sản phẩm: ' + (error.response?.data?.message || error.message)
        });
    }
};

// Proxy: Update product
exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const token = req.cookies.auth_token;

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
        const token = req.cookies.auth_token;

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
