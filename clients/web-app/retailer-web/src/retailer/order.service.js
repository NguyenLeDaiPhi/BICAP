const api = require("../../config/axios");

const getMyOrders = async (userId, token) => {
  try {
    const res = await api.get("/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        // farmId is used in the backend for filtering orders by retailer
        farmId: userId,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Order API error:", err.message);
    return [];
  }
};

const getOrderDetail = async (orderId, token) => {
  try {
    const res = await api.get(`/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Order API error:", err.message);
    return null;
  }
};

module.exports = {
  getMyOrders,
  getOrderDetail,
};