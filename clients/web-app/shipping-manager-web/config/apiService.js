const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const SHIPPING_API = process.env.SHIPPING_SERVICE_URL;
const FARM_API = process.env.FARM_SERVICE_URL;

<<<<<<< HEAD
=======
// Configure axios để parse cả text/plain response (cho error messages)
axios.defaults.transformResponse = [
    function (data, headers) {
        // Nếu content-type là text/plain hoặc text/html, giữ nguyên string
        const contentType = headers['content-type'] || '';
        if (contentType.includes('text/plain') || contentType.includes('text/html')) {
            return data; // Giữ nguyên string
        }
        // Nếu không, thử parse JSON
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch (e) {
                return data; // Nếu không parse được, trả về string
            }
        }
        return data;
    }
];

>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
// Hàm helper để cấu hình Header có Token
const getHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

const apiService = {
    // --- DASHBOARD & REPORT ---
    getSummaryReport: async (token) => {
        try {
            const response = await axios.get(`${SHIPPING_API}/reports/summary`, getHeaders(token));
            return response.data;
        } catch (error) {
            console.error("Error fetching report:", error.message);
            if (error.response) {
                console.error("Backend Details:", error.response.data);
            }
            return null;
        }
    },

    // --- SHIPMENT ---
    getAllShipments: async (token) => {
        try {
            const response = await axios.get(`${SHIPPING_API}/shipments`, getHeaders(token));
            return response.data;
        } catch (error) {
            console.error("Error fetching shipments:", error.message);
            if (error.response) {
                console.error("Backend Details:", error.response.status, error.response.data);
            }
            // Return empty array on error to prevent page crash
            return [];
        }
    },

    createShipment: async (token, shipmentData) => {
        try {
            const response = await axios.post(`${SHIPPING_API}/shipments`, shipmentData, getHeaders(token));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    assignDriver: async (token, shipmentId, driverId, vehicleId) => {
        try {
            await axios.put(`${SHIPPING_API}/shipments/${shipmentId}/assign?driverId=${driverId}&vehicleId=${vehicleId}`, {}, getHeaders(token));
            return true;
        } catch (error) {
            console.error("Error assigning driver:", error.message);
            return false;
        }
    },

    // --- DRIVER & VEHICLE ---
    getAllDrivers: async (token) => {
        try {
            const response = await axios.get(`${SHIPPING_API}/drivers`, getHeaders(token));
            return response.data;
        } catch (error) {
            return [];
        }
    },

    getAllVehicles: async (token) => {
        try {
            const response = await axios.get(`${SHIPPING_API}/vehicles`, getHeaders(token));
            return response.data;
        } catch (error) {
            return [];
        }
    },

    createVehicle: async (token, vehicleData) => {
        try {
<<<<<<< HEAD
            const response = await axios.post(`${SHIPPING_API}/vehicles`, vehicleData, getHeaders(token));
            return response.data;
        } catch (error) {
            throw error;
=======
            console.log('📝 [apiService] Creating vehicle with data:', JSON.stringify(vehicleData, null, 2));
            
            // Sử dụng validateStatus để không throw error cho 4xx, cho phép xử lý response body
            const response = await axios.post(`${SHIPPING_API}/vehicles`, vehicleData, {
                ...getHeaders(token),
                validateStatus: function (status) {
                    // Không throw error cho status < 500, cho phép xử lý response body
                    return status < 500;
                }
            });
            
            // Nếu status là 4xx, extract error message từ response body và throw
            if (response.status >= 400 && response.status < 500) {
                let errorMessage = 'Có lỗi xảy ra khi thêm xe';
                const responseData = response.data;
                
                console.error('❌ [apiService] Received 4xx response:', {
                    status: response.status,
                    data: responseData,
                    dataType: typeof responseData,
                    headers: response.headers
                });
                
                // Extract error message từ response body
                if (responseData !== null && responseData !== undefined) {
                    if (typeof responseData === 'string') {
                        errorMessage = responseData.trim();
                    } else if (typeof responseData === 'object') {
                        errorMessage = responseData.message || responseData.error || JSON.stringify(responseData);
                    } else {
                        errorMessage = String(responseData);
                    }
                }
                
                console.error('❌ [apiService] Extracted error message from 4xx response:', errorMessage);
                throw new Error(errorMessage);
            }
            
            return response.data;
        } catch (error) {
            // Nếu error đã có message từ 4xx response (không phải message mặc định của axios), re-throw ngay
            if (error.message && 
                !error.message.includes('status code') && 
                !error.message.includes('Request failed') && 
                error.message !== 'Có lỗi xảy ra khi thêm xe' &&
                error.message.length > 20) { // Message từ backend thường dài hơn 20 ký tự
                console.error('❌ [apiService] Re-throwing error with extracted message:', error.message);
                throw error;
            }
            
            // Nếu chưa có message đúng, extract từ error.response
            console.error('❌ [apiService] Error creating vehicle - Status:', error.response?.status);
            console.error('❌ [apiService] Error message:', error.message);
            console.error('❌ [apiService] Error response:', error.response);
            
            let errorMessage = 'Có lỗi xảy ra khi thêm xe';
            
            if (error.response) {
                const responseData = error.response.data;
                
                if (responseData !== null && responseData !== undefined) {
                    if (typeof responseData === 'string') {
                        errorMessage = responseData.trim();
                    } else if (typeof responseData === 'object') {
                        errorMessage = responseData.message || responseData.error || JSON.stringify(responseData);
                    } else {
                        errorMessage = String(responseData);
                    }
                } else {
                    errorMessage = error.response.statusText || errorMessage;
                }
            } else if (error.message && !error.message.includes('status code') && !error.message.includes('Request failed')) {
                errorMessage = error.message;
            }
            
            console.error('❌ [apiService] Final extracted error message:', errorMessage);
            throw new Error(errorMessage);
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
        }
    },

    updateVehicle: async (token, vehicleId, vehicleData) => {
        try {
            const response = await axios.put(`${SHIPPING_API}/vehicles/${vehicleId}`, vehicleData, getHeaders(token));
            return response.data;
        } catch (error) {
<<<<<<< HEAD
            throw error;
=======
            // Extract error message from response
            const errorMessage = error.response?.data || error.message;
            const validationError = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
            throw validationError;
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
        }
    },

    deleteVehicle: async (token, vehicleId) => {
        try {
            await axios.delete(`${SHIPPING_API}/vehicles/${vehicleId}`, getHeaders(token));
            return true;
        } catch (error) {
            throw error;
        }
    },

    createDriver: async (token, driverData) => {
        try {
<<<<<<< HEAD
            const response = await axios.post(`${SHIPPING_API}/drivers`, driverData, getHeaders(token));
            return response.data;
        } catch (error) {
            throw error;
=======
            console.log('📝 [apiService] Creating driver with data:', JSON.stringify(driverData, null, 2));
            
            // Sử dụng validateStatus để không throw error cho 4xx, cho phép xử lý response body
            const response = await axios.post(`${SHIPPING_API}/drivers`, driverData, {
                ...getHeaders(token),
                validateStatus: function (status) {
                    // Không throw error cho status < 500, cho phép xử lý response body
                    return status < 500;
                }
            });
            
            // Nếu status là 4xx, extract error message từ response body và throw
            if (response.status >= 400 && response.status < 500) {
                let errorMessage = 'Có lỗi xảy ra khi thêm tài xế';
                const responseData = response.data;
                
                console.error('❌ [apiService] Received 4xx response:', {
                    status: response.status,
                    data: responseData,
                    dataType: typeof responseData,
                    headers: response.headers
                });
                
                // Extract error message từ response body
                if (responseData !== null && responseData !== undefined) {
                    if (typeof responseData === 'string') {
                        errorMessage = responseData.trim();
                    } else if (typeof responseData === 'object') {
                        errorMessage = responseData.message || responseData.error || JSON.stringify(responseData);
                    } else {
                        errorMessage = String(responseData);
                    }
                }
                
                console.error('❌ [apiService] Extracted error message from 4xx response:', errorMessage);
                throw new Error(errorMessage);
            }
            
            return response.data;
        } catch (error) {
            // Nếu error đã có message từ 4xx response (không phải message mặc định của axios), re-throw ngay
            if (error.message && 
                !error.message.includes('status code') && 
                !error.message.includes('Request failed') && 
                error.message !== 'Có lỗi xảy ra khi thêm tài xế' &&
                error.message.length > 20) { // Message từ backend thường dài hơn 20 ký tự
                console.error('❌ [apiService] Re-throwing error with extracted message:', error.message);
                throw error;
            }
            
            // Nếu chưa có message đúng, extract từ error.response
            console.error('❌ [apiService] Error creating driver - Status:', error.response?.status);
            console.error('❌ [apiService] Error message:', error.message);
            console.error('❌ [apiService] Error response:', error.response);
            
            let errorMessage = 'Có lỗi xảy ra khi thêm tài xế';
            
            if (error.response) {
                const responseData = error.response.data;
                
                if (responseData !== null && responseData !== undefined) {
                    if (typeof responseData === 'string') {
                        errorMessage = responseData.trim();
                    } else if (typeof responseData === 'object') {
                        errorMessage = responseData.message || responseData.error || JSON.stringify(responseData);
                    } else {
                        errorMessage = String(responseData);
                    }
                } else {
                    errorMessage = error.response.statusText || errorMessage;
                }
            } else if (error.message && !error.message.includes('status code') && !error.message.includes('Request failed')) {
                errorMessage = error.message;
            }
            
            console.error('❌ [apiService] Final extracted error message:', errorMessage);
            throw new Error(errorMessage);
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
        }
    },

    updateDriver: async (token, driverId, driverData) => {
        try {
            const response = await axios.put(`${SHIPPING_API}/drivers/${driverId}`, driverData, getHeaders(token));
            return response.data;
        } catch (error) {
<<<<<<< HEAD
            throw error;
=======
            // Extract error message from response
            const errorMessage = error.response?.data || error.message;
            const validationError = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
            throw validationError;
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
        }
    },

    deleteDriver: async (token, driverId) => {
        try {
            await axios.delete(`${SHIPPING_API}/drivers/${driverId}`, getHeaders(token));
            return true;
        } catch (error) {
            throw error;
        }
    },

    // --- FARM ORDERS (Để tạo vận đơn) ---
    getConfirmedOrders: async (token) => {
        try {
            const response = await axios.get(`${FARM_API}/orders`, getHeaders(token));
            // Lọc các đơn hàng có trạng thái CONFIRMED (Đã xác nhận, chờ giao)
            return response.data.filter(order => order.status === 'CONFIRMED');
        } catch (error) {
            return [];
        }
    },

    // --- REPORTS ---
    getAllDriverReports: async (token) => {
        try {
            const response = await axios.get(`${SHIPPING_API}/reports/drivers`, getHeaders(token));
            return response.data;
        } catch (error) {
            console.error("Error fetching driver reports:", error.message);
            return [];
        }
    },

    getPendingDriverReports: async (token) => {
        try {
            const response = await axios.get(`${SHIPPING_API}/reports/drivers/pending`, getHeaders(token));
            return response.data;
        } catch (error) {
            console.error("Error fetching pending driver reports:", error.message);
            return [];
        }
    },

    getMyAdminReports: async (token) => {
        try {
            const response = await axios.get(`${SHIPPING_API}/reports/admin/my-reports`, getHeaders(token));
            return response.data;
        } catch (error) {
            console.error("Error fetching my admin reports:", error.message);
            return [];
        }
    },

    sendReportToAdmin: async (token, reportData) => {
        try {
            const response = await axios.post(`${SHIPPING_API}/reports/admin`, reportData, getHeaders(token));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // --- NOTIFICATIONS ---
    sendNotification: async (token, notificationData) => {
        try {
            const response = await axios.post(`${SHIPPING_API}/notifications`, notificationData, getHeaders(token));
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = apiService;