const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const SHIPPING_API = process.env.SHIPPING_SERVICE_URL;
const FARM_API = process.env.FARM_SERVICE_URL;

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
            const response = await axios.post(`${SHIPPING_API}/vehicles`, vehicleData, getHeaders(token));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateVehicle: async (token, vehicleId, vehicleData) => {
        try {
            const response = await axios.put(`${SHIPPING_API}/vehicles/${vehicleId}`, vehicleData, getHeaders(token));
            return response.data;
        } catch (error) {
            throw error;
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
            const response = await axios.post(`${SHIPPING_API}/drivers`, driverData, getHeaders(token));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateDriver: async (token, driverId, driverData) => {
        try {
            const response = await axios.put(`${SHIPPING_API}/drivers/${driverId}`, driverData, getHeaders(token));
            return response.data;
        } catch (error) {
            throw error;
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