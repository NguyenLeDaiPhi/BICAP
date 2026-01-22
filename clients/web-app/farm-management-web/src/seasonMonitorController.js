const axios = require('axios');

// Get API Gateway base URL
const getApiGatewayBaseUrl = () => {
    const MARKETPLACE_API_PATH = process.env.MARKETPLACE_API_PATH || 'http://kong-gateway:8000/api/marketplace';
    return MARKETPLACE_API_PATH.split('/api')[0] || 'http://kong-gateway:8000';
};

const API_GATEWAY_BASE_URL = getApiGatewayBaseUrl();

// URL của API Production Batch - sử dụng API Gateway
const PRODUCTION_BATCH_API_URL = process.env.PRODUCTION_BATCH_API_URL || `${API_GATEWAY_BASE_URL}/api/production-batches`;
const FARMING_PROCESS_API_URL = process.env.FARMING_PROCESS_API_URL || `${API_GATEWAY_BASE_URL}/api/farming-processes`;
const EXPORT_BATCH_API_URL = process.env.EXPORT_BATCH_API_URL || `${API_GATEWAY_BASE_URL}/api/export-batches`;
const FARM_API_URL = process.env.FARM_API_URL || `${API_GATEWAY_BASE_URL}/api/farm-features`;

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

// 1. Hiển thị trang Season Monitor (Danh sách mùa vụ)
exports.getSeasonMonitorPage = async (req, res) => {
    try {
        const ownerId = req.user.userId || req.user.id || req.user.sub;
        const token = req.cookies.auth_token;
        const farmId = await getFarmId(ownerId, token);

        if (!farmId) {
            return res.render('season-monitor', {
                user: req.user,
                seasons: [],
                error: 'Không tìm thấy trang trại. Vui lòng tạo trang trại trước.',
                API_GATEWAY_BASE_URL: API_GATEWAY_BASE_URL,
                PRODUCTION_BATCH_API_URL: PRODUCTION_BATCH_API_URL,
                FARMING_PROCESS_API_URL: FARMING_PROCESS_API_URL,
                EXPORT_BATCH_API_URL: EXPORT_BATCH_API_URL
            });
        }

        // Lấy danh sách mùa vụ của trang trại
        const response = await axios.get(`${PRODUCTION_BATCH_API_URL}/farm/${farmId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const seasons = response.data || [];
        
        res.render('season-monitor', {
            user: req.user,
            seasons: seasons,
            farmId: farmId,
            error: null,
            API_GATEWAY_BASE_URL: API_GATEWAY_BASE_URL,
            PRODUCTION_BATCH_API_URL: PRODUCTION_BATCH_API_URL,
            FARMING_PROCESS_API_URL: FARMING_PROCESS_API_URL,
            EXPORT_BATCH_API_URL: EXPORT_BATCH_API_URL
        });
    } catch (error) {
        console.error('Error getting season monitor page:', error.message);
        
        res.render('season-monitor', {
            user: req.user,
            seasons: [],
            error: 'Không thể tải danh sách mùa vụ: ' + error.message,
            API_GATEWAY_BASE_URL: API_GATEWAY_BASE_URL,
            PRODUCTION_BATCH_API_URL: PRODUCTION_BATCH_API_URL,
            FARMING_PROCESS_API_URL: FARMING_PROCESS_API_URL,
            EXPORT_BATCH_API_URL: EXPORT_BATCH_API_URL
        });
    }
};

// 2. Lấy chi tiết mùa vụ (API endpoint cho frontend)
exports.getSeasonDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({ error: 'Token không tồn tại' });
        }

        console.log(`Getting season detail for ID: ${id}, Token: ${token.substring(0, 20)}...`);

        const response = await axios.get(`${PRODUCTION_BATCH_API_URL}/${id}/detail`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error getting season detail:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            error: 'Không thể lấy chi tiết mùa vụ: ' + (error.response?.data?.message || error.message)
        });
    }
};

// 3. Tạo mùa vụ mới
exports.createSeason = async (req, res) => {
    try {
        const ownerId = req.user.userId || req.user.id || req.user.sub;
        const token = req.cookies.auth_token;
        const farmId = await getFarmId(ownerId, token);

        if (!farmId) {
            return res.status(400).json({ error: 'Không tìm thấy trang trại' });
        }

        const response = await axios.post(`${PRODUCTION_BATCH_API_URL}/farm/${farmId}`, req.body, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error creating season:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Không thể tạo mùa vụ: ' + (error.response?.data?.message || error.message)
        });
    }
};

// 4. Cập nhật tiến trình mùa vụ
exports.updateSeasonProgress = async (req, res) => {
    try {
        const { batchId } = req.params;
        const token = req.cookies.auth_token;
        const ownerId = req.user.userId || req.user.id || req.user.sub;

        const response = await axios.post(`${FARMING_PROCESS_API_URL}/batch/${batchId}`, req.body, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error updating season progress:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Không thể cập nhật tiến trình: ' + (error.response?.data?.message || error.message)
        });
    }
};

// 5. Xuất tiến trình mùa vụ (Tạo Export Batch)
exports.exportSeason = async (req, res) => {
    try {
        const { batchId } = req.params;
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({ error: 'Token không tồn tại' });
        }

        console.log(`Exporting season for batch ID: ${batchId}, Token: ${token.substring(0, 20)}...`);

        const response = await axios.post(`${EXPORT_BATCH_API_URL}/batch/${batchId}`, req.body, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error exporting season:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            error: 'Không thể xuất tiến trình: ' + (error.response?.data?.message || error.message)
        });
    }
};
